#!/usr/bin/env python
"""Manual test of specific endpoints as requested."""

import os
import sys
from pathlib import Path

# Load .env
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

print("=" * 70)
print("Manual API Endpoint Tests")
print("=" * 70)

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Test 1: GET /universes
print("\n[Test 1] GET /universes")
print("-" * 70)
response = client.get("/universes")
print(f"Status: {response.status_code}")
data = response.json()
print(f"Response:")
import json
print(json.dumps(data, indent=2))

# Test 2: POST /story/generate
print("\n[Test 2] POST /story/generate")
print("-" * 70)
payload = {
    "universe": "Harry Potter",
    "what_if": "Harry was sorted into Slytherin",
    "length": "short"
}
print(f"Payload: {json.dumps(payload, indent=2)}")
response = client.post("/story/generate", json=payload)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"\nGenerated Story ID: {data['id']}")
    print(f"Universe: {data['universe']}")
    print(f"What If: {data['what_if']}")
    print(f"Word Count: {data['word_count']}")
    print(f"Rating: {data['rating']}")
    print(f"Created At: {data['created_at']}")
    print(f"\nStory Preview (first 300 chars):")
    print(f"{data['story'][:300]}...\n")
    story_id = data['id']
else:
    print(f"Error: {response.text}")
    sys.exit(1)

# Test 3: GET /story/history
print("\n[Test 3] GET /story/history")
print("-" * 70)
response = client.get("/story/history")
print(f"Status: {response.status_code}")
data = response.json()
print(f"Total Stories: {data['count']}")
print(f"\nStories:")
for story in data['stories']:
    print(f"  - ID {story['id']}: {story['universe']} - {story['what_if']}")
    print(f"    Rating: {story['rating']}, Words: {story['word_count']}, Created: {story['created_at']}")

# Test 4: GET /story/1
print(f"\n[Test 4] GET /story/{story_id}")
print("-" * 70)
response = client.get(f"/story/{story_id}")
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"ID: {data['id']}")
    print(f"Universe: {data['universe']}")
    print(f"What If: {data['what_if']}")
    print(f"Word Count: {data['word_count']}")
    print(f"Rating: {data['rating']}")
    print(f"Created At: {data['created_at']}")
    print(f"\nFull Story:")
    print("-" * 70)
    print(data['story'])
    print("-" * 70)
else:
    print(f"Error: {response.text}")
    sys.exit(1)

print("\n" + "=" * 70)
print("All tests completed successfully! ✓")
print("=" * 70)
