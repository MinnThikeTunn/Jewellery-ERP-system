
import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemType, ItemStatus } from '../types';
import { Search, Filter, Plus, AlertCircle, CheckCircle, Tag, Pencil, Trash2, X, DollarSign } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface InventoryProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (id: number) => void;
  onSellItem: (id: number, quantity: number, salePrice: number) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem, onSellItem }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  // Sell Modal State
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [sellQty, setSellQty] = useState(1);
  const [sellPrice, setSellPrice] = useState(0);

  // Check for navigation state from Dashboard
  useEffect(() => {
    if (location.state && (location.state as any).filter === 'low-stock') {
      setShowLowStockOnly(true);
    }
  }, [location]);
  
  // Filter Logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = showLowStockOnly ? item.qty_available <= item.reorder_point : true;
    return matchesSearch && matchesStock;
  });

  // Form State
  const initialFormState: Partial<InventoryItem> = {
    item_type: ItemType.FINISHED_GOOD,
    status: ItemStatus.IN_STOCK,
    qty_available: 0,
    landed_cost: 0,
    retail_price: 0,
    reorder_point: 0
  };

  const [formData, setFormData] = useState<Partial<InventoryItem>>(initialFormState);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleOpenSell = (item: InventoryItem) => {
    setSellingItem(item);
    setSellQty(1);
    setSellPrice(item.retail_price);
    setIsSellModalOpen(true);
  };

  const handleConfirmSell = () => {
    if (sellingItem && sellQty > 0 && sellPrice >= 0) {
        if (sellQty > sellingItem.qty_available) {
            alert("Cannot sell more than available stock!");
            return;
        }
        onSellItem(sellingItem.id, sellQty, sellPrice);
        setIsSellModalOpen(false);
        setSellingItem(null);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        onDeleteItem(id);
    }
  };

  const handleSave = () => {
    if (formData.sku && formData.name && formData.qty_available !== undefined) {
      if (editingId) {
        // Update existing
        onUpdateItem({
            ...formData,
            id: editingId
        } as InventoryItem);
      } else {
        // Add new
        const item: Omit<InventoryItem, 'id'> = {
            sku: formData.sku,
            name: formData.name,
            item_type: formData.item_type || ItemType.FINISHED_GOOD,
            status: formData.status || ItemStatus.IN_STOCK,
            location: formData.location || 'Unassigned',
            qty_available: Number(formData.qty_available),
            landed_cost: Number(formData.landed_cost || 0),
            retail_price: Number(formData.retail_price || 0),
            reorder_point: Number(formData.reorder_point || 0)
        };
        onAddItem(item);
      }
      setIsModalOpen(false);
      setFormData(initialFormState);
    } else {
        alert("Please fill in at least SKU and Name");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Master Stock Ledger 💎</h1>
          <p className="text-slate-400 mt-1">Manage your finished goods and loose stones.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20 border border-white/10 hover:shadow-cyan-500/30 hover:scale-[1.02]"
        >
          <Plus size={18} />
          Add New Item
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by SKU or Name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-2 px-6 py-2.5 border rounded-xl transition-colors ${showLowStockOnly ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-900/50 border-white/10 text-slate-300 hover:bg-white/10'}`}
        >
          <Filter size={18} />
          {showLowStockOnly ? 'Show All Items' : 'Filter Low Stock'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-5">SKU / Name</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5 text-right">Stock</th>
                <th className="px-6 py-5 text-right">Cost</th>
                <th className="px-6 py-5 text-right">Retail</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-medium text-white">{item.sku}</div>
                    <div className="text-slate-500">{item.name}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/50 text-slate-300 border border-white/5">
                      <Tag size={12} />
                      {item.item_type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-400">{item.location}</td>
                  <td className="px-6 py-5 text-right font-medium">
                    <span className={`flex items-center justify-end gap-1 ${item.qty_available <= item.reorder_point ? "text-red-400" : "text-slate-200"}`}>
                      {item.qty_available <= item.reorder_point && <AlertCircle size={14} />}
                      {item.qty_available}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right text-slate-300 tabular-nums">
                     <span className="text-xs text-slate-500 mr-1">Ks</span>
                     {item.landed_cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-right text-white font-medium tabular-nums">
                    <span className="text-xs text-slate-500 mr-1">Ks</span>
                    {item.retail_price.toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                      ${item.status === ItemStatus.IN_STOCK ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        item.status === ItemStatus.RESERVED ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-slate-700/30 text-slate-400 border-white/5'}`}>
                      {item.status === ItemStatus.IN_STOCK ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleOpenSell(item)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1"
                            title="Sell Item"
                        >
                            <DollarSign size={16} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                            title="Edit Item"
                        >
                            <Pencil size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Item"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            {showLowStockOnly ? 'No low stock items found.' : 'No items found matching your search.'}
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">SKU</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                    value={formData.sku || ''}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    placeholder="e.g. RG-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                  <select 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none"
                    value={formData.item_type}
                    onChange={e => setFormData({...formData, item_type: e.target.value as ItemType})}
                  >
                    {Object.values(ItemType).map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Item Name</label>
                <input 
                  type="text" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-5">
                 <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Qty</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                    value={formData.qty_available}
                    onChange={e => setFormData({...formData, qty_available: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Landed Cost (Ks)</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                    value={formData.landed_cost}
                    onChange={e => setFormData({...formData, landed_cost: Number(e.target.value)})}
                  />
                </div>
                 <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Retail Price (Ks)</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                    value={formData.retail_price}
                    onChange={e => setFormData({...formData, retail_price: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Location</label>
                    <input 
                        type="text" 
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                        value={formData.location || ''}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Reorder Point (Alert)</label>
                    <input 
                        type="number" 
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                        value={formData.reorder_point}
                        onChange={e => setFormData({...formData, reorder_point: Number(e.target.value)})}
                    />
                 </div>
              </div>
              
               <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                    <select 
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as ItemStatus})}
                    >
                        {Object.values(ItemStatus).map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                    </select>
                 </div>
            </div>
            <div className="px-6 py-5 bg-white/5 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 border border-white/10 transition-all flex items-center gap-2">
                {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                {editingId ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Sell Item Modal --- */}
      {isSellModalOpen && sellingItem && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-lg font-bold text-white">Record Sale</h2>
                        <p className="text-xs text-slate-400">{sellingItem.sku} - {sellingItem.name}</p>
                    </div>
                    <button onClick={() => setIsSellModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                     <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex gap-3">
                        <DollarSign className="text-emerald-400 shrink-0" />
                        <p className="text-sm text-emerald-200">Recording a sale will deduct inventory and create <b>Revenue</b> & <b>COGS</b> entries in the General Ledger.</p>
                     </div>

                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Quantity Sold</label>
                        <input 
                            type="number" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:outline-none"
                            value={sellQty}
                            max={sellingItem.qty_available}
                            min={1}
                            onChange={(e) => setSellQty(Number(e.target.value))}
                        />
                        <p className="text-xs text-right text-slate-500 mt-1">Available: {sellingItem.qty_available}</p>
                     </div>

                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Unit Sale Price (Kyats)</label>
                        <input 
                            type="number" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:outline-none"
                            value={sellPrice}
                            onChange={(e) => setSellPrice(Number(e.target.value))}
                        />
                     </div>

                     <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Total Revenue:</span>
                        <span className="text-xl font-bold text-emerald-400 tabular-nums">Ks {(sellQty * sellPrice).toLocaleString()}</span>
                     </div>
                </div>
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={() => setIsSellModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleConfirmSell} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                         <CheckCircle size={18} /> Confirm Sale
                    </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};
