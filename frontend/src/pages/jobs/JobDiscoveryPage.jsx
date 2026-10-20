import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { JobCard } from '../../components/jobs/JobCard';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Filter, SlidersHorizontal, X, Briefcase, MapPin,
  ChevronLeft, ChevronRight, Sparkles, Building
} from 'lucide-react';
import toast from 'react-hot-toast';

export const JobDiscoveryPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || '');
  const [branch, setBranch] = useState(searchParams.get('branch') || '');
  const [graduationYear, setGraduationYear] = useState(searchParams.get('graduationYear') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Fetch saved wishlist to highlight bookmark icon
  useEffect(() => {
    if (user?.role === 'student') {
      jobService.getSavedJobs().then(res => {
        if (res.success && res.savedJobs) {
          const ids = new Set(res.savedJobs.map(s => s.job?._id).filter(Boolean));
          setSavedJobIds(ids);
        }
      }).catch(() => {});
    }
  }, [user]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8,
        sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(jobType && { jobType }),
        ...(workMode && { workMode }),
        ...(branch && { branch }),
        ...(graduationYear && { graduationYear }),
        status: 'open'
      };

      const res = await jobService.getJobs(params);
      if (res.success) {
        setJobs(res.jobs || []);
        setTotal(res.total || 0);
        setPages(res.pages || 1);
      }
    } catch (err) {
      toast.error('Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, searchTerm, jobType, workMode, branch, graduationYear]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setJobType('');
    setWorkMode('');
    setBranch('');
    setGraduationYear('');
    setSortBy('newest');
    setPage(1);
  };

  const handleSaveToggle = async (jobId) => {
    if (!user) {
      toast.error('Please sign in to save opportunities to your wishlist.');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Wishlist is only available for student candidates.');
      return;
    }

    try {
      if (savedJobIds.has(jobId)) {
        await jobService.unsaveJob(jobId);
        setSavedJobIds(prev => {
          const updated = new Set(prev);
          updated.delete(jobId);
          return updated;
        });
        toast.success('Removed from saved list.');
      } else {
        await jobService.saveJob(jobId);
        setSavedJobIds(prev => new Set(prev).add(jobId));
        toast.success('Saved to wishlist!');
      }
    } catch (err) {
      toast.error('Failed to update wishlist.');
    }
  };

  const hasActiveFilters = Boolean(searchTerm || jobType || workMode || branch || graduationYear);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Discover Opportunities</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified campus placements, summer internships, and authorized partner openings.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, skills, company..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            Find
          </button>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar (Desktop) */}
        <div className="hidden lg:block bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-5 h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>Filter Results</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-800"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Job Type Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Opportunity Type
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'All Positions', value: '' },
                { label: 'Full-time Roles', value: 'full-time' },
                { label: 'Summer Internships', value: 'internship' },
                { label: 'Contract / Project', value: 'contract' }
              ].map(opt => (
                <label key={opt.value} className="flex items-center text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="jobType"
                    checked={jobType === opt.value}
                    onChange={() => { setJobType(opt.value); setPage(1); }}
                    className="mr-2 text-brand-600 focus:ring-brand-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Work Mode Filter */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Work Location Mode
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'Any Work Mode', value: '' },
                { label: 'Onsite Campus / Office', value: 'onsite' },
                { label: 'Hybrid Work', value: 'hybrid' },
                { label: 'Remote / Virtual', value: 'remote' }
              ].map(opt => (
                <label key={opt.value} className="flex items-center text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="workMode"
                    checked={workMode === opt.value}
                    onChange={() => { setWorkMode(opt.value); setPage(1); }}
                    className="mr-2 text-brand-600 focus:ring-brand-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Branch Eligibility */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Eligible Branch
            </label>
            <select
              value={branch}
              onChange={(e) => { setBranch(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Engineering Branches</option>
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics & Communication</option>
              <option value="Electrical">Electrical Engineering</option>
            </select>
          </div>

          {/* Graduation Year */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Graduation Year
            </label>
            <select
              value={graduationYear}
              onChange={(e) => { setGraduationYear(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Any Graduation Batch</option>
              <option value="2025">Class of 2025</option>
              <option value="2026">Class of 2026</option>
              <option value="2027">Class of 2027</option>
            </select>
          </div>
        </div>

        {/* Listings Section (3/4) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Sort & Count Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-white px-4 py-3 rounded-xl border border-slate-200/90 shadow-subtle">
            <span className="font-semibold">
              Showing <strong className="text-slate-900">{jobs.length}</strong> of {total} available positions
            </span>
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline-block font-medium text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="newest">Recently Published</option>
                <option value="deadline">Closing Soonest</option>
                <option value="salary">Highest Compensation</option>
                <option value="views">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-64 bg-slate-200/80 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No opportunities match your search parameters.</h3>
              <p className="text-xs text-slate-400 mt-1">Try clearing some filters or searching with different keywords.</p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => (
                <JobCard
                  key={job._id}
                  job={job}
                  onSaveToggle={handleSaveToggle}
                  isSaved={savedJobIds.has(job._id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-3">
                Page {page} of {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
