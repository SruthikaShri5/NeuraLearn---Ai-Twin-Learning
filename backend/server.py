# -*- coding: utf-8 -*-
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
from pydantic import BaseModel, Field
from typing import List, Optional

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:5173",
        "https://neuralearn-frontend-m0q3.onrender.com",
    ] + ([os.environ.get("FRONTEND_URL")] if os.environ.get("FRONTEND_URL") else []),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    for key in ["created_at", "updated_at"]:
        if key in u and isinstance(u[key], datetime):
            u[key] = u[key].isoformat()
    return u


# ============ MODELS (single definition — no duplicates) ============

class LearningProfile(BaseModel):
    preferred_language: str = "english"
    learning_style: str = "visual"
    explanation_style: str = "conceptual"
    session_length_preference: int = 15
    revision_frequency: str = "daily"
    reading_speed_wpm: float = 150.0
    avg_quiz_accuracy: float = 0.0
    hint_usage_rate: float = 0.0
    completion_rate: float = 0.0
    confidence_level: str = "medium"
    persistence_score: float = 0.5
    attention_span_score: float = 0.7
    engagement_score: float = 0.5
    strong_subjects: List[str] = Field(default_factory=list)
    weak_subjects: List[str] = Field(default_factory=list)
    content_complexity: str = "medium"
    max_cognitive_load: float = 0.7
    struggle_threshold: int = 3


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    disability_type: Optional[str] = None
    grade_level: Optional[str] = None
    learning_style: Optional[str] = None
    avatar: Optional[str] = None
    onboarding_complete: Optional[bool] = None
    daily_goal_minutes: Optional[int] = None
    subjects: Optional[List[str]] = None
    learning_profile: Optional[dict] = None
    onboarding_data: Optional[dict] = None


class UpdateSettingsRequest(BaseModel):
    high_contrast: Optional[bool] = None
    font_size: Optional[str] = None
    reduce_motion: Optional[bool] = None
    haptic_intensity: Optional[str] = None
    soundscape_volume: Optional[int] = None
    input_channels: Optional[dict] = None
    federated_sharing: Optional[bool] = None


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"
    disability_type: str = "prefer_not_to_say"
    grade_level: str = "class_1"
    learning_style: str = "visual"
    avatar: str = "owl"
    school_name: Optional[str] = None
    assigned_classes: Optional[List[str]] = None
    subject_specialization: Optional[str] = None
    children_grades: Optional[List[str]] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class SubmitQuizRequest(BaseModel):
    lesson_id: str
    answers: dict
    time_spent_seconds: int = 0
    dynamic_metrics: Optional[dict] = None


class AITutorRequest(BaseModel):
    message: str
    lesson_context: Optional[str] = ""
    emotion_state: Optional[str] = "neutral"
    grade_level: Optional[str] = "class_5"
    disability_type: Optional[str] = "prefer_not_to_say"
    history: Optional[list] = []
    learning_profile: Optional[dict] = None


class TutorRequest(BaseModel):
    question: str
    lesson_title: Optional[str] = None
    lesson_subject: Optional[str] = None
    grade_level: Optional[str] = None
    disability_type: Optional[str] = None
    image_base64: Optional[str] = None
    image_mime: Optional[str] = None


class LinkChildRequest(BaseModel):
    child_code: str


# ============ ACHIEVEMENT ENGINE ============

ACHIEVEMENT_DEFINITIONS = [
    {"id": "first_lesson", "label": "First Lesson!", "emoji": "🎉", "desc": "Completed your first lesson"},
    {"id": "perfect_score", "label": "Perfect Score!", "emoji": "💯", "desc": "Scored 100% on a quiz"},
    {"id": "streak_3", "label": "3-Day Streak", "emoji": "🔥", "desc": "Studied 3 days in a row"},
    {"id": "streak_7", "label": "7-Day Streak", "emoji": "🏆", "desc": "Studied 7 days in a row"},
    {"id": "streak_30", "label": "30-Day Streak", "emoji": "👑", "desc": "Studied 30 days in a row"},
    {"id": "speed_learner", "label": "Speed Learner", "emoji": "⚡", "desc": "Completed a quiz in under 60 seconds"},
    {"id": "knowledge_seeker", "label": "Knowledge Seeker", "emoji": "📚", "desc": "Completed 5 lessons"},
    {"id": "master_mind", "label": "Master Mind", "emoji": "🧠", "desc": "Completed 10 lessons"},
    {"id": "no_hints", "label": "Independent Thinker", "emoji": "💡", "desc": "Scored 80%+ without any hints"},
    {"id": "comeback_kid", "label": "Comeback Kid", "emoji": "💪", "desc": "Improved score after a low attempt"},
]


async def award_achievements(user_id: str, score: int, streak: int, time_spent: int, hints: int, session_count: int, prev_score: int = 0):
    """Check and award new achievements after quiz completion."""
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)}, {"achievements": 1})
    existing = set(user_doc.get("achievements", []))
    new_achievements = []

    if "first_lesson" not in existing and session_count >= 1:
        new_achievements.append("first_lesson")
    if "perfect_score" not in existing and score == 100:
        new_achievements.append("perfect_score")
    if "streak_3" not in existing and streak >= 3:
        new_achievements.append("streak_3")
    if "streak_7" not in existing and streak >= 7:
        new_achievements.append("streak_7")
    if "streak_30" not in existing and streak >= 30:
        new_achievements.append("streak_30")
    if "speed_learner" not in existing and time_spent > 0 and time_spent < 60:
        new_achievements.append("speed_learner")
    if "knowledge_seeker" not in existing and session_count >= 5:
        new_achievements.append("knowledge_seeker")
    if "master_mind" not in existing and session_count >= 10:
        new_achievements.append("master_mind")
    if "no_hints" not in existing and score >= 80 and hints == 0:
        new_achievements.append("no_hints")
    if "comeback_kid" not in existing and prev_score > 0 and score > prev_score and prev_score < 50:
        new_achievements.append("comeback_kid")

    if new_achievements:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"achievements": {"$each": new_achievements}}}
        )

    return new_achievements


