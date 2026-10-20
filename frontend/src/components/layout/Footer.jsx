import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ShieldCheck, Heart, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Placement<span className="text-brand-500">OS</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enterprise-grade College Placement & Internship Management Platform connecting ambitious graduates, premier employers, and campus recruitment officers.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational (API v1.0.0)</span>
            </div>
          </div>

          {/* Platform Columns */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Discovery</h3>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Job & Internship Listings</Link></li>
              <li><Link to="/jobs?jobType=internship" className="hover:text-white transition-colors">Summer Internships 2026</Link></li>
              <li><Link to="/drives" className="hover:text-white transition-colors">Campus Placement Drives</Link></li>
              <li><Link to="/companies" className="hover:text-white transition-colors">Partner Companies Directory</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Portals</h3>
            <ul className="space-y-2">
              <li><Link to="/student" className="hover:text-white transition-colors">Student Career Portal</Link></li>
              <li><Link to="/recruiter" className="hover:text-white transition-colors">Recruiter Talent Hub</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Placement Cell Admin</Link></li>
              <li><Link to="/admin/sync" className="hover:text-white transition-colors">Live API Sync Engine</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Compliance & Security</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Role-based access control, encrypted candidate resumes, transparent eligibility checking, and audit trails.
            </p>
            <div className="flex items-center space-x-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span className="text-[11px]">Strict Privacy & Data Security</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 PlacementOS Platform. Built for College Campus Recruitments.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Designed with precision for modern software engineering teams.
          </p>
        </div>
      </div>
    </footer>
  );
};
