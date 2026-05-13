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
    is_prod = os.environ.get("ENV", "development") == "production"
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=is_prod, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=is_prod, samesite="lax", max_age=604800, path="/")

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
        is_prod = os.environ.get("ENV", "development") == "production"
        response.set_cookie(key="access_token", value=new_access, httponly=True, secure=is_prod, samesite="lax", max_age=3600, path="/")
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
    logging.info(f"Password reset requested for {email}")
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
        {"$set": {"streak": streak, "level": new_level, "last_active": datetime.now(timezone.utc).isoformat()}}
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
        # Failed â€” reset
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
async def get_knowledge_graph(request: Request):
    # Filter concepts by student's grade level
    try:
        user = await get_current_user(request)
        grade = user.get("grade_level")
        role = user.get("role")
        if role in ("student", "learner") and grade:
            # Build grade order to include current + prerequisite grades
            grade_order = [
                "class_1","class_2","class_3","class_4","class_5","class_6",
                "class_7","class_8","class_9","class_10","class_11","class_12",
                "college_science","college_commerce","college_arts"
            ]
            try:
                grade_idx = grade_order.index(grade)
                # Include current grade and all previous grades (prerequisites)
                allowed_grades = grade_order[:grade_idx + 1]
            except ValueError:
                allowed_grades = [grade]
            concepts = await db.concepts.find(
                {"grade": {"$in": allowed_grades}}, {"_id": 0}
            ).to_list(200)
            return {"concepts": concepts, "student_grade": grade}
    except Exception:
        pass
    # Teachers, parents, admins see all concepts
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

@api_router.get("/teacher/risk-report")
async def get_risk_report(user: dict = Depends(get_current_user)):
    """Students at risk: low engagement, falling behind, high frustration"""
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    assigned_classes = user.get("assigned_classes", [])
    query = {"role": "student"}
    if assigned_classes:
        query["grade_level"] = {"$in": assigned_classes}
    students = await db.users.find(query, {"password_hash": 0}).to_list(500)
    at_risk = []
    for s in students:
        s_id = str(s["_id"])
        sessions = await db.sessions.find({"user_id": s_id}, {"_id": 0}).to_list(20)
        recent = sessions[-5:] if sessions else []
        avg_score = round(sum(x.get("score", 0) for x in recent) / len(recent)) if recent else 0
        days_since = 999
        if sessions:
            try:
                last = datetime.fromisoformat(sessions[-1]["completed_at"].replace("Z", "+00:00"))
                days_since = (datetime.now(timezone.utc) - last).days
            except Exception:
                pass
        risk_level = "low"
        risk_reasons = []
        if avg_score < 50 and len(recent) >= 2:
            risk_level = "high"
            risk_reasons.append(f"Low avg score ({avg_score}%)")
        if days_since > 3:
            risk_level = "high" if risk_level == "high" else "medium"
            risk_reasons.append(f"Inactive {days_since} days")
        if s.get("streak", 0) == 0:
            risk_level = "medium" if risk_level == "low" else risk_level
            risk_reasons.append("No streak")
        if risk_level != "low":
            at_risk.append({
                "id": s_id,
                "name": s.get("name"),
                "grade_level": s.get("grade_level"),
                "avatar": s.get("avatar"),
                "risk_level": risk_level,
                "risk_reasons": risk_reasons,
                "avg_score": avg_score,
                "days_inactive": days_since,
                "streak": s.get("streak", 0),
            })
    return {"at_risk": at_risk, "total_at_risk": len(at_risk)}

@api_router.get("/teacher/misconceptions")
async def get_misconceptions(user: dict = Depends(get_current_user)):
    """Most common wrong answers across the class"""
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    assigned_classes = user.get("assigned_classes", [])
    query = {"role": "student"}
    if assigned_classes:
        query["grade_level"] = {"$in": assigned_classes}
    students = await db.users.find(query, {"_id": 1}).to_list(500)
    student_ids = [str(s["_id"]) for s in students]
    sessions = await db.sessions.find(
        {"user_id": {"$in": student_ids}, "score": {"$lt": 70}},
        {"_id": 0, "lesson_id": 1, "score": 1}
    ).to_list(500)
    lesson_errors = {}
    for s in sessions:
        lid = s["lesson_id"]
        lesson_errors[lid] = lesson_errors.get(lid, 0) + 1
    heatmap = sorted(
        [{"lesson_id": k, "error_count": v} for k, v in lesson_errors.items()],
        key=lambda x: x["error_count"], reverse=True
    )[:10]
    # Enrich with lesson titles
    for item in heatmap:
        lesson = await db.lessons.find_one({"id": item["lesson_id"]}, {"_id": 0, "title": 1, "subject": 1})
        if lesson:
            item.update(lesson)
    return {"misconceptions": heatmap}

