
import React, { useState } from 'react';
import { GLEntry } from '../types';
import { BookOpen, TrendingUp, PieChart, X } from 'lucide-react';

interface AccountingProps {
  glEntries: GLEntry[];
}

export const Accounting: React.FC<AccountingProps> = ({ glEntries }) => {
  const [showReport, setShowReport] = useState(false);

  // Basic P&L Calculation
  // In a real app, we'd filter by account code ranges (e.g. 4000-4999 Income, 5000-6999 Expense)
  // Here we will assume '4001' is Sales, and everything else is Expense/Asset transfer
  const salesIncome = glEntries
    .filter(e => e.account_code.startsWith('4'))
    .reduce((acc, curr) => acc + curr.credit, 0);
  
  const cogs = glEntries
    .filter(e => e.account_code.startsWith('5'))
    .reduce((acc, curr) => acc + curr.debit, 0);

  const expenses = glEntries
    .filter(e => e.account_code.startsWith('6'))
    .reduce((acc, curr) => acc + curr.debit, 0);

  const grossProfit = salesIncome - cogs;
  const netIncome = grossProfit - expenses;

  const totalDebits = glEntries.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredits = glEntries.reduce((acc, curr) => acc + curr.credit, 0);


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Accounting (GL) 📊</h1>
          <p className="text-slate-400 mt-1">Financial tracking and reports.</p>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={() => setShowReport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-lg text-emerald-300 transition-colors text-sm font-medium"
            >
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
                {totalDebits.toLocaleString()}
             </p>
        </div>
         <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
             <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Credits (Oct)</h4>
             <p className="text-3xl font-bold mt-2 tabular-nums text-white relative z-10">
                 <span className="text-lg text-slate-600 mr-1 font-normal">Ks</span>
                 {totalCredits.toLocaleString()}
             </p>
        </div>
         <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 backdrop-blur-xl border border-emerald-500/30 p-6 rounded-2xl shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={48} className="text-emerald-400" />
             </div>
             <h4 className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest mb-1">Net Income Estimate</h4>
             <p className="text-3xl font-bold mt-2 tabular-nums text-white relative z-10">
                <span className="text-lg text-emerald-500/50 mr-1 font-normal">Ks</span>
                {netIncome.toLocaleString()}
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
                            <td className="px-6 py-4 text-slate-300">
                                {entry.description}
                                {entry.related_type === 'purchase_order' && entry.related_id && <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">PO-{entry.related_id}</span>}
                            </td>
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

      {/* P&L Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
             <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold text-white">Profit & Loss Summary</h2>
                    <button onClick={() => setShowReport(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-slate-400">Total Revenue (Sales)</span>
                        <span className="text-emerald-400 font-medium text-lg tabular-nums">Ks {salesIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-slate-400">Cost of Goods Sold</span>
                        <span className="text-red-400 font-medium text-lg tabular-nums">- Ks {cogs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-white font-semibold">Gross Profit</span>
                        <span className="text-white font-bold text-xl tabular-nums">Ks {grossProfit.toLocaleString()}</span>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-xl space-y-3 mt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Operating Expenses</span>
                            <span className="text-red-400/80 font-medium tabular-nums">- Ks {expenses.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                         <span className="text-slate-200 font-bold text-lg">Net Income</span>
                         <span className={`font-bold text-2xl tabular-nums ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                             Ks {netIncome.toLocaleString()}
                         </span>
                    </div>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};
