"""
Database migration script to add new columns to existing database
This preserves all existing stories while adding new features
"""
import sqlite3
import os

# Get database path
db_path = os.path.join(os.path.dirname(__file__), 'whatif.db')

print(f"Migrating database: {db_path}")

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if share_token column exists
    cursor.execute("PRAGMA table_info(stories)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'share_token' not in columns:
        print("Adding share_token column...")
        cursor.execute("ALTER TABLE stories ADD COLUMN share_token VARCHAR(32)")
        print("✓ Added share_token column")
    else:
        print("✓ share_token column already exists")
    
    # Create ratings table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            story_id INTEGER NOT NULL,
            session_id VARCHAR(64) NOT NULL,
            rating_value INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (story_id) REFERENCES stories(id)
        )
    """)
    print("✓ Ratings table created/verified")
    
    # Commit changes
    conn.commit()
    print("\n✅ Migration completed successfully!")
    
    # Show story count
    cursor.execute("SELECT COUNT(*) FROM stories")
    count = cursor.fetchone()[0]
    print(f"📚 Total stories preserved: {count}")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()
