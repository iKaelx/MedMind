"""
SQLite to PostgreSQL Database Synchronization Utility.
This script synchronizes all records (Users, Patients, Consultations, Prescriptions)
from a local SQLite database to a remote PostgreSQL database.

Usage:
    export POSTGRES_DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
    python sync_postgres.py
"""

import os
import sys

# Ensure backend package can be imported regardless of execution directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, User, Patient, Consultation, Prescription

# Load configuration
SQLITE_URL = os.getenv("SQLITE_DATABASE_URL", "sqlite:///./test.db")
POSTGRES_URL = os.getenv("POSTGRES_DATABASE_URL")

def sync():
    if not POSTGRES_URL:
        print("✗ Error: POSTGRES_DATABASE_URL environment variable is not set.")
        print("Please export POSTGRES_DATABASE_URL before running this script.")
        sys.exit(1)

    print("🔌 Connecting to databases...")
    print(f"   SQLite (Source): {SQLITE_URL}")
    print(f"   PostgreSQL (Target): {POSTGRES_URL}")

    try:
        # Create engines
        sqlite_engine = create_engine(SQLITE_URL)
        postgres_engine = create_engine(POSTGRES_URL)

        # Create sessions
        SqliteSession = sessionmaker(bind=sqlite_engine)
        PostgresSession = sessionmaker(bind=postgres_engine)

        sqlite_db = SqliteSession()
        postgres_db = PostgresSession()
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        sys.exit(1)

    try:
        print("🛠 Ensuring tables exist in PostgreSQL...")
        Base.metadata.create_all(bind=postgres_engine)
        print("✓ Tables ready.")

        # Table sync order matters due to foreign keys: User -> Patient -> Consultation -> Prescription
        tables = [
            ("Users", User),
            ("Patients", Patient),
            ("Consultations", Consultation),
            ("Prescriptions", Prescription)
        ]

        for name, model in tables:
            print(f"🔄 Syncing {name}...")
            sqlite_records = sqlite_db.query(model).all()
            print(f"   Found {len(sqlite_records)} records in SQLite.")

            sync_count = 0
            update_count = 0

            for src in sqlite_records:
                # Build dict representation of columns
                record_data = {col.name: getattr(src, col.name) for col in model.__table__.columns}

                # Check if record exists in Postgres
                tgt = postgres_db.query(model).filter(model.id == src.id).first()

                if tgt:
                    # Update existing record
                    for key, val in record_data.items():
                        setattr(tgt, key, val)
                    update_count += 1
                else:
                    # Insert new record
                    new_record = model(**record_data)
                    postgres_db.add(new_record)
                    sync_count += 1

            postgres_db.commit()
            print(f"   ✓ {name} sync complete. Inserts: {sync_count}, Updates: {update_count}")

        print("🎉 Database synchronization completed successfully!")

    except Exception as e:
        print(f"✗ Sync failed with error: {e}")
        postgres_db.rollback()
    finally:
        sqlite_db.close()
        postgres_db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        sys.exit(0)
    
    print("🚀 Starting database synchronization...")
    sync()
