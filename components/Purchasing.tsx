
import React, { useState } from 'react';
import { Vendor, PurchaseOrder } from '../types';
import { Truck, FileText, Plus, Trash2, X, Pencil, Calendar, DollarSign, User } from 'lucide-react';

interface PurchasingProps {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
  onDeleteVendor: (id: number) => void;
  onAddPO: (po: Omit<PurchaseOrder, 'id'>) => void;
  onUpdatePO: (po: PurchaseOrder) => void;
  onDeletePO: (id: number) => void;
}

export const Purchasing: React.FC<PurchasingProps> = ({ 
  vendors, 
  purchaseOrders,
  onAddVendor,
  onDeleteVendor,
  onAddPO,
  onUpdatePO,
  onDeletePO
}) => {
  // Modal State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  
  // Form State - Vendor
  const [vendorForm, setVendorForm] = useState<Partial<Vendor>>({
    name: '',
    contact_email: '',
    payment_terms: 'Net 30'
  });

  // Form State - PO
  const initialPOState: Partial<PurchaseOrder> = {
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    total_amount: 0
  };
  const [poForm, setPoForm] = useState<Partial<PurchaseOrder>>(initialPOState);
  const [editingPOId, setEditingPOId] = useState<number | null>(null);

  // Vendor Handlers
  const handleSaveVendor = () => {
    if (vendorForm.name && vendorForm.contact_email) {
      onAddVendor({
        name: vendorForm.name,
        contact_email: vendorForm.contact_email,
        payment_terms: vendorForm.payment_terms || 'Due on Receipt'
      });
      setIsVendorModalOpen(false);
      setVendorForm({ name: '', contact_email: '', payment_terms: 'Net 30' });
    } else {
        alert("Please fill in Vendor Name and Email");
    }
  };

  // PO Handlers
  const handleOpenAddPO = () => {
    setEditingPOId(null);
    setPoForm(initialPOState);
    setIsPOModalOpen(true);
  };

  const handleOpenEditPO = (po: PurchaseOrder) => {
    setEditingPOId(po.id);
    setPoForm({ ...po });
    setIsPOModalOpen(true);
  };

  const handleSavePO = () => {
    if (poForm.vendor_id && poForm.date && poForm.total_amount !== undefined) {
      if (editingPOId) {
        onUpdatePO({ ...poForm, id: editingPOId } as PurchaseOrder);
      } else {
        onAddPO(poForm as Omit<PurchaseOrder, 'id'>);
      }
      setIsPOModalOpen(false);
      setPoForm(initialPOState);
    } else {
        alert("Please select a Vendor and enter an Amount");
    }
  };

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Purchasing (AP) 💵</h1>
          <p className="text-slate-400 mt-1">Manage vendors and purchase orders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vendors List */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl h-fit">
             <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <Truck size={18} className="text-cyan-400" /> Vendors
                </h3>
                <button 
                    onClick={() => setIsVendorModalOpen(true)}
                    className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                    <Plus size={14} /> New
                </button>
             </div>
             <ul className="divide-y divide-white/5">
                {vendors.map(v => (
                    <li key={v.id} className="px-6 py-5 hover:bg-white/5 transition-colors group flex justify-between items-start">
                        <div>
                            <div className="font-medium text-slate-200">{v.name}</div>
                            <div className="text-xs text-slate-500 mt-1">{v.contact_email}</div>
                            <div className="text-xs text-slate-600 mt-1 bg-black/20 px-2 py-1 rounded w-fit border border-white/5">Terms: {v.payment_terms}</div>
                        </div>
                        <button 
                            onClick={() => onDeleteVendor(v.id)}
                            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-500/10 rounded"
                            title="Delete Vendor"
                        >
                            <Trash2 size={14} />
                        </button>
                    </li>
                ))}
                {vendors.length === 0 && (
                    <li className="px-6 py-8 text-center text-sm text-slate-500">No vendors found. Add one to get started.</li>
                )}
             </ul>
          </div>

           {/* PO List */}
           <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
             <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <FileText size={18} className="text-blue-400" /> Purchase Orders
                </h3>
                <button 
                    onClick={handleOpenAddPO}
                    className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                    <Plus size={14} /> New PO
                </button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-slate-400 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 font-medium">PO #</th>
                            <th className="px-6 py-4 font-medium">Vendor</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium text-right">Amount</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {purchaseOrders.map(po => {
                            const vendor = vendors.find(v => v.id === po.vendor_id);
                            return (
                                <tr key={po.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-slate-500">PO-{po.id}</td>
                                    <td className="px-6 py-4 text-white font-medium">{vendor?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-slate-500">{po.date}</td>
                                    <td className="px-6 py-4 text-slate-200 text-right tabular-nums">
                                        <span className="text-xs text-slate-600 mr-1">Ks</span>
                                        {po.total_amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border
                                            ${po.status === 'Received' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                              po.status === 'Pending' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                              'bg-slate-700/30 text-slate-400 border-white/5'
                                            }`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleOpenEditPO(po)}
                                                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button 
                                                onClick={() => onDeletePO(po.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {purchaseOrders.length === 0 && (
                             <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No purchase orders found.</td></tr>
                        )}
                    </tbody>
                </table>
             </div>
          </div>
      </div>

      {/* --- Vendor Modal --- */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold text-white">Add New Vendor</h2>
                    <button onClick={() => setIsVendorModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Vendor Name</label>
                        <input type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none" 
                            value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} placeholder="e.g. Gold Suppliers Ltd."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Contact Email</label>
                        <input type="email" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none" 
                            value={vendorForm.contact_email} onChange={e => setVendorForm({...vendorForm, contact_email: e.target.value})} placeholder="contact@supplier.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Payment Terms</label>
                        <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none bg-slate-900"
                             value={vendorForm.payment_terms} onChange={e => setVendorForm({...vendorForm, payment_terms: e.target.value})}
                        >
                            <option value="Due on Receipt">Due on Receipt</option>
                            <option value="Net 15">Net 15</option>
                            <option value="Net 30">Net 30</option>
                            <option value="Net 60">Net 60</option>
                        </select>
                    </div>
                </div>
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={() => setIsVendorModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleSaveVendor} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium">Save Vendor</button>
                </div>
            </div>
        </div>
      )}

      {/* --- PO Modal --- */}
      {isPOModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold text-white">{editingPOId ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
                    <button onClick={() => setIsPOModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Vendor</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <select className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none bg-slate-900"
                                value={poForm.vendor_id || ''} onChange={e => setPoForm({...poForm, vendor_id: Number(e.target.value)})}
                            >
                                <option value="" disabled>Select a Vendor...</option>
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Order Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none" 
                                    value={poForm.date} onChange={e => setPoForm({...poForm, date: e.target.value})}
                                />
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                            <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none bg-slate-900"
                                value={poForm.status} onChange={e => setPoForm({...poForm, status: e.target.value as any})}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Received">Received</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Amount (Kyats)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Ks</span>
                            <input type="number" className="w-full pl-9 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none" 
                                value={poForm.total_amount} onChange={e => setPoForm({...poForm, total_amount: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={() => setIsPOModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleSavePO} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-900/20">
                        {editingPOId ? 'Update Order' : 'Create Order'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
