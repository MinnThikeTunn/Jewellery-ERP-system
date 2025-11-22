
import React from 'react';
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
import { InventoryItem, RawMaterial, PurchaseOrder } from '../types';

interface DashboardProps {
  inventory: InventoryItem[];
  rawMaterials: RawMaterial[];
  purchaseOrders: PurchaseOrder[];
}

export const Dashboard: React.FC<DashboardProps> = ({ inventory, rawMaterials, purchaseOrders }) => {
  // Calculate Metrics
  const totalInventoryValue = inventory.reduce((acc, item) => acc + (item.landed_cost * item.qty_available), 0);
  const totalRawValue = rawMaterials.reduce((acc, item) => acc + (item.cost_per_unit * item.current_stock), 0);
  const openPOValue = purchaseOrders
    .filter(po => po.status === 'Pending')
    .reduce((acc, po) => acc + po.total_amount, 0);
  
  const lowStockCount = inventory.filter(item => item.qty_available <= item.reorder_point).length;

  // Mock Chart Data
  const valuationData = [
    { name: 'Finished', value: totalInventoryValue },
    { name: 'Raw Mat', value: totalRawValue },
    { name: 'Open POs', value: openPOValue },
  ];

  const salesTrendData = [
    { month: 'Jul', sales: 12000000, profit: 7200000 },
    { month: 'Aug', sales: 9000000, profit: 4194000 },
    { month: 'Sep', sales: 6000000, profit: 29400000 },
    { month: 'Oct', sales: 8340000, profit: 11724000 },
    { month: 'Nov', sales: 5670000, profit: 14400000 },
    { month: 'Dec', sales: 7170000, profit: 11400000 },
  ];

  // Helper component for currency display
  const MoneyDisplay = ({ amount }: { amount: number }) => (
    <span className="tabular-nums tracking-tight text-white">
      <span className="text-slate-400 text-sm font-normal mr-1">Ks</span>
      {amount.toLocaleString()}
    </span>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Executive Overview</h1>
          <p className="text-slate-400">Real-time business intelligence.</p>
        </div>
        <span className="text-xs font-mono text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">Live</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Valuation */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <DollarSign size={64} className="text-emerald-400" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-medium text-slate-400">Total Valuation</h3>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white relative z-10">
            <MoneyDisplay amount={totalInventoryValue + totalRawValue} />
          </p>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
             <TrendingUp size={12} /> +2.5% from last month
          </p>
        </div>

        {/* Low Stock */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <AlertTriangle size={64} className="text-amber-400" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-medium text-slate-400">Low Stock Alerts</h3>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white relative z-10">{lowStockCount}</p>
          <p className="text-xs text-slate-500 mt-2">Items below reorder point</p>
        </div>

        {/* Open POs */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Package size={64} className="text-blue-400" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-medium text-slate-400">Open POs</h3>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Package size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white relative z-10">
             <MoneyDisplay amount={openPOValue} />
          </p>
          <p className="text-xs text-slate-500 mt-2">Pending receiving</p>
        </div>

        {/* Monthly Profit */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <TrendingUp size={64} className="text-purple-400" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-medium text-slate-400">Monthly Profit</h3>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white relative z-10">
            <MoneyDisplay amount={37350000} />
          </p>
          <p className="text-xs text-purple-400 mt-2">Est. current month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Valuation Breakdown */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-6">Asset Valuation</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valuationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                    dataKey="name" 
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
          <h3 className="text-lg font-semibold text-white mb-6">Sales & Profit Trend</h3>
          <div className="h-72">
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
                    name="Total Sales"
                    stroke="#64748b" 
                    strokeWidth={2} 
                    dot={{r: 4, fill: '#64748b', strokeWidth: 0}} 
                    activeDot={{r: 6, fill: '#fff'}}
                />
                <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="Net Profit"
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
