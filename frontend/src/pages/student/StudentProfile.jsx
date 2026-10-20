import React, { useEffect, useState } from 'react';
import { studentService } from '../../services/studentService';
import { Modal } from '../../components/common/Modal';
import {
  User, GraduationCap, UploadCloud, FileText, Check, Plus, Trash2,
  ExternalLink, Github, Linkedin, Globe, Sparkles, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Project Modal State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    techStack: '',
    githubLink: '',
    link: ''
  });

  // Experience Modal State
  const [showExpModal, setShowExpModal] = useState(false);
  const [expForm, setExpForm] = useState({
    role: '',
    company: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await studentService.getProfile();
      if (res.success) {
        setProfile(res.profile);
      }
    } catch (err) {
      toast.error('Could not load student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await studentService.updateProfile(profile);
      if (res.success) {
        setProfile(res.profile);
        toast.success('Academic & Career Profile saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Resume Upload Handler
  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB maximum limit.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadingResume(true);
      const res = await studentService.uploadResume(formData);
      if (res.success) {
        setProfile(prev => ({
          ...prev,
          resumeUrl: res.resumeUrl,
          resumeOriginalName: res.resumeOriginalName
        }));
        toast.success('Resume uploaded and attached to profile!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resume upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Skills tag handling
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const clean = newSkill.trim();
    if (!profile.skills?.includes(clean)) {
      setProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), clean]
      }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Project Handling
  const handleSaveProject = () => {
    if (!projectForm.title) {
      toast.error('Project title is required.');
      return;
    }
    const stackArr = projectForm.techStack
      ? projectForm.techStack.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const newProj = {
      title: projectForm.title,
      description: projectForm.description,
      techStack: stackArr,
      githubLink: projectForm.githubLink,
      link: projectForm.link
    };

    setProfile(prev => ({
      ...prev,
      projects: [...(prev.projects || []), newProj]
    }));

    setProjectForm({ title: '', description: '', techStack: '', githubLink: '', link: '' });
    setShowProjectModal(false);
  };

  const handleDeleteProject = (index) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  // Experience Handling
  const handleSaveExp = () => {
    if (!expForm.role || !expForm.company) {
      toast.error('Role and company are required.');
      return;
    }

    setProfile(prev => ({
      ...prev,
      workExperience: [...(prev.workExperience || []), expForm]
    }));

    setExpForm({ role: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' });
    setShowExpModal(false);
  };

  const handleDeleteExp = (index) => {
    setProfile(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, idx) => idx !== index)
    }));
  };

  if (loading || !profile) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading student profile details...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Academic & Career Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            This verified data is utilized by our automated eligibility checker during job applications.
          </p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
        >
          {saving ? <span>Saving...</span> : <span>Save All Changes</span>}
        </button>
      </div>

      {/* Grid: Academic Info & Resume */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Academic Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Academic Credentials</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                College Email
              </label>
              <input
                type="email"
                value={profile.collegeEmail || ''}
                onChange={(e) => handleFieldChange('collegeEmail', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Degree
              </label>
              <select
                value={profile.degree || 'B.Tech'}
                onChange={(e) => handleFieldChange('degree', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="M.Tech">M.Tech / M.E.</option>
                <option value="MCA">MCA</option>
                <option value="BCA">BCA</option>
                <option value="B.Sc">B.Sc</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Branch / Specialization
              </label>
              <select
                value={profile.branch || 'Computer Science & Engineering'}
                onChange={(e) => handleFieldChange('branch', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Graduation Year
              </label>
              <input
                type="number"
                value={profile.graduationYear || 2026}
                onChange={(e) => handleFieldChange('graduationYear', Number(e.target.value))}
                min="2024"
                max="2030"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                CGPA (0.00 - 10.00)
              </label>
              <input
                type="number"
                step="0.01"
                value={profile.cgpa || 0}
                onChange={(e) => handleFieldChange('cgpa', Number(e.target.value))}
                min="0"
                max="10"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Active Backlogs
              </label>
              <input
                type="number"
                value={profile.backlogs ?? 0}
                onChange={(e) => handleFieldChange('backlogs', Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Professional Summary / Bio
            </label>
            <textarea
              rows={3}
              value={profile.bio || ''}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              placeholder="Brief summary of your technical interests and career goals..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Right Column (1/3): Resume & Links */}
        <div className="space-y-6">
          {/* Resume Upload Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Candidate Resume</h2>
            </div>

            {profile.resumeUrl ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-5 h-5 text-brand-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {profile.resumeOriginalName || 'Resume.pdf'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-700 font-bold flex items-center space-x-1"
                  >
                    <span>View / Download</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-slate-400">PDF / DOCX</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-500">No resume attached yet.</p>
              </div>
            )}

            <div>
              <label className="block w-full cursor-pointer py-2.5 px-3 text-center rounded-xl border border-slate-300 hover:border-brand-500 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">
                <UploadCloud className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                <span>{uploadingResume ? 'Uploading...' : 'Upload New Resume (PDF max 5MB)'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileChange}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Web & Profiles
            </h2>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">GitHub URL</label>
              <div className="relative">
                <Github className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="url"
                  value={profile.githubUrl || ''}
                  onChange={(e) => handleFieldChange('githubUrl', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">LinkedIn URL</label>
              <div className="relative">
                <Linkedin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="url"
                  value={profile.linkedinUrl || ''}
                  onChange={(e) => handleFieldChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Portfolio Website</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="url"
                  value={profile.portfolioUrl || ''}
                  onChange={(e) => handleFieldChange('portfolioUrl', e.target.value)}
                  placeholder="https://portfolio.dev"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Skills Editor */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
          Technical Skills & Proficiencies
        </h2>

        <div className="flex flex-wrap gap-2">
          {(profile.skills || []).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-2 text-brand-400 hover:text-brand-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-2 pt-2 max-w-md">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
            placeholder="e.g. React, Docker, Python..."
            className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Add Skill
          </button>
        </div>
      </div>

      {/* Projects Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Engineering Projects</h2>
          <button
            onClick={() => setShowProjectModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>

        {(!profile.projects || profile.projects.length === 0) ? (
          <p className="text-xs text-slate-400 py-4 text-center">No projects added yet. Click Add Project to showcase your code.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{proj.title}</h3>
                    <button
                      onClick={() => handleDeleteProject(idx)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{proj.description}</p>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {proj.techStack.map((tech, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-medium bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center space-x-3 text-xs">
                  {proj.githubLink && (
                    <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-brand-600 font-semibold flex items-center space-x-1">
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 font-semibold flex items-center space-x-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live App</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title="Add Technical Project"
        subtitle="Highlight apps, research papers, or open source repositories"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Project Title *</label>
            <input
              type="text"
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              placeholder="e.g. Distributed Task Queue"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={3}
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="Features, architecture decisions, and technologies used..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tech Stack (comma-separated)</label>
            <input
              type="text"
              value={projectForm.techStack}
              onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
              placeholder="e.g. React, Node.js, Redis, Docker"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">GitHub Link</label>
              <input
                type="url"
                value={projectForm.githubLink}
                onChange={(e) => setProjectForm({ ...projectForm, githubLink: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Live Demo Link</label>
              <input
                type="url"
                value={projectForm.link}
                onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="pt-3 flex justify-end space-x-2">
            <button
              onClick={() => setShowProjectModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProject}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow"
            >
              Add Project
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
