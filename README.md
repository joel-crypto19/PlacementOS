# PlacementOS — College Placement & Internship Management Platform

PlacementOS is a full-stack MERN platform for managing college placements and internships. It provides student, recruiter, and placement-admin portals for discovering opportunities, checking eligibility, managing applications, and coordinating campus recruitment.

## Features

### Student portal
- Secure registration and login
- Academic and professional profile management
- Resume upload
- Job search, filters, and eligibility checks
- Application tracking and opportunity wishlists

### Recruiter portal
- Recruiter onboarding and verification
- Job and internship posting
- Candidate review and application-stage management
- Interview scheduling

### Placement administration
- Recruitment analytics and dashboards
- Recruiter and company moderation
- Campus placement drive management
- CSV exports and audit logs

### Job data integrations
- Adzuna Jobs API adapter
- USAJOBS API adapter
- Duplicate-listing prevention and synchronization status
- Demo listings identified separately from external listings

External job feeds require valid API credentials. Do not assume listings are live external opportunities unless the provider integration is configured and verified.

## Technology stack

- **Frontend:** React, React Router, Tailwind CSS, Recharts, Axios
- **Backend:** Node.js, Express.js, REST APIs
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT and bcrypt
- **Testing:** Jest and Supertest

## Project structure

```text
Placement Management System/
├── backend/
├── frontend/
├── docs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Run locally

### Prerequisites
- Node.js
- MongoDB running locally or a MongoDB Atlas connection

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Create `backend/.env` using `backend/.env.example` as a template. Add your own local database connection and secret values. Never commit real credentials to GitHub.

### 3. Start the backend

```bash
cd backend
npm run dev
```

### 4. Start the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Open the local URL shown by Vite, typically `http://localhost:5173`.

## Environment variables

See `.env.example` and `backend/.env.example` for the configuration options used by your project. External providers such as Adzuna and USAJOBS need their own credentials before their feeds can return live data.

## Testing

From the backend directory:

```bash
npm test
```

## Deployment

The frontend can be deployed to a static hosting service such as Vercel or Netlify. The backend can be deployed to a Node.js hosting service with a MongoDB database. Configure production environment variables, CORS, file storage, and scheduled jobs before deployment.

## Known limitations

- Resume files are stored locally unless external file storage is configured.
- Scheduled synchronization depends on the backend process running.
- Live job availability depends on correctly configured external API credentials and verified data sources.
