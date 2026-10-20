import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { JobCard } from '../../components/jobs/JobCard';
import { Bookmark, Search, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const SavedJobs = () => {
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await jobService.getSavedJobs();
      if (res.success) {
        setSavedList(res.savedJobs || []);
      }
    } catch (err) {
      toast.error('Could not load saved opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleToggleSave = async (jobId) => {
    try {
      await jobService.unsaveJob(jobId);
      toast.success('Removed from saved list.');
      setSavedList(prev => prev.filter(item => item.job?._id !== jobId));
    } catch (err) {
      toast.error('Failed to remove job.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading your saved wishlist...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Saved Opportunities Wishlist</h1>
          <p className="text-xs text-slate-500 mt-1">
            Bookmarked positions to review, prepare for, and apply to before registration deadlines close.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          {savedList.length} Saved Roles
        </span>
      </div>

      {savedList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Your wishlist is currently empty.</h3>
          <p className="text-xs text-slate-400 mt-1">Bookmark promising opportunities to track deadlines and apply later.</p>
          <Link
            to="/jobs"
            className="inline-flex items-center space-x-1.5 mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-brand-500"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Discover Opportunities</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedList.map(item => (
            item.job && (
              <JobCard
                key={item._id}
                job={item.job}
                onSaveToggle={handleToggleSave}
                isSaved={true}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};