# ============ DISABILITY AUTO-CONFIG ============

def get_automatic_disability_settings(disability_type: str) -> dict:
    settings = {
        "tts_enabled": False, "voice_nav_enabled": False, "high_contrast": False,
        "huge_focus_indicators": False, "dyslexia_font": False, "increased_spacing": False,
        "keyword_highlighting": False, "captions_enabled": False, "visual_feedback_only": False,
        "step_by_step_mode": False, "reduced_distractions": False, "large_touch_targets": False,
        "keyboard_nav_priority": False, "text_only_ai": False, "learning_style": "visual"
    }
    if disability_type == "visual":
        settings.update({"tts_enabled": True, "voice_nav_enabled": True, "high_contrast": True, "huge_focus_indicators": True, "learning_style": "audio"})
    elif disability_type == "dyslexia":
        settings.update({"dyslexia_font": True, "increased_spacing": True, "keyword_highlighting": True, "tts_enabled": True, "learning_style": "reading"})
    elif disability_type == "hearing":
        settings.update({"captions_enabled": True, "visual_feedback_only": True, "learning_style": "visual"})
    elif disability_type == "cognitive":
        settings.update({"step_by_step_mode": True, "reduced_distractions": True, "learning_style": "interactive"})
    elif disability_type == "motor":
        settings.update({"large_touch_targets": True, "keyboard_nav_priority": True, "voice_nav_enabled": True, "learning_style": "interactive"})
    elif disability_type == "speech":
        settings.update({"text_only_ai": True, "learning_style": "reading"})
    elif disability_type == "multiple":
        settings.update({"tts_enabled": True, "captions_enabled": True, "step_by_step_mode": True, "large_touch_targets": True})
    return settings


# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.strip().lower()
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    role = req.role if req.role in ("student", "teacher", "parent") else "student"
    auto_config = get_automatic_disability_settings(req.disability_type or "prefer_not_to_say")

    user_doc = {
        "name": req.name, "email": email,
        "password_hash": hash_password(req.password),
        "role": role, "avatar": req.avatar,
        "onboarding_complete": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "settings": {
            "high_contrast": auto_config.get("high_contrast", False),
            "font_size": "medium",
            "reduce_motion": auto_config.get("reduced_distractions", False),
            "haptic_intensity": "medium", "soundscape_volume": 50,
            "input_channels": {"voice": auto_config.get("voice_nav_enabled", False), "keyboard": True, "text": True},
            "federated_sharing": True
        },
    }

    if role == "student":
        # Generate a unique child code for parent linking
        child_code = secrets.token_urlsafe(4).upper()[:6]
        user_doc.update({
            "disability_type": req.disability_type,
            "grade_level": req.grade_level,
            "learning_style": auto_config.get("learning_style", req.learning_style),
            "child_code": child_code,
            "parent_ids": [],
            "learning_profile": {
                "preferred_language": "english",
                "learning_style": auto_config.get("learning_style", req.learning_style),
                "explanation_style": "conceptual",
                "session_length_preference": 15, "revision_frequency": "daily",
                "reading_speed_wpm": 150.0, "avg_quiz_accuracy": 0.0,
                "hint_usage_rate": 0.0, "completion_rate": 0.0,
                "confidence_level": "medium", "persistence_score": 0.5,
                "attention_span_score": 0.7, "engagement_score": 0.5,
                "strong_subjects": [], "weak_subjects": [],
                "content_complexity": "medium", "max_cognitive_load": 0.7, "struggle_threshold": 3,
                "tts_active": auto_config.get("tts_enabled", False),
                "voice_nav_active": auto_config.get("voice_nav_enabled", False),
                "dyslexia_font_active": auto_config.get("dyslexia_font", False),
                "step_mode_active": auto_config.get("step_by_step_mode", False),
                "large_targets_active": auto_config.get("large_touch_targets", False),
                "captions_active": auto_config.get("captions_enabled", False),
                "visual_feedback_active": auto_config.get("visual_feedback_only", False),
            },
            "xp": 0, "level": 1, "streak": 0,
            "last_active": datetime.now(timezone.utc).isoformat(),
            "achievements": [], "daily_goal_minutes": 30, "subjects": [],
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
            "linked_children": [],
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
    response.delete_cookie("access_token", path="/", httponly=True, samesite="lax")
    response.delete_cookie("refresh_token", path="/", httponly=True, samesite="lax")
    return {"message": "Logged out"}


@api_router.post("/auth/refresh")
async def refresh_token_endpoint(request: Request, response: Response):
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
        "token": token, "user_id": str(user["_id"]), "email": email,
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1), "used": False
    })
    base_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{base_url}/reset-password?token={token}"
    logging.info(f"Password reset link for {email}: {reset_link}")
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    if smtp_host and smtp_user and smtp_pass:
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            smtp_port = int(os.environ.get("SMTP_PORT", "587"))
            msg_email = MIMEMultipart("alternative")
            msg_email["Subject"] = "NeuraLearn - Reset Your Password"
            msg_email["From"] = smtp_user
            msg_email["To"] = email
            html_body = f'<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;"><h2 style="color:#118AB2;">NeuraLearn</h2><p>Reset your password:</p><a href="{reset_link}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#118AB2;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a><p style="color:#64748b;font-size:13px;">Expires in 1 hour.</p></div>'
            msg_email.attach(MIMEText(html_body, "html"))
            with smtplib.SMTP(smtp_host, smtp_port) as s:
                s.ehlo(); s.starttls(); s.login(smtp_user, smtp_pass)
                s.sendmail(smtp_user, email, msg_email.as_string())
        except Exception as email_err:
            logging.warning(f"Email send failed: {email_err}")
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
    await db.users.update_one({"_id": ObjectId(record["user_id"])}, {"$set": {"password_hash": hash_password(req.new_password)}})
    await db.password_reset_tokens.update_one({"token": req.token}, {"$set": {"used": True}})
    return {"message": "Password reset successfully"}


