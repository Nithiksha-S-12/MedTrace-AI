# MedTrace AI 🏥
### Government Unified Health Passport — AI-Powered Medical Records Platform

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd MedTrace
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=MedTraceAI
NEXTAUTH_SECRET=medtrace_super_secret_key_change_in_production
NEXTAUTH_URL=http://localhost:3000
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.3
NEXT_PUBLIC_APP_NAME=MedTrace AI
```

### 3. Seed Demo Data
```bash
node scripts/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔐 Demo Login Credentials

| Role | ID | Password |
|------|----|----------|
| Citizen | `1234567890` | `password` |
| Doctor | `DOC001` | `password` |
| Diagnostic Center | `DOC002` | `password` |
| Admin | `ADMIN001` | `password` |

---

## ✨ Features

### Citizen Portal
- **Timeline** — Chronological medical history with filters
- **AI Summary** — Red/Orange/Green triage overview via Hugging Face AI
- **QR Code Generator** — Time-limited consent-based QR with revoke
- **Notifications** — Real-time alerts on record access
- **Profile** — View and edit personal information

### Doctor Portal
- **QR Scan** — Validate patient QR sessions for record access
- **Emergency Override** — Break-glass access with 15-minute timer and full audit logging
- **Patient View** — AI triage summary + complete medical timeline
- **Audit Log** — Personal access history with CSV export

### Diagnostic Center Portal
- **Upload Scan** — Search patient by Gov ID and upload reports
- **Upload History** — View all uploads with type filters

### Admin Portal
- **Citizens** — Search and manage all registered citizens
- **Doctors** — Approve/revoke doctor verification
- **Hospitals** — View registered healthcare facilities
- **System Audit Log** — Complete audit trail with CSV export

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth | NextAuth.js (Credentials Provider) |
| Database | MongoDB (Mongoose) |
| AI | Hugging Face — Mistral 7B |
| QR Code | qrcode.react |
| Icons | Lucide React |

---

## 📁 Project Structure
```
src/
├── app/
│   ├── api/          # Backend API routes
│   ├── citizen/      # Citizen pages
│   ├── doctor/       # Doctor pages
│   ├── diagnostic/   # Diagnostic center pages
│   ├── admin/        # Admin pages
│   └── login/        # Auth pages
├── components/       # Shared UI components
├── lib/              # DB connection, auth config
└── models/           # Mongoose models
    ├── User.ts
    ├── Record.ts
    ├── QRSession.ts
    ├── AuditLog.ts
    └── Notification.ts
```

---

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

> **Note:** Make sure your MongoDB Atlas cluster allows connections from `0.0.0.0/0` (all IPs) for Vercel serverless functions.

---

## 🔑 Required APIs

| Service | Required | Purpose |
|---------|----------|---------|
| MongoDB Atlas | ✅ Yes | Database for all records |
| Hugging Face | ⚠️ Optional | AI summarization (mock fallback included) |
| Cloudinary | ❌ No | File uploads (base64 used as fallback) |
