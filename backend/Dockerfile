FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create a script to wait for the database and initialize it
RUN echo '#!/bin/bash\n\
echo "Waiting for database..."\n\
sleep 10\n\
python init_db.py\n\
python seed_db.py\n\
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["/app/entrypoint.sh"] 