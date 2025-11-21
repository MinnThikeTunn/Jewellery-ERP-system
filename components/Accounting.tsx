import React from 'react';
import { GLEntry } from '../types';
import { BookOpen, TrendingUp, PieChart } from 'lucide-react';

interface AccountingProps {
  glEntries: GLEntry[];
}

export const Accounting: React.FC<AccountingProps> = ({ glEntries }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Accounting (GL) 📊</h1>
          <p className="text-slate-500">Financial tracking and reports.</p>
        </div>
        <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm">
                <PieChart size={16} /> P&L Report
            </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 text-white p-6 rounded-lg">
             <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Debits (Oct)</h4>
             <p className="text-2xl font-bold mt-2 tabular-nums">
                <span className="text-base text-slate-400 mr-1 font-normal">Ks</span>
                {(17100000).toLocaleString()}
             </p>
        </div>
         <div className="bg-slate-800 text-white p-6 rounded-lg">
             <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Credits (Oct)</h4>
             <p className="text-2xl font-bold mt-2 tabular-nums">
                 <span className="text-base text-slate-400 mr-1 font-normal">Ks</span>
                 {(46200000).toLocaleString()}
             </p>
        </div>
         <div className="bg-emerald-600 text-white p-6 rounded-lg">
             <h4 className="text-emerald-200 text-sm font-medium uppercase tracking-wider">Net Income Estimate</h4>
             <p className="text-2xl font-bold mt-2 tabular-nums">
                <span className="text-base text-emerald-200 mr-1 font-normal">Ks</span>
                {(29100000).toLocaleString()}
             </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <BookOpen size={20} className="text-slate-400" />
            <h3 className="font-semibold text-slate-800">General Ledger Entries</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Account</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3 text-right">Debit</th>
                        <th className="px-6 py-3 text-right">Credit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {glEntries.map(entry => (
                        <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-slate-500">{entry.entry_date}</td>
                            <td className="px-6 py-4 font-mono text-slate-600">{entry.account_code}</td>
                            <td className="px-6 py-4 text-slate-900">{entry.description}</td>
                            <td className="px-6 py-4 text-right text-slate-900 tabular-nums">
                                {entry.debit > 0 ? (
                                    <>
                                        <span className="text-xs text-slate-400 mr-1">Ks</span>
                                        {entry.debit.toLocaleString()}
                                    </>
                                ) : '-'}
                            </td>
                             <td className="px-6 py-4 text-right text-slate-900 tabular-nums">
                                {entry.credit > 0 ? (
                                    <>
                                        <span className="text-xs text-slate-400 mr-1">Ks</span>
                                        {entry.credit.toLocaleString()}
                                    </>
                                ) : '-'}
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