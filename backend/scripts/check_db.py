import sys
import time
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from app.core.config import settings

def check_database_connection(max_retries=30, retry_interval=2):
    """Check if the database is ready and accessible."""
    print("Checking database connection...")
    
    # Create database engine
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    for attempt in range(max_retries):
        try:
            # Try to connect to the database
            with engine.connect() as connection:
                # Test basic connection
                connection.execute(text("SELECT 1"))
                print("Database connection successful!")
                
                # Check if required tables exist
                required_tables = [
                    "users",
                    "user_sessions",
                    "vehicles",
                    "parking_records",
                    "alerts"
                ]
                
                # Get list of existing tables
                result = connection.execute(text(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
                ))
                existing_tables = [row[0] for row in result]
                
                # Check for missing tables
                missing_tables = [table for table in required_tables if table not in existing_tables]
                
                if missing_tables:
                    print(f"Warning: Missing tables: {', '.join(missing_tables)}")
                    return False
                
                print("All required tables exist.")
                return True
                
        except OperationalError as e:
            if attempt < max_retries - 1:
                print(f"Database not ready yet... ({attempt + 1}/{max_retries})")
                time.sleep(retry_interval)
            else:
                print(f"Could not connect to database after {max_retries} attempts.")
                print(f"Error: {str(e)}")
                return False
        except SQLAlchemyError as e:
            print(f"Database error: {str(e)}")
            return False
    
    return False

def main():
    """Main function to check database readiness."""
    if not check_database_connection():
        print("Database check failed. Exiting...")
        sys.exit(1)
    
    print("Database is ready to use!")
    sys.exit(0)

if __name__ == "__main__":
    main() 