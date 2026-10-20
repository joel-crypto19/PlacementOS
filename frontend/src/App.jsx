import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { PortalLayout } from './components/layout/PortalLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { JobDiscoveryPage } from './pages/jobs/JobDiscoveryPage';
import { JobDetailPage } from './pages/jobs/JobDetailPage';
import { PlacementDrivesPage } from './pages/drives/PlacementDrivesPage';
import { DriveDetailPage } from './pages/drives/DriveDetailPage';
import { CompanyDirectoryPage } from './pages/companies/CompanyDirectoryPage';
import { CompanyDetailPage } from './pages/companies/CompanyDetailPage';
import { NotFound } from './pages/NotFound';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { MyApplications } from './pages/student/MyApplications';
import { SavedJobs } from './pages/student/SavedJobs';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { PostJob } from './pages/recruiter/PostJob';
import { ManageJobs } from './pages/recruiter/ManageJobs';
import { JobApplicants } from './pages/recruiter/JobApplicants';
import { CompanyProfile } from './pages/recruiter/CompanyProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageCompanies } from './pages/admin/ManageCompanies';
import { ManageDrives } from './pages/admin/ManageDrives';
import { DataSyncManager } from './pages/admin/DataSyncManager';
import { AuditLogs } from './pages/admin/AuditLogs';

export const App = () => {
  return (
    <Routes>
      {/* Public Pages with Standard Header & Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobDiscoveryPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/drives" element={<PlacementDrivesPage />} />
        <Route path="/drives/:id" element={<DriveDetailPage />} />
        <Route path="/companies" element={<CompanyDirectoryPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Student Protected Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="saved" element={<SavedJobs />} />
      </Route>

      {/* Recruiter Protected Portal */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RecruiterDashboard />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="jobs/:jobId/applicants" element={<JobApplicants />} />
        <Route path="company" element={<CompanyProfile />} />
      </Route>

      {/* Placement Cell Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="companies" element={<ManageCompanies />} />
        <Route path="drives" element={<ManageDrives />} />
        <Route path="sync" element={<DataSyncManager />} />
        <Route path="audit" element={<AuditLogs />} />
      </Route>
    </Routes>
  );
};

export default App;
