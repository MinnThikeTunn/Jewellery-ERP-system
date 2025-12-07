import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        isActive
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-cyan-500/20'
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 transition-opacity duration-300 ${
          isActive ? 'opacity-100' : 'group-hover:opacity-100'
        }`}
      />
      <Icon size={20} className={`relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span className="font-medium relative z-10">{label}</span>
    </Link>
  );
};

export default NavItem;
