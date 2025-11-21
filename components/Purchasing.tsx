import React from 'react';
import { Vendor, PurchaseOrder } from '../types';
import { Truck, FileText } from 'lucide-react';

interface PurchasingProps {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
}

export const Purchasing: React.FC<PurchasingProps> = ({ vendors, purchaseOrders }) => {
  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Purchasing (AP) 💵</h1>
          <p className="text-slate-500">Manage vendors and purchase orders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vendors List */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Truck size={18} /> Vendors
                </h3>
             </div>
             <ul className="divide-y divide-slate-100">
                {vendors.map(v => (
                    <li key={v.id} className="px-6 py-4 hover:bg-slate-50">
                        <div className="font-medium text-slate-900">{v.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{v.contact_email}</div>
                        <div className="text-xs text-slate-400 mt-1">Terms: {v.payment_terms}</div>
                    </li>
                ))}
             </ul>
          </div>

           {/* PO List */}
           <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileText size={18} /> Purchase Orders
                </h3>
                <button className="text-xs bg-white border border-slate-300 px-3 py-1 rounded hover:bg-slate-50">
                    + New PO
                </button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3 font-medium">PO #</th>
                            <th className="px-6 py-3 font-medium">Vendor</th>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium text-right">Amount</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {purchaseOrders.map(po => {
                            const vendor = vendors.find(v => v.id === po.vendor_id);
                            return (
                                <tr key={po.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-600">PO-{po.id}</td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">{vendor?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-slate-500">{po.date}</td>
                                    <td className="px-6 py-4 text-slate-900 text-right tabular-nums">
                                        <span className="text-xs text-slate-400 mr-1">Ks</span>
                                        {po.total_amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                                            ${po.status === 'Received' ? 'bg-emerald-100 text-emerald-700' :
                                              po.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                                              'bg-slate-100 text-slate-600'
                                            }`}>
                                            {po.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
             </div>
          </div>
      </div>
    </div>
  );
};