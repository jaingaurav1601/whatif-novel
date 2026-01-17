import pytest
from sqlalchemy import text, inspect, create_engine
from unittest.mock import patch, MagicMock
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import migrate_db

def test_migration_adds_missing_column(test_engine):
    """Test that migration adds share_token column if missing"""
    # Setup: Create table WITHOUT share_token
    with test_engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS stories"))
        # Create minimal table mocking old state
        conn.execute(text("""
            CREATE TABLE stories (
                id INTEGER PRIMARY KEY,
                universe VARCHAR,
                what_if TEXT,
                story TEXT,
                word_count INTEGER,
                rating INTEGER DEFAULT 0,
                is_public BOOLEAN DEFAULT 1,
                created_at TIMESTAMP
            )
        """))
        conn.commit()

    # Mock engine in migrate_db to use our test_engine
    with patch('migrate_db.engine', test_engine):
        migrate_db.migrate()

    # Verify column exists
    inspector = inspect(test_engine)
    columns = [col['name'] for col in inspector.get_columns('stories')]
    assert 'share_token' in columns

def test_migration_backfills_data(test_engine):
    """Test that migration backfills share_token for existing rows"""
    # Setup: Create table and insert data
    with test_engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS stories"))
        conn.execute(text("""
            CREATE TABLE stories (
                id INTEGER PRIMARY KEY,
                universe VARCHAR,
                what_if TEXT,
                story TEXT,
                word_count INTEGER,
                rating INTEGER DEFAULT 0,
                is_public BOOLEAN DEFAULT 1,
                created_at TIMESTAMP
                -- Missing share_token initially
            )
        """))
        # Insert test story
        conn.execute(text("""
            INSERT INTO stories (universe, what_if, story, word_count)
            VALUES ('Test Universe', 'What if?', 'Story content', 100)
        """))
        conn.commit()

    # Run migration
    with patch('migrate_db.engine', test_engine):
        migrate_db.migrate()

    # Verify data backfill
    with test_engine.connect() as conn:
        result = conn.execute(text("SELECT share_token FROM stories WHERE universe='Test Universe'"))
        token = result.scalar()
        assert token is not None
        assert len(token) > 0

def test_migration_failure_exits(test_engine):
    """Test that migration raises Exception on failure"""
    # Mock engine.connect to raise exception
    mock_engine = MagicMock()
    mock_engine.connect.side_effect = Exception("DB Error")
    mock_engine.url = "sqlite:///test"

    with patch('migrate_db.engine', mock_engine):
        with pytest.raises(Exception) as excinfo:
            migrate_db.migrate()
        assert "DB Error" in str(excinfo.value)
