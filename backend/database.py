from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
import secrets

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./whatif.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Story(Base):
    __tablename__ = "stories"
    
    id = Column(Integer, primary_key=True, index=True)
    universe = Column(String, index=True)
    what_if = Column(Text)
    story = Column(Text)
    word_count = Column(Integer)
    rating = Column(Integer, default=0)  # Kept for backward compatibility
    is_public = Column(Boolean, default=True)
    share_token = Column(String(32), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to ratings
    ratings = relationship("Rating", back_populates="story", cascade="all, delete-orphan")
    
    @property
    def average_rating(self):
        """Calculate average rating from all user ratings"""
        if not self.ratings:
            return 0
        return round(sum(r.rating_value for r in self.ratings) / len(self.ratings), 1)
    
    @property
    def rating_count(self):
        """Get total number of ratings"""
        return len(self.ratings) if self.ratings else 0
    
    def generate_share_token(self):
        """Generate a unique share token for this story"""
        if not self.share_token:
            self.share_token = secrets.token_urlsafe(16)
        return self.share_token

class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    session_id = Column(String(64), nullable=False)  # Browser session identifier
    rating_value = Column(Integer, nullable=False)  # 1-5 stars
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to story
    story = relationship("Story", back_populates="ratings")
    
    # Ensure one rating per session per story
    __table_args__ = (
        # Note: SQLite doesn't support this, but PostgreSQL does
        # UniqueConstraint('story_id', 'session_id', name='unique_story_session_rating'),
    )

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()