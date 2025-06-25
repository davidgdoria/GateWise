# GateWise - Smart Parking Management System

GateWise is an innovative parking management system that uses OCR technology for automated license plate recognition, enabling seamless vehicle entry and exit without traditional tickets or RFID devices. This project is currently in a Proof of Concept (POC) phase, using mock data for development and testing. The final delivery will integrate OCR for real-time license plate recognition.

## Features

- 🚗 Automated license plate recognition (OCR integration planned for final delivery)
- 📊 Real-time monitoring dashboard
- 🔒 Fraud detection system
- ⏰ Smart parking duration tracking
- 🎨 AI-powered vehicle attributes detection
- 💳 Digital payment integration ready
- 🚨 Automated alert system

## System Architecture

The system consists of three main components:

1. **Backend (FastAPI)**
   - Python FastAPI server
   - OCR processing (planned for final delivery)
   - Camera integration
   - Database management
   - Real-time event processing

2. **Frontend (Web Dashboard)**
   - React with TypeScript
   - Real-time monitoring
   - Management interface
   - Analytics dashboard

3. **Database (PostgreSQL)**
   - User management
   - Vehicle tracking
   - Parking records
   - Subscription management
   - Payment processing

## Prerequisites

### For Docker Installation
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### For Local Development
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- [Poetry](https://python-poetry.org/) (Python package manager)
- [pnpm](https://pnpm.io/) (Node package manager)

## Installation Guide

### Option 1: Docker Installation (Recommended)

#### 1. Clone the repository
```bash
git clone <your-repo-url>
cd GateWise
```

#### 2. Build and start all services
```bash
docker-compose up -d --build
```

#### 3. Initialize the database
```bash
# Reset the database schema (if needed)
docker-compose exec db psql -U postgres -d gatewise -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run migrations
docker-compose run --rm backend alembic upgrade head

# Seed the database with mock data
docker-compose run --rm backend python seed_db.py
```

#### 4. Access the application
- **Frontend:** http://localhost:3000
- **Backend API docs:** http://localhost:8000/docs
- **Database:** localhost:5432 (gatewise)

### Option 2: Local Development Setup

#### 1. Database Setup
```bash
# Install PostgreSQL
# For Windows: Download and install from https://www.postgresql.org/download/windows/
# For Linux:
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE gatewise;
CREATE USER gatewise_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gatewise TO gatewise_user;
\q
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
poetry install

# Create and activate virtual environment
poetry shell

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Seed the database
python seed_db.py

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

#### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend API URL

# Start the development server
pnpm dev
```

## Fresh Installation (Full Reset)

If you want to start from a completely clean state (e.g., for a new environment or to resolve migration issues), follow these steps:

### 1. Stop all containers
```bash
docker-compose down
```

### 2. Remove all Docker volumes (this deletes all database data)
```bash
docker volume rm gatewise_postgres_data gatewise_backups gatewise_captured_images
```

### 3. (Optional) Remove all old migration files
Delete all files in `backend/alembic/versions/` except for the migration you want to keep (or delete all for a new migration).

### 4. Start containers (this will recreate the database volume)
```bash
docker-compose up -d
```

### 5. Create a new initial migration (if needed)
```bash
docker-compose run --rm backend alembic revision --autogenerate -m "initial migration"
```

### 6. Apply the migration to create all tables
```bash
docker-compose run --rm backend alembic upgrade head
```

### 7. Seed the database with mock data
```bash
docker-compose run --rm backend python seed_db.py
```

### 8. Access the application
- **Frontend:** http://localhost:3000
- **Backend API docs:** http://localhost:8000/docs

## Project Structure

```
gatewise/
├── backend/                 # Backend (FastAPI, DB, Alembic)
│   ├── app/                # Application code
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core functionality
│   │   ├── crud/          # Database operations
│   │   ├── db/            # Database configuration
│   │   ├── models/        # SQLAlchemy models
│   │   └── schemas/       # Pydantic schemas
│   ├── alembic/           # Database migrations
│   ├── seed_db.py         # Mock data seeding script
│   └── requirements.txt   # Python dependencies
├── frontend/              # Web dashboard (React)
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── package.json      # Node dependencies
├── docker-compose.yml     # Multi-service orchestration
└── README.md             # This file
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://gatewise_user:your_password@localhost:5432/gatewise
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Development Guidelines

### Database Migrations
- Always create new migrations for schema changes:
  ```bash
  alembic revision --autogenerate -m "description of changes"
  ```
- Apply migrations:
  ```bash
  alembic upgrade head
  ```

### Code Style
- Backend: Follow PEP 8 guidelines
- Frontend: Use ESLint and Prettier
- Run tests before committing:
  ```bash
  # Backend
  pytest
  
  # Frontend
  pnpm test
  ```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