@api_router.get("/teacher/students/status")
async def get_students_status(user: dict = Depends(get_current_user)):
    """
    Live classroom heatmap — returns engagement status per student.
    Polled every 30 seconds by the teacher dashboard.
    Status: green=engaged, yellow=frustrated, red=high_risk
    """
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")

    assigned_classes = user.get("assigned_classes", [])
    query = {"role": "student"}
    if assigned_classes:
        query["grade_level"] = {"$in": assigned_classes}

    students = await db.users.find(query, {"_id": 1, "name": 1, "grade_level": 1, "avatar": 1, "streak": 1, "last_active": 1}).to_list(200)

    result = []
    now = datetime.now(timezone.utc)

    for s in students:
        s_id = str(s["_id"])

        # Get last 3 sessions to determine engagement
        sessions = await db.sessions.find(
            {"user_id": s_id},
            {"_id": 0, "score": 1, "completed_at": 1}
        ).sort("completed_at", -1).to_list(3)

        # Calculate days since last active
        days_inactive = 999
        last_active_str = s.get("last_active", "")
        if last_active_str:
            try:
                last_active = datetime.fromisoformat(last_active_str.replace("Z", "+00:00"))
                days_inactive = (now - last_active).days
            except Exception:
                pass

        # Determine status
        avg_recent = round(sum(s2.get("score", 0) for s2 in sessions) / len(sessions)) if sessions else 0
        streak = s.get("streak", 0)

        if days_inactive > 2 or (avg_recent < 40 and len(sessions) >= 2):
            status = "red"       # high risk
        elif avg_recent < 60 or streak == 0:
            status = "yellow"    # frustrated / at risk
        else:
            status = "green"     # engaged

        result.append({
            "id": s_id,
            "name": s.get("name", ""),
            "grade_level": s.get("grade_level", ""),
            "avatar": s.get("avatar", "owl"),
            "status": status,
            "avg_score": avg_recent,
            "streak": streak,
            "days_inactive": days_inactive,
            "session_count": len(sessions),
        })

    return {"students": result, "total": len(result)}

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

# ============ AI TUTOR (Gemini 2.0 Flash) ============

class TutorRequest(BaseModel):
    question: str
    lesson_title: Optional[str] = None
    lesson_subject: Optional[str] = None
    grade_level: Optional[str] = None
    disability_type: Optional[str] = None
    image_base64: Optional[str] = None   # base64 encoded image for Gemini Vision
    image_mime: Optional[str] = None     # e.g. "image/jpeg"

