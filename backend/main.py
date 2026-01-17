from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path

from database import get_db, Story, Rating
from story_generator import generate_story, get_available_universes

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="What If Novel AI", version="2.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class StoryRequest(BaseModel):
    universe: str
    what_if: str
    length: str = "medium"
    system_prompt: Optional[str] = None

class RatingRequest(BaseModel):
    rating: int
    session_id: str

class StoryResponse(BaseModel):
    id: int
    universe: str
    what_if: str
    story: str
    word_count: int
    rating: int  # Kept for backward compatibility
    average_rating: float
    rating_count: int
    created_at: str
    share_url: Optional[str] = None

class RatingStats(BaseModel):
    average: float
    count: int
    distribution: dict  # {1: count, 2: count, ...}

# Endpoints
@app.get("/")
def root():
    return {
        "message": "What If Novel AI API",
        "version": "2.0.0",
        "endpoints": {
            "universes": "/universes",
            "generate": "/story/generate",
            "history": "/story/history",
            "trending": "/story/trending",
            "share": "/story/share/{token}"
        }
    }

@app.get("/universes")
def list_universes():
    """Get all available universes"""
    return {
        "universes": get_available_universes(),
        "count": len(get_available_universes())
    }

@app.post("/story/generate", response_model=StoryResponse)
def create_story(request: StoryRequest, db: Session = Depends(get_db)):
    """Generate a new 'what if' story"""
    
    try:
        result = generate_story(
            universe=request.universe,
            what_if=request.what_if,
            length=request.length
        )
        
        db_story = Story(
            universe=request.universe,
            what_if=request.what_if,
            story=result["story"],
            word_count=result["word_count"]
        )
        db.add(db_story)
        db.commit()
        db.refresh(db_story)
        
        return StoryResponse(
            id=db_story.id,
            universe=db_story.universe,
            what_if=db_story.what_if,
            story=db_story.story,
            word_count=db_story.word_count,
            rating=db_story.rating,
            average_rating=db_story.average_rating,
            rating_count=db_story.rating_count,
            created_at=db_story.created_at.isoformat()
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")

@app.get("/story/history")
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    """Get recent stories"""
    stories = db.query(Story).filter(Story.is_public == True).order_by(Story.created_at.desc()).limit(limit).all()
    
    return {
        "count": len(stories),
        "stories": [
            {
                "id": s.id,
                "universe": s.universe,
                "what_if": s.what_if,
                "word_count": s.word_count,
                "rating": s.rating,
                "average_rating": s.average_rating,
                "rating_count": s.rating_count,
                "created_at": s.created_at.isoformat()
            }
            for s in stories
        ]
    }

@app.get("/story/trending")
def trending_stories(db: Session = Depends(get_db)):
    """Get top rated stories"""
    stories = db.query(Story).filter(Story.is_public == True).all()
    
    # Sort by average rating and rating count
    sorted_stories = sorted(
        stories,
        key=lambda s: (s.average_rating, s.rating_count),
        reverse=True
    )[:10]
    
    return {
        "stories": [
            {
                "id": s.id,
                "universe": s.universe,
                "what_if": s.what_if,
                "average_rating": s.average_rating,
                "rating_count": s.rating_count,
                "word_count": s.word_count
            }
            for s in sorted_stories
        ]
    }

@app.get("/story/{story_id}", response_model=StoryResponse)
def get_story(story_id: int, db: Session = Depends(get_db)):
    """Get a specific story"""
    story = db.query(Story).filter(Story.id == story_id).first()
    
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    return StoryResponse(
        id=story.id,
        universe=story.universe,
        what_if=story.what_if,
        story=story.story,
        word_count=story.word_count,
        rating=story.rating,
        average_rating=story.average_rating,
        rating_count=story.rating_count,
        created_at=story.created_at.isoformat(),
        share_url=f"/share/{story.share_token}" if story.share_token else None
    )

@app.post("/story/{story_id}/rate")
def rate_story(story_id: int, request: RatingRequest, db: Session = Depends(get_db)):
    """Rate a story (1-5 stars) with session tracking"""
    if request.rating < 1 or request.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Check if this session already rated this story
    existing_rating = db.query(Rating).filter(
        Rating.story_id == story_id,
        Rating.session_id == request.session_id
    ).first()
    
    if existing_rating:
        # Update existing rating
        existing_rating.rating_value = request.rating
        existing_rating.updated_at = datetime.utcnow()
    else:
        # Create new rating
        new_rating = Rating(
            story_id=story_id,
            session_id=request.session_id,
            rating_value=request.rating
        )
        db.add(new_rating)
    
    db.commit()
    db.refresh(story)
    
    return {
        "message": "Rating saved",
        "average_rating": story.average_rating,
        "rating_count": story.rating_count
    }

@app.get("/story/{story_id}/ratings", response_model=RatingStats)
def get_story_ratings(story_id: int, db: Session = Depends(get_db)):
    """Get rating statistics for a story"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Calculate distribution
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for rating in story.ratings:
        distribution[rating.rating_value] += 1
    
    return RatingStats(
        average=story.average_rating,
        count=story.rating_count,
        distribution=distribution
    )

@app.post("/story/{story_id}/share")
def generate_share_link(story_id: int, db: Session = Depends(get_db)):
    """Generate a shareable link for a story"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    token = story.generate_share_token()
    db.commit()
    
    return {
        "share_token": token,
        "share_url": f"/share/{token}"
    }

@app.get("/story/share/{token}", response_model=StoryResponse)
def get_shared_story(token: str, db: Session = Depends(get_db)):
    """Get a story by its share token (public access)"""
    story = db.query(Story).filter(Story.share_token == token).first()
    
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    return StoryResponse(
        id=story.id,
        universe=story.universe,
        what_if=story.what_if,
        story=story.story,
        word_count=story.word_count,
        rating=story.rating,
        average_rating=story.average_rating,
        rating_count=story.rating_count,
        created_at=story.created_at.isoformat(),
        share_url=f"/share/{token}"
    )

class UniversePromptRequest(BaseModel):
    universe: str

@app.post("/universe/system-prompt")
def generate_system_prompt(request: UniversePromptRequest):
    """Generate a system prompt for a custom universe"""
    try:
        from story_generator import generate_universe_prompt
        prompt = generate_universe_prompt(request.universe)
        return {"universe": request.universe, "system_prompt": prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate system prompt: {str(e)}")

@app.post("/story/generate-custom")
def generate_custom_story(request: StoryRequest, db: Session = Depends(get_db)):
    """Generate a story for a custom universe"""
    try:
        from story_generator import generate_story_with_prompt
        
        story_text = generate_story_with_prompt(
            universe=request.universe,
            system_prompt=request.system_prompt,
            what_if=request.what_if,
            length=request.length
        )
        
        story = Story(
            universe=request.universe,
            what_if=request.what_if,
            story=story_text,
            word_count=len(story_text.split()),
            rating=0,
            created_at=datetime.now()
        )
        db.add(story)
        db.commit()
        db.refresh(story)
        
        return StoryResponse(
            id=story.id,
            universe=story.universe,
            what_if=story.what_if,
            story=story.story,
            word_count=story.word_count,
            rating=story.rating,
            average_rating=story.average_rating,
            rating_count=story.rating_count,
            created_at=story.created_at.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate story: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
