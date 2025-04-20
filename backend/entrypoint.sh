#!/bin/bash
set -e

# Initialize the database
echo "Initializing database..."
python /app/init_db.py

# Start the application
echo "Starting GateWise backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 