@api_router.post("/tutor/ask")
async def ask_tutor(req: TutorRequest, user: dict = Depends(get_current_user)):
    """LLM-powered AI tutor using Google Gemini 2.0 Flash"""
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    if not gemini_key:
        # Fallback: rule-based helpful response
        return {
            "answer": f"Great question! Let me help you understand '{req.question}'. "
                      f"Try breaking the problem into smaller steps. "
                      f"If you're stuck, re-read the lesson explanation and look at the examples again. "
                      f"You can do it! ðŸ’ª",
            "source": "fallback"
        }

    # Build adaptive prompt based on student profile
    disability_note = ""
    if req.disability_type and req.disability_type != "prefer_not_to_say":
        disability_notes = {
            "visual": "Use clear text descriptions. No references to visual diagrams.",
            "hearing": "Use text only. No references to audio or sounds.",
            "cognitive": "Use very simple language. Short sentences. One idea at a time.",
            "motor": "Keep response concise and easy to read.",
            "speech": "Text-based response only.",
        }
        disability_note = disability_notes.get(req.disability_type, "")

    grade_note = f"The student is in {req.grade_level.replace('_', ' ')}." if req.grade_level else ""
    lesson_note = f"They are currently studying '{req.lesson_title}' ({req.lesson_subject})." if req.lesson_title else ""

    prompt = f"""You are Neura, a friendly and supportive AI tutor for specially-abled students.
{grade_note} {lesson_note}
{disability_note}

Student's question: {req.question}

Instructions:
- Be warm, encouraging, and patient
- Use simple language appropriate for the grade level
- Give a clear step-by-step explanation if needed
- End with an encouraging message
- Keep response under 150 words
- Use emojis sparingly to make it friendly"""

    try:
        import httpx
        # Try models in order of availability
        for model in ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"]:
            try:
                async with httpx.AsyncClient(timeout=20.0) as client:
                    # Build content parts — support text + optional image
                    parts = [{"text": prompt}]
                    if req.image_base64 and req.image_mime:
                        parts.append({
                            "inline_data": {
                                "mime_type": req.image_mime,
                                "data": req.image_base64
                            }
                        })
                    resp = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}",
                        json={"contents": [{"parts": parts}],
                              "generationConfig": {"maxOutputTokens": 300, "temperature": 0.7}},
                        headers={"Content-Type": "application/json"}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        answer = data["candidates"][0]["content"]["parts"][0]["text"]
                        # Log tutor interaction
                        await db.tutor_logs.insert_one({
                            "user_id": user["_id"],
                            "question": req.question,
                            "answer": answer[:500],
                            "lesson": req.lesson_title,
                            "model": model,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })
                        return {"answer": answer, "source": model}
                    elif resp.status_code == 429:
                        continue  # Try next model
                    else:
                        raise Exception(f"API error: {resp.status_code}")
            except Exception as model_err:
                logging.warning(f"Model {model} failed: {model_err}")
                continue
        raise Exception("All models failed")
    except Exception as e:
        logging.warning(f"Tutor API error: {e}")
        return {
            "answer": f"I'm here to help! For '{req.question}', try reviewing the lesson examples step by step. "
                      f"Each example shows you exactly how to solve similar problems. You've got this! ðŸŒŸ",
            "source": "fallback"
        }

# ============ ROOT ============

@api_router.get("/")
async def root():
    return {"message": "NeuraLearn API v1"}

# ── Chatbase Identity Token ──────────────────────────────────────────────────

@api_router.get("/chatbase/token")
async def get_chatbase_token(user: dict = Depends(get_current_user)):
    """Generate a signed JWT for Chatbase user identification"""
    import os
    secret = os.environ.get("CHATBOT_IDENTITY_SECRET", "")
    if not secret:
        # Return empty token if secret not configured — widget still works anonymously
        return {"token": None}
    try:
        payload = {
            "user_id": user.get("id") or user.get("_id", ""),
            "email": user.get("email", ""),
            "name": user.get("name", ""),
            "role": user.get("role", "student"),
            "grade_level": user.get("grade_level", ""),
        }
        token = jwt.encode(payload, secret, algorithm="HS256")
        return {"token": token}
    except Exception:
        return {"token": None}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

