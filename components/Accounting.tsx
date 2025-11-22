
import React from 'react';
import { GLEntry } from '../types';
import { BookOpen, TrendingUp, PieChart } from 'lucide-react';

interface AccountingProps {
  glEntries: GLEntry[];
}

export const Accounting: React.FC<AccountingProps> = ({ glEntries }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Accounting (GL) 📊</h1>
          <p className="text-slate-400 mt-1">Financial tracking and reports.</p>
        </div>
        <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-slate-300 transition-colors text-sm">
                <PieChart size={16} /> P&L Report
            </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors"></div>
             <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Debits (Oct)</h4>
             <p className="text-3xl font-bold mt-2 tabular-nums text-white relative z-10">
                <span className="text-lg text-slate-600 mr-1 font-normal">Ks</span>
                {(17100000).toLocaleString()}
             </p>
        </div>
         <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
             <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Credits (Oct)</h4>
             <p className="text-3xl font-bold mt-2 tabular-nums text-white relative z-10">
                 <span className="text-lg text-slate-600 mr-1 font-normal">Ks</span>
                 {(46200000).toLocaleString()}
             </p>
        </div>
         <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 backdrop-blur-xl border border-emerald-500/30 p-6 rounded-2xl shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={48} className="text-emerald-400" />
             </div>
             <h4 className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest mb-1">Net Income Estimate</h4>
             <p className="text-3xl font-bold mt-2 tabular-nums text-white relative z-10">
                <span className="text-lg text-emerald-500/50 mr-1 font-normal">Ks</span>
                {(29100000).toLocaleString()}
             </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 bg-white/5">
            <div className="p-2 bg-slate-800/50 rounded-lg border border-white/5">
                <BookOpen size={18} className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">General Ledger Entries</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/10">
                    <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Account</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4 text-right">Debit</th>
                        <th className="px-6 py-4 text-right">Credit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {glEntries.map(entry => (
                        <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-slate-500">{entry.entry_date}</td>
                            <td className="px-6 py-4 font-mono text-cyan-300/80 text-xs">{entry.account_code}</td>
                            <td className="px-6 py-4 text-slate-300">{entry.description}</td>
                            <td className="px-6 py-4 text-right text-slate-300 tabular-nums">
                                {entry.debit > 0 ? (
                                    <>
                                        <span className="text-xs text-slate-600 mr-1">Ks</span>
                                        {entry.debit.toLocaleString()}
                                    </>
                                ) : <span className="text-slate-700">-</span>}
                            </td>
                             <td className="px-6 py-4 text-right text-slate-300 tabular-nums">
                                {entry.credit > 0 ? (
                                    <>
                                        <span className="text-xs text-slate-600 mr-1">Ks</span>
                                        {entry.credit.toLocaleString()}
                                    </>
                                ) : <span className="text-slate-700">-</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
