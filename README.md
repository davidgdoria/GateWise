# GateWise - Smart Parking Management System

GateWise is an innovative parking management system that uses OCR technology for automated license plate recognition, enabling seamless vehicle entry and exit without traditional tickets or RFID devices.

## Features

- 🚗 Automated license plate recognition
- 📊 Real-time monitoring dashboard
- 🔒 Fraud detection system
- ⏰ Smart parking duration tracking
- 🎨 AI-powered vehicle attributes detection
- 💳 Digital payment integration ready
- 🚨 Automated alert system

## System Architecture

The system consists of two main components:

1. **Backend (Raspberry Pi)**
   - Python FastAPI server
   - OCR processing
   - Camera integration
   - Database management
   - Real-time event processing

2. **Frontend (Web Dashboard)**
   - React with TypeScript
   - Real-time monitoring
   - Management interface
   - Analytics dashboard

## Prerequisites

- Python 3.9+
- Node.js 16+
- Raspberry Pi 4 (for backend deployment)
- High-resolution camera compatible with Raspberry Pi
- PostgreSQL database

## Installation

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Development

### Running the Backend

```bash
cd backend
uvicorn main:app --reload
```

### Running the Frontend

```bash
cd frontend
npm run dev
```

## Project Structure

```
gatewise/
├── backend/                 # Raspberry Pi backend
│   ├── app/                # Application code
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/               # Web dashboard
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
└── docs/                  # Documentation
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
