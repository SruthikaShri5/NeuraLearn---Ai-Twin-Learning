"""
NeuraLearn Role Connection Layer — FastAPI Router
All 24+ endpoints for classes, enrollments, assignments, messages, notifications, PTM
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import secrets

conn_router = APIRouter(prefix="/api")

# These are injected via get_connections_router()
_db = None
_get_current_user = None

# Wrapper so FastAPI resolves the dependency at call time, not at import time
async def get_current_user(request: Request):
    return await _get_current_user(request)

# ── Helpers ──────────────────────────────────────────────────────────────────

def gen_class_code():
    return secrets.token_urlsafe(6).upper()[:8]

def oid(s):
    try:
        return ObjectId(s)
    except Exception:
        raise HTTPException(400, "Invalid ID")

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def serialize(doc):
    """Convert MongoDB doc to JSON-safe dict."""
    if doc is None:
        return None
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d.pop("_id"))
    return d

# ── Pydantic Models ──────────────────────────────────────────────────────────

class CreateClassReq(BaseModel):
    className: str
    section: str = "A"
    grade: int = 5
    subject: str = "Math & Science"
    academicYear: str = "2024-2025"

class UpdateClassReq(BaseModel):
    className: Optional[str] = None
    section: Optional[str] = None
    subject: Optional[str] = None
    settings: Optional[dict] = None

class JoinClassReq(BaseModel):
    classCode: str

class InviteStudentReq(BaseModel):
    classId: str
    emails: List[str]

class CreateAssignmentReq(BaseModel):
    classId: str
    title: str
    description: str = ""
    dueDate: str
    lessonId: Optional[str] = None
    totalPoints: int = 100

class SubmitAssignmentReq(BaseModel):
    answers: dict = {}
    attachments: List[str] = []

class GradeSubmissionReq(BaseModel):
    score: int
    feedback: str = ""

class SendMessageReq(BaseModel):
    toUserId: str
    message: str
    attachments: List[dict] = []

class BroadcastReq(BaseModel):
    classId: str
    title: str
    message: str
    type: str = "announcement"

class PTMConnectReq(BaseModel):
    studentId: str
    teacherEmail: Optional[str] = None

class ApprovePTMReq(BaseModel):
    studentId: str
    approve: bool = True

class ScheduleMeetingReq(BaseModel):
    connectionId: str
    scheduledAt: str
    notes: str = ""

class RemoveStudentReq(BaseModel):
    classId: str

# ── CLASS MANAGEMENT ─────────────────────────────────────────────────────────

@conn_router.post("/classes/create")
async def create_class(req: CreateClassReq, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    code = gen_class_code()
    doc = {
        "className": req.className,
        "section": req.section,
        "grade": req.grade,
        "subject": req.subject,
        "academicYear": req.academicYear,
        "teacherId": user["_id"],
        "teacherName": user.get("name", ""),
        "teacherEmail": user.get("email", ""),
        "classCode": code,
        "studentCount": 0,
        "createdAt": now_iso(),
        "settings": {},
    }
    result = await _db.classes.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return {"class": doc, "classCode": code}

@conn_router.get("/classes/my-classes")
async def get_my_classes(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    classes = await _db.classes.find({"teacherId": user["_id"]}).to_list(100)
    return {"classes": [serialize(c) for c in classes]}

@conn_router.get("/classes/{classId}")
async def get_class(classId: str, user: dict = Depends(get_current_user)):
    cls = await _db.classes.find_one({"_id": oid(classId)})
    if not cls:
        raise HTTPException(404, "Class not found")
    return {"class": serialize(cls)}

@conn_router.put("/classes/{classId}")
async def update_class(classId: str, req: UpdateClassReq, user: dict = Depends(get_current_user)):
    cls = await _db.classes.find_one({"_id": oid(classId)})
    if not cls:
        raise HTTPException(404, "Class not found")
    if str(cls["teacherId"]) != user["_id"] and user.get("role") != "admin":
        raise HTTPException(403, "Not your class")
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    updates["updatedAt"] = now_iso()
    await _db.classes.update_one({"_id": oid(classId)}, {"$set": updates})
    updated = await _db.classes.find_one({"_id": oid(classId)})
    return {"class": serialize(updated)}

@conn_router.post("/classes/regenerate-code/{classId}")
async def regenerate_code(classId: str, user: dict = Depends(get_current_user)):
    cls = await _db.classes.find_one({"_id": oid(classId)})
    if not cls:
        raise HTTPException(404, "Class not found")
    if str(cls["teacherId"]) != user["_id"] and user.get("role") != "admin":
        raise HTTPException(403, "Not your class")
    new_code = gen_class_code()
    await _db.classes.update_one({"_id": oid(classId)}, {"$set": {"classCode": new_code}})
    return {"classCode": new_code}

# ── ENROLLMENT ───────────────────────────────────────────────────────────────

@conn_router.post("/enroll/join")
async def join_class(req: JoinClassReq, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("student",):
        raise HTTPException(403, "Student access required")
    cls = await _db.classes.find_one({"classCode": req.classCode.upper().strip()})
    if not cls:
        raise HTTPException(404, "Invalid class code")
    class_id = str(cls["_id"])
    existing = await _db.enrollments.find_one({"studentId": user["_id"], "classId": class_id, "status": "active"})
    if existing:
        raise HTTPException(400, "Already enrolled in this class")
    enrollment = {
        "studentId": user["_id"],
        "studentName": user.get("name", ""),
        "studentEmail": user.get("email", ""),
        "classId": class_id,
        "teacherId": str(cls["teacherId"]),
        "status": "active",
        "joinedAt": now_iso(),
    }
    await _db.enrollments.insert_one(enrollment)
    await _db.classes.update_one({"_id": cls["_id"]}, {"$inc": {"studentCount": 1}})
    class_info = serialize(cls)
    class_info["teacherName"] = cls.get("teacherName", "")
    return {"message": "Joined successfully", "classInfo": class_info}

@conn_router.get("/enroll/my-class")
async def get_my_class(user: dict = Depends(get_current_user)):
    enrollment = await _db.enrollments.find_one({"studentId": user["_id"], "status": "active"})
    if not enrollment:
        return {"class": None, "teacher": None, "assignments": []}
    cls = await _db.classes.find_one({"_id": oid(enrollment["classId"])})
    teacher = await _db.users.find_one({"_id": oid(enrollment["teacherId"])}, {"password_hash": 0})
    assignments = await _db.assignments.find({"classId": enrollment["classId"]}).to_list(50)
    return {
        "class": serialize(cls),
        "teacher": serialize(teacher),
        "assignments": [serialize(a) for a in assignments],
        "enrollment": serialize(enrollment),
    }

@conn_router.get("/enroll/class/{classId}/students")
async def get_class_students(classId: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    enrollments = await _db.enrollments.find({"classId": classId, "status": "active"}).to_list(200)
    students = []
    for e in enrollments:
        student = await _db.users.find_one({"_id": oid(e["studentId"])}, {"password_hash": 0})
        if student:
            s = serialize(student)
            sessions = await _db.sessions.find({"user_id": e["studentId"]}, {"_id": 0}).to_list(50)
            s["avg_score"] = round(sum(x.get("score", 0) for x in sessions) / len(sessions)) if sessions else 0
            s["session_count"] = len(sessions)
            students.append(s)
    return {"students": students}

@conn_router.post("/enroll/invite")
async def invite_student(req: InviteStudentReq, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    cls = await _db.classes.find_one({"_id": oid(req.classId)})
    if not cls:
        raise HTTPException(404, "Class not found")
    invited = []
    for email in req.emails:
        existing = await _db.enrollments.find_one({"studentEmail": email.lower(), "classId": req.classId})
        if not existing:
            await _db.enrollments.insert_one({
                "studentEmail": email.lower(),
                "classId": req.classId,
                "teacherId": user["_id"],
                "status": "pending",
                "invitedAt": now_iso(),
            })
            invited.append(email)
    return {"invited": invited, "count": len(invited)}

@conn_router.delete("/enroll/remove/{studentId}")
async def remove_student(studentId: str, req: RemoveStudentReq, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    result = await _db.enrollments.update_one(
        {"studentId": studentId, "classId": req.classId},
        {"$set": {"status": "removed", "removedAt": now_iso()}}
    )
    if result.modified_count == 0:
        raise HTTPException(404, "Enrollment not found")
    await _db.classes.update_one({"_id": oid(req.classId)}, {"$inc": {"studentCount": -1}})
    return {"message": "Student removed"}

@conn_router.put("/enroll/approve/{studentId}")
async def approve_enrollment(studentId: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    enrollment = await _db.enrollments.find_one({"studentId": studentId, "status": "pending"})
    if not enrollment:
        raise HTTPException(404, "Pending enrollment not found")
    await _db.enrollments.update_one(
        {"_id": enrollment["_id"]},
        {"$set": {"status": "active", "approvedAt": now_iso()}}
    )
    await _db.classes.update_one({"_id": oid(enrollment["classId"])}, {"$inc": {"studentCount": 1}})
    updated = await _db.enrollments.find_one({"_id": enrollment["_id"]})
    return {"enrollment": serialize(updated)}

# ── ASSIGNMENTS ──────────────────────────────────────────────────────────────

@conn_router.post("/assignments/create")
async def create_assignment(req: CreateAssignmentReq, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    doc = {
        "classId": req.classId,
        "teacherId": user["_id"],
        "title": req.title,
        "description": req.description,
        "dueDate": req.dueDate,
        "lessonId": req.lessonId,
        "totalPoints": req.totalPoints,
        "createdAt": now_iso(),
        "status": "active",
    }
    result = await _db.assignments.insert_one(doc)
    assignment_id = str(result.inserted_id)
    # Notify enrolled students
    enrollments = await _db.enrollments.find({"classId": req.classId, "status": "active"}).to_list(200)
    for e in enrollments:
        await _db.notifications.insert_one({
            "userId": e["studentId"],
            "type": "assignment",
            "title": "New Assignment",
            "message": f"New assignment: {req.title}",
            "assignmentId": assignment_id,
            "read": False,
            "createdAt": now_iso(),
        })
    doc["id"] = assignment_id
    doc.pop("_id", None)
    return {"assignment": doc}

@conn_router.get("/assignments/class/{classId}")
async def get_class_assignments(classId: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    assignments = await _db.assignments.find({"classId": classId}).to_list(100)
    result = []
    for a in assignments:
        a_dict = serialize(a)
        submissions = await _db.submissions.find({"assignmentId": a_dict["id"]}).to_list(200)
        a_dict["submissionCount"] = len(submissions)
        result.append(a_dict)
    return {"assignments": result}

@conn_router.get("/assignments/student")
async def get_student_assignments(user: dict = Depends(get_current_user)):
    enrollment = await _db.enrollments.find_one({"studentId": user["_id"], "status": "active"})
    if not enrollment:
        return {"all": [], "pending": [], "submitted": [], "graded": []}
    assignments = await _db.assignments.find({"classId": enrollment["classId"], "status": "active"}).to_list(100)
    pending, submitted, graded = [], [], []
    now = now_iso()
    for a in assignments:
        a_dict = serialize(a)
        submission = await _db.submissions.find_one({"assignmentId": a_dict["id"], "studentId": user["_id"]})
        if submission:
            sub_dict = serialize(submission)
            a_dict["submission"] = sub_dict
            if sub_dict.get("score") is not None:
                graded.append(a_dict)
            else:
                submitted.append(a_dict)
        else:
            a_dict["isOverdue"] = a_dict.get("dueDate", "") < now
            pending.append(a_dict)
    return {"all": pending + submitted + graded, "pending": pending, "submitted": submitted, "graded": graded}

@conn_router.post("/assignments/submit/{assignmentId}")
async def submit_assignment(assignmentId: str, req: SubmitAssignmentReq, user: dict = Depends(get_current_user)):
    assignment = await _db.assignments.find_one({"_id": oid(assignmentId)})
    if not assignment:
        raise HTTPException(404, "Assignment not found")
    existing = await _db.submissions.find_one({"assignmentId": assignmentId, "studentId": user["_id"]})
    if existing:
        raise HTTPException(400, "Already submitted")
    doc = {
        "assignmentId": assignmentId,
        "studentId": user["_id"],
        "studentName": user.get("name", ""),
        "answers": req.answers,
        "attachments": req.attachments,
        "submittedAt": now_iso(),
        "score": None,
        "feedback": None,
    }
    result = await _db.submissions.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return {"submission": doc, "message": "Submitted successfully"}

@conn_router.get("/assignments/submissions/{assignmentId}")
async def get_submissions(assignmentId: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    submissions = await _db.submissions.find({"assignmentId": assignmentId}).to_list(200)
    return {"submissions": [serialize(s) for s in submissions]}

@conn_router.put("/assignments/grade/{submissionId}")
async def grade_submission(submissionId: str, req: GradeSubmissionReq, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    submission = await _db.submissions.find_one({"_id": oid(submissionId)})
    if not submission:
        raise HTTPException(404, "Submission not found")
    await _db.submissions.update_one(
        {"_id": oid(submissionId)},
        {"$set": {"score": req.score, "feedback": req.feedback, "gradedAt": now_iso(), "gradedBy": user["_id"]}}
    )
    # Notify student
    await _db.notifications.insert_one({
        "userId": submission["studentId"],
        "type": "grade",
        "title": "Assignment Graded",
        "message": f"Your assignment has been graded: {req.score} points",
        "submissionId": submissionId,
        "read": False,
        "createdAt": now_iso(),
    })
    updated = await _db.submissions.find_one({"_id": oid(submissionId)})
    return {"submission": serialize(updated)}

# ── MESSAGES ─────────────────────────────────────────────────────────────────

@conn_router.post("/messages/send")
async def send_message(req: SendMessageReq, user: dict = Depends(get_current_user)):
    recipient = await _db.users.find_one({"_id": oid(req.toUserId)}, {"password_hash": 0})
    if not recipient:
        raise HTTPException(404, "Recipient not found")
    # Build conversation ID (sorted user IDs)
    ids = sorted([user["_id"], req.toUserId])
    conversation_id = f"{ids[0]}_{ids[1]}"
    msg_doc = {
        "conversationId": conversation_id,
        "fromUserId": user["_id"],
        "fromUserName": user.get("name", ""),
        "toUserId": req.toUserId,
        "toUserName": recipient.get("name", ""),
        "message": req.message,
        "attachments": req.attachments,
        "read": False,
        "sentAt": now_iso(),
    }
    result = await _db.messages.insert_one(msg_doc)
    msg_doc["id"] = str(result.inserted_id)
    msg_doc.pop("_id", None)
    # Notify recipient
    await _db.notifications.insert_one({
        "userId": req.toUserId,
        "type": "message",
        "title": f"Message from {user.get('name', 'Someone')}",
        "message": req.message[:100],
        "fromUserId": user["_id"],
        "read": False,
        "createdAt": now_iso(),
    })
    return {"message": msg_doc}

@conn_router.get("/messages/conversation/{userId}")
async def get_conversation(userId: str, user: dict = Depends(get_current_user)):
    ids = sorted([user["_id"], userId])
    conversation_id = f"{ids[0]}_{ids[1]}"
    messages = await _db.messages.find({"conversationId": conversation_id}).sort("sentAt", 1).to_list(200)
    # Mark as read
    await _db.messages.update_many(
        {"conversationId": conversation_id, "toUserId": user["_id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"messages": [serialize(m) for m in messages], "conversationId": conversation_id}

@conn_router.get("/messages/unread-count")
async def get_unread_count(user: dict = Depends(get_current_user)):
    count = await _db.messages.count_documents({"toUserId": user["_id"], "read": False})
    return {"count": count}

@conn_router.put("/messages/read/{conversationId}")
async def mark_messages_read(conversationId: str, user: dict = Depends(get_current_user)):
    await _db.messages.update_many(
        {"conversationId": conversationId, "toUserId": user["_id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}

# ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

@conn_router.post("/notifications/broadcast")
async def broadcast_notification(req: BroadcastReq, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    enrollments = await _db.enrollments.find({"classId": req.classId, "status": "active"}).to_list(200)
    count = 0
    for e in enrollments:
        await _db.notifications.insert_one({
            "userId": e["studentId"],
            "type": req.type,
            "title": req.title,
            "message": req.message,
            "fromUserId": user["_id"],
            "fromUserName": user.get("name", ""),
            "read": False,
            "createdAt": now_iso(),
        })
        count += 1
    return {"sent": count, "message": f"Broadcast sent to {count} students"}

@conn_router.get("/notifications/my")
async def get_my_notifications(user: dict = Depends(get_current_user)):
    notifications = await _db.notifications.find(
        {"userId": user["_id"]}
    ).sort("createdAt", -1).to_list(50)
    unread = sum(1 for n in notifications if not n.get("read", False))
    return {"notifications": [serialize(n) for n in notifications], "unreadCount": unread}

@conn_router.put("/notifications/read/{notifId}")
async def mark_notification_read(notifId: str, user: dict = Depends(get_current_user)):
    await _db.notifications.update_one(
        {"_id": oid(notifId), "userId": user["_id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}

# ── PTM (Parent-Teacher Meeting) ──────────────────────────────────────────────

@conn_router.post("/ptm/connect")
async def ptm_connect(req: PTMConnectReq, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("parent",):
        raise HTTPException(403, "Parent access required")
    # Find teacher via student enrollment
    student = await _db.users.find_one({"_id": oid(req.studentId)}, {"password_hash": 0})
    if not student:
        raise HTTPException(404, "Student not found")
    enrollment = await _db.enrollments.find_one({"studentId": req.studentId, "status": "active"})
    teacher_id = None
    if enrollment:
        teacher_id = enrollment.get("teacherId")
    elif req.teacherEmail:
        teacher = await _db.users.find_one({"email": req.teacherEmail.lower(), "role": "teacher"})
        if teacher:
            teacher_id = str(teacher["_id"])
    if not teacher_id:
        raise HTTPException(404, "Teacher not found for this student")
    existing = await _db.ptm_connections.find_one({
        "parentId": user["_id"], "studentId": req.studentId, "teacherId": teacher_id
    })
    if existing:
        return {"connection": serialize(existing), "message": "Connection already exists"}
    teacher = await _db.users.find_one({"_id": oid(teacher_id)}, {"password_hash": 0})
    doc = {
        "parentId": user["_id"],
        "parentName": user.get("name", ""),
        "studentId": req.studentId,
        "studentName": student.get("name", ""),
        "teacherId": teacher_id,
        "teacherName": teacher.get("name", "") if teacher else "",
        "teacherEmail": teacher.get("email", "") if teacher else "",
        "status": "pending",
        "requestedAt": now_iso(),
        "notes": "",
        "meetings": [],
    }
    result = await _db.ptm_connections.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    # Notify teacher
    if teacher_id:
        await _db.notifications.insert_one({
            "userId": teacher_id,
            "type": "ptm_request",
            "title": "PTM Connection Request",
            "message": f"{user.get('name', 'A parent')} wants to connect regarding {student.get('name', 'a student')}",
            "parentId": user["_id"],
            "read": False,
            "createdAt": now_iso(),
        })
    return {"connection": doc, "message": "Connection request sent"}

@conn_router.get("/ptm/connections")
async def get_ptm_connections(user: dict = Depends(get_current_user)):
    role = user.get("role")
    if role == "parent":
        connections = await _db.ptm_connections.find({"parentId": user["_id"]}).to_list(50)
    elif role in ("teacher", "admin"):
        connections = await _db.ptm_connections.find({"teacherId": user["_id"]}).to_list(50)
    else:
        connections = []
    return {"connections": [serialize(c) for c in connections]}

@conn_router.put("/ptm/approve/{parentId}")
async def approve_ptm(parentId: str, req: ApprovePTMReq, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("teacher", "admin"):
        raise HTTPException(403, "Teacher access required")
    connection = await _db.ptm_connections.find_one({
        "parentId": parentId, "studentId": req.studentId, "teacherId": user["_id"]
    })
    if not connection:
        raise HTTPException(404, "Connection not found")
    new_status = "approved" if req.approve else "rejected"
    await _db.ptm_connections.update_one(
        {"_id": connection["_id"]},
        {"$set": {"status": new_status, "respondedAt": now_iso()}}
    )
    # Notify parent
    await _db.notifications.insert_one({
        "userId": parentId,
        "type": "ptm_response",
        "title": f"PTM Request {new_status.capitalize()}",
        "message": f"Your connection request has been {new_status} by {user.get('name', 'the teacher')}",
        "read": False,
        "createdAt": now_iso(),
    })
    updated = await _db.ptm_connections.find_one({"_id": connection["_id"]})
    return {"connection": serialize(updated)}

@conn_router.post("/ptm/schedule-meeting")
async def schedule_meeting(req: ScheduleMeetingReq, user: dict = Depends(get_current_user)):
    connection = await _db.ptm_connections.find_one({"_id": oid(req.connectionId)})
    if not connection:
        raise HTTPException(404, "Connection not found")
    if connection.get("status") != "approved":
        raise HTTPException(400, "Connection not approved yet")
    meeting = {
        "scheduledAt": req.scheduledAt,
        "notes": req.notes,
        "scheduledBy": user["_id"],
        "createdAt": now_iso(),
        "status": "scheduled",
    }
    await _db.ptm_connections.update_one(
        {"_id": oid(req.connectionId)},
        {"$push": {"meetings": meeting}}
    )
    # Notify both parties
    notify_ids = [connection["parentId"], connection["teacherId"]]
    for uid in notify_ids:
        if uid != user["_id"]:
            await _db.notifications.insert_one({
                "userId": uid,
                "type": "meeting_scheduled",
                "title": "Meeting Scheduled",
                "message": f"A PTM meeting has been scheduled for {req.scheduledAt}",
                "connectionId": req.connectionId,
                "read": False,
                "createdAt": now_iso(),
            })
    return {"meeting": meeting, "message": "Meeting scheduled"}


# ── Injection function ────────────────────────────────────────────────────────

def get_connections_router(database, current_user_func):
    global _db, _get_current_user
    _db = database
    _get_current_user = current_user_func
    return conn_router
