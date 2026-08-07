# MedTrace AI – Government Unified Health Passport

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A full-stack Government Unified Health Passport system with AI triage, QR sharing, DICOM viewer, and emergency break-glass protocol.

---

## 🚀 Quick Start (Hackathon Demo Mode)

The app ships with **mock authentication** and **seed data** — no API keys needed to run the demo immediately.

```bash
# Clone and install
git clone <repo>
cd medtrace-ai

# Install backend deps
cd backend && npm install

# Install frontend deps  
cd ../frontend && npm install

# Start backend (in one terminal)
cd backend && npm run dev

# Start frontend (in another terminal)
cd frontend && npm run dev
```

Open http://localhost:5173 and log in with the demo accounts below.

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|------|-------|----------|
| **Citizen** | citizen@demo.com | demo123 |
| **Doctor** | doctor@demo.com | demo123 |
| **Diagnostic Center** | diagnostic@demo.com | demo123 |
| **System Admin** | admin@demo.com | demo123 |

---

## 🌍 Environment Variables Setup

### Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your actual values:

| Variable | Source | Required for Demo? |
|----------|--------|--------------------|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) (Free) | Optional (mock fallback) |
| `MONGODB_URI` | [mongodb.com/atlas](https://mongodb.com/atlas) (Free) | Optional (in-memory mock) |
| `CLERK_PUBLISHABLE_KEY` | [clerk.com](https://clerk.com) | ❌ Not needed (mock auth) |
| `CLERK_SECRET_KEY` | [clerk.com](https://clerk.com) | ❌ Not needed (mock auth) |
| `TWILIO_ACCOUNT_SID` | [twilio.com](https://twilio.com) | ❌ Not needed (logs to console) |
| `TWILIO_AUTH_TOKEN` | [twilio.com](https://twilio.com) | ❌ Not needed |
| `TWILIO_PHONE_NUMBER` | [twilio.com](https://twilio.com) | ❌ Not needed |

> **For the hackathon demo**: Only `GROQ_API_KEY` and `MONGODB_URI` are needed for full functionality. Everything else uses mock fallbacks automatically.

### Getting Groq API Key (Free)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up with Google/GitHub (no credit card)
3. Go to API Keys → Create API Key
4. Copy and paste into `GROQ_API_KEY=`

### Getting MongoDB URI (Free)
1. Visit [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster (M0 tier)
3. Create database user and whitelist your IP
4. Click "Connect" → "Connect your application" → Copy the URI
5. Replace `<password>` in the URI with your database password

---

## 🗂️ Project Structure

```
medtrace-ai/
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Shared components (Sidebar, Header, etc.)
│   │   │   ├── citizen/
│   │   │   ├── doctor/
│   │   │   ├── diagnostic/
│   │   │   └── admin/
│   │   ├── pages/            # All route pages
│   │   ├── context/          # React context (Auth, App state)
│   │   ├── services/         # API service layer + mock data
│   │   ├── hooks/            # Custom React hooks
│   │   └── styles/           # Global CSS
│   └── package.json
├── backend/                  # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routes
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/        # Auth, validation
│   │   ├── services/         # AI, OCR, notifications
│   │   └── utils/            # Helper utilities
│   ├── scripts/              # Seed data
│   ├── server.js
│   └── .env.example
└── README.md
```

---

## 🛡️ Security Architecture

- **One Account Per Citizen**: Government ID uniqueness enforced at DB level
- **Role-Based Access Control**: Citizens cannot upload/edit/delete
- **QR Sessions**: Encrypted tokens, auto-expire in 5 minutes
- **Emergency Protocol**: Logged, audited, 15-min max access
- **Audit Trail**: Every access event logged with IP, timestamp, actor

---

## 🧰 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Authentication | Mock Auth (Clerk-ready) |
| AI | Groq API + Llama 3 |
| OCR | Tesseract.js (browser-side) |
| QR Codes | qrcode.react |
| DICOM Viewer | Cornerstone.js |
| Charts | Recharts |
| Animations | Framer Motion |
| PDF Export | jsPDF + html2canvas |

---

## 🌱 Seeding Demo Data

```bash
cd backend
npm run seed
```

This creates:
- 3 demo patients with complete medical histories
- 2 verified doctors
- 1 approved hospital
- Sample scan records, AI summaries, audit logs

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### Backend → Render
1. Push backend folder to GitHub
2. Create new Web Service on Render
3. Set environment variables in Render dashboard
4. Deploy

---

## 📋 Feature Checklist

- [x] Unified Identity System (Government ID → Health ID)
- [x] Citizen Dashboard (View-only)
- [x] Doctor Dashboard + QR Scan
- [x] Emergency Break-Glass Protocol
- [x] Diagnostic Center Upload
- [x] System Administrator Dashboard
- [x] AI Triage (Groq + Llama 3)
- [x] OCR Digitization (Tesseract.js)
- [x] Secure QR Sharing
- [x] Audit Trail
- [x] DICOM Viewer
- [x] PDF Download
- [x] Mobile Responsive

---

## 📄 License

MIT © MedTrace AI Team
