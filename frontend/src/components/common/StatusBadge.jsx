import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    applied: 'bg-slate-100 text-slate-700 border-slate-200',
    under_review: 'bg-blue-50 text-blue-700 border-blue-200',
    shortlisted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    assessment: 'bg-purple-50 text-purple-700 border-purple-200',
    interview_scheduled: 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse',
    selected: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    withdrawn: 'bg-slate-100 text-slate-500 border-slate-200',
    // Account statuses
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    suspended: 'bg-rose-50 text-rose-700 border-rose-200',
    open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
    ongoing: 'bg-blue-50 text-blue-700 border-blue-200',
    upcoming: 'bg-amber-50 text-amber-800 border-amber-200',
    completed: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const labels = {
    applied: 'Applied',
    under_review: 'Under Review',
    shortlisted: 'Shortlisted',
    assessment: 'Assessment Round',
    interview_scheduled: 'Interview Scheduled',
    selected: 'Selected / Offer',
    rejected: 'Not Selected',
    withdrawn: 'Withdrawn',
    active: 'Active',
    pending: 'Pending Verification',
    verified: 'Verified Employer',
    suspended: 'Suspended',
    open: 'Actively Hiring',
    closed: 'Application Closed',
    ongoing: 'Ongoing Drive',
    upcoming: 'Upcoming Drive',
    completed: 'Completed'
  };

  const statusKey = status ? String(status).toLowerCase() : 'applied';
  const colorClass = styles[statusKey] || 'bg-slate-100 text-slate-700 border-slate-200';
  const labelText = labels[statusKey] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      {labelText}
    </span>
  );
};
