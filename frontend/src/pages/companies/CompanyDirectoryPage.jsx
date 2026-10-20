import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Building, MapPin, ExternalLink, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyDirectoryPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/companies?${search ? `search=${search}` : ''}`);
      if (res.data.success) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      toast.error('Could not load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Building className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Partner Employers</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified enterprise recruiters visiting our campus for placements and internships.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-72">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company name..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button type="submit" className="px-3.5 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No employers match your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {companies.map(c => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-lg">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900 mt-3">{c.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{c.industry} • {c.location}</p>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                  {c.description || 'Verified hiring partner.'}
                </p>

                <span className="inline-block mt-3 text-[11px] text-slate-400 font-medium">
                  Company Size: {c.size} employees
                </span>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {c.website ? (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span />}
                <Link
                  to={`/companies/${c._id}`}
                  className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <span>Open Vacancies</span>
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
