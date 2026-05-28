# VedaAI — AI Assessment Creator

An AI-powered assessment creation platform that enables teachers to generate structured question papers using Google Gemini AI. Built with a modern full-stack architecture featuring real-time updates via WebSocket and background job processing.

![VedaAI](https://img.shields.io/badge/VedaAI-AI%20Assessment%20Creator-7C3AED?style=for-the-badge)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Create   │  │ Dashboard│  │Assessment│  │  PDF Export   │  │
│  │ Form     │  │  Page    │  │  View    │  │ (html2canvas) │  │
│  └────┬─────┘  └──────────┘  └────┬─────┘  └───────────────┘  │
│       │                           │                             │
│  ┌────┴───────────────────────────┴─────┐                      │
│  │         Zustand State Management      │                      │
│  └────┬──────────────────────────┬──────┘                      │
│       │ REST API                 │ WebSocket                    │
└───────┼──────────────────────────┼──────────────────────────────┘
        │                          │
┌───────┼──────────────────────────┼──────────────────────────────┐
│       │        BACKEND (Express + TypeScript)                   │
│  ┌────┴─────┐              ┌─────┴──────┐                      │
│  │  REST    │              │  Socket.io │                      │
│  │  Routes  │              │  Server    │                      │
│  └────┬─────┘              └─────▲──────┘                      │
│       │                          │                              │
│  ┌────┴─────┐              ┌─────┴──────┐     ┌────────────┐  │
│  │Controller│──────────────│  BullMQ    │────▶│  Google    │  │
│  │          │              │  Worker    │     │  Gemini AI  │  │
│  └────┬─────┘              └─────┬──────┘     └────────────┘  │
│       │                          │                              │
│  ┌────┴─────┐    ┌───────┐ ┌────┴─────┐                      │
│  │ MongoDB  │    │ Redis │ │ BullMQ   │                      │
│  │ (Atlas)  │    │(Cache)│ │ (Queue)  │                      │
│  └──────────┘    └───────┘ └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ Features

### Core
- **Assignment Creation** — Rich form with validation for creating assessments
- **AI Question Generation** — Structured prompt engineering with Google Gemini
- **Real-time Updates** — WebSocket notifications for generation progress
- **Background Processing** — BullMQ job queues for reliable AI generation
- **Structured Output** — Exam-paper format with sections, difficulty tags, marks

### Bonus
- **PDF Export** — Download formatted question papers as PDF
- **Regenerate** — Re-generate questions with one click
- **Redis Caching** — Fast retrieval of generated papers
- **Responsive Design** — Mobile-friendly dark theme UI

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Zustand, Socket.io Client |
| **Backend** | Node.js, Express, TypeScript, Socket.io |
| **Database** | MongoDB Atlas (Mongoose) |
| **Cache/Queue** | Upstash Redis, BullMQ |
| **AI** | Google Gemini (gemini-2.0-flash) |
| **PDF** | html2canvas + jsPDF |
| **Styling** | Vanilla CSS (Dark Theme, Glassmorphism) |

## 📁 Project Structure

```
VedaAI/
├── client/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Pages (App Router)
│   │   ├── components/        # UI, Layout, Feature components
│   │   ├── store/             # Zustand stores
│   │   ├── lib/               # API client, Socket, Validators
│   │   └── types/             # TypeScript interfaces
│   └── package.json
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── config/            # DB, Redis, Environment config
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # AI service, Prompt builder
│   │   ├── queues/            # BullMQ queue & worker
│   │   ├── socket/            # WebSocket handlers
│   │   └── types/             # TypeScript interfaces
│   └── package.json
│
├── .env.example               # Environment template
├── .gitignore
├── package.json               # Root workspace scripts
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier)
- Upstash Redis account (free tier)
- Google Gemini API key ([Get one free](https://ai.google.dev))

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/VedaAI.git
cd VedaAI
npm run install:all
```

### 2. Configure Environment

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/vedaai
REDIS_URL=rediss://default:<password>@<host>.upstash.io:6379
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
```

Create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Servers

```bash
# Run both frontend & backend concurrently
npm run dev

# Or run separately:
npm run dev:server   # Express on port 5000
npm run dev:client   # Next.js on port 3000
```

### 4. Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/assignments` | Create a new assignment + start AI generation |
| `GET` | `/api/assignments` | List all assignments |
| `GET` | `/api/assignments/:id` | Get assignment with generated paper |
| `POST` | `/api/assignments/:id/regenerate` | Regenerate question paper |
| `GET` | `/api/health` | Health check |

## 🔄 Data Flow

1. **Teacher fills form** → Frontend validates with Zod
2. **Submit** → POST to `/api/assignments`
3. **Backend saves** to MongoDB + adds job to BullMQ queue
4. **Client subscribes** via WebSocket for real-time updates
5. **BullMQ Worker** picks up job → builds structured prompt
6. **Gemini AI** generates questions → worker parses JSON response
7. **Worker saves** structured paper to MongoDB + caches in Redis
8. **WebSocket notification** sent to frontend → redirects to output page
9. **Output page** displays structured question paper with sections, difficulty tags, marks
10. **PDF export** available via html2canvas + jsPDF

## 🎨 Design Approach

- **Dark theme** with purple (#7C3AED) accent colors
- **Glassmorphism** cards with backdrop blur effects
- **Micro-animations** for enhanced UX (fade-in, slide-up, pulse)
- **Responsive** design — sidebar collapses on mobile
- **Exam-paper styling** — clean, hierarchical output resembling real exam papers

## 🧠 AI Prompt Engineering

The system constructs a detailed, structured prompt that instructs Gemini to:
- Generate questions organized into sections
- Tag each question with difficulty (Easy/Medium/Hard)
- Allocate marks per question
- Support multiple question types (MCQ, Short Answer, Long Answer, True/False)
- Follow the specified difficulty distribution
- Return structured JSON (not raw text)

The response is parsed and validated before being stored, ensuring the LLM output is never rendered directly.

## 📦 Deployment

### Frontend (Vercel)
```bash
cd client
vercel --prod
```

### Backend (Railway/Render)
- Connect GitHub repo
- Set build command: `cd server && npm install && npm run build`
- Set start command: `cd server && npm start`
- Add all environment variables from `.env`

## 📄 License

MIT
