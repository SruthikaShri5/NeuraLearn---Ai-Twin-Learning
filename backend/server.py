from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import secrets
import uuid
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

def user_response(user: dict) -> dict:
    u = {k: v for k, v in user.items() if k != "password_hash"}
    if "_id" in u and not isinstance(u["_id"], str):
        u["_id"] = str(u["_id"])
    u["id"] = u.pop("_id", u.get("id", ""))
    # Convert datetime fields to ISO strings
    for key in ["created_at", "updated_at"]:
        if key in u and isinstance(u[key], datetime):
            u[key] = u[key].isoformat()
    return u

# ============ AUTH MODELS ============

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"  # student | teacher | parent
    disability_type: str = "prefer_not_to_say"
    grade_level: str = "class_1"
    learning_style: str = "visual"
    avatar: str = "owl"
    # Teacher fields
    school_name: Optional[str] = None
    assigned_classes: Optional[List[str]] = None  # e.g. ["class_5", "class_6"]
    subject_specialization: Optional[str] = None
    # Parent fields
    children_grades: Optional[List[str]] = None  # grades of their children

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.strip().lower()
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    valid_roles = ["student", "teacher", "parent"]
    role = req.role if req.role in valid_roles else "student"

    user_doc = {
        "name": req.name,
        "email": email,
        "password_hash": hash_password(req.password),
        "role": role,
        "avatar": req.avatar,
        "onboarding_complete": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "settings": {
            "high_contrast": False, "font_size": "medium", "reduce_motion": False,
            "haptic_intensity": "medium", "soundscape_volume": 50,
            "input_channels": {"gaze": False, "voice": False, "gesture": False, "touch": True, "keyboard": True},
            "federated_sharing": True
        },
    }

    if role == "student":
        user_doc.update({
            "disability_type": req.disability_type,
            "grade_level": req.grade_level,
            "learning_style": req.learning_style,
            "xp": 0, "level": 1, "streak": 0,
            "last_active": datetime.now(timezone.utc).isoformat(),
            "achievements": [],
            "daily_goal_minutes": 30,
            "subjects": [],
        })
    elif role == "teacher":
        user_doc.update({
            "school_name": req.school_name or "",
            "assigned_classes": req.assigned_classes or [],
            "subject_specialization": req.subject_specialization or "general",
            "onboarding_complete": True,
        })
    elif role == "parent":
        user_doc.update({
            "children_grades": req.children_grades or [],
            "onboarding_complete": True,
        })

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    user_doc["_id"] = user_id
    return {"user": user_response(user_doc), "access_token": access_token}

@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    return {"user": user_response(user), "access_token": access_token}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"user": user_response(user)}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user_id = str(user["_id"])
        new_access = create_access_token(user_id, user["email"])
        response.set_cookie(key="access_token", value=new_access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"access_token": new_access}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@api_router.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    email = req.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user:
        return {"message": "If the email exists, a reset link has been sent"}
    token = secrets.token_urlsafe(32)
    await db.password_reset_tokens.insert_one({
        "token": token,
        "user_id": str(user["_id"]),
        "email": email,
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        "used": False
    })
    logging.info(f"Password reset token for {email}: {token}")
    return {"message": "If the email exists, a reset link has been sent"}

@api_router.post("/auth/reset-password")
async def reset_password(req: ResetPasswordRequest):
    record = await db.password_reset_tokens.find_one({"token": req.token, "used": False})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if datetime.now(timezone.utc) > record["expires_at"]:
        raise HTTPException(status_code=400, detail="Reset token expired")
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    hashed = hash_password(req.new_password)
    await db.users.update_one({"_id": ObjectId(record["user_id"])}, {"$set": {"password_hash": hashed}})
    await db.password_reset_tokens.update_one({"token": req.token}, {"$set": {"used": True}})
    return {"message": "Password reset successfully"}

# ============ USER PROFILE ============

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    disability_type: Optional[str] = None
    grade_level: Optional[str] = None
    learning_style: Optional[str] = None
    avatar: Optional[str] = None
    onboarding_complete: Optional[bool] = None
    daily_goal_minutes: Optional[int] = None
    subjects: Optional[List[str]] = None

class UpdateSettingsRequest(BaseModel):
    high_contrast: Optional[bool] = None
    font_size: Optional[str] = None
    reduce_motion: Optional[bool] = None
    haptic_intensity: Optional[str] = None
    soundscape_volume: Optional[int] = None
    input_channels: Optional[dict] = None
    federated_sharing: Optional[bool] = None

@api_router.put("/user/profile")
async def update_profile(req: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": updates})
    updated = await db.users.find_one({"_id": ObjectId(user["_id"])}, {"password_hash": 0})
    updated["_id"] = str(updated["_id"])
    return {"user": user_response(updated)}

@api_router.put("/user/settings")
async def update_settings(req: UpdateSettingsRequest, user: dict = Depends(get_current_user)):
    updates = {}
    for k, v in req.model_dump().items():
        if v is not None:
            updates[f"settings.{k}"] = v
    if updates:
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": updates})
    updated = await db.users.find_one({"_id": ObjectId(user["_id"])}, {"password_hash": 0})
    updated["_id"] = str(updated["_id"])
    return {"user": user_response(updated)}

# ============ LESSONS ============

@api_router.get("/lessons")
async def get_lessons(request: Request, grade: Optional[str] = None, subject: Optional[str] = None):
    query = {}
    # Try to get current user for grade-based filtering
    try:
        user = await get_current_user(request)
        # Students only see lessons for their grade level
        if user.get("role") in ("student", "learner") and not grade:
            grade = user.get("grade_level")
    except Exception:
        pass
    if grade:
        query["grade"] = grade
    if subject:
        query["subject"] = subject
    lessons = await db.lessons.find(query, {"_id": 0}).to_list(200)
    return {"lessons": lessons}

@api_router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"lesson": lesson}

class SubmitQuizRequest(BaseModel):
    lesson_id: str
    answers: dict
    time_spent_seconds: int = 0

