#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL started"

# Initialize the database
python init_db.py

# Start the FastAPI application
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 