# ============ USER PROFILE ============

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


# ============ PARENT CHILD LINKING ============

@api_router.post("/parent/link-child")
async def link_child(req: LinkChildRequest, user: dict = Depends(get_current_user)):
    """Parent links to a child using the child's 6-char code shown in student settings."""
    if user.get("role") != "parent":
        raise HTTPException(status_code=403, detail="Parent access required")
    child = await db.users.find_one({"child_code": req.child_code.upper().strip(), "role": "student"})
    if not child:
        raise HTTPException(status_code=404, detail="No student found with that code")
    child_id = str(child["_id"])
    already_linked = child_id in (user.get("linked_children") or [])
    if already_linked:
        return {"message": "Already linked", "child": user_response(child)}
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$addToSet": {"linked_children": child_id}})
    await db.users.update_one({"_id": ObjectId(child_id)}, {"$addToSet": {"parent_ids": user["_id"]}})
    return {"message": "Child linked successfully", "child": user_response(child)}


@api_router.get("/parent/linked-children")
async def get_linked_children(user: dict = Depends(get_current_user)):
    """Return only the children explicitly linked by this parent."""
    if user.get("role") not in ("parent", "admin"):
        raise HTTPException(status_code=403, detail="Parent access required")
    linked_ids = user.get("linked_children") or []
    result = []
    for child_id in linked_ids:
        try:
            child = await db.users.find_one({"_id": ObjectId(child_id)}, {"password_hash": 0})
            if not child:
                continue
            child["_id"] = str(child["_id"])
            sessions = await db.sessions.find({"user_id": child["_id"]}, {"_id": 0}).to_list(50)
            mastery = await db.concept_mastery.find({"user_id": child["_id"]}, {"_id": 0}).to_list(50)
            concepts_mastered = sum(1 for m in mastery if m.get("score", 0) >= 70)
            total_time = sum(s.get("time_spent_seconds", 0) for s in sessions)
            result.append({
                **user_response(child),
                "session_count": len(sessions),
                "concepts_mastered": concepts_mastered,
                "total_time_minutes": round(total_time / 60),
                "recent_sessions": sessions[-5:],
                "avg_score": round(sum(s.get("score", 0) for s in sessions) / len(sessions)) if sessions else 0,
            })
        except Exception:
            continue
    return {"children": result}


@api_router.get("/student/my-code")
async def get_my_child_code(user: dict = Depends(get_current_user)):
    """Student gets their unique child code to share with parents."""
    if user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    code = user.get("child_code")
    if not code:
        code = secrets.token_urlsafe(4).upper()[:6]
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"child_code": code}})
    return {"child_code": code}


# ============ STUDENT HEARTBEAT (for live classroom) ============

@api_router.post("/student/heartbeat")
async def student_heartbeat(user: dict = Depends(get_current_user)):
    """Student pings this every 60s while active — keeps classroom heatmap accurate."""
    if user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"last_active": now_iso}})
    return {"ok": True}


# ============ LESSONS ============

@api_router.get("/lessons")
async def get_lessons(request: Request, grade: Optional[str] = None, subject: Optional[str] = None):
    query = {}
    try:
        user = await get_current_user(request)
        if user.get("role") in ("student", "learner") and not grade:
            grade = user.get("grade_level")
    except Exception:
        pass
    if grade:
        query["grade"] = grade
    if subject:
        query["subject"] = subject
    lessons = await db.lessons.find(query, {"_id": 0}).to_list(500)
    return {"lessons": lessons}


@api_router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"lesson": lesson}


