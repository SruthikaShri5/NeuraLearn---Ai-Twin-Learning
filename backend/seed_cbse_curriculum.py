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

    for lesson in CURRICULUM_LESSONS:
        try:
            # Normalise subject to lowercase_underscore
            lesson["subject"] = lesson.get("subject", "").lower().replace(" ", "_")

            # Upsert by lesson id
            result = await db.lessons.update_one(
                {"id": lesson["id"]},
                {"$set": lesson},
                upsert=True
            )
            if result.upserted_id:
                inserted += 1
            else:
                updated += 1
        except Exception as e:
            print(f"  ERROR on {lesson.get('id', '?')}: {e}")
            errors += 1

    print(f"\nDone!")
    print(f"  Inserted: {inserted}")
    print(f"  Updated:  {updated}")
    print(f"  Errors:   {errors}")

    # Also seed concepts from lessons
    print("\nSeeding concept mastery stubs...")
    concepts_seeded = 0
    existing_concepts = await db.concepts.count_documents({})
    if existing_concepts == 0:
        concept_docs = []
        seen = set()
        for lesson in CURRICULUM_LESSONS:
            cid = lesson.get("concept_id") or lesson["id"]
            if cid not in seen:
                seen.add(cid)
                concept_docs.append({
                    "id": cid,
                    "name": lesson["title"],
                    "subject": lesson.get("subject", ""),
                    "grade": lesson.get("grade", ""),
                    "prerequisites": [],
                    "description": lesson.get("introduction", "")[:200],
                })
        if concept_docs:
            await db.concepts.insert_many(concept_docs)
            concepts_seeded = len(concept_docs)
    print(f"  Concepts seeded: {concepts_seeded} (skipped if already exist)")

    client.close()
    print("\nSeed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