@api_router.post("/lessons/submit-quiz")
async def submit_quiz(req: SubmitQuizRequest, user: dict = Depends(get_current_user)):
    lesson = await db.lessons.find_one({"id": req.lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    quiz = lesson.get("quiz", [])
    correct = 0
    total = len(quiz)
    for q in quiz:
        qid = q["id"]
        if req.answers.get(qid) == q["correct_answer"]:
            correct += 1
    score = round((correct / total) * 100) if total > 0 else 0
    # Update mastery in knowledge graph
    concept_id = lesson.get("concept_id", lesson["id"])
    await db.concept_mastery.update_one(
        {"user_id": user["_id"], "concept_id": concept_id},
        {"$set": {"score": score, "last_attempted": datetime.now(timezone.utc).isoformat(), "concept_id": concept_id, "user_id": user["_id"]}},
        upsert=True
    )
    # Update XP
    xp_gained = score // 10
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$inc": {"xp": xp_gained}, "$set": {"last_active": datetime.now(timezone.utc).isoformat()}}
    )
    # Log session
    await db.sessions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "lesson_id": req.lesson_id,
        "score": score,
        "correct": correct,
        "total": total,
        "xp_gained": xp_gained,
        "time_spent_seconds": req.time_spent_seconds,
        "completed_at": datetime.now(timezone.utc).isoformat()
    })

    # Update spaced repetition schedule (SM-2)
    existing_sr = await db.spaced_repetition.find_one({"user_id": user["_id"], "lesson_id": req.lesson_id})
    if existing_sr:
        sr_update = sm2_next_review(
            existing_sr.get("ease_factor", 2.5),
            existing_sr.get("interval", 1),
            existing_sr.get("repetitions", 0),
            score
        )
    else:
        sr_update = sm2_next_review(2.5, 1, 0, score)

    await db.spaced_repetition.update_one(
        {"user_id": user["_id"], "lesson_id": req.lesson_id},
        {"$set": {**sr_update, "user_id": user["_id"], "lesson_id": req.lesson_id, "last_score": score}},
        upsert=True
    )

    # Update streak
    user_doc = await db.users.find_one({"_id": ObjectId(user["_id"])})
    last_active_str = user_doc.get("last_active", "")
    streak = user_doc.get("streak", 0)
    try:
        last_active = datetime.fromisoformat(last_active_str.replace("Z", "+00:00")) if last_active_str else None
        now = datetime.now(timezone.utc)
        if last_active:
            days_diff = (now.date() - last_active.date()).days
            if days_diff == 1:
                streak += 1
            elif days_diff > 1:
                streak = 1
            # days_diff == 0: same day, keep streak
        else:
            streak = 1
    except Exception:
        streak = max(1, streak)

    # Level up: every 100 XP
    new_xp = (user_doc.get("xp", 0) or 0) + xp_gained
    new_level = max(1, new_xp // 100 + 1)

    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"streak": streak, "level": new_level, "last_active": datetime.now(timezone.utc).isoformat()},
         "$inc": {"xp": xp_gained}}
    )

    return {
        "score": score,
        "correct": correct,
        "total": total,
        "xp_gained": xp_gained,
        "streak": streak,
        "next_review_date": sr_update.get("next_review_date"),
        "interval_days": sr_update.get("interval"),
    }
# ============ SPACED REPETITION (SM-2 Algorithm) ============

def sm2_next_review(ease_factor: float, interval: int, repetitions: int, score: int) -> dict:
    """
    SM-2 spaced repetition algorithm.
    score: 0-100 (quiz score)
    Returns updated ease_factor, interval, repetitions, next_review_date
    """
    # Convert 0-100 score to SM-2 quality (0-5)
    quality = round(score / 20)  # 0-5

    if quality < 3:
        # Failed — reset
        repetitions = 0
        interval = 1
    else:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = round(interval * ease_factor)
        repetitions += 1

    # Update ease factor
    ease_factor = max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    next_review = datetime.now(timezone.utc) + timedelta(days=interval)
    return {
        "ease_factor": round(ease_factor, 2),
        "interval": interval,
        "repetitions": repetitions,
        "next_review_date": next_review.isoformat(),
    }

@api_router.get("/spaced-repetition/due")
async def get_due_reviews(user: dict = Depends(get_current_user)):
    """Get lessons due for review based on SM-2 schedule"""
    now = datetime.now(timezone.utc).isoformat()
    due = await db.spaced_repetition.find(
        {"user_id": user["_id"], "next_review_date": {"$lte": now}},
        {"_id": 0}
    ).to_list(20)
    # Enrich with lesson data
    result = []
    for item in due:
        lesson = await db.lessons.find_one({"id": item["lesson_id"]}, {"_id": 0, "title": 1, "subject": 1, "grade": 1, "id": 1})
        if lesson:
            result.append({**item, "lesson": lesson})
    return {"due_reviews": result, "count": len(result)}

@api_router.get("/spaced-repetition/schedule")
async def get_schedule(user: dict = Depends(get_current_user)):
    """Get full spaced repetition schedule"""
    schedule = await db.spaced_repetition.find({"user_id": user["_id"]}, {"_id": 0}).to_list(200)
    return {"schedule": schedule}

# ============ KNOWLEDGE GRAPH ============

@api_router.get("/knowledge-graph")
async def get_knowledge_graph():
    concepts = await db.concepts.find({}, {"_id": 0}).to_list(200)
    return {"concepts": concepts}

@api_router.get("/knowledge-graph/mastery")
async def get_mastery(user: dict = Depends(get_current_user)):
    mastery = await db.concept_mastery.find({"user_id": user["_id"]}, {"_id": 0}).to_list(200)
    return {"mastery": mastery}

# ============ ANALYTICS ============

@api_router.get("/analytics")
async def get_analytics(user: dict = Depends(get_current_user)):
    sessions = await db.sessions.find({"user_id": user["_id"]}, {"_id": 0}).to_list(500)
    mastery = await db.concept_mastery.find({"user_id": user["_id"]}, {"_id": 0}).to_list(200)
    total_time = sum(s.get("time_spent_seconds", 0) for s in sessions)
    concepts_mastered = sum(1 for m in mastery if m.get("score", 0) >= 70)
    return {
        "sessions": sessions,
        "mastery": mastery,
        "total_time_seconds": total_time,
        "concepts_mastered": concepts_mastered,
        "total_sessions": len(sessions),
    }

# ============ TEACHER ENDPOINTS ============

