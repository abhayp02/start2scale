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
- AI: Google Gemini Developer API (`gemini-3.7-flash` by default)
- Uploads: Multer with local file storage

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
GEMINI_MODEL=gemini-3.7-flash
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

All seeded startup accounts use this password:

```text
Demo@1234
```

Example startup login:

```text
Email: contact@bhulekhai.demo
Password: Demo@1234
```

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

- Landing page: <http://localhost:5173/welcome>
- Government login: <http://localhost:5173/government/login>
- Startup login: <http://localhost:5173/startup/login>
- API health check: <http://localhost:5000/api/health>

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
- Uploaded files are stored locally in `uploads/`; production deployment should use durable object storage.
- No automated test suite or production deployment configuration is included.

## Production checklist

- Rotate all development credentials.
- Restrict MongoDB Atlas network access.
- Use a strong, unique JWT secret.
- Configure strict CORS origins.
- Add rate limiting and request validation.
- Move uploads to durable object storage.
- Add automated tests, monitoring and centralized error logging.
- Connect remaining showcase screens to live API data.

## Project structure

```text
start2scale/
├── frontend/        React application
├── backend/         Express API and MongoDB models
├── uploads/         Local evidence uploads
├── .env.example     Environment variable template
└── README.md
```
