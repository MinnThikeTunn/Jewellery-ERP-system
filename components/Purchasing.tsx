import React, { useState } from 'react';
import { Vendor, PurchaseOrder, InventoryItem, RawMaterial, ItemType, ReceiveData } from '../types';
import { Truck, FileText, Plus, Trash2, X, Pencil, Calendar, DollarSign, User, PackageCheck, Box } from 'lucide-react';

interface PurchasingProps {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  rawMaterials: RawMaterial[];
  inventoryItems: InventoryItem[];
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
  onDeleteVendor: (id: number) => void;
  onAddPO: (po: Omit<PurchaseOrder, 'id'>) => void;
  onUpdatePO: (po: PurchaseOrder) => void;
  onDeletePO: (id: number) => void;
  onReceivePO: (poId: number, data: ReceiveData) => void;
}

export const Purchasing: React.FC<PurchasingProps> = ({ 
  vendors, 
  purchaseOrders,
  rawMaterials,
  inventoryItems,
  onAddVendor,
  onDeleteVendor,
  onAddPO,
  onUpdatePO,
  onDeletePO,
  onReceivePO
}) => {
  // Modal State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  
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

  // Form State - Receive
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [receiveForm, setReceiveForm] = useState<Partial<ReceiveData>>({
    target: 'raw_material',
    itemId: 'new',
    quantity: 1,
    newItemName: '',
    location: 'Vault'
  });

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

  // Receive Handlers
  const handleOpenReceive = (po: PurchaseOrder) => {
    setReceivingPO(po);
    setReceiveForm({
        target: 'raw_material',
        itemId: 'new',
        quantity: 1,
        newItemName: `Items from PO #${po.id}`,
        newItemSku: `PO${po.id}-ITEM`,
        newItemType: ItemType.RAW_MATERIAL,
        location: 'Main Vault'
    });
    setIsReceiveModalOpen(true);
  };

  const handleSubmitReceive = () => {
    if (!receivingPO || !receiveForm.quantity || !receiveForm.itemId) return;
    if (receiveForm.itemId === 'new' && !receiveForm.newItemName) {
        alert("Please enter a name for the new item.");
        return;
    }

    onReceivePO(receivingPO.id, receiveForm as ReceiveData);
    setIsReceiveModalOpen(false);
    setReceivingPO(null);
  };

  const getStatusLabel = (status: string) => {
      switch (status) {
          case 'Pending': return 'ဆိုင်းငံ့';
          case 'Received': return 'လက်ခံရရှိပြီး';
          case 'Paid': return 'ငွေချေပြီး';
          default: return status;
      }
  };

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ဝယ်ယူရေး (AP) 💵</h1>
          <p className="text-slate-400 mt-1">ရောင်းချသူများနှင့် အဝယ်အော်ဒါများကို စီမံခန့်ခွဲရန်</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vendors List */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl h-fit">
             <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <Truck size={18} className="text-cyan-400" /> ရောင်းချသူများ
                </h3>
                <button 
                    onClick={() => setIsVendorModalOpen(true)}
                    className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                    <Plus size={14} /> အသစ်
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
                    <li className="px-6 py-8 text-center text-sm text-slate-500">ရောင်းချသူစာရင်း မရှိပါ</li>
                )}
             </ul>
          </div>

           {/* PO List */}
           <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
             <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <FileText size={18} className="text-blue-400" /> အဝယ်အော်ဒါများ
                </h3>
                <button 
                    onClick={handleOpenAddPO}
                    className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                    <Plus size={14} /> အော်ဒါအသစ်
                </button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-slate-400 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 font-medium">အော်ဒါနံပါတ်</th>
                            <th className="px-6 py-4 font-medium">ရောင်းချသူ</th>
                            <th className="px-6 py-4 font-medium">နေ့စွဲ</th>
                            <th className="px-6 py-4 font-medium text-right">ပမာဏ</th>
                            <th className="px-6 py-4 font-medium">အခြေအနေ</th>
                            <th className="px-6 py-4 font-medium text-right">လုပ်ဆောင်ချက်</th>
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
                                            {getStatusLabel(po.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {po.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleOpenReceive(po)}
                                                    className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs border border-emerald-500/20 transition-colors mr-2"
                                                    title="Receive Goods"
                                                >
                                                    <PackageCheck size={14} /> လက်ခံရရှိ
                                                </button>
                                            )}
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {purchaseOrders.length === 0 && (
                             <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">အဝယ်အော်ဒါများ မရှိပါ</td></tr>
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
                    <h2 className="text-lg font-bold text-white">ရောင်းချသူအသစ်ထည့်ရန်</h2>
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
                    <h2 className="text-lg font-bold text-white">{editingPOId ? 'အဝယ်အော်ဒါ ပြင်ဆင်ရန်' : 'အဝယ်အော်ဒါ ဖွင့်ရန်'}</h2>
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

      {/* --- RECEIVE GOODS MODAL --- */}
      {isReceiveModalOpen && receivingPO && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                 <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-lg font-bold text-white">အော်ဒါလက်ခံရန် PO #{receivingPO.id}</h2>
                        <p className="text-xs text-slate-400">Total Value: Ks {receivingPO.total_amount.toLocaleString()}</p>
                    </div>
                    <button onClick={() => setIsReceiveModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-5">
                     <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3">
                        <Box className="text-blue-400 shrink-0" />
                        <p className="text-sm text-blue-200">This will update the status to <b>Received</b>, add items to your <b>Stock</b>, and create a <b>General Ledger</b> entry automatically.</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-medium text-slate-400 mb-1.5">Destination</label>
                             <select 
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none bg-slate-900"
                                value={receiveForm.target}
                                onChange={(e) => setReceiveForm({...receiveForm, target: e.target.value as 'raw_material' | 'inventory'})}
                             >
                                 <option value="raw_material">Raw Materials (ကုန်ကြမ်း)</option>
                                 <option value="inventory">Finished Inventory (အချောထည်)</option>
                             </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Item</label>
                             <select 
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none bg-slate-900"
                                value={receiveForm.itemId}
                                onChange={(e) => setReceiveForm({...receiveForm, itemId: e.target.value === 'new' ? 'new' : Number(e.target.value)})}
                             >
                                 <option value="new">+ Create New Item (ပစ္စည်းအသစ်ဖန်တီးရန်)</option>
                                 {receiveForm.target === 'raw_material' 
                                    ? rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)
                                    : inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)
                                 }
                             </select>
                        </div>
                     </div>

                     {/* Dynamic Fields based on Selection */}
                     {receiveForm.itemId === 'new' && (
                        <div className="space-y-4 border-l-2 border-cyan-500/30 pl-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">New Item Name (ပစ္စည်းအမည်သစ်)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:outline-none"
                                    value={receiveForm.newItemName}
                                    onChange={(e) => setReceiveForm({...receiveForm, newItemName: e.target.value})}
                                    placeholder="e.g. 24k Gold Bar"
                                />
                            </div>
                            {receiveForm.target === 'inventory' && (
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">SKU</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:outline-none"
                                            value={receiveForm.newItemSku}
                                            onChange={(e) => setReceiveForm({...receiveForm, newItemSku: e.target.value})}
                                            placeholder="SKU-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                                        <select 
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:outline-none bg-slate-900"
                                            value={receiveForm.newItemType}
                                            onChange={(e) => setReceiveForm({...receiveForm, newItemType: e.target.value as any})}
                                        >
                                            <option value={ItemType.FINISHED_GOOD}>Finished Good</option>
                                            <option value={ItemType.LOOSE_STONE}>Loose Stone</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Quantity Received</label>
                            <input 
                                type="number" 
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:outline-none"
                                value={receiveForm.quantity}
                                onChange={(e) => setReceiveForm({...receiveForm, quantity: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-medium text-slate-400 mb-1.5">Cost Per Unit (Calc)</label>
                             <div className="px-4 py-2.5 bg-white/5 rounded-xl text-slate-300 border border-white/5 tabular-nums text-sm">
                                Ks {((receivingPO.total_amount) / (receiveForm.quantity || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                             </div>
                        </div>
                     </div>
                </div>
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={() => setIsReceiveModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleSubmitReceive} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                         <PackageCheck size={18} /> Confirm Receipt
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};