@api_router.post("/admin/reseed-lessons")
async def reseed_lessons(user: dict = Depends(get_current_user)):
    """Admin only: drop and re-seed lessons with full curriculum"""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.lessons.drop()
    from curriculum_data import CURRICULUM_LESSONS
    normalised = []
    for lesson in CURRICULUM_LESSONS:
        l = dict(lesson)
        l["subject"] = l.get("subject", "").lower().replace(" ", "_")
        normalised.append(l)
    await db.lessons.insert_many(normalised)
    return {"message": f"Re-seeded {len(normalised)} lessons"}

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
    try:
        os.makedirs("/app/memory", exist_ok=True)
        with open("/app/memory/test_credentials.md", "w") as f:
            f.write(f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n")
    except Exception:
        pass  # Skip file writing in production environments

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
    from curriculum_data import CURRICULUM_LESSONS
    # Normalise subject to lowercase for consistency with frontend filters
    normalised = []
    for lesson in CURRICULUM_LESSONS:
        l = dict(lesson)
        l["subject"] = l.get("subject", "").lower().replace(" ", "_")
        normalised.append(l)
    await db.lessons.insert_many(normalised)

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

from connections_router import get_connections_router
app.include_router(get_connections_router(db, get_current_user))

# ============ AI TUTOR ENDPOINT (Gemini 2.0 Flash) ============

class AITutorRequest(BaseModel):
    message: str
    lesson_context: Optional[str] = ""
    emotion_state: Optional[str] = "neutral"
    grade_level: Optional[str] = "class_5"
    disability_type: Optional[str] = "prefer_not_to_say"
    history: Optional[list] = []

@api_router.post("/ai/tutor")
async def ai_tutor(req: AITutorRequest, user: dict = Depends(get_current_user)):
    """AI Tutor powered by Google Gemini 2.0 Flash"""
    gemini_key = os.environ.get("GEMINI_API_KEY", "")

    # Build system prompt
    grade_label = req.grade_level.replace("class_", "Class ").replace("_", " ").title() if req.grade_level else "Class 5"
    disability = req.disability_type or "prefer_not_to_say"

    system_prompt = f"""You are Neura, a friendly and encouraging AI tutor for NeuraLearn — an adaptive learning platform for specially-abled students.

Student profile:
- Grade: {grade_label}
- Disability type: {disability}
- Current emotional state: {req.emotion_state}
- Lesson context: {req.lesson_context or "General learning"}

Guidelines:
- Keep responses concise (2-4 sentences max for simple questions, up to 6 for complex ones)
- Use simple, clear language appropriate for {grade_label}
- If disability is "visual": describe things verbally, avoid "look at this"
- If disability is "cognitive": use step-by-step explanations, short sentences
- If disability is "hearing": use text-based explanations, no audio references
- If emotion is "confused" or "frustrated": be extra encouraging and break things down further
- If emotion is "tired": keep it brief and suggest a break if needed
- Always end with a positive, encouraging note
- Use emojis sparingly for junior grades (Class 1-5), professionally for senior grades (Class 6-12)
- Never give direct answers to quiz questions — guide the student to find the answer themselves"""

    if not gemini_key:
        # Smart rule-based fallback
        reply = _rule_based_tutor(req.message, req.emotion_state, req.grade_level, req.disability_type)
        return {"reply": reply}

    try:
        import httpx
        # Build conversation history
        contents = []
        for h in (req.history or [])[-6:]:
            role = "user" if h.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": req.message}]})

        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 300,
                "topP": 0.9,
            }
        }

        async with httpx.AsyncClient(timeout=15.0) as client_http:
            resp = await client_http.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            resp.raise_for_status()
            data = resp.json()
            reply = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"reply": reply}

    except Exception as e:
        logging.warning(f"Gemini API error: {e}")
        reply = _rule_based_tutor(req.message, req.emotion_state, req.grade_level, req.disability_type)
        return {"reply": reply}


def _rule_based_tutor(message: str, emotion: str, grade: str, disability: str) -> str:
    """Fallback rule-based tutor responses when Gemini is unavailable"""
    msg = message.lower()
    is_junior = grade in ["class_1","class_2","class_3","class_4","class_5"]

    if emotion in ("confused", "frustrated"):
        prefix = "No worries, let's slow down! 💛 " if is_junior else "Let's break this down step by step. "
    elif emotion == "tired":
        prefix = "You're doing great! Almost there 😊 " if is_junior else "Take a moment, then let's continue. "
    else:
        prefix = "Great question! 🌟 " if is_junior else ""

    if any(w in msg for w in ["hint", "help", "stuck", "don't understand", "confused"]):
        return prefix + ("Try breaking the problem into smaller steps. What do you know so far? 💡" if is_junior
                        else "Identify what information you have, then determine what formula or concept applies.")
    if any(w in msg for w in ["example", "show me", "demonstrate"]):
        return prefix + ("Let's use something from real life! If you have 5 apples and get 3 more, how many do you have? 🍎" if is_junior
                        else "Apply the concept to a concrete scenario. Start with the simplest case and build up.")
    if any(w in msg for w in ["why", "important", "use"]):
        return prefix + ("This helps you understand the world around you! 🌍 Every topic connects to real life." if is_junior
                        else "This concept forms a foundation for more advanced topics and has direct real-world applications.")
    if any(w in msg for w in ["answer", "solution", "what is"]):
        return ("I can't give you the answer directly — but I can guide you! What have you tried so far? 🤔" if is_junior
                else "Rather than giving the answer, let's work through the reasoning. What approach have you considered?")
    if any(w in msg for w in ["easy", "simple", "explain simply"]):
        return prefix + ("Think of it this way: " + ("imagine you're explaining it to a friend using everyday objects! 🎒" if is_junior
                        else "reduce it to its core principle, then add complexity gradually."))

    return (prefix + "That's a great question! Try re-reading the lesson section on this topic and look for key words. You've got this! 💪"
            if is_junior else
            prefix + "Review the core definitions in the lesson. The answer often emerges from a solid understanding of fundamentals.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://neuralearn-frontend-m0q3.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
