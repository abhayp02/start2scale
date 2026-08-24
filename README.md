# Scale2Start

**From Government Challenges to Scalable Innovation**

Scale2Start is a government–startup innovation and procurement platform. It helps public-sector organizations define challenges, discover relevant startup solutions through AI, evaluate applications, manage pilots, measure impact, initiate procurement, and scale successful solutions.

## Workflow

```text
Challenge → AI Matching → Evaluation → Pilot → Impact → Procurement → Scale
```

The AI engine recommends and ranks relevant startups. It does not make the final evaluation or procurement decision.

## Technology

- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: Node.js, Express
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT and role-based authorization
- AI: Google Gemini Developer API (`gemini-3.5-flash-lite` by default)
- Uploads: Multer with MongoDB GridFS durable storage

## Roles

- `government`: creates challenges, reviews matches, manages pilots and payments
- `startup`: discovers challenges, applies, submits KPI updates and evidence
- `evaluator`: performs eligibility checks, scores applications and verifies milestones
- `admin`: administrative access to supported backend operations

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB Atlas database
- Google AI Studio API key

## Environment setup

Create `.env` in the project root, beside this README:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=replace-with-your-google-ai-studio-key
GEMINI_MODEL=gemini-3.5-flash-lite
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env`. If the MongoDB password contains reserved URL characters, URL-encode it before placing it in the connection string.

## Installation

Install backend dependencies:

```powershell
cd backend
npm install
```

Install frontend dependencies:

```powershell
cd ..\frontend
npm install
```

## Seed demo data

From `backend/`, seed the six standard procurement templates and 15 startup profiles:

```powershell
node src/seed/seedTemplates.js
node src/seed/seedStartups.js
```

Both scripts are idempotent and can be run more than once.

Seed the administrator account from `backend/`:

```powershell
node src/seed/seedAdmin.js
```

Admin portal credentials:

```text
URL: http://localhost:5173/admin/login
Email: admin@scale2start.demo
Password: Demo@1234
```

The admin account is provisioned only through the seed script. Public admin
registration is intentionally unavailable.

All seeded startup accounts use this password:

```text
Demo@1234
```

Example startup login:

```text
Email: contact@bhulekhai.demo
Password: Demo@1234
```

Government and evaluator registration accepts approved government domains.
For the prototype, verification uses the first three alphanumeric characters
before `@`, followed by `123`. For example, `abhay@gov.in` uses `abh123`.
Configure additional demo agency domains with `GOVERNMENT_EMAIL_DOMAINS`.

Startup registration includes rate limiting, a honeypot, disposable-email
blocking, unique email and company registration number validation, and an
information-accuracy declaration.

Other seeded emails include `team@agrivision.demo`, `contact@mediscribe.demo`, `info@urbanpulse.demo`, and `hello@shikshatrack.demo`.

Government accounts can be created from the registration screen by selecting the government role and supplying a department name. The configured demo database also contains:

```text
Email: procurement@scale2start.gov.in
Password: Demo@1234
```

## Run locally

Start the backend from `backend/`:

```powershell
npm run dev
```

Start the frontend in a second terminal from `frontend/`:

```powershell
npm run dev
```

Open:

- Landing page: <http://localhost:5173/>
- Government login: <http://localhost:5173/government/login>
- Startup login: <http://localhost:5173/startup/login>
- Admin login: <http://localhost:5173/admin/login>
- API health check: <http://localhost:5000/api/health>

The health endpoint checks both the Express API and its MongoDB connection.
The green system indicator in the frontend uses this endpoint, so it reflects
real backend readiness instead of showing a fixed label.

## Free deployment: Vercel + Render + MongoDB Atlas

This repository is prepared for the following deployment layout:

```text
Browser → Vercel frontend → Render API → MongoDB Atlas
                                  └──→ Google Gemini API
```

Deploy the backend first because the frontend needs its public API URL.

### 1. Deploy the backend on Render

Create a **Web Service** from the repository and use:

```text
Branch: deployment
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

