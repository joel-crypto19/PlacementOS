import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileText, CheckCircle2, Clock, Video, Bookmark,
  Calendar, ArrowRight, UserCheck, Sparkles, Building, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await studentService.getDashboard();
        if (res.success) {
          setDashboardData(res.dashboard);
        }
      } catch (err) {
        toast.error('Could not load student dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const { metrics = {}, profileCompleteness = 0, recentApplications = [], upcomingInterviews = [], upcomingDeadlines = [] } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Welcome & Profile Completeness Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-premium relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-brand-500/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3 border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Recruitment Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              National Institute of Technology • Computer Science & Engineering • Class of 2026
            </p>
          </div>

          {/* Completeness Card */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 sm:w-72 flex-shrink-0">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300">Profile Completeness</span>
              <span className="font-bold text-brand-400">{profileCompleteness}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                {profileCompleteness >= 75 ? 'Ready to apply' : 'Incomplete profile'}
              </span>
              <Link to="/student/profile" className="text-brand-400 hover:text-brand-300 font-bold">
                Edit Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Applications"
          value={metrics.totalApplications || 0}
          subtitle="All submitted roles"
          icon={FileText}
          color="brand"
        />
        <StatCard
          title="Under Review"
          value={metrics.underReviewCount || 0}
          subtitle="Awaiting recruiter decision"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={metrics.shortlistedCount || 0}
          subtitle="Passed preliminary screening"
          icon={CheckCircle2}
          color="purple"
        />
        <StatCard
          title="Interview Invites"
          value={metrics.interviewCount || 0}
          subtitle="Live technical/HR rounds"
          icon={Video}
          color="amber"
        />
        <StatCard
          title="Saved Opportunities"
          value={metrics.savedCount || 0}
          subtitle="Wishlisted jobs"
          icon={Bookmark}
          color="emerald"
        />
      </div>

      {/* Upcoming Scheduled Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-subtle">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white font-bold">
              <Video className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-amber-900">Upcoming Live Interview Invitation</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingInterviews.map((interview) => (
              <div key={interview._id} className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{interview.roundName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {interview.durationMinutes} mins
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {interview.job?.title} at {interview.job?.companyName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Mode: {interview.mode}</span>
                  {interview.meetingLinkOrLocation?.startsWith('http') ? (
                    <a
                      href={interview.meetingLinkOrLocation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center space-x-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Launch Video Call</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-700 font-semibold">{interview.meetingLinkOrLocation}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid: Recent Applications & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Applications</h3>
            <Link to="/student/applications" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              View All ({metrics.totalApplications || 0}) →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No applications submitted yet.</p>
              <p className="text-xs text-slate-400 mt-1">Discover campus opportunities and submit your profile.</p>
              <Link
                to="/jobs"
                className="inline-block mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-brand-500"
              >
                Browse Job Board
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplications.map((app) => (
                <div key={app._id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                      {app.job?.title || 'Position'}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {app.job?.companyName || 'Company'} • {app.job?.location}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1/3): Upcoming Deadlines */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Upcoming Deadlines</h3>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No imminent deadlines closing this week.</p>
            ) : (
              upcomingDeadlines.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="block p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-900 truncate">{job.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{job.companyName}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold capitalize">
                      {job.jobType}
                    </span>
                    <span className="font-bold text-amber-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
