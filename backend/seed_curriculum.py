"""NeuraLearn CBSE/ICSE Curriculum Seed — Classes 1-12. Run: python backend/seed_curriculum.py"""
import asyncio
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

# Setup paths
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / "backend" / ".env")

from motor.motor_asyncio import AsyncIOMotorClient
from curriculum_data import CURRICULUM_LESSONS

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def seed_curriculum():
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    
    if not mongo_url or not db_name:
        logger.error("MONGO_URL or DB_NAME not found in environment variables.")
        return

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    logger.info(f"Connected to database: {db_name}")
    logger.info(f"Starting seeding of {len(CURRICULUM_LESSONS)} lessons...")

    # Clear existing lessons to avoid duplicates and ensure clean state
    # await db.lessons.delete_many({})
    # logger.info("Cleared existing lessons.")

    count = 0
    for lesson in CURRICULUM_LESSONS:
        # Use update_one with upsert=True to avoid duplicates
        await db.lessons.update_one(
            {"id": lesson["id"]},
            {"$set": lesson},
            upsert=True
        )
        count += 1
        if count % 50 == 0:
            logger.info(f"Seeded {count} lessons...")

    logger.info(f"Successfully seeded {count} lessons.")

    # Also seed concepts for the knowledge graph
    logger.info("Seeding concepts...")
    concept_count = 0
    for lesson in CURRICULUM_LESSONS:
        cid = lesson.get("concept_id") or lesson["id"]
        doc = {
            "id": cid,
            "name": lesson["title"],
            "subject": lesson["subject"],
            "grade": lesson["grade"],
            "prerequisites": [],
            "description": lesson.get("explanation", "")[:200],
        }
        await db.concepts.update_one(
            {"id": cid},
            {"$set": doc},
            upsert=True
        )
        concept_count += 1

    logger.info(f"Successfully seeded {concept_count} concepts.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_curriculum())
