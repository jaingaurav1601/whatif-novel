#!/usr/bin/env python
"""Test script to validate story_generator and database modules."""

import os
import sys
from pathlib import Path

# Load .env from the backend folder
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

print("=" * 60)
print("Testing Backend Modules")
print("=" * 60)

# Test 1: Check .env loading
print("\n[Test 1] Checking .env loading...")
groq_key = os.getenv("GROQ_API_KEY")
if groq_key:
    print(f"✓ GROQ_API_KEY loaded (starts with: {groq_key[:20]}...)")
else:
    print("✗ GROQ_API_KEY not found in .env")
    sys.exit(1)

# Test 2: Import database module
print("\n[Test 2] Importing database module...")
try:
    from database import Story, SessionLocal, Base, engine
    print("✓ database module imported successfully")
    print(f"  - DATABASE_URL: {os.getenv('DATABASE_URL', 'sqlite:///./whatif.db')}")
except Exception as e:
    print(f"✗ Failed to import database: {e}")
    sys.exit(1)

# Test 3: Check database connection
print("\n[Test 3] Checking database connection...")
try:
    from sqlalchemy import text
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
    print("✓ Database connection successful")
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    sys.exit(1)

# Test 4: Import story_generator module
print("\n[Test 4] Importing story_generator module...")
try:
    from story_generator import get_available_universes
    print("✓ story_generator module imported successfully")
except Exception as e:
    print(f"✗ Failed to import story_generator: {e}")
    sys.exit(1)

# Test 5: Check available universes
print("\n[Test 5] Checking available universes...")
try:
    universes = get_available_universes()
    print(f"✓ Available universes ({len(universes)}):")
    for u in universes:
        print(f"  - {u}")
except Exception as e:
    print(f"✗ Failed to get universes: {e}")
    sys.exit(1)

# Test 6: Query existing stories from database
print("\n[Test 6] Querying stories from database...")
try:
    with SessionLocal() as db:
        stories = db.query(Story).limit(5).all()
        print(f"✓ Database query successful ({len(stories)} stories found)")
        if stories:
            for s in stories:
                print(f"  - ID {s.id}: {s.universe} - {s.what_if[:50]}...")
except Exception as e:
    print(f"✗ Failed to query stories: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("All tests passed! ✓")
print("=" * 60)
