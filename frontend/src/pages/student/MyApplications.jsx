import React, { useEffect, useState } from 'react';
import { applicationService } from '../../services/applicationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  FileText, Building, Calendar, Clock, MapPin,
  ExternalLink, AlertTriangle, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Timeline Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getMyApplications();
      if (res.success) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      toast.error('Could not load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you certain you wish to withdraw this job application? This action cannot be reversed.')) {
      return;
    }

    try {
      const res = await applicationService.withdraw(applicationId);
      if (res.success) {
        toast.success('Application withdrawn successfully.');
        fetchApplications();
        setShowTimelineModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed.');
    }
  };

  const filteredApps = applications.filter(app => {
    if (selectedFilter === 'all') return true;
    return app.status === selectedFilter;
  });

  const filterTabs = [
    { key: 'all', label: 'All Applications' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'interview_scheduled', label: 'Interviews' },
    { key: 'selected', label: 'Selected / Offer' },
    { key: 'rejected', label: 'Archived / Rejected' },
  ];

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading your applications...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Application History & Progress</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status progressions, interview calls, recruiter feedback notes, and decisions.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          {applications.length} Total Submissions
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto space-x-1.5 p-1 bg-slate-200/70 rounded-xl">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === tab.key
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No applications match this filter.</h3>
          <p className="text-xs text-slate-400 mt-1">Switch tabs or browse opportunities to submit your profile.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900">{app.job?.title || 'Job Listing'}</h3>
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-xs text-slate-600 font-semibold flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {app.job?.companyName} • {app.job?.location}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Type: <strong className="capitalize text-slate-600">{app.job?.jobType}</strong></span>
                  {app.eligibilitySnapshot?.isEligible ? (
                    <span className="text-emerald-600 font-semibold flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Eligible at Application
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-auto flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedApp(app);
                    setShowTimelineModal(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center space-x-1"
                >
                  <span>View Timeline & Notes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status History Timeline Modal */}
      <Modal
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        title="Application Lifecycle & Audit History"
        subtitle={selectedApp ? `${selectedApp.job?.title} at ${selectedApp.job?.companyName}` : ''}
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Status Header Pill */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-semibold">Current State:</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Applied on:</p>
                <p className="font-bold text-slate-800">{new Date(selectedApp.appliedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Recruitment Progression Log</h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(selectedApp.statusHistory || []).map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-brand-600 border-2 border-white ring-2 ring-brand-100" />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          {step.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(step.changedAt).toLocaleString()}
                        </span>
                      </div>
                      {step.note && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1.5 leading-relaxed">
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Snapshot Verification */}
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-indigo-900 uppercase tracking-wider text-[10px]">
                Application Eligibility Snapshot:
              </span>
              <p>Degree: {selectedApp.profileSnapshot?.degree} • Branch: {selectedApp.profileSnapshot?.branch}</p>
              <p>CGPA at application: <strong>{selectedApp.profileSnapshot?.cgpa}</strong> • Backlogs: <strong>{selectedApp.profileSnapshot?.backlogs}</strong></p>
            </div>

            {/* Withdrawal Action */}
            {!['selected', 'rejected', 'withdrawn'].includes(selectedApp.status) && (
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleWithdraw(selectedApp._id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  Withdraw Application
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
