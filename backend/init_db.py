import os
import sys
import time
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from app.models.models import Base
from app.core.config import settings

def init_db():
    """
    Initialize the database by creating all tables
    """
    print("Initializing database...")
    
    # Convert PostgresDsn to string for SQLAlchemy
    DATABASE_URL = str(settings.SQLALCHEMY_DATABASE_URI)
    
    # Create database engine
    engine = create_engine(DATABASE_URL)
    
    # Wait for database to be ready
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Try to connect to the database
            with engine.connect() as connection:
                # Create postgres role if it doesn't exist
                connection.execute(text("""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
                            CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
                        END IF;
                    END
                    $$;
                """))
                connection.commit()
            print("Database connection successful!")
            break
        except OperationalError:
            retry_count += 1
            print(f"Waiting for database to be ready... ({retry_count}/{max_retries})")
            time.sleep(2)
    
    if retry_count >= max_retries:
        print("Could not connect to the database. Exiting...")
        sys.exit(1)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db() 