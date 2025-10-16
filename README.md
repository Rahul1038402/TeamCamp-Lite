# TeamCamp Lite

A simplified project management application built with React, Flask, and Supabase.

## Project Structure

```
teamcamp-lite/
├── frontend/          # React + Vite + TypeScript
└── backend/           # Flask + Supabase
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Add your Supabase credentials to .env.local
npm run dev
```

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your Supabase credentials to .env
python run.py
```

## Environment Variables

### Frontend (.env.local)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
FLASK_ENV=development
SECRET_KEY=your_secret_key
```

## Features
- ✅ Google OAuth Authentication
- ✅ Project Management
- ✅ Task Management
- ✅ File Upload
- ✅ Team Collaboration

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Flask, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage