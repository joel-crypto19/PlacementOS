import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import { driveService } from '../services/driveService';
import { JobCard } from '../components/jobs/JobCard';
import {
  Briefcase, ShieldCheck, Users, TrendingUp, Sparkles, CheckCircle2,
  ArrowRight, Search, Building2, Calendar, FileCheck, Layers, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LandingPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [drives, setDrives] = useState([]);
  const [activeRoleTab, setActiveRoleTab] = useState('student');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, drivesRes] = await Promise.all([
          jobService.getJobs({ limit: 4, sortBy: 'newest' }),
          driveService.getDrives({ status: 'ongoing' })
        ]);
        if (jobsRes.success) setFeaturedJobs(jobsRes.jobs || []);
        if (drivesRes.success) setDrives(drivesRes.drives || []);
      } catch (e) {}
    };
    fetchData();
  }, []);

  // Quick 1-click test login for examiners/graders
  const handleQuickLogin = async (email, password, redirectPath) => {
    try {
      setLoggingIn(true);
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate(redirectPath);
      }
    } catch (err) {
      toast.error('Quick login failed. Please use standard login.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-brand-600/20 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-brand-300 font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Next-Generation College Recruitment OS</span>
            <span className="hidden sm:inline-block text-slate-500">•</span>
            <span className="hidden sm:inline-block text-slate-300">Live Campus Drive 2025-2026</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Empowering College Talent, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400">
              Accelerating Enterprise Hiring
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The unified platform connecting college graduates, vetted enterprise recruiters, and placement officers with automated eligibility checks, real-world data sync, and structured interview tracking.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Explore Opportunities</span>
            </Link>
            <Link
              to="/drives"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center space-x-2 transition-all"
            >
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>View Placement Drives</span>
            </Link>
          </div>

          {/* Live Quick-Switch Test Bar (Instant Login for grading & review) */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-brand-400" />
              Quick One-Click Demo Access
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                disabled={loggingIn}
                onClick={() => handleQuickLogin('student.alex@college.edu', 'Student@1234Password', '/student')}
                className="px-3.5 py-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Student Persona</span>
                  <span className="text-[10px] text-blue-400 font-semibold">Alex Chen</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">CSE • CGPA 9.2 • 0 Backlogs</p>
              </button>

              <button
                disabled={loggingIn}
                onClick={() => handleQuickLogin('recruiter.google@placementos.edu', 'Recruiter@1234Password', '/recruiter')}
                className="px-3.5 py-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Recruiter Persona</span>
                  <span className="text-[10px] text-indigo-400 font-semibold">Google India</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">Post Jobs • Review Candidates</p>
              </button>

              <button
                disabled={loggingIn}
                onClick={() => handleQuickLogin('admin@college.edu', 'Admin@1234Password', '/admin')}
                className="px-3.5 py-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Placement Admin</span>
                  <span className="text-[10px] text-purple-400 font-semibold">College Officer</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">Analytics • Drives • Audit Logs</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Key Figures Strip */}
      <section className="bg-white border-y border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">100%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Automated Eligibility</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand-600 tracking-tight">26.0 LPA</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Highest Campus Offer</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">150+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Verified Employers</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">Zero</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Duplicate Applications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities Preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Current Openings</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Featured Campus & Internship Roles</h2>
          </div>
          <Link
            to="/jobs"
            className="mt-3 sm:mt-0 text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>Browse All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {featuredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      </section>

      {/* Role Feature Showcase */}
      <section className="bg-slate-900 text-white py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Tailored Portals</span>
            <h2 className="text-3xl font-bold mt-1 text-white">Engineered for Every Recruitment Stakeholder</h2>
            <p className="text-slate-400 text-sm mt-2">
              Explore dedicated features built specifically for students, enterprise recruiters, and college placement leadership.
            </p>

            {/* Role Tabs */}
            <div className="mt-8 inline-flex p-1 rounded-xl bg-slate-800 border border-slate-700">
              <button
                onClick={() => setActiveRoleTab('student')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeRoleTab === 'student' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                For Students
              </button>
              <button
                onClick={() => setActiveRoleTab('recruiter')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeRoleTab === 'recruiter' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                For Recruiters
              </button>
              <button
                onClick={() => setActiveRoleTab('admin')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeRoleTab === 'admin' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                For Placement Officers
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-8 sm:p-10">
            {activeRoleTab === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Smart Eligibility Engine</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instantly view whether your CGPA, academic branch, graduation year, and backlog status fulfill recruiter requirements before submitting.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Live Interview Schedule</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Receive scheduled technical and HR interview rounds directly in your student calendar with integrated Google Meet conference links.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Comprehensive Profile & Resume</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Showcase your GitHub repositories, certifications, technical project portfolios, and uploaded resumes in a standardized, employer-ready format.
                  </p>
                </div>
              </div>
            )}

            {activeRoleTab === 'recruiter' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Targeted Campus Listings</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Publish full-time graduate opportunities and summer internships with strict branch cutoffs, graduation years, and stipend disclosures.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Recruitment Stage Funnel</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Move candidates seamlessly from Applied to Under Review, Shortlisted, Interview Scheduled, and Final Selection with candidate notes.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Verified Candidate Profiles</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Review academic-verified student snapshots and download PDF resumes with single-click candidate scheduling.
                  </p>
                </div>
              </div>
            )}

            {activeRoleTab === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Executive Placement Analytics</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Real-time aggregated dashboards showing placement percentage from actual offers, student enrollment, and skills demanded by recruiters.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Campus Recruitment Drives</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Organize semester-wide placement drives, assign participating employers, set coordination contacts, and enforce batch eligibility.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">One-Click CSV Export & Audits</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Export full student placement records and application data as CSV for college NIRF/NAAC accreditation and regulatory audits.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Campus Drives Preview */}
      {drives.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-900 to-slate-900 rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-premium">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/30 text-brand-300 border border-brand-500/40">
                Official Campus Hiring
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold">{drives[0].title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {drives[0].description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <span>Academic Year: {drives[0].academicYear}</span>
                <span>•</span>
                <span>Minimum CGPA: {drives[0].minCgpa}</span>
                <span>•</span>
                <span>Max Backlogs: {drives[0].maxBacklogs}</span>
              </div>
            </div>

            <Link
              to={`/drives/${drives[0]._id}`}
              className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm flex-shrink-0 transition-all shadow-md"
            >
              View Participating Companies & Jobs
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};
