import pytest
from unittest.mock import patch, MagicMock
from database import Story

def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data

def test_get_universes(client):
    response = client.get("/universes")
    assert response.status_code == 200
    data = response.json()
    assert "universes" in data
    assert len(data["universes"]) > 0

@patch("main.generate_story")
def test_generate_story(mock_generate, client):
    # Mock AI response
    mock_generate.return_value = {
        "story": "Generated story",
        "word_count": 100,
        "universe": "Harry Potter",
        "what_if": "What if?"
    }
    
    payload = {
        "universe": "Harry Potter",
        "what_if": "What if?",
        "length": "short"
    }
    
    response = client.post("/story/generate", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify response structure
    assert data["id"] is not None
    assert data["story"] == "Generated story"
    # share_token is NOT in response model for generate, only for get_story or get_shared_story?
    # Let's check main.py StoryResponse model: share_url is Optional.
    # Logic: return StoryResponse(...). It doesn't auto-add share_url unless set.    
    
@patch("story_generator.generate_story_with_prompt")
def test_generate_custom_story(mock_gen, client):
    mock_gen.return_value = "Custom content"
    
    payload = {
        "universe": "Custom",
        "system_prompt": "Sys",
        "what_if": "What if?",
        "length": "short"
    }
    
    response = client.post("/story/generate-custom", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["universe"] == "Custom"
    assert data["story"] == "Custom content"

@patch("story_generator.generate_story_with_prompt")
def test_generate_custom_story_no_prompt(mock_gen, client):
    """Test custom story generation without system prompt (fallback)"""
    mock_gen.return_value = "Fallback content"
    
    payload = {
        "universe": "Blade Runner",
        "what_if": "What if Deckard was a replicant?",
        "length": "medium"
        # system_prompt is MISSING
    }
    
    response = client.post("/story/generate-custom", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["story"] == "Fallback content"
    
    # Verify mock was called with the fallback prompt
    args, kwargs = mock_gen.call_args
    expected_fallback = "You are an expert in the Blade Runner universe. Write in the style of Blade Runner."
    assert kwargs["system_prompt"] == expected_fallback

def test_get_history(client, test_db):
    # Add manual story to DB
    story = Story(universe="U", what_if="W", story="S", word_count=10, is_public=True)
    test_db.add(story)
    test_db.commit()
    
    response = client.get("/story/history")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 1
    assert data["stories"][0]["id"] == story.id

def test_rate_story(client, test_db):
    # Add story
    story = Story(universe="U", what_if="W", story="S", word_count=10)
    test_db.add(story)
    test_db.commit()
    
    payload = {
        "rating": 5,
        "session_id": "test_session_123"
    }
    
    response = client.post(f"/story/{story.id}/rate", json=payload)
    assert response.status_code == 200
    data = response.json()
    # First rating of 5, so average is 5.0
    assert data["average_rating"] == 5.0
    assert data["rating_count"] == 1

def test_get_story_by_token(client, test_db):
    story = Story(universe="U", what_if="W", story="S", word_count=10)
    story.generate_share_token()
    test_db.add(story)
    test_db.commit()
    
    response = client.get(f"/story/share/{story.share_token}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == story.id

@patch("story_generator.generate_universe_prompt")
def test_generate_universe_system_prompt(mock_gen, client):
    """Test generating system prompt via API"""
    mock_gen.return_value = "Generated system prompt"
    
    payload = {"universe": "Matrix"}
    
    # Since main.py does a local import, patching story_generator.generate_universe_prompt works
    # provided story_generator is imported.
    
    response = client.post("/universe/system-prompt", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["universe"] == "Matrix"
    assert data["system_prompt"] == "Generated system prompt"
