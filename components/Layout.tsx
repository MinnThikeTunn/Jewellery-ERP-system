import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Diamond, 
  Hammer, 
  ShoppingCart, 
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import NavItem from './NavItem';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-900 text-slate-200 overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950/50 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between lg:justify-start gap-4">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
            <Diamond size={24} className="text-white" />
          </div>
          {/* Rebranded Title: Aung (Large) Yadanar (Small) */}
          <div className="flex items-baseline gap-1.5 font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
            <span className="text-2xl">Aung</span>
            <span className="text-lg tracking-wider text-slate-400">Yadanar</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="px-6 space-y-2 mt-2">
          <NavItem to="/" icon={LayoutDashboard} label="ဒက်ရှ်ဘုတ်" />
          <NavItem to="/inventory" icon={Diamond} label="ကုန်ပစ္စည်းစာရင်း" />
          <NavItem to="/manufacturing" icon={Hammer} label="ထုတ်လုပ်မှု" />
          <NavItem to="/purchasing" icon={ShoppingCart} label="ဝယ်ယူရေး" />
          <NavItem to="/accounting" icon={BarChart3} label="စာရင်းကိုင်" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between lg:hidden">
           <button onClick={() => setSidebarOpen(true)} className="text-slate-300 hover:text-white">
             <Menu size={24} />
           </button>
           {/* Mobile Header Branding */}
           <div className="flex items-baseline gap-1 font-bold text-slate-100">
             <span>Aung</span>
             <span className="text-sm text-slate-300">Yadanar</span>
           </div>
           <div className="w-6" /> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
