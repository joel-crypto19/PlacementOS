import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { adminService } from '../../services/adminService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Building, ShieldCheck, Check, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies?page=1&limit=50');
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

  const handleUpdateVerification = async (companyId, verificationStatus) => {
    try {
      const res = await adminService.updateCompanyVerification(companyId, verificationStatus);
      if (res.success) {
        toast.success(`Company verification set to ${verificationStatus}.`);
        fetchCompanies();
      }
    } catch (err) {
      toast.error('Failed to update company verification.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Partner Employer Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verify legitimate hiring partners and regulate publishing permissions across the institution.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          {companies.length} Registered Employers
        </span>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading company profiles...</div>
      ) : companies.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          No companies registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map(c => (
            <div key={c._id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-500">{c.industry} • {c.location}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.verificationStatus} />
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {c.description || 'No description provided.'}
                </p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Size: {c.size} employees</span>
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-700 font-bold flex items-center space-x-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Verification Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                {c.verificationStatus !== 'verified' ? (
                  <button
                    onClick={() => handleUpdateVerification(c._id, 'verified')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify Partner</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateVerification(c._id, 'pending')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                  >
                    Revoke Verification
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