@api_router.get("/teacher/students")
async def get_teacher_students(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    assigned_classes = user.get("assigned_classes", [])
    query = {"role": "student"}
    if assigned_classes:
        query["grade_level"] = {"$in": assigned_classes}
    students = await db.users.find(query, {"password_hash": 0}).to_list(500)
    result = []
    for s in students:
        s["_id"] = str(s["_id"])
        # Get session count and avg score
        sessions = await db.sessions.find({"user_id": s["_id"]}, {"_id": 0}).to_list(100)
        avg_score = round(sum(s2.get("score", 0) for s2 in sessions) / len(sessions)) if sessions else 0
        result.append({
            **user_response(s),
            "session_count": len(sessions),
            "avg_score": avg_score,
        })
    return {"students": result}

@api_router.get("/teacher/class-analytics")
async def get_class_analytics(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    assigned_classes = user.get("assigned_classes", [])
    query = {"role": "student"}
    if assigned_classes:
        query["grade_level"] = {"$in": assigned_classes}
    students = await db.users.find(query, {"_id": 1, "name": 1, "grade_level": 1, "xp": 1, "streak": 1}).to_list(500)
    class_stats = {}
    for s in students:
        grade = s.get("grade_level", "unknown")
        if grade not in class_stats:
            class_stats[grade] = {"grade": grade, "student_count": 0, "total_xp": 0, "avg_streak": 0}
        class_stats[grade]["student_count"] += 1
        class_stats[grade]["total_xp"] += s.get("xp", 0)
        class_stats[grade]["avg_streak"] += s.get("streak", 0)
    for g in class_stats:
        n = class_stats[g]["student_count"]
        if n > 0:
            class_stats[g]["avg_xp"] = round(class_stats[g]["total_xp"] / n)
            class_stats[g]["avg_streak"] = round(class_stats[g]["avg_streak"] / n)
    return {"class_stats": list(class_stats.values()), "total_students": len(students)}

@api_router.get("/teacher/lessons")
async def get_teacher_lessons(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    assigned_classes = user.get("assigned_classes", [])
    query = {}
    if assigned_classes:
        query["grade"] = {"$in": assigned_classes}
    lessons = await db.lessons.find(query, {"_id": 0}).to_list(200)
    return {"lessons": lessons}

# ============ PARENT ENDPOINTS ============

@api_router.get("/parent/children-progress")
async def get_children_progress(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("parent", "admin"):
        raise HTTPException(status_code=403, detail="Parent access required")
    children_grades = user.get("children_grades", [])
    query = {"role": "student"}
    if children_grades:
        query["grade_level"] = {"$in": children_grades}
    students = await db.users.find(query, {"password_hash": 0}).to_list(200)
    result = []
    for s in students:
        s["_id"] = str(s["_id"])
        sessions = await db.sessions.find({"user_id": s["_id"]}, {"_id": 0}).to_list(50)
        mastery = await db.concept_mastery.find({"user_id": s["_id"]}, {"_id": 0}).to_list(50)
        concepts_mastered = sum(1 for m in mastery if m.get("score", 0) >= 70)
        total_time = sum(s2.get("time_spent_seconds", 0) for s2 in sessions)
        result.append({
            **user_response(s),
            "session_count": len(sessions),
            "concepts_mastered": concepts_mastered,
            "total_time_minutes": round(total_time / 60),
            "recent_sessions": sessions[-5:],
        })
    return {"children": result}

@api_router.get("/parent/grade-lessons")
async def get_grade_lessons(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("parent", "admin"):
        raise HTTPException(status_code=403, detail="Parent access required")
    children_grades = user.get("children_grades", [])
    query = {}
    if children_grades:
        query["grade"] = {"$in": children_grades}
    lessons = await db.lessons.find(query, {"_id": 0}).to_list(200)
    return {"lessons": lessons}

# ============ ROOT ============

@api_router.get("/")
async def root():
    return {"message": "NeuraLearn API v1"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# ============ SEED DATA ============

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@neuralearn.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin123!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "name": "Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "disability_type": "prefer_not_to_say",
            "grade_level": "college_science",
            "learning_style": "visual",
            "avatar": "owl",
            "onboarding_complete": True,
            "xp": 500,
            "level": 5,
            "streak": 10,
            "last_active": datetime.now(timezone.utc).isoformat(),
            "settings": {
                "high_contrast": False, "font_size": "medium", "reduce_motion": False,
                "haptic_intensity": "medium", "soundscape_volume": 50,
                "input_channels": {"gaze": False, "voice": False, "gesture": False, "touch": True, "keyboard": True},
                "federated_sharing": True
            },
            "achievements": ["first_lesson", "streak_3"],
            "daily_goal_minutes": 30,
            "subjects": ["mathematics", "science"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n- POST /api/auth/forgot-password\n- POST /api/auth/reset-password\n")

async def seed_concepts():
    count = await db.concepts.count_documents({})
    if count > 0:
        return
    math_concepts = [
        {"id": "math_addition", "name": "Addition", "subject": "mathematics", "grade": "class_1", "prerequisites": [], "description": "Adding numbers together"},
        {"id": "math_subtraction", "name": "Subtraction", "subject": "mathematics", "grade": "class_1", "prerequisites": ["math_addition"], "description": "Taking away numbers"},
        {"id": "math_multiplication", "name": "Multiplication", "subject": "mathematics", "grade": "class_2", "prerequisites": ["math_addition"], "description": "Repeated addition"},
        {"id": "math_division", "name": "Division", "subject": "mathematics", "grade": "class_2", "prerequisites": ["math_multiplication", "math_subtraction"], "description": "Splitting into equal parts"},
        {"id": "math_fractions", "name": "Fractions", "subject": "mathematics", "grade": "class_3", "prerequisites": ["math_division"], "description": "Parts of a whole"},
        {"id": "math_decimals", "name": "Decimals", "subject": "mathematics", "grade": "class_4", "prerequisites": ["math_fractions"], "description": "Numbers with decimal points"},
        {"id": "math_percentages", "name": "Percentages", "subject": "mathematics", "grade": "class_5", "prerequisites": ["math_fractions", "math_decimals"], "description": "Parts per hundred"},
        {"id": "math_ratios", "name": "Ratios", "subject": "mathematics", "grade": "class_6", "prerequisites": ["math_fractions"], "description": "Comparing quantities"},
        {"id": "math_algebra_basics", "name": "Algebra Basics", "subject": "mathematics", "grade": "class_6", "prerequisites": ["math_multiplication", "math_division"], "description": "Using letters for numbers"},
        {"id": "math_linear_equations", "name": "Linear Equations", "subject": "mathematics", "grade": "class_7", "prerequisites": ["math_algebra_basics"], "description": "Solving equations with one variable"},
        {"id": "math_geometry_basics", "name": "Geometry Basics", "subject": "mathematics", "grade": "class_5", "prerequisites": ["math_multiplication"], "description": "Shapes and their properties"},
        {"id": "math_area_perimeter", "name": "Area and Perimeter", "subject": "mathematics", "grade": "class_5", "prerequisites": ["math_geometry_basics", "math_multiplication"], "description": "Measuring shapes"},
        {"id": "math_angles", "name": "Angles", "subject": "mathematics", "grade": "class_6", "prerequisites": ["math_geometry_basics"], "description": "Measuring turns"},
        {"id": "math_triangles", "name": "Triangles", "subject": "mathematics", "grade": "class_7", "prerequisites": ["math_angles", "math_area_perimeter"], "description": "Three-sided shapes"},
        {"id": "math_circles", "name": "Circles", "subject": "mathematics", "grade": "class_7", "prerequisites": ["math_area_perimeter", "math_decimals"], "description": "Round shapes and pi"},
        {"id": "math_probability", "name": "Probability", "subject": "mathematics", "grade": "class_8", "prerequisites": ["math_fractions", "math_percentages"], "description": "Chance and likelihood"},
        {"id": "math_statistics", "name": "Statistics", "subject": "mathematics", "grade": "class_8", "prerequisites": ["math_decimals", "math_percentages"], "description": "Collecting and analyzing data"},
        {"id": "math_quadratic", "name": "Quadratic Equations", "subject": "mathematics", "grade": "class_9", "prerequisites": ["math_linear_equations"], "description": "Equations with squared terms"},
        {"id": "math_polynomials", "name": "Polynomials", "subject": "mathematics", "grade": "class_9", "prerequisites": ["math_algebra_basics", "math_multiplication"], "description": "Expressions with multiple terms"},
        {"id": "math_trigonometry", "name": "Trigonometry", "subject": "mathematics", "grade": "class_10", "prerequisites": ["math_triangles", "math_ratios"], "description": "Study of triangles and angles"},
        {"id": "math_coordinate_geo", "name": "Coordinate Geometry", "subject": "mathematics", "grade": "class_10", "prerequisites": ["math_linear_equations", "math_geometry_basics"], "description": "Geometry on a grid"},
        {"id": "math_sets", "name": "Sets", "subject": "mathematics", "grade": "class_11", "prerequisites": ["math_algebra_basics"], "description": "Collections of objects"},
        {"id": "math_functions", "name": "Functions", "subject": "mathematics", "grade": "class_11", "prerequisites": ["math_sets", "math_coordinate_geo"], "description": "Input-output relationships"},
        {"id": "math_limits", "name": "Limits", "subject": "mathematics", "grade": "class_11", "prerequisites": ["math_functions"], "description": "Approaching a value"},
        {"id": "math_derivatives", "name": "Derivatives", "subject": "mathematics", "grade": "class_12", "prerequisites": ["math_limits", "math_polynomials"], "description": "Rate of change"},
        {"id": "math_integrals", "name": "Integrals", "subject": "mathematics", "grade": "class_12", "prerequisites": ["math_derivatives"], "description": "Area under curves"},
        {"id": "math_matrices", "name": "Matrices", "subject": "mathematics", "grade": "class_12", "prerequisites": ["math_linear_equations"], "description": "Arrays of numbers"},
        {"id": "math_vectors", "name": "Vectors", "subject": "mathematics", "grade": "class_12", "prerequisites": ["math_coordinate_geo", "math_trigonometry"], "description": "Quantities with direction"},
    ]
    science_concepts = [
        {"id": "sci_matter", "name": "Matter", "subject": "science", "grade": "class_1", "prerequisites": [], "description": "What things are made of"},
        {"id": "sci_living_things", "name": "Living Things", "subject": "science", "grade": "class_1", "prerequisites": [], "description": "Plants and animals"},
        {"id": "sci_water", "name": "Water", "subject": "science", "grade": "class_2", "prerequisites": ["sci_matter"], "description": "Properties of water"},
        {"id": "sci_air", "name": "Air", "subject": "science", "grade": "class_2", "prerequisites": ["sci_matter"], "description": "What is air made of"},
        {"id": "sci_plants", "name": "Plants", "subject": "science", "grade": "class_3", "prerequisites": ["sci_living_things", "sci_water"], "description": "How plants grow"},
        {"id": "sci_animals", "name": "Animals", "subject": "science", "grade": "class_3", "prerequisites": ["sci_living_things"], "description": "Animal types and habitats"},
        {"id": "sci_human_body", "name": "Human Body", "subject": "science", "grade": "class_4", "prerequisites": ["sci_animals"], "description": "Our body systems"},
        {"id": "sci_force_motion", "name": "Force and Motion", "subject": "science", "grade": "class_4", "prerequisites": ["sci_matter"], "description": "Pushes and pulls"},
        {"id": "sci_energy", "name": "Energy", "subject": "science", "grade": "class_5", "prerequisites": ["sci_force_motion"], "description": "Types of energy"},
        {"id": "sci_light", "name": "Light", "subject": "science", "grade": "class_5", "prerequisites": ["sci_energy"], "description": "How light works"},
        {"id": "sci_sound", "name": "Sound", "subject": "science", "grade": "class_5", "prerequisites": ["sci_energy"], "description": "Vibrations and waves"},
        {"id": "sci_electricity", "name": "Electricity", "subject": "science", "grade": "class_6", "prerequisites": ["sci_energy"], "description": "Electric current and circuits"},
        {"id": "sci_magnetism", "name": "Magnetism", "subject": "science", "grade": "class_6", "prerequisites": ["sci_electricity"], "description": "Magnetic fields"},
        {"id": "sci_cells", "name": "Cells", "subject": "science", "grade": "class_7", "prerequisites": ["sci_human_body", "sci_plants"], "description": "Building blocks of life"},
        {"id": "sci_photosynthesis", "name": "Photosynthesis", "subject": "science", "grade": "class_7", "prerequisites": ["sci_plants", "sci_light", "sci_energy"], "description": "How plants make food"},
        {"id": "sci_acids_bases", "name": "Acids and Bases", "subject": "science", "grade": "class_7", "prerequisites": ["sci_water", "sci_matter"], "description": "Chemical properties"},
        {"id": "sci_atoms", "name": "Atoms", "subject": "science", "grade": "class_8", "prerequisites": ["sci_matter"], "description": "Smallest particles"},
        {"id": "sci_chemical_reactions", "name": "Chemical Reactions", "subject": "science", "grade": "class_8", "prerequisites": ["sci_atoms", "sci_acids_bases"], "description": "How substances change"},
        {"id": "sci_newton_laws", "name": "Newton's Laws", "subject": "science", "grade": "class_9", "prerequisites": ["sci_force_motion"], "description": "Laws of motion"},
        {"id": "sci_gravity", "name": "Gravity", "subject": "science", "grade": "class_9", "prerequisites": ["sci_newton_laws"], "description": "Force of attraction"},
        {"id": "sci_periodic_table", "name": "Periodic Table", "subject": "science", "grade": "class_9", "prerequisites": ["sci_atoms"], "description": "Organization of elements"},
        {"id": "sci_genetics", "name": "Genetics", "subject": "science", "grade": "class_10", "prerequisites": ["sci_cells"], "description": "Heredity and DNA"},
        {"id": "sci_evolution", "name": "Evolution", "subject": "science", "grade": "class_10", "prerequisites": ["sci_genetics", "sci_animals"], "description": "How species change"},
        {"id": "sci_waves", "name": "Waves", "subject": "science", "grade": "class_10", "prerequisites": ["sci_sound", "sci_light"], "description": "Wave properties"},
        {"id": "sci_thermodynamics", "name": "Thermodynamics", "subject": "science", "grade": "class_11", "prerequisites": ["sci_energy", "sci_chemical_reactions"], "description": "Heat and energy transfer"},
        {"id": "sci_organic_chem", "name": "Organic Chemistry", "subject": "science", "grade": "class_11", "prerequisites": ["sci_chemical_reactions", "sci_periodic_table"], "description": "Carbon compounds"},
        {"id": "sci_electromagnetism", "name": "Electromagnetism", "subject": "science", "grade": "class_12", "prerequisites": ["sci_electricity", "sci_magnetism", "sci_waves"], "description": "EM fields and radiation"},
        {"id": "sci_quantum", "name": "Quantum Mechanics", "subject": "science", "grade": "class_12", "prerequisites": ["sci_atoms", "sci_waves"], "description": "Physics of tiny particles"},
    ]
    all_concepts = math_concepts + science_concepts
    await db.concepts.insert_many(all_concepts)

async def seed_lessons():
    count = await db.lessons.count_documents({})
    if count > 0:
        return
    lessons = [
        {
            "id": "lesson_addition_1",
            "title": "Introduction to Addition",
            "subject": "mathematics",
            "grade": "class_1",
            "concept_id": "math_addition",
            "difficulty": 1,
            "introduction": "Addition means putting numbers together! When we add, we combine groups to find out how many there are in total.",
            "explanation": "Imagine you have 2 apples and your friend gives you 3 more. How many do you have now? We write this as 2 + 3 = 5. The '+' sign means 'add' or 'plus'.",
            "examples": [
                {"problem": "1 + 1 = ?", "answer": "2", "explanation": "One finger plus one finger equals two fingers!"},
                {"problem": "3 + 2 = ?", "answer": "5", "explanation": "Three stars plus two stars equals five stars!"}
            ],
            "quiz": [
                {"id": "q1", "question": "What is 2 + 3?", "options": ["4", "5", "6", "3"], "correct_answer": "5"},
                {"id": "q2", "question": "What is 1 + 4?", "options": ["3", "4", "5", "6"], "correct_answer": "5"},
                {"id": "q3", "question": "What is 3 + 3?", "options": ["5", "6", "7", "4"], "correct_answer": "6"},
                {"id": "q4", "question": "What is 0 + 5?", "options": ["0", "5", "4", "6"], "correct_answer": "5"},
                {"id": "q5", "question": "What is 4 + 2?", "options": ["5", "7", "6", "8"], "correct_answer": "6"}
            ]
        },
        {
            "id": "lesson_subtraction_1",
            "title": "Introduction to Subtraction",
            "subject": "mathematics",
            "grade": "class_1",
            "concept_id": "math_subtraction",
            "difficulty": 1,
            "introduction": "Subtraction means taking away! When we subtract, we find out how many are left.",
            "explanation": "If you have 5 cookies and eat 2, how many are left? We write this as 5 - 2 = 3. The '-' sign means 'subtract' or 'minus'.",
            "examples": [
                {"problem": "5 - 2 = ?", "answer": "3", "explanation": "Five cookies minus two eaten equals three left!"},
                {"problem": "4 - 1 = ?", "answer": "3", "explanation": "Four birds minus one that flew away equals three remaining!"}
            ],
            "quiz": [
                {"id": "q1", "question": "What is 5 - 3?", "options": ["1", "2", "3", "4"], "correct_answer": "2"},
                {"id": "q2", "question": "What is 4 - 2?", "options": ["1", "2", "3", "4"], "correct_answer": "2"},
                {"id": "q3", "question": "What is 6 - 1?", "options": ["4", "5", "6", "3"], "correct_answer": "5"},
                {"id": "q4", "question": "What is 3 - 0?", "options": ["0", "1", "2", "3"], "correct_answer": "3"},
                {"id": "q5", "question": "What is 7 - 4?", "options": ["2", "3", "4", "5"], "correct_answer": "3"}
            ]
        },
        {
            "id": "lesson_multiplication_1",
            "title": "Introduction to Multiplication",
            "subject": "mathematics",
            "grade": "class_2",
            "concept_id": "math_multiplication",
            "difficulty": 2,
            "introduction": "Multiplication is a quick way to add the same number many times!",
            "explanation": "If you have 3 bags with 4 apples in each, instead of adding 4+4+4, you can multiply: 3 x 4 = 12.",
            "examples": [
                {"problem": "2 x 3 = ?", "answer": "6", "explanation": "Two groups of three: 3 + 3 = 6"},
                {"problem": "4 x 2 = ?", "answer": "8", "explanation": "Four groups of two: 2 + 2 + 2 + 2 = 8"}
            ],
            "quiz": [
                {"id": "q1", "question": "What is 3 x 2?", "options": ["5", "6", "7", "8"], "correct_answer": "6"},
                {"id": "q2", "question": "What is 4 x 3?", "options": ["10", "11", "12", "14"], "correct_answer": "12"},
                {"id": "q3", "question": "What is 5 x 2?", "options": ["7", "8", "10", "12"], "correct_answer": "10"},
                {"id": "q4", "question": "What is 1 x 7?", "options": ["1", "7", "8", "6"], "correct_answer": "7"},
                {"id": "q5", "question": "What is 2 x 6?", "options": ["8", "10", "12", "14"], "correct_answer": "12"}
            ]
        },
        {
            "id": "lesson_matter_1",
            "title": "What is Matter?",
            "subject": "science",
            "grade": "class_1",
            "concept_id": "sci_matter",
            "difficulty": 1,
            "introduction": "Everything around us is made of matter! Your toys, water, and even the air you breathe!",
            "explanation": "Matter is anything that takes up space and has weight. Matter comes in three forms: solid (like a rock), liquid (like water), and gas (like air).",
            "examples": [
                {"problem": "Is a book a solid, liquid, or gas?", "answer": "Solid", "explanation": "A book has a fixed shape - it's a solid!"},
                {"problem": "Is milk a solid, liquid, or gas?", "answer": "Liquid", "explanation": "Milk flows and takes the shape of its container - it's a liquid!"}
            ],
            "quiz": [
                {"id": "q1", "question": "Which is a solid?", "options": ["Water", "Air", "Ice", "Juice"], "correct_answer": "Ice"},
                {"id": "q2", "question": "What form is water in?", "options": ["Solid", "Liquid", "Gas", "Plasma"], "correct_answer": "Liquid"},
                {"id": "q3", "question": "Can you see air?", "options": ["Yes always", "No, air is invisible", "Only at night", "Only in water"], "correct_answer": "No, air is invisible"},
                {"id": "q4", "question": "What happens to ice when heated?", "options": ["It stays the same", "It melts into water", "It becomes a rock", "It disappears"], "correct_answer": "It melts into water"},
                {"id": "q5", "question": "Which takes the shape of its container?", "options": ["A brick", "A ball", "Juice", "A pencil"], "correct_answer": "Juice"}
            ]
        },
        {
            "id": "lesson_living_1",
            "title": "Living and Non-Living Things",
            "subject": "science",
            "grade": "class_1",
            "concept_id": "sci_living_things",
            "difficulty": 1,
            "introduction": "The world is full of living and non-living things! Let's learn how to tell them apart.",
            "explanation": "Living things grow, breathe, eat, and move. Plants and animals are living things. Non-living things like rocks, water, and toys do not grow or breathe.",
            "examples": [
                {"problem": "Is a cat living or non-living?", "answer": "Living", "explanation": "A cat breathes, eats, grows, and moves - it's living!"},
                {"problem": "Is a chair living or non-living?", "answer": "Non-living", "explanation": "A chair doesn't grow, breathe, or eat - it's non-living!"}
            ],
            "quiz": [
                {"id": "q1", "question": "Which is a living thing?", "options": ["Rock", "Tree", "Water", "Chair"], "correct_answer": "Tree"},
                {"id": "q2", "question": "Do living things grow?", "options": ["Yes", "No", "Only some", "Never"], "correct_answer": "Yes"},
                {"id": "q3", "question": "Which is non-living?", "options": ["Dog", "Fish", "Flower", "Pencil"], "correct_answer": "Pencil"},
                {"id": "q4", "question": "What do living things need?", "options": ["Food and water", "Only sunlight", "Nothing", "Only air"], "correct_answer": "Food and water"},
                {"id": "q5", "question": "Is a robot living?", "options": ["Yes", "No", "Sometimes", "Only when on"], "correct_answer": "No"}
            ]
        },
        {
            "id": "lesson_fractions_1",
            "title": "Introduction to Fractions",
            "subject": "mathematics",
            "grade": "class_3",
            "concept_id": "math_fractions",
            "difficulty": 3,
            "introduction": "Fractions help us talk about parts of something! Like half a pizza or a quarter of a cake.",
            "explanation": "A fraction has two numbers: the top number (numerator) tells how many parts we have, and the bottom number (denominator) tells how many equal parts the whole is divided into. For example, 1/2 means 1 part out of 2 equal parts.",
            "examples": [
                {"problem": "What fraction is shaded if 1 out of 4 parts is colored?", "answer": "1/4", "explanation": "One part out of four equal parts is 1/4 (one quarter)"},
                {"problem": "What fraction is 3 out of 5?", "answer": "3/5", "explanation": "Three parts out of five equal parts is 3/5"}
            ],
            "quiz": [
                {"id": "q1", "question": "What is the numerator in 3/4?", "options": ["3", "4", "7", "1"], "correct_answer": "3"},
                {"id": "q2", "question": "Half of a pizza is written as?", "options": ["1/3", "1/2", "2/1", "1/4"], "correct_answer": "1/2"},
                {"id": "q3", "question": "Which is bigger: 1/2 or 1/4?", "options": ["1/2", "1/4", "They are equal", "Cannot tell"], "correct_answer": "1/2"},
                {"id": "q4", "question": "What is the denominator in 5/8?", "options": ["5", "8", "13", "3"], "correct_answer": "8"},
                {"id": "q5", "question": "2/4 is the same as?", "options": ["1/4", "1/2", "3/4", "1/3"], "correct_answer": "1/2"}
            ]
        },
        {
            "id": "lesson_energy_1",
            "title": "Types of Energy",
            "subject": "science",
            "grade": "class_5",
            "concept_id": "sci_energy",
            "difficulty": 3,
            "introduction": "Energy is everywhere! It's what makes things move, grow, and change.",
            "explanation": "Energy comes in many forms: kinetic energy (energy of motion), potential energy (stored energy), thermal energy (heat), light energy, sound energy, and electrical energy. Energy can change from one form to another but is never created or destroyed.",
            "examples": [
                {"problem": "A ball rolling down a hill has what type of energy?", "answer": "Kinetic energy", "explanation": "Moving objects have kinetic energy — the faster they move, the more kinetic energy they have!"},
                {"problem": "A stretched rubber band has what type of energy?", "answer": "Potential energy", "explanation": "Stored energy ready to be released is potential energy!"}
            ],
            "quiz": [
                {"id": "q1", "question": "What type of energy does a moving car have?", "options": ["Potential", "Kinetic", "Chemical", "Nuclear"], "correct_answer": "Kinetic"},
                {"id": "q2", "question": "Energy from the sun is called?", "options": ["Wind energy", "Solar energy", "Nuclear energy", "Chemical energy"], "correct_answer": "Solar energy"},
                {"id": "q3", "question": "A book on a shelf has what energy?", "options": ["Kinetic", "Sound", "Potential", "Electrical"], "correct_answer": "Potential"},
                {"id": "q4", "question": "Can energy be destroyed?", "options": ["Yes always", "No, it only changes form", "Only heat can be destroyed", "Yes, in space"], "correct_answer": "No, it only changes form"},
                {"id": "q5", "question": "What energy does a battery store?", "options": ["Kinetic", "Chemical", "Nuclear", "Sound"], "correct_answer": "Chemical"}
            ]
        },
        {
            "id": "lesson_algebra_1",
            "title": "Algebra Basics",
            "subject": "mathematics",
            "grade": "class_6",
            "concept_id": "math_algebra_basics",
            "difficulty": 4,
            "introduction": "Algebra uses letters to represent unknown numbers. It's like solving a mystery!",
            "explanation": "In algebra, we use variables (letters like x, y, n) to stand for unknown numbers. For example, if x + 3 = 7, we need to find what x equals. We can solve this by subtracting 3 from both sides: x = 7 - 3 = 4.",
            "examples": [
                {"problem": "Solve: x + 5 = 9", "answer": "x = 4", "explanation": "Subtract 5 from both sides: x = 9 - 5 = 4"},
                {"problem": "Solve: 2y = 10", "answer": "y = 5", "explanation": "Divide both sides by 2: y = 10 / 2 = 5"}
            ],
            "quiz": [
                {"id": "q1", "question": "Solve: x + 4 = 10", "options": ["x = 4", "x = 6", "x = 14", "x = 2"], "correct_answer": "x = 6"},
                {"id": "q2", "question": "Solve: y - 3 = 7", "options": ["y = 4", "y = 10", "y = 21", "y = 3"], "correct_answer": "y = 10"},
                {"id": "q3", "question": "Solve: 3n = 15", "options": ["n = 3", "n = 5", "n = 12", "n = 45"], "correct_answer": "n = 5"},
                {"id": "q4", "question": "What does a variable represent?", "options": ["A fixed number", "An unknown number", "A fraction", "A negative number"], "correct_answer": "An unknown number"},
                {"id": "q5", "question": "Solve: x/2 = 6", "options": ["x = 3", "x = 8", "x = 12", "x = 4"], "correct_answer": "x = 12"}
            ]
        },
        {
            "id": "lesson_cells_1",
            "title": "Cells: Building Blocks of Life",
            "subject": "science",
            "grade": "class_7",
            "concept_id": "sci_cells",
            "difficulty": 4,
            "introduction": "Every living thing is made of cells — the tiny building blocks of life!",
            "explanation": "Cells are the smallest unit of life. Plant cells have a cell wall, chloroplasts, and a large vacuole. Animal cells have a cell membrane, nucleus, mitochondria, and cytoplasm. The nucleus controls the cell, mitochondria produce energy, and the cell membrane controls what enters and exits.",
            "examples": [
                {"problem": "Which organelle produces energy in a cell?", "answer": "Mitochondria", "explanation": "Mitochondria are the powerhouses of the cell — they convert food into energy (ATP)!"},
                {"problem": "What controls what enters and exits the cell?", "answer": "Cell membrane", "explanation": "The cell membrane acts like a gatekeeper, controlling what goes in and out!"}
            ],
            "quiz": [
                {"id": "q1", "question": "What is the control center of a cell?", "options": ["Mitochondria", "Nucleus", "Vacuole", "Ribosome"], "correct_answer": "Nucleus"},
                {"id": "q2", "question": "Which organelle is found in plant cells but NOT animal cells?", "options": ["Nucleus", "Mitochondria", "Chloroplast", "Cell membrane"], "correct_answer": "Chloroplast"},
                {"id": "q3", "question": "What do mitochondria produce?", "options": ["Proteins", "Energy (ATP)", "DNA", "Chlorophyll"], "correct_answer": "Energy (ATP)"},
                {"id": "q4", "question": "What surrounds all cells?", "options": ["Cell wall", "Cell membrane", "Nucleus", "Cytoplasm"], "correct_answer": "Cell membrane"},
                {"id": "q5", "question": "What is the jelly-like fluid inside a cell called?", "options": ["Plasma", "Cytoplasm", "Chlorophyll", "Nucleus"], "correct_answer": "Cytoplasm"}
            ]
        },
        {
            "id": "lesson_newton_1",
            "title": "Newton's Laws of Motion",
            "subject": "science",
            "grade": "class_9",
            "concept_id": "sci_newton_laws",
            "difficulty": 5,
            "introduction": "Sir Isaac Newton discovered three laws that explain how objects move. These laws changed science forever!",
            "explanation": "Newton's 1st Law: An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force (inertia). Newton's 2nd Law: Force = Mass x Acceleration (F = ma). Newton's 3rd Law: For every action, there is an equal and opposite reaction.",
            "examples": [
                {"problem": "A 5 kg object accelerates at 3 m/s2. What is the force?", "answer": "15 N", "explanation": "F = ma = 5 x 3 = 15 Newtons"},
                {"problem": "Why does a rocket move forward?", "answer": "Newton's 3rd Law", "explanation": "Gas is pushed backward (action), so the rocket moves forward (reaction)!"}
            ],
            "quiz": [
                {"id": "q1", "question": "What is Newton's 1st Law about?", "options": ["Force and acceleration", "Inertia", "Action-reaction", "Gravity"], "correct_answer": "Inertia"},
                {"id": "q2", "question": "F = ma is Newton's which law?", "options": ["1st", "2nd", "3rd", "4th"], "correct_answer": "2nd"},
                {"id": "q3", "question": "A 10 kg object has force 50 N. What is acceleration?", "options": ["5 m/s2", "500 m/s2", "0.2 m/s2", "40 m/s2"], "correct_answer": "5 m/s2"},
                {"id": "q4", "question": "When you push a wall, the wall pushes back. This is Newton's?", "options": ["1st Law", "2nd Law", "3rd Law", "Law of Gravity"], "correct_answer": "3rd Law"},
                {"id": "q5", "question": "What keeps a moving ball rolling on a frictionless surface?", "options": ["Gravity", "Inertia", "Friction", "Air resistance"], "correct_answer": "Inertia"}
            ]
        },
        {
            "id": "lesson_quadratic_1",
            "title": "Quadratic Equations",
            "subject": "mathematics",
            "grade": "class_9",
            "concept_id": "math_quadratic",
            "difficulty": 6,
            "introduction": "Quadratic equations involve x squared and create beautiful parabola curves!",
            "explanation": "A quadratic equation has the form ax2 + bx + c = 0. We can solve it using the quadratic formula: x = (-b +/- sqrt(b2-4ac)) / 2a. The discriminant (b2-4ac) tells us how many solutions exist: positive = 2 solutions, zero = 1 solution, negative = no real solutions.",
            "examples": [
                {"problem": "Solve: x2 - 5x + 6 = 0", "answer": "x = 2 or x = 3", "explanation": "Factor: (x-2)(x-3) = 0, so x = 2 or x = 3"},
                {"problem": "What is the discriminant of x2 + 2x + 1 = 0?", "answer": "0", "explanation": "b2-4ac = 4 - 4(1)(1) = 0, so one repeated solution"}
            ],
            "quiz": [
                {"id": "q1", "question": "What is the standard form of a quadratic equation?", "options": ["ax + b = 0", "ax2 + bx + c = 0", "ax3 + b = 0", "a/x + b = 0"], "correct_answer": "ax2 + bx + c = 0"},
                {"id": "q2", "question": "Solve: x2 - 4 = 0", "options": ["x = 2", "x = +/-2", "x = 4", "x = +/-4"], "correct_answer": "x = +/-2"},
                {"id": "q3", "question": "The discriminant b2-4ac > 0 means?", "options": ["No real solutions", "One solution", "Two real solutions", "Infinite solutions"], "correct_answer": "Two real solutions"},
                {"id": "q4", "question": "What shape does a quadratic equation graph make?", "options": ["Line", "Circle", "Parabola", "Hyperbola"], "correct_answer": "Parabola"},
                {"id": "q5", "question": "Solve: x2 + 6x + 9 = 0", "options": ["x = 3", "x = -3", "x = +/-3", "x = 9"], "correct_answer": "x = -3"}
            ]
        },
        {
            "id": "lesson_photosynthesis_1",
            "title": "Photosynthesis",
            "subject": "science",
            "grade": "class_7",
            "concept_id": "sci_photosynthesis",
            "difficulty": 4,
            "introduction": "Plants are amazing — they make their own food using sunlight! This process is called photosynthesis.",
            "explanation": "Photosynthesis happens in chloroplasts (the green parts of plant cells). Plants take in carbon dioxide (CO2) from air and water (H2O) from soil, and use sunlight energy to produce glucose (sugar) and oxygen. The equation is: 6CO2 + 6H2O + light -> C6H12O6 + 6O2",
            "examples": [
                {"problem": "What gas do plants release during photosynthesis?", "answer": "Oxygen", "explanation": "Plants release oxygen as a byproduct — that's why forests are called the lungs of the Earth!"},
                {"problem": "Where does photosynthesis occur in a plant cell?", "answer": "Chloroplast", "explanation": "Chloroplasts contain chlorophyll, the green pigment that captures sunlight!"}
            ],
            "quiz": [
                {"id": "q1", "question": "What do plants need for photosynthesis?", "options": ["Only water", "CO2, water, and sunlight", "Only sunlight", "Oxygen and water"], "correct_answer": "CO2, water, and sunlight"},
                {"id": "q2", "question": "What is the main product of photosynthesis?", "options": ["Carbon dioxide", "Water", "Glucose", "Nitrogen"], "correct_answer": "Glucose"},
                {"id": "q3", "question": "Which pigment captures sunlight?", "options": ["Melanin", "Chlorophyll", "Hemoglobin", "Carotene"], "correct_answer": "Chlorophyll"},
                {"id": "q4", "question": "Where does photosynthesis occur?", "options": ["Mitochondria", "Nucleus", "Chloroplast", "Vacuole"], "correct_answer": "Chloroplast"},
                {"id": "q5", "question": "What gas is released as a byproduct?", "options": ["Carbon dioxide", "Nitrogen", "Hydrogen", "Oxygen"], "correct_answer": "Oxygen"}
            ]
        },
        {
            "id": "lesson_trigonometry_1",
            "title": "Introduction to Trigonometry",
            "subject": "mathematics",
            "grade": "class_10",
            "concept_id": "math_trigonometry",
            "difficulty": 7,
            "introduction": "Trigonometry is the study of relationships between angles and sides of triangles. It's used in navigation, architecture, and physics!",
            "explanation": "In a right triangle, we have three main ratios: sin(angle) = opposite/hypotenuse, cos(angle) = adjacent/hypotenuse, tan(angle) = opposite/adjacent. Remember with SOH-CAH-TOA! Key values: sin(30) = 0.5, cos(60) = 0.5, tan(45) = 1.",
            "examples": [
                {"problem": "In a right triangle, opposite = 3, hypotenuse = 5. Find sin(angle).", "answer": "0.6", "explanation": "sin = opposite/hypotenuse = 3/5 = 0.6"},
                {"problem": "What is tan(45 degrees)?", "answer": "1", "explanation": "At 45 degrees, opposite = adjacent, so tan(45) = 1"}
            ],
            "quiz": [
                {"id": "q1", "question": "SOH stands for?", "options": ["Sin = Opposite/Hypotenuse", "Sin = Adjacent/Hypotenuse", "Sin = Opposite/Adjacent", "Sin = Hypotenuse/Opposite"], "correct_answer": "Sin = Opposite/Hypotenuse"},
                {"id": "q2", "question": "What is sin(90 degrees)?", "options": ["0", "0.5", "1", "0.707"], "correct_answer": "1"},
                {"id": "q3", "question": "cos(0 degrees) = ?", "options": ["0", "1", "0.5", "0.866"], "correct_answer": "1"},
                {"id": "q4", "question": "tan(angle) = opposite/adjacent. If opposite=4, adjacent=4, tan = ?", "options": ["0", "0.5", "1", "2"], "correct_answer": "1"},
                {"id": "q5", "question": "Which ratio is CAH?", "options": ["sin", "cos", "tan", "sec"], "correct_answer": "cos"}
            ]
        },
    ]
    await db.lessons.insert_many(lessons)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.spaced_repetition.create_index([("user_id", 1), ("lesson_id", 1)], unique=True)
    await db.spaced_repetition.create_index("next_review_date")
    await seed_admin()
    await seed_concepts()
    await seed_lessons()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
