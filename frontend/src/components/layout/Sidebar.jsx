import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, User, FileText, Bookmark, Search,
  PlusCircle, Briefcase, Building, ShieldCheck, Users,
  Database, ScrollText, Calendar, LogOut
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { label: 'Dashboard', path: '/student', icon: LayoutDashboard, exact: true },
    { label: 'My Applications', path: '/student/applications', icon: FileText },
    { label: 'Profile & Resume', path: '/student/profile', icon: User },
    { label: 'Saved Wishlist', path: '/student/saved', icon: Bookmark },
    { label: 'Find Opportunities', path: '/jobs', icon: Search },
    { label: 'Campus Drives', path: '/drives', icon: Calendar },
  ];

  const recruiterLinks = [
    { label: 'Recruiter Dashboard', path: '/recruiter', icon: LayoutDashboard, exact: true },
    { label: 'Post Opportunity', path: '/recruiter/post-job', icon: PlusCircle },
    { label: 'Manage Listings', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Company Profile', path: '/recruiter/company', icon: Building },
    { label: 'Explore Drives', path: '/drives', icon: Calendar },
  ];

  const adminLinks = [
    { label: 'Executive Analytics', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Manage Companies', path: '/admin/companies', icon: Building },
    { label: 'Placement Drives', path: '/admin/drives', icon: Calendar },
    { label: 'Data Sync Engine', path: '/admin/sync', icon: Database },
    { label: 'Audit Trail', path: '/admin/audit', icon: ScrollText },
    { label: 'All Listings', path: '/jobs', icon: Search },
  ];

  let links = studentLinks;
  let portalTitle = 'Student Portal';
  let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';

  if (user.role === 'recruiter') {
    links = recruiterLinks;
    portalTitle = 'Recruiter Portal';
    badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (user.role === 'admin') {
    links = adminLinks;
    portalTitle = 'Placement Cell Admin';
    badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Portal Header */}
      <div className="p-5 border-b border-slate-800/80">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
          Workspace
        </p>
        <h2 className="text-sm font-bold text-white mt-0.5">{portalTitle}</h2>
        <div className="mt-2.5 flex items-center space-x-2">
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
            {user.role}
          </span>
          {user.isVerified ? (
            <span className="text-[10px] text-emerald-400 flex items-center font-medium">
              <ShieldCheck className="w-3 h-3 mr-1" /> Verified
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 flex items-center font-medium">
              Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Card & Logout Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
