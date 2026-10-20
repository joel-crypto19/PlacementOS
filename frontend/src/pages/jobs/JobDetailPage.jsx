import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building, MapPin, Calendar, Clock, DollarSign, ShieldCheck,
  CheckCircle2, AlertCircle, ArrowLeft, Send, ExternalLink, Sparkles, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Application Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await jobService.getJobById(id);
        if (res.success) {
          setJob(res.job);
          setEligibility(res.eligibility);
        }

        // Check if student already applied
        if (user?.role === 'student') {
          const appsRes = await applicationService.getMyApplications();
          if (appsRes.success) {
            const hasApplied = appsRes.applications?.some(a => a.job?._id === id);
            setAlreadyApplied(hasApplied);
          }
        }
      } catch (err) {
        toast.error('Could not load opportunity details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, user]);

  const handleApply = async () => {
    try {
      setApplying(true);
      const res = await applicationService.apply(job._id, {}, notes);
      if (res.success) {
        toast.success('Application submitted successfully!');
        setAlreadyApplied(true);
        setShowApplyModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (sal) => {
    if (!sal || !sal.isDisclosed || (!sal.min && !sal.max)) {
      return 'Disclosed on application';
    }
    const symbol = sal.currency === 'INR' ? '₹' : '$';
    const period = sal.period === 'monthly' ? '/month' : sal.period === 'hourly' ? '/hr' : '/year';

    if (sal.currency === 'INR') {
      const minLakhs = sal.min ? (sal.period === 'yearly' ? `${(sal.min / 100000).toFixed(1)} LPA` : `₹${sal.min.toLocaleString()}`) : '';
      const maxLakhs = sal.max ? (sal.period === 'yearly' ? `${(sal.max / 100000).toFixed(1)} LPA` : `₹${sal.max.toLocaleString()}`) : '';
      if (minLakhs && maxLakhs) return `${minLakhs} - ${maxLakhs} ${period}`;
      return `${maxLakhs || minLakhs} ${period}`;
    }

    return `${symbol}${sal.min?.toLocaleString()} - ${symbol}${sal.max?.toLocaleString()} ${period}`;
  };

  if (loading || !job) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading opportunity details...</div>;
  }

  const isExpired = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);
  const daysLeft = job.applicationDeadline
    ? Math.max(0, Math.ceil((new Date(job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all opportunities</span>
      </Link>

      {/* Hero Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-2xl flex-shrink-0 shadow-sm">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain p-2 rounded-2xl" />
            ) : (
              job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C'
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                {job.jobType}
              </span>
              <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {job.workMode}
              </span>
              {job.sourceProvider === 'adzuna' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> Verified API Listing
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {job.title}
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center">
              <Building className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>{job.companyName}</span>
              {job.company?.verificationStatus === 'verified' && (
                <span className="ml-2 text-xs text-emerald-600 font-bold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-0.5" /> Verified Partner
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.location}
              </span>
              <span>•</span>
              <span className="flex items-center font-bold text-slate-800">
                <span className="mr-1">₹</span>
                {formatSalary(job.salaryOrStipend)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="flex flex-col sm:items-end justify-between flex-shrink-0 space-y-3">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Application Deadline
            </span>
            <span className={`text-xs sm:text-sm font-bold flex items-center justify-end ${
              isExpired ? 'text-rose-600' : 'text-slate-900'
            }`}>
              <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
              {new Date(job.applicationDeadline).toLocaleDateString()}
              {daysLeft !== null && !isExpired && (
                <span className="ml-1.5 text-xs text-amber-600">({daysLeft} days left)</span>
              )}
            </span>
          </div>

          {/* Primary Action Button */}
          {alreadyApplied ? (
            <button
              disabled
              className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs sm:text-sm flex items-center space-x-1.5 cursor-default"
            >
              <Check className="w-4 h-4" />
              <span>Application Submitted</span>
            </button>
          ) : isExpired ? (
            <button
              disabled
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm cursor-not-allowed"
            >
              Applications Closed
            </button>
          ) : job.applicationMethod === 'external' ? (
            <a
              href={job.externalUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 flex items-center space-x-2 transition-all"
            >
              <span>Apply on Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : !isAuthenticated ? (
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 flex items-center space-x-2 transition-all"
            >
              <span>Sign in to Apply</span>
            </Link>
          ) : user.role === 'student' ? (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 flex items-center space-x-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Submit Application</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Viewing as {user.role}</span>
          )}
        </div>
      </div>

      {/* Automated Eligibility Checker Widget (Only shown when student evaluates listing) */}
      {isAuthenticated && user?.role === 'student' && eligibility && (
        <div className={`p-5 rounded-2xl border ${
          eligibility.isEligible
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center space-x-2.5">
            {eligibility.isEligible ? (
              <div className="p-1 rounded-full bg-emerald-600 text-white">
                <Check className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1 rounded-full bg-amber-600 text-white">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-xs sm:text-sm font-bold">
                {eligibility.isEligible
                  ? 'Automated Eligibility Check: You are Eligible to Apply!'
                  : 'Automated Eligibility Criteria Notice'}
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Evaluated in real-time against your verified academic record (CGPA, Branch, Year, Backlogs).
              </p>
            </div>
          </div>

          {!eligibility.isEligible && eligibility.reasons?.length > 0 && (
            <div className="mt-3 pl-8 space-y-1">
              {eligibility.reasons.map((r, i) => (
                <p key={i} className="text-xs font-semibold text-amber-800 flex items-center">
                  • {r}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Description, Responsibilities, Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Role Overview & Description
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Key Responsibilities
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-2 mr-2.5 flex-shrink-0" />
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Qualifications & Expectations
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-2.5 flex-shrink-0" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Criteria & Metadata */}
        <div className="space-y-6">
          {/* Eligibility Criteria Specification */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-3 text-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Campus Eligibility Rules
            </h3>
            <div className="space-y-2.5 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">Minimum Cutoff CGPA:</span>
                <span className="font-bold text-slate-900">
                  {job.eligibility?.minCgpa > 0 ? `${job.eligibility.minCgpa} / 10.0` : 'No CGPA cutoff'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Eligible Engineering Branches:</span>
                <span className="font-semibold text-slate-800">
                  {job.eligibility?.allowedBranches?.length > 0
                    ? job.eligibility.allowedBranches.join(', ')
                    : 'Open to All Branches'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Eligible Graduation Batches:</span>
                <span className="font-semibold text-slate-800">
                  {job.eligibility?.allowedGraduationYears?.length > 0
                    ? job.eligibility.allowedGraduationYears.join(', ')
                    : 'All graduating years'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Maximum Allowed Backlogs:</span>
                <span className="font-bold text-slate-900">
                  {job.eligibility?.maxBacklogs ?? 0} active backlogs
                </span>
              </div>
            </div>
          </div>

          {/* Skills Required */}
          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skillsRequired.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Company Mini Card */}
          {job.company && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-3 text-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Employer Profile
              </h3>
              <p className="font-bold text-sm text-slate-900">{job.company.name}</p>
              <p className="text-slate-600 leading-relaxed line-clamp-3">{job.company.description}</p>
              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 font-bold flex items-center space-x-1 pt-1"
                >
                  <span>Company Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Application Confirmation Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Confirm Application Submission"
        subtitle={`Position: ${job.title} at ${job.companyName}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Profile Snapshot to be Submitted:
            </p>
            <p className="text-slate-700">Candidate: <strong>{user?.name}</strong> ({user?.email})</p>
            <p className="text-slate-700">Institution: <strong>National Institute of Technology</strong></p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              An immutable snapshot of your academic records, CGPA, and resume will be securely delivered to the recruiter.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Cover Note for Recruiter (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why are you a great match for this engineering team? Mention relevant projects..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              onClick={() => setShowApplyModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md flex items-center space-x-1.5 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{applying ? 'Submitting...' : 'Confirm & Apply'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
