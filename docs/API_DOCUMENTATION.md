# PlacementOS — RESTful API Documentation

## Base Configuration
- **Base URL**: `http://localhost:5000/api`
- **Response Format**: `application/json`
- **Authentication**: `Authorization: Bearer <jwt_token>` header or HTTP-only cookie.

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register Account
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Alex Chen",
  "email": "student.alex@college.edu",
  "password": "Student@1234Password",
  "role": "student",
  "university": "National Institute of Technology",
  "degree": "B.Tech",
  "branch": "Computer Science & Engineering",
  "graduationYear": 2026,
  "cgpa": 9.2
}
```
- **Response**: `201 Created` with JWT token and user profile.

### 1.2 Sign In
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "student.alex@college.edu",
  "password": "Student@1234Password"
}
```
- **Response**: `200 OK` with `{ success: true, token: "...", user: { ... } }`.

### 1.3 Get Authenticated Profile
- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Access**: Private (Any authenticated role)
- **Response**: `200 OK` with user and student profile object.

---

## 2. Student Endpoints (`/api/students`)

### 2.1 Get Student Profile
- **Method**: `GET`
- **URL**: `/api/students/profile`
- **Access**: Private (`student`)
- **Response**: `200 OK` with academic fields and `completeness` score.

### 2.2 Update Profile
- **Method**: `PUT`
- **URL**: `/api/students/profile`
- **Access**: Private (`student`)
- **Request Body**: Full/partial profile fields (skills, projects, cgpa, backlogs, etc.).

### 2.3 Upload Resume
- **Method**: `POST`
- **URL**: `/api/students/resume`
- **Access**: Private (`student`)
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data**: `resume` (PDF, DOC, DOCX up to 5MB)
- **Response**: `200 OK` with relative server path.

### 2.4 Aggregated Dashboard Metrics
- **Method**: `GET`
- **URL**: `/api/students/dashboard`
- **Access**: Private (`student`)
- **Response**: `200 OK` with total applications, under review count, interview invitations, upcoming deadlines.

---

## 3. Job Opportunities (`/api/jobs`)

### 3.1 Discover Opportunities
- **Method**: `GET`
- **URL**: `/api/jobs`
- **Access**: Public
- **Query Parameters**:
  - `search` (keyword)
  - `jobType` (`full-time`, `internship`, `contract`)
  - `workMode` (`onsite`, `hybrid`, `remote`)
  - `branch` (branch cutoff)
  - `graduationYear` (cohort year)
  - `sortBy` (`newest`, `deadline`, `salary`)
  - `page`, `limit`

### 3.2 Get Job Details & Real-Time Eligibility
- **Method**: `GET`
- **URL**: `/api/jobs/:id`
- **Access**: Public (Optional student authentication attaches real-time `{ isEligible, reasons }` object).

### 3.3 Publish Opportunity
- **Method**: `POST`
- **URL**: `/api/jobs`
- **Access**: Private (`recruiter` [verified], `admin`)
- **Request Body**:
```json
{
  "title": "Associate Software Engineer",
  "jobType": "full-time",
  "workMode": "hybrid",
  "location": "Bangalore, India",
  "salaryOrStipend": {
    "min": 1800000,
    "max": 2400000,
    "currency": "INR",
    "period": "yearly",
    "isDisclosed": true
  },
  "eligibility": {
    "minCgpa": 7.5,
    "allowedBranches": ["Computer Science & Engineering", "Information Technology"],
    "allowedGraduationYears": [2026],
    "maxBacklogs": 0
  },
  "applicationDeadline": "2026-11-30T00:00:00.000Z",
  "description": "Design web-scale microservices...",
  "skillsRequired": ["React", "Node.js", "Docker"]
}
```

---

## 4. Applications (`/api/applications`)

### 4.1 Apply for Job
- **Method**: `POST`
- **URL**: `/api/applications`
- **Access**: Private (`student`)
- **Request Body**:
```json
{
  "jobId": "65b...",
  "notes": "Cover note to recruiter..."
}
```
- **Error Codes**:
  - `400 Bad Request`: Deadline expired or profile incomplete.
  - `409 Conflict`: Duplicate application already submitted.

### 4.2 Candidate Applications
- **Method**: `GET`
- **URL**: `/api/applications/me`
- **Access**: Private (`student`)

### 4.3 Review Job Applicants
- **Method**: `GET`
- **URL**: `/api/applications/job/:jobId`
- **Access**: Private (`recruiter` [owner], `admin`)

### 4.4 Transition Recruitment Stage
- **Method**: `PATCH`
- **URL**: `/api/applications/:id/status`
- **Access**: Private (`recruiter`, `admin`)
- **Request Body**:
```json
{
  "status": "shortlisted",
  "note": "Passed technical resume screening."
}
```

---

## 5. Interviews (`/api/interviews`)

### 5.1 Schedule Interview
- **Method**: `POST`
- **URL**: `/api/interviews`
- **Access**: Private (`recruiter`, `admin`)
- **Request Body**:
```json
{
  "applicationId": "...",
  "roundName": "Technical Interview 1",
  "scheduledAt": "2026-11-15T10:00:00.000Z",
  "durationMinutes": 60,
  "mode": "online",
  "meetingLinkOrLocation": "https://meet.google.com/xyz-abc"
}
```

---

## 6. Administration & Sync (`/api/admin`, `/api/sync`)

### 6.1 Real Database Analytics
- **Method**: `GET`
- **URL**: `/api/admin/analytics`
- **Access**: Private (`admin`)
- **Returns**: Aggregated recruitment funnel, status breakdown, in-demand skills, placement percentage.

### 6.2 Data Sources & Sync Health
- **Method**: `GET`
- **URL**: `/api/sync/sources`
- **Access**: Private (`admin`)
- **Returns**: Configuration status, health status, and import counts for external providers (Adzuna, USAJobs).

### 6.3 Trigger Manual Synchronization
- **Method**: `POST`
- **URL**: `/api/sync/trigger/:providerKey`
- **Access**: Private (`admin`)