Add these Render environment variables:

```env
NODE_ENV=production
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a long unique random value>
GEMINI_API_KEY=<your Google AI Studio key>
GEMINI_MODEL=gemini-3.5-flash-lite
GOVERNMENT_EMAIL_DOMAINS=gov.in,nic.in
DEMO_ADMIN_EMAIL=admin@scale2start.demo
DEMO_ADMIN_PASSWORD=<your chosen demo password>
FRONTEND_URL=https://your-project.vercel.app
```

Render supplies `PORT` automatically. The server listens on that port and on
`0.0.0.0`, which makes it reachable from Render's public network.

After deployment, verify:

```text
https://your-render-service.onrender.com/api/health
```

You should receive `status: "ok"` and `database: "connected"`.

### 2. Deploy the frontend on Vercel

Create a Vercel project from the same repository and use:

```text
Branch: deployment
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Add this Vercel environment variable, using the real Render URL:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

`frontend/vercel.json` sends direct visits such as `/government/login` and
`/dashboard` to the React application. Without this rewrite, refreshing a
nested route can produce a Vercel 404.

### 3. Connect the final Vercel URL to Render

Once Vercel gives you the final public URL, set Render's `FRONTEND_URL` to that
exact origin and redeploy the backend:

```env
FRONTEND_URL=https://your-project.vercel.app
```

For more than one allowed frontend, use comma-separated origins. CORS then
accepts only those websites plus local development URLs.

### Free-tier behavior

Render's free web service can sleep after inactivity. The frontend checks
`/api/health` when a visitor opens the site and every ten minutes while the
site remains open. During a cold start it shows **Connecting to system**, then
changes to **System operational** after the API and database are ready.

This does not create an artificial always-on monitor. For a presentation,
open the deployed site several minutes before the demo and keep that tab open.
KPI evidence is stored in MongoDB GridFS, so Render restarts do not delete new
uploads.

## Suggested demo flow

1. Sign in through the government portal.
2. Create and publish a challenge using the multi-step wizard.
3. Review AI solution recommendations and supporting match evidence.
4. Sign out and log in through the startup portal.
5. Browse published challenges and submit an application.
6. Use an evaluator account to run eligibility and weighted scoring.
7. Create a pilot, track milestones and submit KPI evidence.
8. Verify a milestone to automatically flag its payment as due.
9. Generate a KPI evaluation report and scale recommendation.

## AI operations

`backend/src/services/aiService.js` exposes four operations:

- `extractRequirements(problemText)`
- `matchStartups(requirements, startupList)`
- `fillTemplate(templateContent, dataObject)`
- `analyzeKPIProgress(pilot, kpiRecords)`

Each operation makes one Gemini request and expects structured JSON output. Officer and citizen KPI evidence is weighted more heavily than startup self-reporting in progress analysis.

## Current implementation notes

- Authentication, challenges, applications, eligibility, evaluation, pilots, milestones, payments, KPI records, uploads, templates and Gemini endpoints are API-backed.
- AI Solution Matching loads department challenges and calls `/api/challenges/:id/matches` for live Gemini-ranked startup recommendations.
- Some enterprise navigation views are designed operational showcases pending dedicated backend modules.
- New KPI evidence uploads are stored durably in MongoDB GridFS. Legacy local
  `/uploads` paths remain available during local development.
- Vercel SPA routing and Render-compatible API startup are configured.

## Production checklist

- Rotate all development credentials.
- Restrict MongoDB Atlas network access.
- Use a strong, unique JWT secret.
- Set `FRONTEND_URL` to the exact deployed Vercel origin.
- Add rate limiting and request validation.
- Add automated tests, monitoring and centralized error logging.
- Connect remaining showcase screens to live API data.

## Project structure

```text
start2scale/
├── frontend/        React application
├── backend/         Express API and MongoDB models
├── uploads/         Legacy local evidence uploads
├── .env.example     Environment variable template
└── README.md
```
