# Quick Start Guide

Get the AI Doctor Assistant running in minutes.

## 1. Frontend Setup (Current Directory)

The frontend is already configured with dependencies installed.

### Start the development server:
```bash
pnpm dev
```

The app will open at **http://localhost:3000**

### Test the UI:
- Login page at `/` 
- Register at `/register`
- Dashboard at `/dashboard` (after login)

## 2. Backend Setup (Separate Terminal)

### Navigate to backend:
```bash
cd backend
```

### Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### Install dependencies:
```bash
pip install -r requirements.txt
```

### Configure environment (.env):
```bash
cp .env.example .env
# Edit .env and add your settings:
# - DATABASE_URL=sqlite:///./doctors.db (or PostgreSQL URL)
# - SECRET_KEY=your-secret-key
# - GROQ_API_KEY=your-groq-api-key
```

### Start backend:
```bash
python main.py
```

Backend runs at **http://localhost:8000**

## 3. Verify Connection

### Check backend health:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy", "timestamp": "2026-05-26T..."}
```

### Try login (with test credentials):
1. Go to http://localhost:3000
2. Email: `demo@example.com`
3. Password: `password123`

## 4. Project Features

### Current Implementation
- ✅ User authentication (login/register)
- ✅ Patient management dashboard
- ✅ Offline-first data storage
- ✅ Background sync engine
- ✅ Theme system (light/dark mode)
- ✅ Professional UI with Tailwind CSS

### Ready to Extend
- Consultations module
- Prescriptions management
- AI patient summaries
- Advanced analytics
- Settings and backup

## 5. Database Options

### SQLite (Default - Fast Setup)
```
DATABASE_URL=sqlite:///./doctors.db
```
Perfect for development and testing.

### PostgreSQL (Production)
```
DATABASE_URL=postgresql://user:password@localhost:5432/doctor_assistant
```

## 6. Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=sqlite:///./doctors.db
SECRET_KEY=change-this-secret-key
GROQ_API_KEY=your-groq-api-key
HOST=0.0.0.0
PORT=8000
```

## 7. File Structure Overview

```
project/
├── app/                    # Next.js frontend
│   ├── page.tsx           # Login page
│   ├── register/          # Registration
│   └── dashboard/         # Main app
├── lib/
│   ├── db.ts              # IndexedDB
│   ├── api.ts             # API client
│   ├── store.ts           # State management
│   └── sync.ts            # Background sync
├── backend/               # FastAPI
│   ├── main.py            # App entry
│   ├── models.py          # Database models
│   └── routes/            # API endpoints
└── components/            # UI components
```

## 8. Common Commands

### Frontend
```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm lint         # Run linter
```

### Backend
```bash
python main.py              # Start server
python -m pip install -r requirements.txt  # Install deps
```

## 9. Troubleshooting

### Frontend won't start?
```bash
rm -rf .next node_modules
pnpm install
pnpm dev
```

### Backend connection error?
- Ensure backend is running: `curl http://localhost:8000/health`
- Check .env.local has correct NEXT_PUBLIC_API_URL
- Check CORS configuration in backend/main.py

### Database issues?
- SQLite: Delete `doctors.db` to reset
- PostgreSQL: Verify connection string and database exists

## 10. Next Steps

1. **Create a test account**: Register a new user at `/register`
2. **Add patients**: Go to dashboard and add patient records
3. **Configure AI**: Set your Groq API key in Settings
4. **Enable sync**: Check sync status in Dashboard
5. **Explore features**: Navigate through all modules

## 11. Development Tips

- Use browser DevTools to inspect IndexedDB (Application → Storage)
- Check console logs for sync engine activity
- API docs available at `http://localhost:8000/docs` (Swagger UI)
- Network tab shows sync requests in real-time

## 12. API Testing

### Test register (Backend):
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor1","email":"doc@example.com","password":"pass123"}'
```

### Test login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doc@example.com","password":"pass123"}'
```

## 13. Production Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect to Vercel
3. Set NEXT_PUBLIC_API_URL
4. Deploy

### Backend (Heroku/Railway)
1. Set DATABASE_URL to PostgreSQL
2. Set GROQ_API_KEY
3. Set SECRET_KEY
4. Deploy

## Support

Refer to README.md for detailed documentation.

---

**Ready to build?** Start with `pnpm dev` and explore the app!
