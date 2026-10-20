import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Building, Send, DollarSign, Calendar, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    jobType: 'full-time',
    workMode: 'onsite',
    location: 'Bangalore, India',
    salaryMin: '1200000',
    salaryMax: '1800000',
    currency: 'INR',
    period: 'yearly',
    isDisclosed: true,
    minCgpa: '7.0',
    maxBacklogs: '0',
    allowedBranches: ['Computer Science & Engineering', 'Information Technology'],
    allowedGraduationYears: [2026],
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    responsibilitiesText: 'Design, develop, and test high-throughput software modules.\nCollaborate with product and design teams on architecture reviews.\nMaintain automated unit and integration tests.',
    requirementsText: 'Strong foundation in Data Structures, Algorithms, and Object-Oriented Design.\nProficiency in modern JavaScript/TypeScript, React, Python, or Go.\nExcellent problem solving and collaborative skills.',
    skillsText: 'React, Node.js, TypeScript, SQL, Docker, Problem Solving',
    applicationMethod: 'internal',
    externalUrl: ''
  });

  const [loading, setLoading] = useState(false);

  const branchesList = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering'
  ];

  const yearsList = [2025, 2026, 2027];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBranchToggle = (branch) => {
    setFormData(prev => {
      const exists = prev.allowedBranches.includes(branch);
      return {
        ...prev,
        allowedBranches: exists
          ? prev.allowedBranches.filter(b => b !== branch)
          : [...prev.allowedBranches, branch]
      };
    });
  };

  const handleYearToggle = (year) => {
    setFormData(prev => {
      const exists = prev.allowedGraduationYears.includes(year);
      return {
        ...prev,
        allowedGraduationYears: exists
          ? prev.allowedGraduationYears.filter(y => y !== year)
          : [...prev.allowedGraduationYears, year]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.applicationDeadline) {
      toast.error('Please fill in title, description, location, and application deadline.');
      return;
    }

    try {
      setLoading(true);

      const responsibilities = formData.responsibilitiesText
        ? formData.responsibilitiesText.split('\n').map(s => s.trim()).filter(Boolean)
        : [];
      const requirements = formData.requirementsText
        ? formData.requirementsText.split('\n').map(s => s.trim()).filter(Boolean)
        : [];
      const skillsRequired = formData.skillsText
        ? formData.skillsText.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        companyName: user.company?.name || user.requestedCompanyName || 'Company',
        description: formData.description,
        responsibilities,
        requirements,
        skillsRequired,
        jobType: formData.jobType,
        workMode: formData.workMode,
        location: formData.location,
        salaryOrStipend: {
          min: Number(formData.salaryMin) || 0,
          max: Number(formData.salaryMax) || 0,
          currency: formData.currency,
          period: formData.period,
          isDisclosed: formData.isDisclosed
        },
        eligibility: {
          minCgpa: Number(formData.minCgpa) || 0,
          allowedBranches: formData.allowedBranches,
          allowedGraduationYears: formData.allowedGraduationYears,
          maxBacklogs: Number(formData.maxBacklogs) || 0
        },
        applicationDeadline: new Date(formData.applicationDeadline),
        applicationMethod: formData.applicationMethod,
        externalUrl: formData.externalUrl
      };

      const res = await jobService.createJob(payload);
      if (res.success) {
        toast.success('Opportunity published successfully!');
        navigate(user.role === 'admin' ? '/admin' : '/recruiter/jobs');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Publish Recruitment Opportunity</h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify technical requirements, stipend/salary, cutoff CGPA, and branch eligibility for candidate filtering.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Attributes Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            Position Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Opportunity Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Associate Software Engineer / Frontend Intern"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Job Type
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="full-time">Full-time Graduate Role</option>
                <option value="internship">Summer / Winter Internship</option>
                <option value="contract">Contract / Apprenticeship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Mode
              </label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="onsite">Onsite (College Campus / Office)</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Fully Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore, Hyderabad, Pune, India"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Compensation Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center space-x-1.5">
            <DollarSign className="w-4 h-4 text-brand-600" />
            <span>Compensation & Stipend Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pay Period
              </label>
              <select
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="yearly">Per Annum (LPA)</option>
                <option value="monthly">Per Month (Stipend)</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Minimum Amount (INR)
              </label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Maximum Amount (INR)
              </label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isDisclosed"
                  checked={formData.isDisclosed}
                  onChange={handleChange}
                  className="mr-2 text-brand-600 rounded"
                />
                <span>Publicly Disclosed</span>
              </label>
            </div>
          </div>
        </div>

        {/* Eligibility Rules Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Campus Eligibility Cutoffs</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Minimum Cutoff CGPA (0.0 - 10.0)
              </label>
              <input
                type="number"
                step="0.1"
                name="minCgpa"
                value={formData.minCgpa}
                onChange={handleChange}
                min="0"
                max="10"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Maximum Active Backlogs Permitted
              </label>
              <input
                type="number"
                name="maxBacklogs"
                value={formData.maxBacklogs}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Allowed Engineering Disciplines
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {branchesList.map(branch => (
                <label key={branch} className="flex items-center text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowedBranches.includes(branch)}
                    onChange={() => handleBranchToggle(branch)}
                    className="mr-2 text-brand-600 rounded"
                  />
                  <span>{branch}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Graduation Batches
            </label>
            <div className="flex items-center space-x-6">
              {yearsList.map(yr => (
                <label key={yr} className="flex items-center text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowedGraduationYears.includes(yr)}
                    onChange={() => handleYearToggle(yr)}
                    className="mr-2 text-brand-600 rounded"
                  />
                  <span>Class of {yr}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Content & Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            Job Details & Requirements
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Description *
            </label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the mission, team, and day-to-day impact of this role..."
              required
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Key Responsibilities (One item per line)
            </label>
            <textarea
              rows={3}
              name="responsibilitiesText"
              value={formData.responsibilitiesText}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Qualifications & Requirements (One item per line)
            </label>
            <textarea
              rows={3}
              name="requirementsText"
              value={formData.requirementsText}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skills Required (comma-separated)
            </label>
            <input
              type="text"
              name="skillsText"
              value={formData.skillsText}
              onChange={handleChange}
              placeholder="React, Node.js, Python, AWS..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 flex items-center space-x-2 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Publishing...' : 'Publish Listing'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
