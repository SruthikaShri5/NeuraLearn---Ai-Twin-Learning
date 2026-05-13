"""
NeuraLearn — Demo Seed Script for Role Connection Layer
Run: python seed_connections.py
Creates: 1 teacher, 5 students, 1 parent, 1 class, 2 assignments, connections
"""
import asyncio
import os
import secrets
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import bcrypt

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

def now():
    return datetime.now(timezone.utc).isoformat()

def tomorrow():
    return (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

def next_week():
    return (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

def hash_pw(pw):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

async def get_or_create_user(email, password, name, role, extra=None):
    existing = await db.users.find_one({"email": email})
    if existing:
        print(f"  ✓ User exists: {email}")
        existing["_id"] = str(existing["_id"])
        return existing
    doc = {
        "name": name,
        "email": email,
        "password_hash": hash_pw(password),
        "role": role,
        "avatar": "owl",
        "onboarding_complete": True,
        "xp": 0, "level": 1, "streak": 0,
        "settings": {
            "high_contrast": False, "font_size": "medium", "reduce_motion": False,
            "haptic_intensity": "medium", "soundscape_volume": 50,
            "input_channels": {"gaze": False, "voice": False, "gesture": False, "touch": True, "keyboard": True},
            "federated_sharing": True
        },
        "created_at": now(),
    }
    if extra:
        doc.update(extra)
    result = await db.users.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    print(f"  + Created user: {email}")
    return doc

async def main():
    print("\n🌱 Seeding NeuraLearn Role Connection Demo Data...\n")

    # ── 1. Teacher ──────────────────────────────────────────────────────────
    print("👩‍🏫 Creating teacher...")
    teacher = await get_or_create_user(
        email="teacher@neuralearn.com",
        password="Teacher123!",
        name="Ms. Sarah Johnson",
        role="teacher",
        extra={
            "school_name": "Spring Valley School",
            "assigned_classes": ["class_5", "class_6"],
            "subject_specialization": "mathematics",
        }
    )
    teacher_id = teacher["_id"]

    # ── 2. Class ────────────────────────────────────────────────────────────
    print("\n🏫 Creating class...")
    existing_class = await db.classes.find_one({"classCode": "NEURA5A"})
    if existing_class:
        class_id = str(existing_class["_id"])
        print(f"  ✓ Class exists: NEURA5A (id={class_id})")
    else:
        class_doc = {
            "className": "5-A Mathematics",
            "section": "A",
            "grade": 5,
            "subject": "Mathematics",
            "academicYear": "2024-2025",
            "teacherId": teacher_id,
            "teacherName": teacher["name"],
            "teacherEmail": teacher["email"],
            "classCode": "NEURA5A",
            "studentCount": 0,
            "createdAt": now(),
            "settings": {"allowParentAccess": True, "autoApproveEnrollment": False},
        }
        result = await db.classes.insert_one(class_doc)
        class_id = str(result.inserted_id)
        print(f"  + Created class: NEURA5A (id={class_id})")

    # ── 3. Students ─────────────────────────────────────────────────────────
    print("\n👦 Creating students...")
    student_data = [
        ("riya@neuralearn.com",  "Student123!", "Riya Sharma",  "class_5", "owl",    50,  3),
        ("alex@neuralearn.com",  "Student123!", "Alex Kumar",   "class_5", "fox",    120, 7),
        ("sarah@neuralearn.com", "Student123!", "Sarah Patel",  "class_5", "bunny",  30,  1),
        ("john@neuralearn.com",  "Student123!", "John Davis",   "class_5", "bear",   200, 12),
        ("priya@neuralearn.com", "Student123!", "Priya Singh",  "class_5", "cat",    80,  5),
    ]
    students = []
    for email, pw, name, grade, avatar, xp, streak in student_data:
        s = await get_or_create_user(
            email=email, password=pw, name=name, role="student",
            extra={
                "grade_level": grade,
                "disability_type": "prefer_not_to_say",
                "learning_style": "visual",
                "avatar": avatar,
                "xp": xp,
                "level": max(1, xp // 100 + 1),
                "streak": streak,
                "achievements": ["first_lesson"] if xp > 0 else [],
                "daily_goal_minutes": 30,
                "subjects": ["mathematics", "science"],
                "last_active": now(),
            }
        )
        students.append(s)

        # Enroll in class
        existing_enroll = await db.enrollments.find_one(
            {"studentId": s["_id"], "classId": class_id, "status": "active"}
        )
        if not existing_enroll:
            await db.enrollments.insert_one({
                "studentId": s["_id"],
                "studentName": s["name"],
                "studentEmail": s["email"],
                "classId": class_id,
                "teacherId": teacher_id,
                "status": "active",
                "joinedAt": now(),
            })
            await db.classes.update_one({"_id": existing_class["_id"] if existing_class else None or
                                         (await db.classes.find_one({"classCode": "NEURA5A"}))["_id"]},
                                        {"$inc": {"studentCount": 1}})
            print(f"  + Enrolled {s['name']} in NEURA5A")

    # ── 4. Assignments ──────────────────────────────────────────────────────
    print("\n📋 Creating assignments...")
    assignments_data = [
        {
            "classId": class_id,
            "teacherId": teacher_id,
            "title": "Fractions Worksheet",
            "description": "Complete all fraction problems from Chapter 3. Show your working clearly.",
            "dueDate": tomorrow(),
            "lessonId": "c4_math_fractions",
            "totalPoints": 100,
            "createdAt": now(),
            "status": "active",
        },
        {
            "classId": class_id,
            "teacherId": teacher_id,
            "title": "Percentages Practice",
            "description": "Solve the 10 percentage problems. Use the formula: (part/whole) × 100.",
            "dueDate": next_week(),
            "lessonId": "c5_math_percentages",
            "totalPoints": 50,
            "createdAt": now(),
            "status": "active",
        },
    ]
    for a_data in assignments_data:
        existing_a = await db.assignments.find_one({"title": a_data["title"], "classId": class_id})
        if not existing_a:
            result = await db.assignments.insert_one(a_data)
            assignment_id = str(result.inserted_id)
            print(f"  + Created assignment: {a_data['title']}")
            # Notify students
            for s in students:
                await db.notifications.insert_one({
                    "userId": s["_id"],
                    "type": "assignment",
                    "title": f"New Assignment: {a_data['title']}",
                    "message": a_data["description"][:100],
                    "assignmentId": assignment_id,
                    "fromUserId": teacher_id,
                    "read": False,
                    "createdAt": now(),
                })
        else:
            print(f"  ✓ Assignment exists: {a_data['title']}")

    # ── 5. Parent ───────────────────────────────────────────────────────────
    print("\n👨‍👩‍👧 Creating parent...")
    parent = await get_or_create_user(
        email="parent@neuralearn.com",
        password="Parent123!",
        name="Rajesh Sharma",
        role="parent",
        extra={
            "children_grades": ["class_5"],
            "avatar": "star",
        }
    )
    parent_id = parent["_id"]

    # ── 6. Parent-Teacher Connection ────────────────────────────────────────
    print("\n🤝 Creating parent-teacher connection...")
    existing_conn = await db.ptm_connections.find_one({
        "parentId": parent_id,
        "studentId": students[0]["_id"],
        "teacherId": teacher_id,
    })
    if not existing_conn:
        await db.ptm_connections.insert_one({
            "parentId": parent_id,
            "parentName": parent["name"],
            "studentId": students[0]["_id"],
            "studentName": students[0]["name"],
            "teacherId": teacher_id,
            "teacherName": teacher["name"],
            "teacherEmail": teacher["email"],
            "status": "approved",
            "requestedAt": now(),
            "respondedAt": now(),
            "notes": "Riya is doing well in class. Please encourage her to practice fractions daily.",
            "meetings": [],
        })
        print(f"  + Created PTM connection: {parent['name']} ↔ {teacher['name']}")
    else:
        print(f"  ✓ PTM connection exists")

    # ── 7. Sample messages ──────────────────────────────────────────────────
    print("\n💬 Creating sample messages...")
    ids = sorted([parent_id, teacher_id])
    conv_id = f"{ids[0]}_{ids[1]}"
    existing_msg = await db.messages.find_one({"conversationId": conv_id})
    if not existing_msg:
        msgs = [
            {
                "conversationId": conv_id,
                "fromUserId": teacher_id,
                "fromUserName": teacher["name"],
                "toUserId": parent_id,
                "toUserName": parent["name"],
                "message": "Hello! Riya has been doing great in class this week. She scored 90% on the fractions quiz!",
                "attachments": [],
                "read": True,
                "sentAt": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            },
            {
                "conversationId": conv_id,
                "fromUserId": parent_id,
                "fromUserName": parent["name"],
                "toUserId": teacher_id,
                "toUserName": teacher["name"],
                "message": "Thank you Ms. Johnson! We've been practising at home. Is there anything specific she should focus on?",
                "attachments": [],
                "read": True,
                "sentAt": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
            },
            {
                "conversationId": conv_id,
                "fromUserId": teacher_id,
                "fromUserName": teacher["name"],
                "toUserId": parent_id,
                "toUserName": parent["name"],
                "message": "She should focus on percentages next. There's an assignment due tomorrow — please remind her!",
                "attachments": [],
                "read": False,
                "sentAt": (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat(),
            },
        ]
        await db.messages.insert_many(msgs)
        print(f"  + Created {len(msgs)} sample messages")
    else:
        print(f"  ✓ Messages exist")

    # ── 8. DB Indexes ────────────────────────────────────────────────────────
    print("\n📑 Creating indexes...")
    await db.classes.create_index("classCode", unique=True)
    await db.classes.create_index("teacherId")
    await db.enrollments.create_index([("studentId", 1), ("classId", 1)])
    await db.enrollments.create_index("classId")
    await db.assignments.create_index("classId")
    await db.submissions.create_index([("assignmentId", 1), ("studentId", 1)])
    await db.messages.create_index("conversationId")
    await db.messages.create_index([("toUserId", 1), ("read", 1)])
    await db.notifications.create_index([("userId", 1), ("read", 1)])
    await db.ptm_connections.create_index([("parentId", 1), ("teacherId", 1)])
    print("  ✓ All indexes created")

    print("\n✅ Seed complete!\n")
    print("=" * 50)
    print("DEMO CREDENTIALS")
    print("=" * 50)
    print(f"Teacher:  teacher@neuralearn.com  / Teacher123!")
    print(f"Student1: riya@neuralearn.com     / Student123!")
    print(f"Student2: alex@neuralearn.com     / Student123!")
    print(f"Student3: sarah@neuralearn.com    / Student123!")
    print(f"Student4: john@neuralearn.com     / Student123!")
    print(f"Student5: priya@neuralearn.com    / Student123!")
    print(f"Parent:   parent@neuralearn.com   / Parent123!")
    print(f"Admin:    admin@neuralearn.com     / Admin123!")
    print("=" * 50)
    print(f"Class Code: NEURA5A")
    print("=" * 50)

    client.close()

if __name__ == "__main__":
    asyncio.run(main())
