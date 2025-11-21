import React, { useState } from 'react';
import { InventoryItem, ItemType, ItemStatus } from '../types';
import { Search, Filter, Plus, AlertCircle, CheckCircle, Tag } from 'lucide-react';

interface InventoryProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ items, onAddItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filter Logic
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock Form State
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    item_type: ItemType.FINISHED_GOOD,
    status: ItemStatus.IN_STOCK
  });

  const handleSave = () => {
    if (newItem.sku && newItem.name && newItem.qty_available !== undefined) {
      const item: Omit<InventoryItem, 'id'> = {
        sku: newItem.sku,
        name: newItem.name,
        item_type: newItem.item_type || ItemType.FINISHED_GOOD,
        status: newItem.status || ItemStatus.IN_STOCK,
        location: newItem.location || 'Unassigned',
        qty_available: Number(newItem.qty_available),
        landed_cost: Number(newItem.landed_cost || 0),
        retail_price: Number(newItem.retail_price || 0),
        reorder_point: Number(newItem.reorder_point || 0)
      };
      onAddItem(item);
      setShowAddModal(false);
      setNewItem({ item_type: ItemType.FINISHED_GOOD, status: ItemStatus.IN_STOCK });
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
          onClick={() => setShowAddModal(true)}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
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
                    <span className={item.qty_available <= item.reorder_point ? "text-red-600 flex items-center justify-end gap-1" : "text-slate-900"}>
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

      {/* Add Item Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Add Inventory Item</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">SKU</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={newItem.sku || ''}
                    onChange={e => setNewItem({...newItem, sku: e.target.value})}
                    placeholder="e.g. RG-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                  <select 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={newItem.item_type}
                    onChange={e => setNewItem({...newItem, item_type: e.target.value as ItemType})}
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
                  value={newItem.name || ''}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Qty</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={newItem.qty_available || ''}
                    onChange={e => setNewItem({...newItem, qty_available: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Landed Cost</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={newItem.landed_cost || ''}
                    onChange={e => setNewItem({...newItem, landed_cost: Number(e.target.value)})}
                  />
                </div>
                 <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Retail Price</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={newItem.retail_price || ''}
                    onChange={e => setNewItem({...newItem, retail_price: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={newItem.location || ''}
                    onChange={e => setNewItem({...newItem, location: e.target.value})}
                  />
                </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};