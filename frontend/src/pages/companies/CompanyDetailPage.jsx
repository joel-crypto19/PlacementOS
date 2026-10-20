import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { JobCard } from '../../components/jobs/JobCard';
import { Building, MapPin, ExternalLink, ArrowLeft, ShieldCheck, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyDetailPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/companies/${id}`);
        if (res.data.success) {
          setCompany(res.data.company);
          setActiveJobs(res.data.activeJobs || []);
        }
      } catch (err) {
        toast.error('Could not load company details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading || !company) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading company profile...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      <Link
        to="/companies"
        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all employers</span>
      </Link>

      {/* Company Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-2xl flex-shrink-0">
            {company.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{company.name}</h1>
              {company.verificationStatus === 'verified' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-0.5" /> Verified
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {company.location} • {company.industry} • {company.size} employees
            </p>

            <p className="text-xs sm:text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed">
              {company.description}
            </p>
          </div>
        </div>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 self-start flex-shrink-0"
          >
            <span>Visit Company Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Active Jobs Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-brand-600" />
          <span>Active Opportunities at {company.name} ({activeJobs.length})</span>
        </h2>

        {activeJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            No active campus listings currently published by this employer.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeJobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
