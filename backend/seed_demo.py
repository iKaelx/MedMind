"""
Seed script to create demo user and sample data.
Run this after setting up the database to populate test data.

Usage:
    python seed_demo.py
"""

import os
import sys

# Ensure backend package can be imported regardless of execution directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.main import SessionLocal, engine
from backend.models import Base, User
from backend.routes.auth import hash_password
from datetime import datetime

def seed_database():
    """Create demo user for testing"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check and create demo user
        existing_user = db.query(User).filter(User.email == "demo@example.com").first()
        if existing_user:
            print("✓ Demo user already exists")
        else:
            demo_user = User(
                username="demo_doctor",
                email="demo@example.com",
                password_hash=hash_password("password123"),
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(demo_user)
            db.commit()
            print("✓ Demo user created successfully!")
            print("  Email: demo@example.com")
            print("  Password: password123")
        
        # Check and create admin user
        existing_admin = db.query(User).filter(User.email == "admin@gmail.com").first()
        if existing_admin:
            print("✓ Admin user already exists")
        else:
            admin_user = User(
                username="admin",
                email="admin@gmail.com",
                password_hash=hash_password("admin123"),
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(admin_user)
            db.commit()
            print("✓ Admin user created successfully!")
            print("  Email: admin@gmail.com")
            print("  Password: admin123")
        
    except Exception as e:
        print(f"✗ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Seeding demo data...")
    seed_database()
    print("✓ Done!")
