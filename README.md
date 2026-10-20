# PlacementOS — College Placement & Internship Management Platform

PlacementOS is an enterprise-grade full-stack web platform built for modern university placement cells, graduating students, and enterprise recruitment teams. It replaces disjointed spreadsheets, paper resumes, and uncoordinated communications with an automated, role-governed placement ecosystem.

---

## 1. Summary of Implemented Features

### 🎓 Student Career Experience
- **Secure Authentication & Onboarding**: Register and login with JWT and BCrypt security.
- **Academic & Professional Profile**: Complete academic records (Degree, Branch, CGPA, Backlogs, Graduation Year).
- **Resume Upload & Validation**: Secure resume upload subsystem (PDF, DOC, DOCX up to 5MB) with file preview and static storage.
- **Technical Skills & Project Portfolio**: Skill tag manager, project showcase with GitHub links, certifications, and work experience.
- **Live Eligibility Checker**: Real-time evaluation of CGPA, branch cutoffs, graduation batch, and backlog status before application submission.
- **Application Tracking & Audit Timeline**: Status history tracking (`Applied` → `Under Review` → `Shortlisted` → `Assessment` → `Interview Scheduled` → `Selected` / `Rejected`).
- **Wishlist & Deadlines**: Bookmark opportunities to a personal wishlist and track imminent registration deadlines.
- **Interview Portal**: Live interview invitation feed with Google Meet launch buttons.

### 🏢 Recruiter Talent Hub
- **Access Requests & Company Profile**: Recruiter registration with verification workflows.
- **Targeted Campus Job Publishing**: Post full-time roles and summer internships with customizable cutoff rules (CGPA, allowed engineering branches, graduation batches, backlogs, stipend disclosures).
- **Candidate Reviewer Board**: Filter applicant pools across recruitment stages, view academic snapshots and resumes.
- **Stage Progression & Feedback**: Transition candidates between stages with audit notes.
- **Structured Interview Scheduler**: Schedule technical and HR interview rounds with meeting links and candidate notifications.

### 🏛️ Placement Administration & Institutional Governance
- **Executive Analytics Dashboard**: Real-time Recharts visualizations (Campus Recruitment Funnel, Application Distribution Pie Chart, Most In-Demand Skills).
- **Real Placement Rate Calculation**: Calculated exclusively from actual database selections (`selected / total students`), never fabricated.
- **User & Company Moderation**: Approve or reject pending recruiter registrations; verify employer organizations.
- **Campus Placement Drives**: Create and schedule semester placement drives (e.g., Annual Drive 2025-2026, Summer Internship Drive 2026).
- **One-Click CSV Export**: Download authorized student rosters and application records for accreditation reports.
- **Security Audit Trail**: Immutable database audit log tracking all actions with actor role, IP address, and timestamps.

### 🌐 Real-World Data Integration Pipeline
- **Adapter Architecture**: Documented integrations for **Adzuna Jobs API** and **USAJobs Open Data API**.
- **Automated Deduplication**: Compound index on `(sourceProvider, externalId)` prevents duplicate records.
- **Live Sync Manager**: Administrative dashboard displaying configuration status, health state, manual "Sync Now" trigger, and audit history.
- **Truthful Status Reporting**: When API keys are not supplied in `.env`, the provider is honestly reported as `"not_configured"` with setup instructions. Demonstration listings are clearly demarcated (`isDemo: true`).

---

## 2. Technology Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, Lucide React, Recharts, Axios, React Hot Toast.
- **Backend**: Node.js, Express.js, RESTful JSON APIs, Mongoose ODM.
- **Database**: MongoDB (Local instance or MongoDB Atlas).
- **Security & Utilities**: JWT (`jsonwebtoken`), BCrypt (`bcryptjs`), Helmet, CORS, Express Rate Limit, Multer.
- **Testing**: Jest, Supertest.

---

## 3. Project Folder Structure

```
Placement Management System/
├── backend/
│   ├── src/
│   │   ├── config/              # Database connection & validated environment
│   │   ├── controllers/         # REST API route handlers
│   │   ├── integrations/        # Adzuna & USAJobs adapters and syncService
│   │   ├── middleware/          # JWT auth, RBAC, multer upload, rateLimiter, errorHandler
│   │   ├── models/              # 12 Mongoose Schemas (User, Job, Application, etc.)
│   │   ├── routes/              # Express API route modules
│   │   ├── services/            # Eligibility engine, notifications, background scheduler
│   │   ├── utils/               # Realistic database seed data script
│   │   ├── app.js               # Express application initialization
│   │   └── server.js            # Server startup and MongoDB connection
│   ├── tests/                   # Automated API integration tests (Supertest + Jest)
│   ├── uploads/resumes/         # Local secure resume storage directory
│   ├── .env.example             # Environment variable template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Common UI, Job Cards, Layouts (Navbar, Sidebar, Footer)
│   │   ├── context/             # AuthContext and NotificationContext
│   │   ├── pages/
│   │   │   ├── admin/           # Executive Analytics, User Mgmt, Data Sync, Drives
│   │   │   ├── auth/            # Sign In & Registration
│   │   │   ├── companies/       # Employer Directory & Profile Pages
│   │   │   ├── drives/          # Campus Placement Drives
│   │   │   ├── jobs/            # Job Discovery & Detail with Eligibility Evaluation
│   │   │   ├── recruiter/       # Recruiter Dashboard, Post Job, Manage Applicants
│   │   │   ├── student/         # Student Portal, Profile & Resume, Applications
│   │   │   └── LandingPage.jsx  # Public interactive landing page
│   │   ├── services/            # Axios API client modules
│   │   ├── styles/              # Tailwind CSS index stylesheet
│   │   ├── App.jsx              # React Router component tree
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   ├── ARCHITECTURE.md          # Architecture overview & diagrams
│   ├── DATABASE_SCHEMA.md       # ER diagram & 12 schema breakdowns
│   ├── API_DOCUMENTATION.md     # REST endpoint specs
│   └── POSTMAN_COLLECTION.json  # Postman v2.1 collection
├── .env.example
├── package.json
└── README.md
```

