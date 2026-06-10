import asyncio, os, sys
sys.path.insert(0, r'd:\Neura-Learn-1\backend')
from dotenv import load_dotenv
load_dotenv(r'd:\Neura-Learn-1\backend\.env')
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    lesson_count = await db.lessons.count_documents({})
    print("Lessons in DB:", lesson_count)
    
    if lesson_count > 0:
        sample = await db.lessons.find_one({}, {"_id": 0})
        print("Sample lesson ID:", sample.get("id"))
        print("Sample title:", sample.get("title"))
        print("Grade:", sample.get("grade"))
        print("Subject:", sample.get("subject"))
        quiz = sample.get("quiz", [])
        print("Quiz count:", len(quiz))
        if quiz:
            print("First Q:", quiz[0])
    else:
        print("DB is EMPTY - need to seed")
    
    user_count = await db.users.count_documents({})
    print("Users in DB:", user_count)
    client.close()

asyncio.run(check())
