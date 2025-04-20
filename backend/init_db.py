import os
import sys
import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from app.models.models import Base
from app.core.config import settings

def init_db():
    """
    Initialize the database by creating all tables
    """
    print("Initializing database...")
    
    # Create database engine
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    # Wait for database to be ready
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Try to connect to the database
            connection = engine.connect()
            connection.close()
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