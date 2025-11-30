import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InventoryItem, RawMaterial, PurchaseOrder, GLEntry } from '../types';

interface DashboardProps {
  inventory: InventoryItem[];
  rawMaterials: RawMaterial[];
  purchaseOrders: PurchaseOrder[];
  glEntries: GLEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ inventory, rawMaterials, purchaseOrders, glEntries }) => {
  const navigate = useNavigate();

  // Calculate Metrics
  const totalInventoryValue = inventory.reduce((acc, item) => acc + (item.landed_cost * item.qty_available), 0);
  const totalRawValue = rawMaterials.reduce((acc, item) => acc + (item.cost_per_unit * item.current_stock), 0);
  
  // Calculate Active POs (Pending + Received) - Represents total unpaid liability/incoming value
  const activePOValue = purchaseOrders
    .filter(po => po.status === 'Pending' || po.status === 'Received')
    .reduce((acc, po) => acc + (Number(po.total_amount) || 0), 0);
  
  const lowStockCount = inventory.filter(item => item.qty_available <= item.reorder_point).length;

  // --- REAL DATA AGGREGATION FOR CHARTS ---
  const { salesTrendData, currentMonthProfit } = useMemo(() => {
    // Helper to get YYYY-MM key safely from YYYY-MM-DD string
    const getMonthKey = (dateStr: string) => {
      if (!dateStr || dateStr.length < 7) return 'Unknown';
      return dateStr.substring(0, 7); // "2023-10-01" -> "2023-10"
    };

    // Group GL Entries by Month
    const monthlyStats: Record<string, { sales: number, expenses: number }> = {};

    glEntries.forEach(entry => {
      const key = getMonthKey(entry.entry_date);
      if (!monthlyStats[key]) {
        monthlyStats[key] = { sales: 0, expenses: 0 };
      }

      // Heuristic for Demo: 
      // Account codes starting with '4' are Income/Sales (Credits)
      // Account codes starting with '5' (COGS) or '6' (Expenses) are Costs (Debits)
      if (entry.account_code.startsWith('4')) {
        monthlyStats[key].sales += Number(entry.credit) || 0;
      } else if (entry.account_code.startsWith('5') || entry.account_code.startsWith('6')) {
        monthlyStats[key].expenses += Number(entry.debit) || 0;
      }
    });

    // Sort keys to be chronological
    const sortedKeys = Object.keys(monthlyStats).sort();
    
    // Get Current Month Profit
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentStats = monthlyStats[currentMonthKey] || { sales: 0, expenses: 0 };
    const currentProfit = currentStats.sales - currentStats.expenses;

    // Format data for Recharts (Take last 6 months of data if available, or just what we have)
    const trendData = sortedKeys.slice(-6).map(key => {
      const [year, month] = key.split('-');
      // Create date object for display name (using local year/month construction)
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1); 
      const stats = monthlyStats[key];
      return {
        month: dateObj.toLocaleString('default', { month: 'short' }), // e.g. "Oct"
        sales: stats.sales,
        profit: stats.sales - stats.expenses
      };
    });

    // Fallback if no data
    if (trendData.length === 0) {
       trendData.push({ month: 'No Data', sales: 0, profit: 0 });
    }

    return { salesTrendData: trendData, currentMonthProfit: currentProfit };
  }, [glEntries]);

  const valuationData = [
    { name: 'Finished', value: totalInventoryValue, displayName: 'အချောထည်' },
    { name: 'Raw Mat', value: totalRawValue, displayName: 'ကုန်ကြမ်း' },
    { name: 'Active POs', value: activePOValue, displayName: 'အဝယ်အော်ဒါများ' },
  ];

  // Helper component for currency display
  const MoneyDisplay = ({ amount }: { amount: number }) => (
    <span className="tabular-nums tracking-tight text-white">
      <span className="text-slate-400 text-sm font-normal mr-1">Ks</span>
      {(amount || 0).toLocaleString()}
    </span>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">လုပ်ငန်းသုံးသပ်ချက်</h1>
          <p className="text-slate-400">လုပ်ငန်းဆိုင်ရာ အချိန်နှင့်တပြေးညီ အချက်အလက်များ</p>
        </div>
        <span className="text-xs font-mono text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 w-fit">တိုက်ရိုက်</span>
      </div>

      {/* KPI Cards */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Valuation Breakdown */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-6">ပိုင်ဆိုင်မှု တန်ဖိုးဖြတ်ခြင်း</h3>
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valuationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                    dataKey="displayName" 
                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false}
                    dy={10}
                />
                <YAxis 
                    tick={{fontSize: 11, fill: '#94a3b8'}} 
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [`Ks ${value.toLocaleString()}`, 'Value']}
                  contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      color: '#fff',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar 
                    dataKey="value" 
                    fill="url(#colorAmber)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={50} 
                />
                <defs>
                    <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Trend */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-6">အရောင်းနှင့် အမြတ်ငွေ အခြေအနေ</h3>
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                    dataKey="month" 
                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false}
                    dy={10}
                />
                <YAxis 
                    tick={{fontSize: 11, fill: '#94a3b8'}} 
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip 
                   formatter={(value: number) => [`Ks ${value.toLocaleString()}`, 'Amount']}
                   contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      color: '#fff',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                    type="monotone" 
                    dataKey="sales" 
                    name="စုစုပေါင်းအရောင်း"
                    stroke="#64748b" 
                    strokeWidth={2} 
                    dot={{r: 4, fill: '#64748b', strokeWidth: 0}} 
                    activeDot={{r: 6, fill: '#fff'}}
                />
                <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="အသားတင်အမြတ်"
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={{r: 4, fill: '#10b981', strokeWidth: 0}} 
                    activeDot={{r: 6, fill: '#fff'}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};