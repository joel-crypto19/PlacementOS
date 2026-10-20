import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Briefcase, Users, Clock, CheckCircle2, PlusCircle,
  Building, Calendar, Video, ArrowRight, ShieldCheck, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [jobsRes, intRes] = await Promise.all([
          jobService.getMyJobs(),
          applicationService.getMyInterviews()
        ]);
        if (jobsRes.success) setJobs(jobsRes.jobs || []);
        if (intRes.success) setInterviews(intRes.interviews || []);
      } catch (err) {
        toast.error('Could not load recruiter data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const totalListings = jobs.length;
  const activeListings = jobs.filter(j => j.status === 'open').length;
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicationsCount || 0), 0);

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading recruiter workspace...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Recruiter Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-300 mb-2">
            <Building className="w-4 h-4" />
            <span>{user?.company?.name || user?.requestedCompanyName || 'Enterprise Recruiter'}</span>
            <span className="text-slate-500">•</span>
            {user?.isVerified ? (
              <span className="text-emerald-400 font-bold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Employer
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" /> Pending Admin Verification
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Recruiter Talent Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Manage your campus vacancies, filter candidate batches by cutoffs, and schedule interview rounds.
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 flex items-center space-x-2 self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Opportunity</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Listings"
          value={activeListings}
          subtitle={`Out of ${totalListings} total posted`}
          icon={Briefcase}
          color="brand"
        />
        <StatCard
          title="Total Candidate Applications"
          value={totalApplicants}
          subtitle="Across all job listings"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Scheduled Interviews"
          value={interviews.length}
          subtitle="Active candidate rounds"
          icon={Video}
          color="amber"
        />
        <StatCard
          title="Employer Account Status"
          value={user?.status?.toUpperCase()}
          subtitle="Placement cell verified"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Upcoming Candidate Interviews */}
      {interviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Video className="w-4 h-4 text-brand-600" />
              <span>Upcoming Candidate Interviews</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.map(int => (
              <div key={int._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{int.roundName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {int.durationMinutes} mins
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-semibold">
                    Candidate: {int.student?.name} ({int.student?.email})
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Position: {int.job?.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {new Date(int.scheduledAt).toLocaleString()}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Mode: {int.mode}</span>
                  {int.meetingLinkOrLocation?.startsWith('http') && (
                    <a
                      href={int.meetingLinkOrLocation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center space-x-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Start Video Call</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posted Listings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Your Active Job Listings
          </h2>
          <Link to="/recruiter/jobs" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            Manage All Listings →
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-10">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No job listings published yet.</p>
            <p className="text-xs text-slate-400 mt-1">Publish an opportunity to begin receiving student applications.</p>
            <Link
              to="/recruiter/post-job"
              className="inline-block mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-brand-500"
            >
              Post First Opportunity
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map(job => (
              <div key={job._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Location: {job.location} • Type: <strong className="capitalize">{job.jobType}</strong> • Mode: <strong className="capitalize">{job.workMode}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {job.applicationsCount || 0} Applicants
                  </span>
                  <Link
                    to={`/recruiter/jobs/${job._id}/applicants`}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center space-x-1"
                  >
                    <span>Review Candidates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
