from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / '.env')

import os, asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'], serverSelectionTimeoutMS=8000)
    try:
        info = await client.server_info()
        print(f"Connected! MongoDB version: {info['version']}")
        db = client[os.environ['DB_NAME']]
        colls = await db.list_collection_names()
        print(f"Collections: {colls if colls else '(empty - fresh DB)'}")
    except Exception as e:
        print(f"Connection failed: {e}")
    finally:
        client.close()

asyncio.run(test())