@api_router.post("/lessons/submit-quiz")
async def submit_quiz(req: SubmitQuizRequest, user: dict = Depends(get_current_user)):
    lesson = await db.lessons.find_one({"id": req.lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    quiz = lesson.get("quiz", [])
    correct = 0
    total = len(quiz)
    for q in quiz:
        if req.answers.get(q["id"]) == q["correct_answer"]:
            correct += 1
    score = round((correct / total) * 100) if total > 0 else 0

    # Neural Twin DNA Evolution
    profile = user.get("learning_profile", {})
    prev_accuracy = profile.get("avg_quiz_accuracy", 0.0)
    profile["avg_quiz_accuracy"] = round((prev_accuracy + score) / 2, 2)
    hints = 0

    if req.dynamic_metrics:
        hints = req.dynamic_metrics.get("hintUsage", 0)
        profile["hint_usage_rate"] = round((profile.get("hint_usage_rate", 0) + (hints / 5)) / 2, 2)
        if score > 80 and hints == 0:
            profile["confidence_level"] = "high"
        elif score < 50:
            profile["confidence_level"] = "low"
        else:
            profile["confidence_level"] = "medium"
        time_ratio = min(2.0, req.time_spent_seconds / 300) if req.time_spent_seconds > 0 else 1.0
        profile["attention_span_score"] = round((profile.get("attention_span_score", 0.7) + (1.0 - abs(1.0 - time_ratio))) / 2, 2)
        interactions = req.dynamic_metrics.get("interactions", 0)
        profile["engagement_score"] = round((profile.get("engagement_score", 0.5) + min(1.0, interactions / 10)) / 2, 2)
        if profile["avg_quiz_accuracy"] > 85:
            profile["content_complexity"] = "high"
        elif profile["avg_quiz_accuracy"] < 40:
            profile["content_complexity"] = "low"
        if interactions > 15 and profile.get("learning_style") != "interactive":
            profile["learning_style"] = "interactive"
            profile["explanation_style"] = "practical"

    # Update subject strengths/weaknesses
    subject = lesson.get("subject", "")
    if subject:
        if score >= 70:
            strong = profile.get("strong_subjects", [])
            if subject not in strong:
                strong.append(subject)
                profile["strong_subjects"] = strong
            weak = [s for s in profile.get("weak_subjects", []) if s != subject]
            profile["weak_subjects"] = weak
        elif score < 50:
            weak = profile.get("weak_subjects", [])
            if subject not in weak:
                weak.append(subject)
                profile["weak_subjects"] = weak

    # Update completion_rate
    total_sessions = await db.sessions.count_documents({"user_id": user["_id"]})
    total_lessons = await db.lessons.count_documents({"grade": user.get("grade_level", "class_1")})
    profile["completion_rate"] = round(min(1.0, (total_sessions + 1) / max(1, total_lessons)), 2)

    # Mastery in knowledge graph
    concept_id = lesson.get("concept_id", lesson["id"])
    await db.concept_mastery.update_one(
        {"user_id": user["_id"], "concept_id": concept_id},
        {"$set": {"score": score, "last_attempted": datetime.now(timezone.utc).isoformat(), "concept_id": concept_id, "user_id": user["_id"]}},
        upsert=True
    )

    xp_gained = score // 10
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$inc": {"xp": xp_gained}, "$set": {"last_active": datetime.now(timezone.utc).isoformat(), "learning_profile": profile}}
    )

    # Log session
    await db.sessions.insert_one({
        "id": str(uuid.uuid4()), "user_id": user["_id"],
        "lesson_id": req.lesson_id, "score": score, "correct": correct, "total": total,
        "xp_gained": xp_gained, "time_spent_seconds": req.time_spent_seconds,
        "completed_at": datetime.now(timezone.utc).isoformat()
    })

    # SM-2 spaced repetition
    existing_sr = await db.spaced_repetition.find_one({"user_id": user["_id"], "lesson_id": req.lesson_id})
    prev_score = existing_sr.get("last_score", 0) if existing_sr else 0
    if existing_sr:
        sr_update = sm2_next_review(existing_sr.get("ease_factor", 2.5), existing_sr.get("interval", 1), existing_sr.get("repetitions", 0), score)
    else:
        sr_update = sm2_next_review(2.5, 1, 0, score)
    await db.spaced_repetition.update_one(
        {"user_id": user["_id"], "lesson_id": req.lesson_id},
        {"$set": {**sr_update, "user_id": user["_id"], "lesson_id": req.lesson_id, "last_score": score}},
        upsert=True
    )

    # Streak update
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
        else:
            streak = 1
    except Exception:
        streak = max(1, streak)

    new_xp = (user_doc.get("xp", 0) or 0) + xp_gained
    new_level = max(1, new_xp // 100 + 1)
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"streak": streak, "level": new_level, "last_active": datetime.now(timezone.utc).isoformat()}}
    )

    # Achievements
    session_count_new = total_sessions + 1
    new_achievements = await award_achievements(
        user["_id"], score, streak, req.time_spent_seconds, hints, session_count_new, prev_score
    )

    return {
        "score": score, "correct": correct, "total": total,
        "xp_gained": xp_gained, "streak": streak,
        "next_review_date": sr_update.get("next_review_date"),
        "interval_days": sr_update.get("interval"),
        "new_achievements": new_achievements,
    }


# ============ SM-2 ALGORITHM (fixed encoding) ============

def sm2_next_review(ease_factor: float, interval: int, repetitions: int, score: int) -> dict:
    """SM-2 spaced repetition. score: 0-100."""
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
    ease_factor = max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    next_review = datetime.now(timezone.utc) + timedelta(days=interval)
    return {"ease_factor": round(ease_factor, 2), "interval": interval, "repetitions": repetitions, "next_review_date": next_review.isoformat()}


# ============ SPACED REPETITION ============

