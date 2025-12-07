import React from 'react';
import { DollarSign, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardKPIProps {
  totalInventoryValue: number;
  totalRawValue: number;
  activePOValue: number;
  lowStockCount: number;
  currentMonthProfit: number;
}

const MoneyDisplay = ({ amount }: { amount: number }) => (
  <span className="tabular-nums tracking-tight text-white">
    <span className="text-slate-400 text-sm font-normal mr-1">Ks</span>
    {(amount || 0).toLocaleString()}
  </span>
);

export const DashboardKPI: React.FC<DashboardKPIProps> = ({
  totalInventoryValue,
  totalRawValue,
  activePOValue,
  lowStockCount,
  currentMonthProfit,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Valuation */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <DollarSign size={64} className="text-emerald-400" />
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-sm font-medium text-slate-400">စုစုပေါင်းတန်ဖိုး</h3>
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <DollarSign size={18} />
          </div>
        </div>
        <p className="text-2xl font-bold text-white relative z-10">
          <MoneyDisplay amount={totalInventoryValue + totalRawValue} />
        </p>
        <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
          <TrendingUp size={12} /> လက်ရှိပိုင်ဆိုင်မှုတန်ဖိုး
        </p>
      </div>

      {/* Low Stock - Clickable Link */}
      <div
        onClick={() => navigate('/inventory', { state: { filter: 'low-stock' } })}
        className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors duration-300 cursor-pointer"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertTriangle size={64} className="text-amber-400" />
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-sm font-medium text-slate-400">ပစ္စည်းပြတ်လပ်မှု သတိပေးချက်များ</h3>
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <AlertTriangle size={18} />
          </div>
        </div>
        <p className="text-2xl font-bold text-white relative z-10">{lowStockCount}</p>
        <p className="text-xs text-slate-500 mt-2 group-hover:text-cyan-400 transition-colors">ပြန်လည်မှာယူရမည့် အမှတ်အောက်ရောက်နေသော ပစ္စည်းများ →</p>
      </div>

      {/* Active POs */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Package size={64} className="text-blue-400" />
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-sm font-medium text-slate-400">ဆောင်ရွက်ဆဲ အဝယ်အော်ဒါများ</h3>
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <Package size={18} />
          </div>
        </div>
        <p className="text-2xl font-bold text-white relative z-10">
          <MoneyDisplay amount={activePOValue} />
        </p>
        <p className="text-xs text-slate-500 mt-2">ဆိုင်းငံ့ နှင့် လက်ခံရရှိပြီး</p>
      </div>

      {/* Monthly Profit */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp size={64} className="text-purple-400" />
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-sm font-medium text-slate-400">လစဉ်အမြတ်ငွေ</h3>
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <TrendingUp size={18} />
          </div>
        </div>
        <p className="text-2xl font-bold text-white relative z-10">
          <MoneyDisplay amount={currentMonthProfit} />
        </p>
        <p className="text-xs text-purple-400 mt-2">ယခုလအတွက် အမှန်တကယ်</p>
      </div>
    </div>
  );
};

export default DashboardKPI;
