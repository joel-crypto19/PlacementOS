import React from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Calendar, Clock, DollarSign, Bookmark, ArrowRight, Sparkles } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const JobCard = ({ job, onSaveToggle, isSaved = false }) => {
  const formatSalary = (sal) => {
    if (!sal || !sal.isDisclosed || (!sal.min && !sal.max)) {
      return 'Disclosed on application';
    }
    const symbol = sal.currency === 'INR' ? '₹' : '$';
    const period = sal.period === 'monthly' ? '/mo' : sal.period === 'hourly' ? '/hr' : '/yr';

    if (sal.currency === 'INR') {
      const minLakhs = sal.min ? (sal.period === 'yearly' ? `${(sal.min / 100000).toFixed(1)} LPA` : `₹${sal.min.toLocaleString()}`) : '';
      const maxLakhs = sal.max ? (sal.period === 'yearly' ? `${(sal.max / 100000).toFixed(1)} LPA` : `₹${sal.max.toLocaleString()}`) : '';
      if (minLakhs && maxLakhs) return `${minLakhs} - ${maxLakhs} ${period}`;
      return `${maxLakhs || minLakhs} ${period}`;
    }

    return `${symbol}${sal.min?.toLocaleString()} - ${symbol}${sal.max?.toLocaleString()} ${period}`;
  };

  const isExpired = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);
  const daysLeft = job.applicationDeadline
    ? Math.max(0, Math.ceil((new Date(job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle hover:shadow-premium hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg flex-shrink-0 group-hover:border-brand-300 transition-colors">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain p-1 rounded-xl" />
              ) : (
                job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C'
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                {job.title}
              </h3>
              <p className="text-xs font-semibold text-slate-600 flex items-center mt-0.5">
                <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.companyName}
              </p>
            </div>
          </div>

          {onSaveToggle && (
            <button
              onClick={() => onSaveToggle(job._id)}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-slate-50 border-slate-200'
              }`}
              title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Badges / Key Attributes */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="capitalize px-2.5 py-0.5 rounded-md font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
            {job.jobType}
          </span>
          <span className="capitalize px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700">
            {job.workMode}
          </span>
          {job.sourceProvider === 'adzuna' && (
            <span className="px-2 py-0.5 rounded-md font-semibold bg-teal-50 text-teal-700 border border-teal-200 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> Verified Feed
            </span>
          )}
          {job.isDemo && (
            <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-500 border border-slate-200">
              Sample Listing
            </span>
          )}
          {isExpired ? (
            <span className="px-2 py-0.5 rounded-md font-semibold bg-rose-50 text-rose-700">
              Expired
            </span>
          ) : daysLeft !== null && daysLeft <= 5 ? (
            <span className="px-2 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              {daysLeft} days left
            </span>
          ) : null}
        </div>

        {/* Details Grid */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center font-medium text-slate-800">
            <span className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0 font-bold text-center">₹</span>
            <span>{formatSalary(job.salaryOrStipend)}</span>
          </div>
        </div>

        {/* Skills Chips */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1">
            {job.skillsRequired.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/60"
              >
                {skill}
              </span>
            ))}
            {job.skillsRequired.length > 4 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{job.skillsRequired.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Deadline: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'Rolling'}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
};
