# LeetLab

LeetLab is a full-stack coding practice platform with problem solving, real-time code execution, submissions, playlists, and a monthly leaderboard.

## Features

- Email/password auth with OTP email verification and JWT cookie sessions
- Problem browsing with search, difficulty/status filters, and solved tracking
- Problem detail workspace with Monaco editor, run/submit, per-testcase feedback, and custom test cases
- Local code persistence per problem/language
- User profile analytics (submissions, solved count, language usage, streak calendar)
- Playlist management (create, update, delete, add/remove problems, progress tracking)
- Monthly leaderboard with weighted scoring (Easy=1, Medium=3, Hard=5)
- Admin-only problem creation/update/delete flow with multi-step form wizard
- Command palette (`Ctrl/Cmd + K`) and keyboard shortcuts in coding workspace
- Health endpoints with DB and RapidAPI checks

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, DaisyUI, React Query, Zustand, Monaco Editor
- Backend: Node.js, Express 5, Prisma ORM
- Database: PostgreSQL
- Code execution: Judge0 CE via RapidAPI
- Email: Resend

## Repository Structure

```text
LeetLab/
├── backend/   # Express + Prisma API
└── frontend/  # React + Vite client
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL
- RapidAPI key for Judge0 CE
- Resend API key (for OTP emails)

### 1) Clone

```bash
git clone https://github.com/Blazeiscoding/LeetLab.git
cd LeetLab
```

### 2) Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
DIRECT_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=replace_with_a_long_random_secret
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_BASE_URL=https://judge0-ce.p.rapidapi.com
RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@example.com
PORT=8080
NODE_ENV=development
```

Run migrations and start backend:

```bash
npm run migrate
npm run dev
```

### 3) Frontend setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:8080/api/v1
```

Start frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

Backend (`backend/.env`):

- `DATABASE_URL` (required): Prisma PostgreSQL connection string
- `DIRECT_DATABASE_URL` (required for migrations): direct PostgreSQL URL
- `JWT_SECRET` (required): JWT signing secret
- `RAPIDAPI_KEY` (required): Judge0 RapidAPI key
- `RAPIDAPI_BASE_URL` (optional): defaults to `https://judge0-ce.p.rapidapi.com`
- `RAPIDAPI_HOST` (optional): defaults to `judge0-ce.p.rapidapi.com`
- `RESEND_API_KEY` (required): Resend API key for OTP emails
- `RESEND_FROM_EMAIL` (optional): sender email
- `ALLOWED_ORIGINS` (optional): comma-separated extra CORS origins
- `COOKIE_DOMAIN` (optional): production cookie domain
- `PORT` (optional): API port (default `5000`)
- `RENDER_EXTERNAL_URL` (optional): used by production keep-alive cron
- `NODE_ENV` (optional): `development` or `production`

Frontend (`frontend/.env`):

- `VITE_BACKEND_URL` (recommended): API base URL, e.g. `http://localhost:8080/api/v1`

## Scripts

Backend (`backend/package.json`):

- `npm run dev` - run API with nodemon
- `npm run start` - run API with node
- `npm run migrate` - apply Prisma migrations (`prisma migrate deploy`)
- `npm run build` - install deps + Prisma generate + migrate deploy (deployment-oriented)

Frontend (`frontend/package.json`):

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## API Overview

Base URL: `/api/v1`

- Auth: `/auth/register`, `/auth/login`, `/auth/send-otp`, `/auth/verify-otp`, `/auth/logout`, `/auth/me`
- Problems: `/problems/get-all-problems`, `/problems/get-problem/:id`, `/problems/get-solved-problems`
- Admin problems: `/problems/create-problem`, `/problems/update-problem/:id`, `/problems/delete-problem/:id`
- Execution: `/execute-code/run`, `/execute-code/submit`
- Submissions: `/submission/get-all-submission`, `/submission/get-submission/:problemid`, `/submission/get-submissions-count/:problemid`
- Playlists: `/playlist`, `/playlist/:playlistId`, `/playlist/create-playlist`, `/playlist/:playlistId/add-problem`, `/playlist/:playlistId/remove-problem`
- Leaderboard: `/leaderboard/monthly`, `/leaderboard/user-stats`
- Health: `/health`, `/ping`

## Database and Seed Data

Prisma models include:

- `User`, `OTP`
- `Problem`, `Submission`, `TestCaseResult`, `ProblemSolved`
- `Playlist`, `ProblemInPlaylist`

Optional seed script:

```bash
cd backend
node seed.js
```

Note: `seed.js` expects at least one existing admin user.

## Postman

Postman collection is available at:

- `backend/postman/LeetLab-Api.postman_collection.json`

## Acknowledgments

- Judge0 CE
- Prisma
- React
- PostgreSQL
