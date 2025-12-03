# Smart Competency Diagnostic & Candidate Score Calculator

Smart Competency Diagnostic is a full-stack TypeScript project that lays the groundwork for a competency diagnostic and scoring platform. This first phase focuses on secure authentication, candidate profile CRUD flows, and a clean React dashboard for basic profile management.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt
- **Frontend:** React 19, Vite, TypeScript, React Router, Axios
- **Tooling:** ts-node-dev, ESLint (frontend), dotenv

## Project Structure
```
Smart Competency/
├─ backend/        # Express API (JWT auth + candidate CRUD)
└─ frontend/       # React dashboard (registration, login, profile)
```

## Environment Variables
Create `.env` files based on the provided `.env.example` files.

### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI="mongodb+srv://divyam8175:<db_password>@cluster0.9gpkb.mongodb.net/?appName=Cluster0"
JWT_SECRET=supersecretkey
CLIENT_URL=http://localhost:5173,http://localhost:5174
GROK_API_KEY=your_xai_bearer_token
GROK_MODEL=grok-2-latest
```

Separate multiple allowed frontend origins with commas. The backend calls the Grok (xAI) chat-completions endpoint for resume parsing, skill-gap analysis, job-fit predictions, recruiter rankings, and PDF insights. Provide a valid Grok API key to enable these flows; otherwise, deterministic fallbacks run locally.

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

## Installation
```bash
# Backend deps
cd backend
npm install

# Frontend deps (new terminal)
cd ../frontend
npm install
```

## Available Scripts
### Backend
- `npm run dev` – Start Express API with hot reload (ts-node-dev)
- `npm run build` – Compile TypeScript to `dist/`
- `npm run start` – Run compiled server from `dist/`
- `npm run lint` – Type-check all backend sources

### Frontend
- `npm run dev` – Start Vite dev server (http://localhost:5173 by default)
- `npm run build` – Type-check and build production assets
- `npm run preview` – Preview the production build locally

## Running Locally
1. **Start MongoDB** (local service or Atlas connection string in `MONGO_URI`).
2. **Backend:**
   ```bash
   cd backend
   npm run dev
   ```
3. **Frontend:** (separate terminal)
   ```bash
   cd frontend
   npm run dev
   ```
4. Visit `http://localhost:5173` to register, log in, and manage the candidate profile.

## API Overview
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Candidate/Recr/Admin registration + JWT issue | Public |
| POST | `/api/auth/login` | Login + JWT issue | Public |
| POST | `/api/candidates/profile` | Create candidate profile (one per candidate) | Candidate |
| PUT | `/api/candidates/profile` | Update candidate profile + basic user info | Candidate |
| GET | `/api/candidates/profile` | Fetch authenticated candidate profile | Candidate |
| GET | `/api/candidates/:userId` | Recruiter/Admin view of candidate profile | Recruiter/Admin |
| POST | `/api/scores/calculate/:candidateId` | Save weighted competency score for a candidate | Recruiter/Admin |
| GET | `/api/scores/:candidateId` | Retrieve candidate score breakdown + insights | Candidate/Recruiter/Admin |
| GET | `/api/scores/history/:candidateId` | Historical trend of candidate scores | Candidate/Recruiter/Admin |

All protected endpoints expect an `Authorization: Bearer <token>` header containing the JWT issued during login/registration.

## Competency Scoring Engine & Analytics (Phase 2 & 3)
- Deterministic weighting (Technical 40%, Cognitive 25%, Behavioral 20%, Communication 15%) configured in `backend/src/services/scoringEngine.ts`
- Recruiters/Admins can submit raw scores (0-100) via the dashboard scoring console; the API persists weighted outputs in the candidate profile
- Score history is tracked per candidate for trend analysis (`scoreHistory` collection inside each profile)
- Insights generator (`backend/src/services/insightService.ts`) summarizes strengths, weak areas, and focus suggestions
- Candidates see their most recent Smart Score breakdown and insights directly on the dashboard

## Frontend Features
- Registration and login screens built with a shared Auth context
- Protected dashboard with role gating (candidate vs. recruiter/admin experiences)
- Candidate profile form covering name, email, phone, education history, skills, and projects
- Live preview card plus Smart Score card showing weighted breakdown + insights
- Recruiter/Admin scoring console to calculate and store new competency scores without leaving the app
- Analytics gallery powered by Recharts: radar breakdown, skill comparison bar chart, growth line graph, heatmap view, and skill gap analysis table
- Dedicated insights + improvement suggestions section driven by backend analysis

## Next Steps
- Add analytics/visual trends for score history
- Expand recruiter/admin views with candidate search & review workflows
- Introduce testing (Jest / React Testing Library, API integration tests)
- Harden validation, rate limiting, and auditing in the API
