#!/usr/bin/env python
"""Test script to call the story generation API endpoint."""

import os
import sys
from pathlib import Path

# Load .env from the backend folder
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

print("=" * 60)
print("Testing Story Generation API")
print("=" * 60)

# Test 1: Check GROQ_API_KEY is loaded
print("\n[Test 1] Checking GROQ_API_KEY...")
groq_key = os.getenv("GROQ_API_KEY")
if not groq_key:
    print("✗ GROQ_API_KEY not found in .env")
    sys.exit(1)
print(f"✓ GROQ_API_KEY loaded (starts with: {groq_key[:20]}...)")

# Test 2: Import FastAPI app
print("\n[Test 2] Importing FastAPI app...")
try:
    from main import app
    print("✓ FastAPI app imported successfully")
except Exception as e:
    print(f"✗ Failed to import app: {e}")
    sys.exit(1)

# Test 3: Import TestClient
print("\n[Test 3] Setting up test client...")
try:
    from fastapi.testclient import TestClient
    client = TestClient(app)
    print("✓ TestClient created")
except Exception as e:
    print(f"✗ Failed to create TestClient: {e}")
    sys.exit(1)

# Test 4: Test GET /universes
print("\n[Test 4] Testing GET /universes...")
try:
    response = client.get("/universes")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "universes" in data, "Response missing 'universes' key"
    assert "count" in data, "Response missing 'count' key"
    print(f"✓ GET /universes successful")
    print(f"  - Status: {response.status_code}")
    print(f"  - Count: {data['count']}")
    print(f"  - Universes: {', '.join(data['universes'])}")
except Exception as e:
    print(f"✗ GET /universes failed: {e}")
    sys.exit(1)

# Test 5: Test POST /story/generate with Harry Potter
print("\n[Test 5] Testing POST /story/generate (Harry Potter)...")
try:
    payload = {
        "universe": "Harry Potter",
        "what_if": "What if Harry Potter had been sorted into Slytherin?",
        "length": "short"
    }
    response = client.post("/story/generate", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    
    # Validate response structure
    assert "id" in data, "Response missing 'id'"
    assert "universe" in data, "Response missing 'universe'"
    assert "what_if" in data, "Response missing 'what_if'"
    assert "story" in data, "Response missing 'story'"
    assert "word_count" in data, "Response missing 'word_count'"
    assert "rating" in data, "Response missing 'rating'"
    assert "created_at" in data, "Response missing 'created_at'"
    
    print(f"✓ POST /story/generate successful")
    print(f"  - Status: {response.status_code}")
    print(f"  - Story ID: {data['id']}")
    print(f"  - Universe: {data['universe']}")
    print(f"  - What If: {data['what_if']}")
    print(f"  - Word Count: {data['word_count']}")
    print(f"  - Story Preview: {data['story'][:100]}...")
    
    story_id = data['id']
except Exception as e:
    print(f"✗ POST /story/generate failed: {e}")
    sys.exit(1)

# Test 6: Test GET /story/{story_id}
print(f"\n[Test 6] Testing GET /story/{story_id}...")
try:
    response = client.get(f"/story/{story_id}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["id"] == story_id, "Story ID mismatch"
    print(f"✓ GET /story/{story_id} successful")
    print(f"  - Status: {response.status_code}")
    print(f"  - Universe: {data['universe']}")
    print(f"  - Word Count: {data['word_count']}")
except Exception as e:
    print(f"✗ GET /story/{story_id} failed: {e}")
    sys.exit(1)

# Test 7: Test POST /story/{story_id}/rate
print(f"\n[Test 7] Testing POST /story/{story_id}/rate...")
try:
    response = client.post(f"/story/{story_id}/rate", params={"rating": 5})
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["new_rating"] == 5, "Rating not updated correctly"
    print(f"✓ POST /story/{story_id}/rate successful")
    print(f"  - Status: {response.status_code}")
    print(f"  - New Rating: {data['new_rating']}")
except Exception as e:
    print(f"✗ POST /story/{story_id}/rate failed: {e}")
    sys.exit(1)

# Test 8: Test GET /story/history
print("\n[Test 8] Testing GET /story/history...")
try:
    response = client.get("/story/history")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "count" in data, "Response missing 'count'"
    assert "stories" in data, "Response missing 'stories'"
    print(f"✓ GET /story/history successful")
    print(f"  - Status: {response.status_code}")
    print(f"  - Stories Count: {data['count']}")
except Exception as e:
    print(f"✗ GET /story/history failed: {e}")
    sys.exit(1)

# Test 9: Test GET /story/trending
print("\n[Test 9] Testing GET /story/trending...")
try:
    response = client.get("/story/trending")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "stories" in data, "Response missing 'stories'"
    print(f"✓ GET /story/trending successful")
    print(f"  - Status: {response.status_code}")
    print(f"  - Trending Stories: {len(data['stories'])}")
except Exception as e:
    print(f"✗ GET /story/trending failed: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("All API tests passed! ✓")
print("=" * 60)
