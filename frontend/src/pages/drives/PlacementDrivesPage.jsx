import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { driveService } from '../../services/driveService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Calendar, Building, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const PlacementDrivesPage = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        setLoading(true);
        const res = await driveService.getDrives();
        if (res.success) {
          setDrives(res.drives || []);
        }
      } catch (err) {
        toast.error('Could not load placement drives.');
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Campus Placement Drives</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official recruitment sessions organized by the college training and placement cell.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading placement drives...</div>
      ) : drives.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No campus drives published currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drives.map(drive => (
            <div
              key={drive._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                    {drive.academicYear} • {drive.semester}
                  </span>
                  <StatusBadge status={drive.status} />
                </div>

                <h2 className="text-lg font-bold text-slate-900 mt-2">{drive.title}</h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                  {drive.description}
                </p>

                <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                  <p>Minimum CGPA Cutoff: <strong>{drive.minCgpa}</strong></p>
                  <p>Maximum Active Backlogs: <strong>{drive.maxBacklogs}</strong></p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Eligible: {drive.eligibleBranches?.join(', ')}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(drive.startDate).toLocaleDateString()} - {new Date(drive.endDate).toLocaleDateString()}
                </span>
                <Link
                  to={`/drives/${drive._id}`}
                  className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <span>View Drive Vacancies</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
