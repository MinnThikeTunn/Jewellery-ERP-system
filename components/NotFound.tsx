import React from 'react';
import { Link } from 'react-router-dom';
import { Gem, Home, SearchX } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 relative overflow-hidden">
       {/* Ambient Glow for 404 */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

       <div className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-10 md:p-14 rounded-3xl shadow-2xl max-w-lg w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <div className="relative mb-8">
             <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
             <div className="p-6 bg-slate-900/80 rounded-full border border-white/10 shadow-inner relative z-10">
                <SearchX size={64} className="text-cyan-400 opacity-90" />
             </div>
             {/* Floating gem decoration */}
             <div className="absolute -top-2 -right-4 animate-bounce duration-[3000ms]">
                <Gem size={32} className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
             </div>
          </div>

          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-400 to-blue-500 mb-2 tracking-tighter drop-shadow-lg">
            404
          </h1>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            စာမျက်နှာ ရှာမတွေ့ပါ
          </h2>
          
          <p className="text-slate-400 mb-8 leading-relaxed max-w-sm mx-auto">
            သင်ရှာဖွေနေသော စာမျက်နှာသည် မရှိပါ (သို့မဟုတ်) အခြားနေရာသို့ ပြောင်းရွှေ့သွားပါပြီ။
            <span className="block text-xs mt-2 text-slate-500 font-mono">(The page you are looking for does not exist.)</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
             <Link
               to="/"
               className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
             >
                <Home size={18} />
                ပင်မစာမျက်နှာသို့
             </Link>
          </div>
       </div>
    </div>
  );
};