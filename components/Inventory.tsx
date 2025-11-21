import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemType, ItemStatus } from '../types';
import { Search, Filter, Plus, AlertCircle, CheckCircle, Tag, Pencil, Trash2, X } from 'lucide-react';

interface InventoryProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (id: number) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Filter Logic
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Stock Ledger 💎</h1>
          <p className="text-slate-500">Manage your finished goods and loose stones.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add New Item
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by SKU or Name..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">SKU / Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Stock</th>
                <th className="px-6 py-4 text-right">Cost</th>
                <th className="px-6 py-4 text-right">Retail</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.sku}</div>
                    <div className="text-slate-500">{item.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      <Tag size={12} />
                      {item.item_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.location}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    <span className={`flex items-center justify-end gap-1 ${item.qty_available <= item.reorder_point ? "text-red-600" : "text-slate-900"}`}>
                      {item.qty_available <= item.reorder_point && <AlertCircle size={14} />}
                      {item.qty_available}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">${item.landed_cost.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-slate-900 font-medium">${item.retail_price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${item.status === ItemStatus.IN_STOCK ? 'bg-emerald-100 text-emerald-700' : 
                        item.status === ItemStatus.RESERVED ? 'bg-amber-100 text-amber-700' : 
                        'bg-slate-100 text-slate-600'}`}>
                      {item.status === ItemStatus.IN_STOCK ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Item"
                        >
                            <Pencil size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="p-8 text-center text-slate-500">
            No items found matching your search.
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">SKU</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-shadow"
                    value={formData.sku || ''}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    placeholder="e.g. RG-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                  <select 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    value={formData.item_type}
                    onChange={e => setFormData({...formData, item_type: e.target.value as ItemType})}
                  >
                    {Object.values(ItemType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Item Name</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Qty</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={formData.qty_available}
                    onChange={e => setFormData({...formData, qty_available: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Landed Cost</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={formData.landed_cost}
                    onChange={e => setFormData({...formData, landed_cost: Number(e.target.value)})}
                  />
                </div>
                 <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Retail Price</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={formData.retail_price}
                    onChange={e => setFormData({...formData, retail_price: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                    <input 
                        type="text" 
                        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        value={formData.location || ''}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                    <select 
                        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as ItemStatus})}
                    >
                        {Object.values(ItemStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-sm transition-all hover:shadow flex items-center gap-2">
                {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                {editingId ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};