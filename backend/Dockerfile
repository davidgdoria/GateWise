FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        libgl1 \
        libglib2.0-0 \
        python3-dev \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Copy the Alembic migration template
COPY alembic/script.py.mako alembic/script.py.mako

# Create versions directory if it doesn't exist
RUN mkdir -p /app/alembic/versions

# Create a script to wait for the database and initialize it
RUN echo '#!/bin/bash\necho "Waiting for database..."\nsleep 10\npython /app/init_db.py\npython /app/seed_db.py\nexec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["/app/entrypoint.sh"] 