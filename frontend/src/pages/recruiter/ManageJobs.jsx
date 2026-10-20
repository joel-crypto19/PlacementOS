import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Briefcase, Users, PlusCircle, Trash2, Edit3, ArrowRight,
  ExternalLink, Clock, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobService.getMyJobs();
      if (res.success) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      toast.error('Could not load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId, title) => {
    if (!window.confirm(`Are you certain you wish to delete the listing "${title}"?`)) return;
    try {
      await jobService.deleteJob(jobId);
      toast.success('Listing deleted.');
      setJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) {
      toast.error('Failed to delete job listing.');
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await jobService.updateJob(job._id, { status: newStatus });
      toast.success(`Job marked as ${newStatus}.`);
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
    } catch (err) {
      toast.error('Failed to update listing status.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading your vacancies...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Job Vacancies</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant pools, toggle application statuses, and manage campus opportunities.
          </p>
        </div>
        <Link
          to="/recruiter/post-job"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No job listings found.</h3>
          <p className="text-xs text-slate-400 mt-1">Publish a new campus job or internship to start receiving applications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div
              key={job._id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-xs text-slate-600 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {job.location} • <span className="capitalize ml-1">{job.jobType}</span> ({job.workMode})
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Deadline: <strong>{new Date(job.applicationDeadline).toLocaleDateString()}</strong></span>
                  <span>•</span>
                  <span>Cutoff CGPA: <strong>{job.eligibility?.minCgpa || 0}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2.5 self-end md:self-auto flex-shrink-0">
                <button
                  onClick={() => handleToggleStatus(job)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  {job.status === 'open' ? 'Close Applications' : 'Reopen Job'}
                </button>

                <Link
                  to={`/recruiter/jobs/${job._id}/applicants`}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center space-x-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Candidates ({job.applicationsCount || 0})</span>
                </Link>

                <button
                  onClick={() => handleDelete(job._id, job.title)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
