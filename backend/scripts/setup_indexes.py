from sqlalchemy import create_engine, text
from app.core.config import settings

def setup_indexes():
    """Set up database indexes for better performance."""
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    # List of indexes to create
    indexes = [
        # Users table indexes
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
        "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);",
        "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);",
        
        # User sessions table indexes
        "CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_sessions_access_token ON user_sessions(access_token);",
        "CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);",
        "CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);",
        
        # Vehicles table indexes
        "CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);",
        "CREATE INDEX IF NOT EXISTS idx_vehicles_is_authorized ON vehicles(is_authorized);",
        "CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at);",
        
        # Parking records table indexes
        "CREATE INDEX IF NOT EXISTS idx_parking_records_vehicle_id ON parking_records(vehicle_id);",
        "CREATE INDEX IF NOT EXISTS idx_parking_records_entry_time ON parking_records(entry_time);",
        "CREATE INDEX IF NOT EXISTS idx_parking_records_exit_time ON parking_records(exit_time);",
        "CREATE INDEX IF NOT EXISTS idx_parking_records_is_paid ON parking_records(is_paid);",
        
        # Alerts table indexes
        "CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);",
        "CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);",
        "CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);",
        "CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);",
        "CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_id ON alerts(vehicle_id);",
        "CREATE INDEX IF NOT EXISTS idx_alerts_parking_record_id ON alerts(parking_record_id);"
    ]
    
    # Create indexes
    with engine.connect() as connection:
        for index in indexes:
            try:
                connection.execute(text(index))
                print(f"Created index: {index}")
            except Exception as e:
                print(f"Error creating index {index}: {e}")
        
        # Commit the changes
        connection.commit()
    
    print("Database indexes setup completed.")

if __name__ == "__main__":
    setup_indexes() 