@api_router.get("/spaced-repetition/due")
async def get_due_reviews(user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    due = await db.spaced_repetition.find({"user_id": user["_id"], "next_review_date": {"$lte": now}}, {"_id": 0}).to_list(20)
    result = []
    for item in due:
        lesson = await db.lessons.find_one({"id": item["lesson_id"]}, {"_id": 0, "title": 1, "subject": 1, "grade": 1, "id": 1})
        if lesson:
            result.append({**item, "lesson": lesson})
    return {"due_reviews": result, "count": len(result)}


@api_router.get("/spaced-repetition/schedule")
async def get_schedule(user: dict = Depends(get_current_user)):
    schedule = await db.spaced_repetition.find({"user_id": user["_id"]}, {"_id": 0}).to_list(200)
    return {"schedule": schedule}


# ============ RECOMMENDATIONS ============

@api_router.get("/recommendations")
async def get_recommendations(user: dict = Depends(get_current_user)):
    """Proactive next-lesson recommendations based on weak_subjects and completion."""
    profile = user.get("learning_profile", {})
    weak_subjects = profile.get("weak_subjects", [])
    grade = user.get("grade_level", "class_1")

    # Get lessons the user has already attempted
    sessions = await db.sessions.find({"user_id": user["_id"]}, {"_id": 0, "lesson_id": 1}).to_list(200)
    attempted_ids = {s["lesson_id"] for s in sessions}

    # Priority: weak subject lessons not yet attempted
    query = {"grade": grade, "id": {"$nin": list(attempted_ids)}}
    if weak_subjects:
        query["subject"] = {"$in": weak_subjects}

    recommendations = await db.lessons.find(query, {"_id": 0, "id": 1, "title": 1, "subject": 1, "grade": 1, "introduction": 1}).to_list(5)

    # Fallback: any not-attempted lesson
    if not recommendations:
        fallback_query = {"grade": grade, "id": {"$nin": list(attempted_ids)}}
        recommendations = await db.lessons.find(fallback_query, {"_id": 0, "id": 1, "title": 1, "subject": 1, "grade": 1, "introduction": 1}).to_list(5)

    return {"recommendations": recommendations, "based_on_weak": weak_subjects}


# ============ KNOWLEDGE GRAPH ============

@api_router.get("/knowledge-graph")
async def get_knowledge_graph(request: Request):
    try:
        user = await get_current_user(request)
        grade = user.get("grade_level")
        role = user.get("role")
        if role in ("student", "learner") and grade:
            grade_order = ["class_1","class_2","class_3","class_4","class_5","class_6","class_7","class_8","class_9","class_10","class_11","class_12"]
            try:
                grade_idx = grade_order.index(grade)
                allowed_grades = grade_order[:grade_idx + 1]
            except ValueError:
                allowed_grades = [grade]
            concepts = await db.concepts.find({"grade": {"$in": allowed_grades}}, {"_id": 0}).to_list(500)
            grade_lessons = await db.lessons.find({"grade": grade}, {"_id": 0, "id": 1, "concept_id": 1}).to_list(300)
            lesson_map = {l.get("concept_id"): l.get("id") for l in grade_lessons}
            for c in concepts:
                c["lesson_id"] = lesson_map.get(c.get("id"))
            return {"concepts": concepts, "student_grade": grade}
    except Exception as e:
        logging.warning(f"[knowledge-graph] auth/error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Authentication required")


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
    return {"sessions": sessions, "mastery": mastery, "total_time_seconds": total_time, "concepts_mastered": concepts_mastered, "total_sessions": len(sessions)}


# ============ LEADERBOARD ============

@api_router.get("/leaderboard")
async def get_leaderboard(request: Request):
    """Top 20 students by XP within the same grade."""
    try:
        user = await get_current_user(request)
        grade = user.get("grade_level", "class_1")
        my_id = user.get("_id") or user.get("id")
    except Exception:
        raise HTTPException(status_code=401, detail="Not authenticated")

    students = await db.users.find(
        {"role": "student", "grade_level": grade},
        {"_id": 1, "name": 1, "avatar": 1, "xp": 1, "level": 1, "streak": 1}
    ).sort("xp", -1).to_list(20)

    result = []
    my_rank = None
    for i, s in enumerate(students):
        s_id = str(s["_id"])
        entry = {
            "rank": i + 1,
            "id": s_id,
            "name": s.get("name", ""),
            "avatar": s.get("avatar", "owl"),
            "xp": s.get("xp", 0),
            "level": s.get("level", 1),
            "streak": s.get("streak", 0),
            "is_me": s_id == my_id,
        }
        result.append(entry)
        if s_id == my_id:
            my_rank = i + 1

    # If current user not in top 20, get their rank
    if my_rank is None:
        count_above = await db.users.count_documents({"role": "student", "grade_level": grade, "xp": {"$gt": user.get("xp", 0)}})
        my_rank = count_above + 1

    return {"leaderboard": result, "my_rank": my_rank, "grade": grade}


# ============ ACHIEVEMENTS ============

@api_router.get("/achievements")
async def get_achievements(user: dict = Depends(get_current_user)):
    """Return user's earned achievements with metadata."""
    earned = set(user.get("achievements", []))
    result = []
    for ach in ACHIEVEMENT_DEFINITIONS:
        result.append({**ach, "earned": ach["id"] in earned})
    return {"achievements": result, "earned_count": len(earned), "total_count": len(ACHIEVEMENT_DEFINITIONS)}


# ============ TEACHER CUSTOM LESSON ============

class CreateLessonRequest(BaseModel):
    title: str
    subject: str
    grade: str
    introduction: str
    explanation: str
    quiz: Optional[List[dict]] = []

@api_router.post("/teacher/lessons/create")
async def create_teacher_lesson(req: CreateLessonRequest, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    import uuid
    lesson_id = f"custom_{str(uuid.uuid4())[:8]}"
    lesson = {
        "id": lesson_id,
        "title": req.title,
        "subject": req.subject.lower().replace(" ", "_"),
        "grade": req.grade,
        "introduction": req.introduction,
        "explanation": req.explanation,
        "quiz": req.quiz,
        "difficulty": 1,
        "created_by": user["_id"],
        "is_custom": True,
        "examples": [],
        "key_concepts": [],
        "concept_id": lesson_id,
    }
    await db.lessons.insert_one(lesson)
    lesson.pop("_id", None)
    return {"lesson": lesson, "message": "Lesson created successfully"}


# ============ TEACHER ENDPOINTS ============

@api_router.get("/teacher/students")
async def get_teacher_students(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    
    # Get students via enrollment
    enrollments = await db.enrollments.find({"teacherId": str(user["_id"]), "status": "active"}).to_list(500)
    student_ids = [ObjectId(e["studentId"]) for e in enrollments]
    
    query = {"_id": {"$in": student_ids}}
    students = await db.users.find(query, {"password_hash": 0}).to_list(500)
    result = []
    for s in students:
        s["_id"] = str(s["_id"])
        sessions = await db.sessions.find({"user_id": s["_id"]}, {"_id": 0}).to_list(100)
        avg_score = round(sum(s2.get("score", 0) for s2 in sessions) / len(sessions)) if sessions else 0
        result.append({**user_response(s), "session_count": len(sessions), "avg_score": avg_score})
    return {"students": result}


@api_router.get("/teacher/class-analytics")
async def get_class_analytics(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    
    # Get students via enrollment
    enrollments = await db.enrollments.find({"teacherId": str(user["_id"]), "status": "active"}).to_list(500)
    student_ids = [ObjectId(e["studentId"]) for e in enrollments]
    
    query = {"_id": {"$in": student_ids}}
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
    lessons = await db.lessons.find(query, {"_id": 0}).to_list(500)
    return {"lessons": lessons}


@api_router.get("/teacher/risk-report")
async def get_risk_report(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    
    # Get students via enrollment
    enrollments = await db.enrollments.find({"teacherId": str(user["_id"]), "status": "active"}).to_list(500)
    student_ids = [ObjectId(e["studentId"]) for e in enrollments]
    
    query = {"_id": {"$in": student_ids}}
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
                "id": s_id, "name": s.get("name"), "grade_level": s.get("grade_level"),
                "avatar": s.get("avatar"), "risk_level": risk_level, "risk_reasons": risk_reasons,
                "avg_score": avg_score, "days_inactive": days_since, "streak": s.get("streak", 0),
            })
    return {"at_risk": at_risk, "total_at_risk": len(at_risk)}


@api_router.get("/teacher/misconceptions")
async def get_misconceptions(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    # Use enrollments to find students (works even without assigned_classes)
    enrollments = await db.enrollments.find({"teacherId": str(user["_id"]), "status": "active"}).to_list(500)
    student_ids = [e["studentId"] for e in enrollments]
    if not student_ids:
        return {"misconceptions": []}
    sessions = await db.sessions.find({"user_id": {"$in": student_ids}, "score": {"$lt": 70}}, {"_id": 0, "lesson_id": 1, "score": 1}).to_list(500)
    lesson_errors = {}
    for s in sessions:
        lid = s["lesson_id"]
        lesson_errors[lid] = lesson_errors.get(lid, 0) + 1
    heatmap = sorted([{"lesson_id": k, "error_count": v} for k, v in lesson_errors.items()], key=lambda x: x["error_count"], reverse=True)[:10]
    for item in heatmap:
        lesson = await db.lessons.find_one({"id": item["lesson_id"]}, {"_id": 0, "title": 1, "subject": 1})
        if lesson:
            item.update(lesson)
    return {"misconceptions": heatmap}


@api_router.get("/teacher/students/concept-mastery")
async def get_students_concept_mastery(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    enrollments = await db.enrollments.find({"teacherId": str(user["_id"]), "status": "active"}).to_list(200)
    student_ids = [ObjectId(e["studentId"]) for e in enrollments]
    students = await db.users.find({"_id": {"$in": student_ids}}, {"_id": 1, "name": 1, "avatar": 1, "grade_level": 1}).to_list(200)
    result = []
    for s in students:
        s_id = str(s["_id"])
        sessions = await db.sessions.find({"user_id": s_id}, {"_id": 0, "lesson_id": 1, "score": 1}).to_list(200)
        lesson_scores = {}
        for sess in sessions:
            lid = sess["lesson_id"]
            lesson_scores[lid] = max(lesson_scores.get(lid, 0), sess.get("score", 0))
        result.append({
            "id": s_id, "name": s.get("name", ""), "avatar": s.get("avatar", "owl"),
            "grade_level": s.get("grade_level", ""), "lesson_scores": lesson_scores,
            "avg_score": round(sum(lesson_scores.values()) / len(lesson_scores)) if lesson_scores else 0,
        })
    return {"students": result}


@api_router.get("/teacher/students/status")
async def get_students_status(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher access required")
    
    # Get students via enrollment
    enrollments = await db.enrollments.find({"teacherId": str(user["_id"]), "status": "active"}).to_list(200)
    student_ids = [ObjectId(e["studentId"]) for e in enrollments]
    
    query = {"_id": {"$in": student_ids}}
    students = await db.users.find(query, {"_id": 1, "name": 1, "grade_level": 1, "avatar": 1, "streak": 1, "last_active": 1}).to_list(200)
    result = []
    now = datetime.now(timezone.utc)
    for s in students:
        s_id = str(s["_id"])
        sessions = await db.sessions.find({"user_id": s_id}, {"_id": 0, "score": 1, "completed_at": 1}).sort("completed_at", -1).to_list(3)
        
        last_active_str = s.get("last_active", "")
        is_online = False
        days_inactive = 999
        if last_active_str:
            try:
                last_active = datetime.fromisoformat(last_active_str.replace("Z", "+00:00"))
                diff = now - last_active
                is_online = diff.total_seconds() < 120 # Online if active in last 2 mins
                days_inactive = diff.days
            except Exception:
                pass
        
        avg_recent = round(sum(s2.get("score", 0) for s2 in sessions) / len(sessions)) if sessions else 0
        streak = s.get("streak", 0)
        
        # New Status Logic
        if is_online:
            if avg_recent < 40 and len(sessions) >= 1:
                status = "yellow" # Online but struggling
            else:
                status = "green"  # Online and doing okay
        else:
            if days_inactive > 2 or (avg_recent < 40 and len(sessions) >= 2):
                status = "red"    # Inactive or high risk
            else:
                status = "yellow" # Away or moderate risk
                
        result.append({
            "id": s_id, "name": s.get("name", ""), "grade_level": s.get("grade_level", ""),
            "avatar": s.get("avatar", "owl"), "status": status, "avg_score": avg_recent,
            "streak": streak, "days_inactive": days_inactive, "session_count": len(sessions),
            "is_online": is_online
        })
    return {"students": result, "total": len(result)}


# ============ PARENT ENDPOINTS (grade-based fallback) ============

@api_router.get("/parent/children-progress")
async def get_children_progress(user: dict = Depends(get_current_user)):
    """Returns linked children first, then grade-matched as fallback."""
    if user.get("role") not in ("parent", "admin"):
        raise HTTPException(status_code=403, detail="Parent access required")

    linked_ids = user.get("linked_children") or []
    children_grades = user.get("children_grades", [])

    if linked_ids:
        # Use real linked children
        query = {"_id": {"$in": [ObjectId(i) for i in linked_ids if ObjectId.is_valid(i)]}, "role": "student"}
    else:
        return {"children": []}

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
            "avg_score": round(sum(s2.get("score", 0) for s2 in sessions) / len(sessions)) if sessions else 0,
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
    lessons = await db.lessons.find(query, {"_id": 0}).to_list(500)
    return {"lessons": lessons}


# ============ AI TUTOR ============

@api_router.post("/ai/tutor")
async def ai_tutor(req: AITutorRequest, user: dict = Depends(get_current_user)):
    grade_label = (req.grade_level or "").replace("_", " ").replace("class ", "Class ").strip() or "Class 5"
    disability = req.disability_type or "prefer_not_to_say"
    profile = req.learning_profile or user.get("learning_profile", {})
    style = profile.get("learning_style") or "visual"
    complexity = profile.get("content_complexity") or "medium"

    # Build disability-specific behaviour instructions
    disability_instructions = {
        "visual": """- You MUST proactively ask the student what they want to do next after every response.
- Always end with one of: 'Would you like me to explain more?', 'Shall I give you an example?', or 'Ready for the next concept?'
- Never reference diagrams or visual elements. Describe everything verbally.
- Speak in a warm, conversational tone as if talking to the student.""",
        "dyslexia": """- Use bullet points for every explanation.
- Keep every sentence under 12 words.
- Bold key terms using markdown **term**.
- Avoid complex vocabulary.""",
        "hearing": """- Text-only responses. Never reference audio, sounds, or 'listening'.
- Use visual metaphors (shapes, colours, positions).
- Structure responses with clear headings and bullet points.""",
        "cognitive": """- One idea per response only. Never combine multiple concepts.
- Use numbered steps for any process.
- Always confirm understanding: end with 'Does that make sense? Tell me in your own words.'
- Use very simple vocabulary.""",
        "motor": """- Keep responses short (max 3 sentences).
- Offer numbered choices so the student can reply with just a number.
- End every response with numbered options: '1) Yes, continue  2) Repeat this  3) Skip'""",
        "speech": """- Text-only. Never ask the student to say anything aloud.
- Offer clickable quick replies as numbered options.
- Keep responses brief and scannable.""",
    }.get(disability, "- Be warm, clear, and encouraging.")

    system_prompt = f"""You are Neura, a friendly AI tutor for NeuraLearn — an adaptive learning platform for specially-abled students.

Student profile:
- Grade: {grade_label}
- Disability type: {disability}
- Learning Style: {style}
- Content Complexity: {complexity}
- Current emotional state: {req.emotion_state}
- Lesson context: {req.lesson_context or "General learning"}

Disability-specific behaviour:
{disability_instructions}

General guidelines:
- Keep responses concise (2-4 sentences for simple questions, up to 6 for complex)
- Use simple language appropriate for {grade_label}
- If emotion is "confused" or "frustrated": be extra encouraging and slow down
- Never give direct quiz answers — guide the student to think
- Always respond in a way that builds independence, not dependency"""

    history_context = ""
    if req.history:
        for h in req.history[-6:]:
            role = "Student" if h.get("role") == "user" else "Tutor"
            history_context += f"{role}: {h.get('content', '')}\n"

    full_prompt = f"{system_prompt}\n\n{history_context}\nStudent: {req.message}\nTutor:"

    reply = ""
    source = ""

    for provider_name, provider_call in [
        ("groq", _call_groq(system_prompt, req.history or [], req.message)),
        ("gemini", _call_gemini(system_prompt, req.history or [], req.message)),
    ]:
        try:
            reply, source = await provider_call
            if reply:
                return {"reply": reply, "source": source}
        except Exception as e:
            logging.warning(f"AI provider {provider_name} failed: {e}")
            continue

    reply = _rule_based_tutor(req.message, req.emotion_state, req.grade_level, req.disability_type)
    return {"reply": reply, "fallback": True, "error": "all_providers_failed"}


async def _call_ollama(prompt: str):
    """Try local Ollama (llama3) — fast fallback for dev."""
    import httpx
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False}
        )
        r.raise_for_status()
        return r.json().get("response", "").strip(), "ollama"


async def _call_groq(system_prompt: str, history: list, message: str):
    """Call Groq API (llama-3.1-8b-instant) — fast and generous free tier."""
    import httpx
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key or api_key == "your-groq-key-here":
        raise ValueError("No GROQ_API_KEY set")

    messages = [{"role": "system", "content": system_prompt}]
    for h in (history or [])[-6:]:
        role = "user" if h.get("role") in ("user",) else "assistant"
        content = h.get("content") or h.get("text", "")
        if content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": message})

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": "llama-3.1-8b-instant", "messages": messages, "max_tokens": 500, "temperature": 0.7}
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip(), "groq"


async def _call_gemini(system_prompt: str, history: list, message: str):
    """Call Gemini 2.0 Flash via REST."""
    import httpx
    import asyncio
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("No GEMINI_API_KEY set")

    # Build contents — Gemini requires alternating user/model roles
    contents = []
    for h in (history or [])[-6:]:
        role = "user" if h.get("role") == "user" else "model"
        text = h.get("content", "").strip()
        if text:
            # Ensure alternating roles (skip consecutive same-role)
            if contents and contents[-1]["role"] == role:
                contents[-1]["parts"][0]["text"] += "\n" + text
            else:
                contents.append({"role": role, "parts": [{"text": text}]})

    # Always end with user message
    if contents and contents[-1]["role"] == "user":
        contents[-1]["parts"][0]["text"] += "\n" + message
    else:
        contents.append({"role": "user", "parts": [{"text": message}]})

    body = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 400,
            "topP": 0.9,
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        ]
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    for attempt in range(3):
        async with httpx.AsyncClient(timeout=25) as client:
            r = await client.post(url, json=body)
            if r.status_code == 429:
                await asyncio.sleep(2 ** attempt)
                continue
            r.raise_for_status()
            data = r.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("Gemini returned no candidates")
            text = candidates[0]["content"]["parts"][0]["text"].strip()
            return text, "gemini"
    raise ValueError("Gemini rate limit exceeded after retries")


def _rule_based_tutor(message: str, emotion: str, grade: str, disability: str) -> str:
    import random
    msg = message.lower().strip()
    is_junior = grade in ["class_1", "class_2", "class_3", "class_4", "class_5"]
    
    base_jr_prefix = {
        "confused": "No worries, let's slow down! 💛 ",
        "frustrated": "Take a deep breath — we'll figure this out together! 💛 ",
        "tired": "You're doing great! 😊 ",
    }.get(emotion, "Great question! 🌟 ")
    
    base_sr_prefix = {
        "confused": "Let's break this down step by step. ",
        "frustrated": "Let's take it one step at a time. ",
        "tired": "Take a moment, then let's continue. ",
    }.get(emotion, "")
    
    prefix = base_jr_prefix if is_junior else base_sr_prefix
    
    responses = []
    if any(w in msg for w in ["hint", "help", "stuck", "don't understand", "confused"]):
        responses += [
            prefix + ("Try breaking the problem into smaller steps. What do you know so far? 💡" if is_junior else "Identify what you have, then determine what concept applies."),
            prefix + ("Let's start with what you do know! Can you tell me one thing about this topic? 💡" if is_junior else "Start by identifying the knowns, then apply the relevant concept."),
        ]
    elif any(w in msg for w in ["example", "show me", "demonstrate"]):
        responses += [
            prefix + ("Let's use real life! If you have 5 apples and get 3 more, how many? 🍎" if is_junior else "Apply the concept to a concrete scenario. Start with the simplest case."),
            prefix + ("Here's a simple example: think about when you share candies equally among friends! 🍬" if is_junior else "Consider a real-world application and work through it numerically."),
        ]
    elif any(w in msg for w in ["why", "important", "use"]):
        responses += [
            prefix + ("This helps you understand the world! 🌍" if is_junior else "This concept forms a foundation for advanced topics and real-world use."),
            prefix + ("Knowing this helps you make better decisions every day! 🌟" if is_junior else "It builds foundational understanding for more advanced applications."),
        ]
    elif any(w in msg for w in ["answer", "solution", "what is"]):
        responses += [
            ("I can't give the answer directly — what have you tried so far? 🤔" if is_junior else "Let's work through the reasoning. What approach have you considered?"),
            ("Let's think about this together — what does the problem tell us first? 🤔" if is_junior else "Consider what the question is really asking. What's missing from your current approach?"),
        ]
    
    if not responses:
        responses = [
            prefix + ("Re-read the lesson section on this topic. You've got this! 💪" if is_junior else "Review the core definitions in the lesson. The answer often emerges from solid fundamentals."),
            prefix + ("You're closer than you think! Try the lesson examples again. 💪" if is_junior else "Review the lesson material and try applying it to a simpler case first."),
            prefix + ("That's a great direction! Can you tell me more about what you've tried? 🧠" if is_junior else "Good thinking. Can you expand on your current approach?"),
        ]
    
    return random.choice(responses)


# ============ FOCUS TREE XP ============

@api_router.post("/focus/complete")
async def focus_complete(user: dict = Depends(get_current_user)):
    """Award 50 XP when student completes a 25-minute focus session."""
    if user.get("role") not in ("student", "learner"):
        raise HTTPException(status_code=403, detail="Student access required")
    xp_bonus = 50
    user_doc = await db.users.find_one({"_id": ObjectId(user["_id"])})
    new_xp = (user_doc.get("xp", 0) or 0) + xp_bonus
    new_level = max(1, new_xp // 100 + 1)
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$inc": {"xp": xp_bonus}, "$set": {"level": new_level}}
    )
    return {"xp_gained": xp_bonus, "new_xp": new_xp, "new_level": new_level}



async def root():
    return {"message": "NeuraLearn API v1"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

@api_router.post("/admin/reseed-lessons")
async def reseed_lessons(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from curriculum_data import CURRICULUM_LESSONS
    count = 0
    for lesson in CURRICULUM_LESSONS:
        l = dict(lesson)
        l["subject"] = l.get("subject", "").lower().replace(" ", "_")
        await db.lessons.update_one({"id": l["id"]}, {"$set": l}, upsert=True)
        count += 1
    await seed_concepts()
    return {"message": f"Re-seeded {count} lessons"}


# ============ SEED DATA ============

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@neuralearn.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin123!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "name": "Admin", "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin", "disability_type": "prefer_not_to_say",
            "grade_level": "college_science", "learning_style": "visual",
            "avatar": "owl", "onboarding_complete": True,
            "xp": 500, "level": 5, "streak": 10,
            "last_active": datetime.now(timezone.utc).isoformat(),
            "settings": {"high_contrast": False, "font_size": "medium", "reduce_motion": False, "haptic_intensity": "medium", "soundscape_volume": 50, "input_channels": {"gaze": False, "voice": False, "gesture": False, "touch": True, "keyboard": True}, "federated_sharing": True},
            "achievements": ["first_lesson", "streak_3", "knowledge_seeker"],
            "daily_goal_minutes": 30, "subjects": ["mathematics", "science"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })


async def seed_concepts():
    from curriculum_data import CURRICULUM_LESSONS
    count = 0
    for lesson in CURRICULUM_LESSONS:
        cid = lesson.get("concept_id") or lesson["id"]
        doc = {"id": cid, "name": lesson["title"], "subject": lesson.get("subject", "").lower().replace(" ", "_"), "grade": lesson.get("grade"), "prerequisites": [], "description": (lesson.get("introduction") or "")[:200]}
        await db.concepts.update_one({"id": cid}, {"$set": doc}, upsert=True)
        count += 1
    logging.info(f"Concepts synced: {count}")


async def seed_lessons():
    from curriculum_data import CURRICULUM_LESSONS
    count = 0
    for lesson in CURRICULUM_LESSONS:
        l = dict(lesson)
        l["subject"] = l.get("subject", "").lower().replace(" ", "_")
        await db.lessons.update_one({"id": l["id"]}, {"$set": l}, upsert=True)
        count += 1
    logging.info(f"Lessons synced: {count}")


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("child_code", sparse=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.spaced_repetition.create_index([("user_id", 1), ("lesson_id", 1)], unique=True)
    await db.spaced_repetition.create_index("next_review_date")
    await seed_admin()
    await seed_concepts()
    await seed_lessons()

app.include_router(api_router)

from connections_router import get_connections_router
app.include_router(get_connections_router(db, get_current_user))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
