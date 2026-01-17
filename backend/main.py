from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path

from database import get_db, Story
from story_generator import generate_story, get_available_universes

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="What If Novel AI", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Will restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class StoryRequest(BaseModel):
    universe: str
    what_if: str
    length: str = "medium"  # short, medium, long
    system_prompt: Optional[str] = None  # For custom universes

class StoryResponse(BaseModel):
    id: int
    universe: str
    what_if: str
    story: str
    word_count: int
    rating: int
    created_at: str

# Endpoints
@app.get("/")
def root():
    return {
        "message": "What If Novel AI API",
        "version": "1.0.0",
        "endpoints": {
            "universes": "/universes",
            "generate": "/story/generate",
            "history": "/story/history",
            "trending": "/story/trending"
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
        # Generate the story
        result = generate_story(
            universe=request.universe,
            what_if=request.what_if,
            length=request.length
        )
        
        # Save to database
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
                "created_at": s.created_at.isoformat()
            }
            for s in stories
        ]
    }

@app.get("/story/trending")
def trending_stories(db: Session = Depends(get_db)):
    """Get top rated stories"""
    stories = db.query(Story).filter(Story.is_public == True).order_by(Story.rating.desc()).limit(10).all()
    
    return {
        "stories": [
            {
                "id": s.id,
                "universe": s.universe,
                "what_if": s.what_if,
                "rating": s.rating,
                "word_count": s.word_count
            }
            for s in stories
        ]
    }

@app.get("/story/{story_id}")
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
        created_at=story.created_at.isoformat()
    )

@app.post("/story/{story_id}/rate")
def rate_story(story_id: int, rating: int, db: Session = Depends(get_db)):
    """Rate a story (1-5)"""
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    story.rating = rating
    db.commit()
    
    return {"message": "Rating updated", "new_rating": rating}

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
        
        # Save story to database
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
            created_at=story.created_at.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate story: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
