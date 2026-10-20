import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Users, Briefcase, FileText, CheckCircle2, Video, Calendar,
  ExternalLink, ArrowLeft, Send, Sparkles, Filter, ChevronRight, User
} from 'lucide-react';
import toast from 'react-hot-toast';

export const JobApplicants = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Status Change Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('under_review');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Interview Schedule Modal State
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    roundName: 'Technical Round 1: Coding & Systems',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    durationMinutes: 45,
    mode: 'online',
    meetingLinkOrLocation: 'https://meet.google.com/placementos-interview-room',
    notes: 'Please be ready with a browser capable of live collaborative code editing.'
  });
  const [scheduling, setScheduling] = useState(false);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getJobApplications(jobId);
      if (res.success) {
        setJob(res.job);
        setApplications(res.applications || []);
      }
    } catch (err) {
      toast.error('Could not load job applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    try {
      setUpdatingStatus(true);
      const res = await applicationService.updateStatus(selectedApp._id, newStatus, statusNote);
      if (res.success) {
        toast.success(`Candidate marked as ${newStatus.replace('_', ' ')}.`);
        setShowStatusModal(false);
        setStatusNote('');
        fetchApplicants();
      }
    } catch (err) {
      toast.error('Failed to update candidate recruitment status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApp) return;
    try {
      setScheduling(true);
      const payload = {
        applicationId: selectedApp._id,
        roundName: interviewForm.roundName,
        scheduledAt: new Date(interviewForm.scheduledAt),
        durationMinutes: Number(interviewForm.durationMinutes),
        mode: interviewForm.mode,
        meetingLinkOrLocation: interviewForm.meetingLinkOrLocation,
        notes: interviewForm.notes
      };

      const res = await applicationService.scheduleInterview(payload);
      if (res.success) {
        toast.success('Interview scheduled and invitation delivered to candidate!');
        setShowInterviewModal(false);
        fetchApplicants();
      }
    } catch (err) {
      toast.error('Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  const filteredApps = applications.filter(a => {
    if (activeFilter === 'all') return true;
    return a.status === activeFilter;
  });

  const filterTabs = [
    { key: 'all', label: 'All Candidates' },
    { key: 'applied', label: 'Applied' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'interview_scheduled', label: 'Interview Scheduled' },
    { key: 'selected', label: 'Selected / Hired' },
    { key: 'rejected', label: 'Rejected' },
  ];

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading candidate applications...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Navigation */}
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </Link>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Applicant Reviewer Board
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {job?.title || 'Job Applications'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cutoff Requirements: CGPA {job?.eligibility?.minCgpa || 0} • Max Backlogs: {job?.eligibility?.maxBacklogs ?? 0}
          </p>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          {applications.length} Total Applicants
        </span>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex overflow-x-auto space-x-1.5 p-1 bg-slate-200/70 rounded-xl">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === tab.key
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Candidates List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No candidate applications in this stage.</h3>
          <p className="text-xs text-slate-400 mt-1">Select another stage tab or check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map(app => (
            <div
              key={app._id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Candidate Info */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {app.profileSnapshot?.fullName || app.student?.name}
                  </h3>
                  <StatusBadge status={app.status} />
                  {app.eligibilitySnapshot?.isEligible && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Eligible
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  {app.profileSnapshot?.degree} in {app.profileSnapshot?.branch} • Class of {app.profileSnapshot?.graduationYear}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span>CGPA: <strong className="text-slate-900">{app.profileSnapshot?.cgpa || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Backlogs: <strong className="text-slate-900">{app.profileSnapshot?.backlogs ?? 0}</strong></span>
                  <span>•</span>
                  <span>Email: <strong className="text-slate-900">{app.profileSnapshot?.collegeEmail || app.student?.email}</strong></span>
                </div>

                {/* Candidate Skills */}
                {app.profileSnapshot?.skills && app.profileSnapshot.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {app.profileSnapshot.skills.slice(0, 5).map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes from candidate if any */}
                {app.notes && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                    "{app.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap md:flex-col items-end gap-2 flex-shrink-0">
                {app.profileSnapshot?.resumeUrl && (
                  <a
                    href={app.profileSnapshot.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Resume</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    setSelectedApp(app);
                    setNewStatus(app.status);
                    setShowStatusModal(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center space-x-1"
                >
                  <span>Update Stage</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedApp(app);
                    setShowInterviewModal(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm flex items-center space-x-1"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Schedule Interview</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Recruitment Stage Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Recruitment Stage"
        subtitle={selectedApp ? `Candidate: ${selectedApp.profileSnapshot?.fullName}` : ''}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select New Stage
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="assessment">Assessment Round</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="selected">Selected / Offer Extended</option>
              <option value="rejected">Rejected / Not Selected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Feedback Note for Candidate & Audit Trail (Optional)
            </label>
            <textarea
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Candidate demonstrated strong problem solving. Moving to final assessment..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              onClick={() => setShowStatusModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={updatingStatus}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md disabled:opacity-60"
            >
              {updatingStatus ? 'Updating...' : 'Save Stage Change'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        title="Schedule Candidate Interview"
        subtitle={selectedApp ? `Interview invitation for ${selectedApp.profileSnapshot?.fullName}` : ''}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Interview Round Title *
            </label>
            <input
              type="text"
              value={interviewForm.roundName}
              onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={interviewForm.scheduledAt}
                onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                value={interviewForm.durationMinutes}
                onChange={(e) => setInterviewForm({ ...interviewForm, durationMinutes: e.target.value })}
                min="15"
                max="180"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Interview Mode
              </label>
              <select
                value={interviewForm.mode}
                onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="online">Online Video Conference</option>
                <option value="in-person">In-Person (Campus Placement Room)</option>
                <option value="phone">Telephonic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Meeting Link or Room Location *
              </label>
              <input
                type="text"
                value={interviewForm.meetingLinkOrLocation}
                onChange={(e) => setInterviewForm({ ...interviewForm, meetingLinkOrLocation: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Preparation Instructions for Student
            </label>
            <textarea
              rows={2}
              value={interviewForm.notes}
              onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              onClick={() => setShowInterviewModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleInterview}
              disabled={scheduling}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md flex items-center space-x-1.5 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{scheduling ? 'Scheduling...' : 'Confirm & Send Invitation'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
