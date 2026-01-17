import pytest
from sqlalchemy.exc import IntegrityError
from database import Story, Rating

def test_story_model_properties_defaults(test_db):
    """Test default values and basic properties of Story model after DB insertion"""
    story = Story(
        universe="Test",
        what_if="What if?",
        story="Content", 
        word_count=100
    )
    test_db.add(story)
    test_db.commit()
    test_db.refresh(story)
    
    assert story.rating == 0  # Default verified
    assert story.is_public is True  # Default verified
    assert story.created_at is not None  # DB sets this
    
    # Check share token generation
    token = story.generate_share_token()
    assert token is not None
    assert len(token) > 10
    assert story.share_token == token
    
    # Save token change
    test_db.commit()
    test_db.refresh(story)
    assert story.share_token == token

def test_rating_calculations(test_db):
    """Test average_rating and rating_count properties"""
    # Create story
    story = Story(
        universe="Test", 
        what_if="What if?", 
        story="Content", 
        word_count=50
    )
    test_db.add(story)
    test_db.commit()
    
    assert story.average_rating == 0
    assert story.rating_count == 0
    
    # Add ratings
    r1 = Rating(story_id=story.id, session_id="sess1", rating_value=5)
    r2 = Rating(story_id=story.id, session_id="sess2", rating_value=3)
    test_db.add_all([r1, r2])
    test_db.commit()
    test_db.refresh(story)
    
    assert story.rating_count == 2
    assert story.average_rating == 4.0  # (5+3)/2

def test_related_cascade_delete(test_db):
    """Test that deleting a story deletes its ratings"""
    story = Story(universe="U", what_if="W", story="S", word_count=10)
    test_db.add(story)
    test_db.commit()
    
    r1 = Rating(story_id=story.id, session_id="s1", rating_value=5)
    test_db.add(r1)
    test_db.commit()
    
    assert test_db.query(Rating).count() == 1
    
    # Delete story
    test_db.delete(story)
    test_db.commit()
    
    assert test_db.query(Rating).count() == 0
