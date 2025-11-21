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
    { name: 'Finished Goods', value: totalInventoryValue },
    { name: 'Raw Materials', value: totalRawValue },
    { name: 'Pending POs', value: openPOValue },
  ];

  const salesTrendData = [
    { month: 'Jul', sales: 4000, profit: 2400 },
    { month: 'Aug', sales: 3000, profit: 1398 },
    { month: 'Sep', sales: 2000, profit: 9800 },
    { month: 'Oct', sales: 2780, profit: 3908 },
    { month: 'Nov', sales: 1890, profit: 4800 },
    { month: 'Dec', sales: 2390, profit: 3800 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Executive Overview</h1>
        <span className="text-sm text-slate-500">Last updated: Just now</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Valuation</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ${(totalInventoryValue + totalRawValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 mt-1">+2.5% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Low Stock Alerts</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-full">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{lowStockCount}</p>
          <p className="text-xs text-slate-500 mt-1">Items below reorder point</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Open POs</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
              <Package size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ${openPOValue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Pending receiving</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Monthly Profit</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">$12,450.00</p>
          <p className="text-xs text-indigo-600 mt-1">Est. current month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valuation Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Asset Valuation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valuationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Sales & Profit Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#64748b" strokeWidth={2} dot={{r: 4}} />
                <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};