---

## 4. Setup and Run Instructions

### Prerequisites
- Node.js version **18.x or 20.x+**
- MongoDB running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

### Step 1: Install Dependencies
Open your terminal in the root directory:

```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Install Frontend Dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment
Create a `.env` file in `backend/.env` (copy from `backend/.env.example`):

```bash
cd ../backend
cp .env.example .env
```

### Step 3: Seed Database with Initial Data
Initialize all models, verified recruiter accounts, campus placement drives, and realistic job listings:

```bash
cd backend
npm run seed
```

### Step 4: Run Application
Open two terminal windows:

**Terminal 1 (Backend API on Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Client on Port 5173):**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 5. Pre-Configured Test Accounts

| Persona | Email | Password | Role / Access |
|---|---|---|---|
| **Placement Cell Admin** | `admin@college.edu` | `Admin@1234Password` | Institutional Analytics, Sync, User Mgmt |
| **Recruiter (Google India)** | `recruiter.google@placementos.edu` | `Recruiter@1234Password` | Verified Employer, Post Jobs, Review Candidates |
| **Recruiter (Microsoft IDC)** | `recruiter.ms@placementos.edu` | `Recruiter@1234Password` | Verified Employer, Interview Scheduling |
| **Recruiter (Apex AI - Demo)**| `pending.recruiter@apexai.example.com`| `Recruiter@1234Password` | Recruiter pending admin approval |
| **Student (Alex Chen)** | `student.alex@college.edu` | `Student@1234Password` | CSE, CGPA 9.2, 0 Backlogs (Eligible) |
| **Student (Priya Patel)** | `student.priya@college.edu` | `Student@1234Password` | IT, CGPA 8.7, 0 Backlogs |
| **Student (Rahul Varma)** | `student.rahul@college.edu` | `Student@1234Password` | ECE, CGPA 7.1, 1 Backlog (Tests cutoffs) |

> **Pro Tip**: The Landing Page and Login Page include 1-click test fill buttons to evaluate each role instantly.

---

## 6. Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend HTTP Port | `5000` |
| `MONGO_URI` | MongoDB Connection String | `mongodb://127.0.0.1:27017/placementos` |
| `JWT_SECRET` | Secret key for signing tokens | `placementos-super-secret-jwt-key-2026` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `ADZUNA_APP_ID` | Optional Adzuna Application ID | `""` |
| `ADZUNA_API_KEY` | Optional Adzuna API Key | `""` |
| `USAJOBS_API_KEY` | Optional USAJobs API Key | `""` |
| `USAJOBS_EMAIL` | Optional USAJobs User-Agent Email | `""` |
| `SYNC_INTERVAL_HOURS`| Background job refresh interval | `24` |

---

## 7. Integrated Live Data Sources & Status

| Data Source | Geographic Coverage | Integration Status | Notes |
|---|---|---|---|
| **Adzuna Job Search API** | India (`in`), Global (`us`, `gb`) | **Ready & Implemented** | Adapter implemented in `adzunaAdapter.js`. Reports `not_configured` when API keys are absent; fully functional upon entering free keys from `developer.adzuna.com`. |
| **USAJobs Federal API** | United States | **Ready & Implemented** | Adapter implemented in `usaJobsAdapter.js`. Handles rate limits, retry logic with backoff, and pagination. |
| **Campus Direct Listings** | Institutional | **Live & Active** | Internal database listings created by verified campus recruiters. |

---

## 8. Automated Tests & Verification Results

Backend integration test suite executed via `Jest` and `Supertest`:

```
PASS tests/api.test.js
  PlacementOS Core API Test Suite
    √ GET /api/health should return status healthy (121 ms)
    √ POST /api/auth/login with valid student credentials (228 ms)
    √ POST /api/auth/login with valid admin credentials (138 ms)
    √ POST /api/auth/login with invalid password should return 401 (101 ms)
    √ GET /api/students/profile should retrieve student profile with completeness (29 ms)
    √ GET /api/jobs should return paginated job listings (33 ms)
    √ GET /api/jobs/:id should return job details with eligibility evaluation for student (36 ms)
    √ RBAC: Student should be forbidden from accessing admin analytics (14 ms)
    √ RBAC: Admin should successfully access administrative analytics (83 ms)
    √ Duplicate application prevention: applying again to same job returns 409 (58 ms)
    √ Data Sources health status reports accurately (30 ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        2.669 s
```

To run tests:
```bash
cd backend
npm test
```

---

## 9. Production Deployment Guide

### Frontend Deployment (Vercel / Netlify / Render)
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. The output directory is `frontend/dist`.
3. Configure your hosting provider to redirect all single-page routes (`/*`) to `/index.html`.
4. Set environment variable `VITE_API_URL` to your production backend URL.

### Backend Deployment (Render / Railway / AWS / Heroku)
1. Set the root working directory to `backend`.
2. Configure environment variables (`NODE_ENV=production`, `PORT=5000`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`).
3. Set start command to `npm start` (`node src/server.js`).

---

## 10. Known Limitations
- Local resume storage uses file system storage in `backend/uploads/resumes`. For multi-server production clusters, configure an AWS S3 / Cloudinary bucket adapter.
- Background sync scheduler runs via Node.js timer (`syncScheduler.js`); in serverless deployment environments, scheduled cron jobs (e.g. AWS EventBridge or Vercel Cron) should trigger `/api/sync/trigger/:providerKey`.
