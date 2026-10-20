import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import {
  Users, Building, Briefcase, FileText, Download,
  TrendingUp, Award, Database, Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAnalytics();
        if (res.success) {
          setAnalytics(res.analytics);
        }
      } catch (err) {
        toast.error('Could not load administrative analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-400">Aggregating platform database analytics...</div>;
  }

  const { students = {}, recruiters = {}, companies = {}, jobs = {}, applications = {}, topSkills = [], dataSources = [] } = analytics || {};

  // Funnel data for Recharts
  const funnelData = (applications.funnel || []).map(f => ({
    name: f.stage,
    count: f.count
  }));

  // Status breakdown data for PieChart
  const breakdown = applications.breakdown || {};
  const pieData = [
    { name: 'Applied', value: breakdown.applied || 0, color: '#94A3B8' },
    { name: 'Under Review', value: breakdown.under_review || 0, color: '#3B82F6' },
    { name: 'Shortlisted', value: breakdown.shortlisted || 0, color: '#6366F1' },
    { name: 'Interviews', value: breakdown.interview_scheduled || 0, color: '#F59E0B' },
    { name: 'Offers / Selected', value: breakdown.selected || 0, color: '#10B981' },
    { name: 'Rejected', value: breakdown.rejected || 0, color: '#F43F5E' },
  ].filter(d => d.value > 0);

  const skillsData = (topSkills || []).map(s => ({
    name: s.skill,
    count: s.count
  }));

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Export Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Placement Cell Executive Intelligence</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Placement Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Aggregated in real-time from active college databases, verified offers, and employer vacancies.
          </p>
        </div>

        {/* CSV Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <a
            href={adminService.exportApplicationsUrl}
            download
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-brand-400" />
            <span>Export Applications (CSV)</span>
          </a>
          <a
            href={adminService.exportStudentsUrl}
            download
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Student Roster</span>
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Placement Conversion Rate"
          value={`${students.placementRate || 0}%`}
          subtitle={`${students.placed || 0} students selected of ${students.total || 0} candidates`}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Registered Students"
          value={students.total || 0}
          subtitle="Enrolled campus candidates"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Approved Employers"
          value={companies.verified || 0}
          subtitle={`Out of ${companies.total || 0} registered organizations`}
          icon={Building}
          color="blue"
        />
        <StatCard
          title="Active Opportunities"
          value={jobs.active || 0}
          subtitle={`${jobs.direct || 0} campus drives • ${jobs.imported || 0} partner feeds`}
          icon={Briefcase}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Campus Recruitment Funnel
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Progression through hiring stages</p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Application Status Distribution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{applications.total || 0} total applications processed</p>
            </div>
            <FileText className="w-4 h-4 text-brand-600" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">No applications to display yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: In-Demand Skills & Data Sync Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most In-Demand Skills (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Most In-Demand Technical Skills
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Aggregated from active employer postings</p>
            </div>
          </div>

          <div className="h-60 w-full">
            {skillsData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No skills data aggregated yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Data Sources Health Status (1/3) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-brand-600" />
                <span>API Data Sources</span>
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              {dataSources.map(ds => (
                <div key={ds._id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{ds.name}</span>
                    {ds.isConfigured ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Configured
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                        Not Configured
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Status: <strong className="capitalize">{ds.lastSyncStatus}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {ds.lastSyncAt ? `Last Sync: ${new Date(ds.lastSyncAt).toLocaleString()}` : 'Never synchronized'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <a
              href="/admin/sync"
              className="w-full py-2 text-center text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl block transition-colors"
            >
              Open Live Sync Manager →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
