"""NeuraLearn CBSE/ICSE Curriculum Seed — Classes 1-12 only. Run: python seed_curriculum.py"""
import asyncio
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / ".env")
from motor.motor_asyncio import AsyncIOMotorClient
import os

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

LESSONS = [
