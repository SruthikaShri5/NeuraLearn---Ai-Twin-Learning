"""
NeuraLearn CBSE Curriculum Seed Script
Upserts all lessons from curriculum_data.py into MongoDB Atlas.
Run: python seed_cbse_curriculum.py
"""
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from curriculum_data import CURRICULUM_LESSONS


async def seed():
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ.get("DB_NAME", "neuralearn")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    print(f"Connecting to MongoDB: {db_name}")
    print(f"Total lessons to seed: {len(CURRICULUM_LESSONS)}")

    inserted = 0
    updated = 0
    errors = 0

    from pymongo import UpdateOne
    ops = []
    for lesson in CURRICULUM_LESSONS:
        l = dict(lesson)
        l["subject"] = l.get("subject", "").lower().replace(" ", "_")
        ops.append(UpdateOne({"id": l["id"]}, {"$set": l}, upsert=True))
    try:
        if ops:
            result = await db.lessons.bulk_write(ops, ordered=False)
            inserted = result.upserted_count
            updated = result.modified_count
    except Exception as e:
        print(f"  BULK ERROR: {e}")
        errors = len(ops)

    print(f"\nDone!")
    print(f"  Inserted: {inserted}")
    print(f"  Updated:  {updated}")
    print(f"  Errors:   {errors}")

    # Upsert concepts from lessons
    print("\nSyncing concepts from curriculum...")
    concept_ops = []
    seen = set()
    for lesson in CURRICULUM_LESSONS:
        cid = lesson.get("concept_id") or lesson["id"]
        if cid in seen:
            continue
        seen.add(cid)
        doc = {
            "id": cid,
            "name": lesson["title"],
            "subject": lesson.get("subject", "").lower().replace(" ", "_"),
            "grade": lesson.get("grade", ""),
            "prerequisites": [],
            "description": (lesson.get("introduction") or "")[:200],
        }
        concept_ops.append(UpdateOne({"id": cid}, {"$set": doc}, upsert=True))
    if concept_ops:
        await db.concepts.bulk_write(concept_ops, ordered=False)
    print(f"  Concepts synced: {len(concept_ops)}")

    client.close()
    print("\nSeed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
