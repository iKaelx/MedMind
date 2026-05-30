# AI Doctor Assistant System

A comprehensive offline-first + cloud backup medical assistant application with AI-powered insights using Groq API.

## Architecture Overview

- **Frontend**: Next.js 16 (React) with IndexedDB for offline-first functionality
- **Backend**: FastAPI with PostgreSQL/SQLite
- **Sync Engine**: Background worker that syncs local changes to cloud
- **AI Service**: Groq API integration for patient summaries and Q&A

## Project Structure

```
.
├── app/                          # Next.js application
│   ├── dashboard/                # Main application pages
│   │   ├── patients/            # Patient management
│   │   ├── consultations/       # Consultation records
│   │   ├── prescriptions/       # Prescription management
│   │   ├── ai/                  # AI assistant
│   │   └── settings/            # Settings & sync configuration
│   ├── page.tsx                 # Login page
│   ├── register/                # Registration page
│   └── globals.css              # Theme configuration
│
├── lib/
│   ├── db.ts                    # IndexedDB utilities
│   ├── store.ts                 # Zustand state management
│   ├── api.ts                   # API client
│   └── sync.ts                  # Background sync engine
│
├── components/ui/               # shadcn UI components
│
└── backend/                     # FastAPI application
    ├── main.py                  # Application entry point
    ├── models.py                # SQLAlchemy models
    ├── schemas.py               # Pydantic schemas
    └── routes/
        ├── auth.py              # Authentication endpoints
        ├── patients.py          # Patient CRUD endpoints
        ├── consultations.py     # Consultation endpoints
        ├── prescriptions.py     # Prescription endpoints
        └── ai_service.py        # AI service endpoints
```

## Setup Instructions

### Frontend Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables** (`.env.local`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

   The app will run on `http://localhost:3000`

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create Python virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (`.env`):
   ```
   DATABASE_URL=sqlite:///./doctors.db
   # For PostgreSQL:
   # DATABASE_URL=postgresql://user:password@localhost:5432/doctor_assistant
   
   SECRET_KEY=your-super-secret-key-change-this
   GROQ_API_KEY=your-groq-api-key-here
   ```

5. **Start backend server**:
   ```bash
   python main.py
   ```

   The API will run on `http://localhost:8000`

## Features

### Core Functionality
- ✅ User authentication (login/register)
- ✅ Patient management (add, edit, delete, search)
- ✅ Offline-first data storage (IndexedDB)
- ✅ Background sync engine (30-second intervals)
- ✅ Local SQLite + Cloud PostgreSQL
- ✅ JWT-based authentication

### In Development
- 📋 Consultation recording and management
- 💊 Prescription creation and tracking
- 🤖 AI-powered patient summaries
- 🤖 AI Q&A for patient data
- 📊 Dashboard with analytics
- 💾 Data backup & restore

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **State Management**: Zustand
- **Database**: Dexie (IndexedDB wrapper)
- **UI**: shadcn/ui + Tailwind CSS
- **HTTP Client**: Axios
- **API**: Groq API for AI features

### Backend
- **Framework**: FastAPI
- **Database**: SQLAlchemy ORM
- **Database Options**: SQLite (dev), PostgreSQL (prod)
- **Authentication**: JWT tokens with bcrypt
- **API Format**: RESTful JSON

### Sync & Storage
- **Local**: IndexedDB (browser)
- **Cloud**: PostgreSQL (production)
- **Sync**: Background worker (every 30 seconds)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients/` - List all patients
- `POST /api/patients/` - Create patient
- `GET /api/patients/{id}` - Get patient details
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### Consultations
- `GET /api/consultations/` - List consultations
- `POST /api/consultations/` - Create consultation
- `GET /api/consultations/{id}` - Get consultation
- `PUT /api/consultations/{id}` - Update consultation
- `DELETE /api/consultations/{id}` - Delete consultation

### Prescriptions
- `GET /api/prescriptions/` - List prescriptions
- `POST /api/prescriptions/` - Create prescription
- `GET /api/prescriptions/{id}` - Get prescription
- `PUT /api/prescriptions/{id}` - Update prescription
- `DELETE /api/prescriptions/{id}` - Delete prescription

### AI Service
- `POST /api/ai/summarize` - Generate patient summary
- `POST /api/ai/query` - Ask question about patient

## Data Synchronization

The system uses an offline-first approach:

1. **Local Operations**: All data changes are stored in IndexedDB immediately
2. **Sync Queue**: Changes are added to a sync queue with `sync_status: "pending"`
3. **Background Sync**: Every 30 seconds, pending items are sent to the backend
4. **Status Update**: Upon successful sync, `sync_status` changes to `"synced"`
5. **Conflict Resolution**: Last-write-wins strategy

### Sync Status Flow
```
User Action → Local Save → sync_status: "pending"
                              ↓
                    Background Sync (30s)
                              ↓
                      API Upload Attempt
                              ↓
           Success → sync_status: "synced"
           Failure → Retry on next interval
```

## Database Schema

### Users Table
- id (PK)
- username (unique)
- email (unique)
- password_hash
- is_active
- created_at, updated_at

### Patients Table
- id (PK)
- full_name
- birth_date
- gender
- phone, email
- allergies, chronic_diseases
- doctor_id (FK to Users)
- sync_status (pending | synced | deleted)
- created_at, updated_at

### Consultations Table
- id (PK)
- patient_id (FK)
- doctor_id (FK)
- symptoms, diagnosis, notes
- consultation_date
- sync_status
- created_at, updated_at

### Prescriptions Table
- id (PK)
- patient_id (FK)
- doctor_id (FK)
- medication, dosage, instructions, duration
- sync_status
- created_at, updated_at

## Demo Credentials

When testing, you can use:
- **Email**: demo@example.com
- **Password**: password123

## Development Notes

### Hot Module Replacement
The frontend dev server supports HMR - changes reflect immediately without page reload.

### Database Seeding
To seed demo data, you can use the backend's POST endpoints with the provided test credentials.

### CORS Configuration
The backend allows CORS from `http://localhost:3000` and `http://localhost:8000` during development.

### Security Considerations
- Passwords are hashed with bcrypt (10 salt rounds)
- JWTs expire after 30 days
- Session tokens are stored in HTTP-only cookies
- All API requests require JWT token

## Future Enhancements

- Multi-doctor & multi-clinic support
- Real-time data sync with WebSockets
- Mobile app (React Native)
- PDF prescription generation with ReportLab
- Voice input for consultations
- Advanced analytics dashboard
- SMS & WhatsApp notifications
- Two-factor authentication
- Full-text search integration

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Select Next.js framework
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Heroku/Railway)
1. Add Procfile: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
2. Set PostgreSQL DATABASE_URL environment variable
3. Deploy

## Troubleshooting

### API Connection Issues
- Verify backend is running: `curl http://localhost:8000/`
- Check NEXT_PUBLIC_API_URL in .env.local
- Ensure CORS is configured correctly

### Sync Not Working
- Check browser console for errors
- Verify token is valid
- Check IndexedDB in DevTools → Application → Storage

### Database Issues
- For SQLite: Check `doctors.db` file exists in backend directory
- For PostgreSQL: Verify connection string and database is running
- Run migrations if needed

## License

MIT

## Support

For issues and questions, please refer to the project documentation or contact support.
