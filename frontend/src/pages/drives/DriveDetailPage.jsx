import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { driveService } from '../../services/driveService';
import { JobCard } from '../../components/jobs/JobCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Calendar, Building, ArrowLeft, ShieldCheck, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export const DriveDetailPage = () => {
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrive = async () => {
      try {
        setLoading(true);
        const res = await driveService.getDriveById(id);
        if (res.success) {
          setDrive(res.drive);
          setJobs(res.jobs || []);
        }
      } catch (err) {
        toast.error('Could not load drive details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDrive();
  }, [id]);

  if (loading || !drive) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading drive details...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      <Link
        to="/drives"
        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all drives</span>
      </Link>

      {/* Drive Overview Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
              {drive.academicYear} • {drive.semester}
            </span>
            <StatusBadge status={drive.status} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {drive.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            {drive.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Duration: {new Date(drive.startDate).toLocaleDateString()} to {new Date(drive.endDate).toLocaleDateString()}
            </span>
            <span>•</span>
            <span>Coordinator: <strong>{drive.coordinatorName}</strong> ({drive.coordinatorEmail})</span>
          </div>
        </div>

        {/* Cutoff Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 sm:w-72 flex-shrink-0">
          <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Drive Academic Cutoffs:</p>
          <p>Minimum CGPA: <strong>{drive.minCgpa}</strong></p>
          <p>Maximum Backlogs: <strong>{drive.maxBacklogs}</strong></p>
          <p className="text-slate-500 text-[11px] pt-1">
            Branches: {drive.eligibleBranches?.join(', ')}
          </p>
        </div>
      </div>

      {/* Open Positions Under this Drive */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-brand-600" />
            <span>Open Opportunities in this Drive ({jobs.length})</span>
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            No vacancies currently listed under this drive. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
