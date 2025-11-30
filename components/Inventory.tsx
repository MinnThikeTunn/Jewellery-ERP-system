import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem, ItemType, ItemStatus } from '../types';
import { Search, Filter, Plus, AlertCircle, CheckCircle, Tag, Pencil, Trash2, X, DollarSign, ArrowUpDown, ChevronDown, RefreshCcw, MapPin } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface InventoryProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (id: number) => void;
  onSellItem: (id: number, quantity: number, salePrice: number) => void;
}

type SortField = 'qty_available' | 'landed_cost' | 'retail_price' | 'none';
type SortOrder = 'asc' | 'desc';

export const Inventory: React.FC<InventoryProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem, onSellItem }) => {
  const location = useLocation();
  
  // -- Filter State --
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  const [filterType, setFilterType] = useState<ItemType | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<ItemStatus | 'All'>('All');
  const [filterLocation, setFilterLocation] = useState<string>('All');

  // -- Sort State --
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // -- Modal State --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // -- Sell Modal State --
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [sellQty, setSellQty] = useState(1);
  const [sellPrice, setSellPrice] = useState(0);

  // Check for navigation state from Dashboard
  useEffect(() => {
    if (location.state && (location.state as any).filter === 'low-stock') {
      setShowLowStockOnly(true);
      setShowFilters(true); // Open panel so user sees why results are filtered
    }
  }, [location]);

  // Derive Unique Locations for Dropdown
  const uniqueLocations = useMemo(() => {
    const locs = new Set(items.map(i => i.location).filter(Boolean));
    return Array.from(locs).sort();
  }, [items]);

  // --- Helper Functions for Translation ---
  const getStatusLabel = (status: ItemStatus) => {
    // Returned to English as requested
    return status;
  };

  const getTypeLabel = (type: ItemType) => {
    switch (type) {
        case ItemType.FINISHED_GOOD: return 'အချောထည်';
        case ItemType.LOOSE_STONE: return 'ကျောက်';
        case ItemType.RAW_MATERIAL: return 'ကုန်ကြမ်း';
        default: return type;
    }
  };


  // --- Main Filter & Sort Logic ---
  const processedItems = useMemo(() => {
    let result = items;

    // 1. Text Search
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(item => 
            item.name.toLowerCase().includes(lowerTerm) ||
            item.name.toLowerCase().includes(lowerTerm) // SKU removed, searching by name twice is redundant but safe
        );
    }

    // 2. Low Stock Toggle
    if (showLowStockOnly) {
        result = result.filter(item => item.qty_available <= item.reorder_point);
    }

    // 3. Dropdown Filters
    if (filterType !== 'All') {
        result = result.filter(item => item.item_type === filterType);
    }
    if (filterStatus !== 'All') {
        result = result.filter(item => item.status === filterStatus);
    }
    if (filterLocation !== 'All') {
        result = result.filter(item => item.location === filterLocation);
    }

    // 4. Sorting
    if (sortField !== 'none') {
        result = [...result].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return result;
  }, [items, searchTerm, showLowStockOnly, filterType, filterStatus, filterLocation, sortField, sortOrder]);


  const resetFilters = () => {
      setSearchTerm('');
      setFilterType('All');
      setFilterStatus('All');
      setFilterLocation('All');
      setSortField('none');
      setShowLowStockOnly(false);
  };

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
    if (formData.name && formData.qty_available !== undefined) {
      if (editingId) {
        onUpdateItem({ ...formData, id: editingId } as InventoryItem);
      } else {
        const item: Omit<InventoryItem, 'id'> = {
            sku: formData.sku || `INV-${Date.now()}`,
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
        alert("Please fill in Name");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ကုန်ပစ္စည်း စာရင်းချုပ် 💎</h1>
          <p className="text-slate-400 mt-1">အချောထည်များနှင့် ကျောက်များကို စီမံခန့်ခွဲရန်</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20 border border-white/10 hover:shadow-cyan-500/30 hover:scale-[1.02] whitespace-nowrap text-sm"
        >
          <Plus size={18} />
          ပစ္စည်းအသစ်ထည့်ရန်
        </button>
      </div>

      {/* --- Search & Toggle Bar --- */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text"
                placeholder="အမည်ဖြင့် ရှာဖွေရန်..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-500 transition-all shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 border rounded-xl transition-all shadow-lg font-medium whitespace-nowrap ${
                    showFilters 
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
            >
            <Filter size={18} />
            စစ်ထုတ်ရန်
            <ChevronDown size={16} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
        </div>

        {/* --- Advanced Filter Panel --- */}
        {showFilters && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Column 1: Filter Dropdowns */}
                    <div className="space-y-4 md:col-span-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">အမျိုးအစားအလိုက် စစ်ထုတ်ရန်</label>
                        
                        <div className="space-y-3">
                            <select 
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as ItemType | 'All')}
                            >
                                <option value="All">All Types</option>
                                {Object.values(ItemType).map(t => <option key={t} value={t}>{getTypeLabel(t)}</option>)}
                            </select>

                            <select 
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as ItemStatus | 'All')}
                            >
                                <option value="All">All Statuses</option>
                                {Object.values(ItemStatus).map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                            </select>

                             <select 
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                value={filterLocation}
                                onChange={(e) => setFilterLocation(e.target.value)}
                            >
                                <option value="All">All Locations</option>
                                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Column 2: Quick Toggles */}
                    <div className="space-y-4 md:col-span-1">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">အမြန်ကြည့်ရန်</label>
                         <button 
                            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm transition-all whitespace-nowrap ${
                                showLowStockOnly 
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                                : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                            <span className="flex items-center gap-2 overflow-hidden text-ellipsis"><AlertCircle size={16}/> ပစ္စည်းပြတ်လပ်မှု</span>
                            {showLowStockOnly && <CheckCircle size={14} />}
                         </button>
                    </div>

                    {/* Column 3: Sorting */}
                    <div className="space-y-4 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">စီရန်</label>
                        <div className="grid grid-cols-2 gap-3">
                             {/* Stock Sort */}
                             <button 
                                onClick={() => { setSortField('qty_available'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
                                className={`px-4 py-2 rounded-lg border text-sm flex items-center justify-between transition-all whitespace-nowrap ${
                                    sortField === 'qty_available' ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/10'
                                }`}
                             >
                                <span className="flex items-center gap-2">လက်ကျန်အရေအတွက်</span>
                                {sortField === 'qty_available' ? (sortOrder === 'asc' ? <ArrowUpDown className="rotate-180" size={14}/> : <ArrowUpDown size={14}/>) : null}
                             </button>

                             {/* Retail Sort */}
                             <button 
                                onClick={() => { setSortField('retail_price'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
                                className={`px-4 py-2 rounded-lg border text-sm flex items-center justify-between transition-all whitespace-nowrap ${
                                    sortField === 'retail_price' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/10'
                                }`}
                             >
                                <span className="flex items-center gap-2">အရောင်းစျေး</span>
                                {sortField === 'retail_price' ? (sortOrder === 'asc' ? <ArrowUpDown className="rotate-180" size={14}/> : <ArrowUpDown size={14}/>) : null}
                             </button>

                             {/* Cost Sort */}
                             <button 
                                onClick={() => { setSortField('landed_cost'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
                                className={`px-4 py-2 rounded-lg border text-sm flex items-center justify-between transition-all whitespace-nowrap ${
                                    sortField === 'landed_cost' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/10'
                                }`}
                             >
                                <span className="flex items-center gap-2">အရင်းစျေး</span>
                                {sortField === 'landed_cost' ? (sortOrder === 'asc' ? <ArrowUpDown className="rotate-180" size={14}/> : <ArrowUpDown size={14}/>) : null}
                             </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <p className="text-xs text-slate-500">
                        ရလဒ် {processedItems.length} ခု ပြသနေပါသည်
                    </p>
                    <button 
                        onClick={resetFilters}
                        className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                    >
                        <RefreshCcw size={12} /> စစ်ထုတ်မှုများအားလုံး ဖျက်မည်
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-5 whitespace-nowrap">အမည်</th>
                <th className="px-6 py-5 whitespace-nowrap">အမျိုးအစား</th>
                <th className="px-6 py-5 whitespace-nowrap">နေရာ</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">လက်ကျန်</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">အရင်း</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">အရောင်း</th>
                <th className="px-6 py-5 whitespace-nowrap">အခြေအနေ</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processedItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-medium text-white">{item.name}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/50 text-slate-300 border border-white/5 whitespace-nowrap">
                      <Tag size={12} />
                      {getTypeLabel(item.item_type)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-400 flex items-center gap-1">
                      {item.location !== 'Unassigned' && <MapPin size={12} className="opacity-50" />}
                      {item.location}
                  </td>
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
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap
                      ${item.status === ItemStatus.IN_STOCK ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        item.status === ItemStatus.RESERVED ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-slate-700/30 text-slate-400 border-white/5'}`}>
                      {item.status === ItemStatus.IN_STOCK ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {getStatusLabel(item.status)}
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
        {processedItems.length === 0 && (
          <div className="p-12 text-center text-slate-500">
             <div className="flex justify-center mb-4">
                 <Filter size={48} className="text-slate-700" />
             </div>
             <p className="text-lg font-medium text-slate-400">မည်သည့်ပစ္စည်းမျှ မတွေ့ပါ</p>
             <p className="text-sm">စစ်ထုတ်မှု သို့မဟုတ် ရှာဖွေမှုစကားလုံးများကို ပြင်ဆင်ကြည့်ပါ</p>
             <button onClick={resetFilters} className="mt-4 text-cyan-400 hover:underline">စစ်ထုတ်မှုများအားလုံး ဖျက်မည်</button>
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-lg font-bold text-white">{editingId ? 'ကုန်ပစ္စည်းပြင်ဆင်ရန်' : 'ကုန်ပစ္စည်းအသစ်ထည့်ရန်'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">အမျိုးအစား</label>
                  <select 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none"
                    value={formData.item_type}
                    onChange={e => setFormData({...formData, item_type: e.target.value as ItemType})}
                  >
                    {Object.values(ItemType).map(t => <option key={t} value={t} className="bg-slate-900">{getTypeLabel(t)}</option>)}
                  </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">ပစ္စည်းအမည်</label>
                <input 
                  type="text" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                 <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">အရေအတွက်</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                    value={formData.qty_available}
                    onChange={e => {
                        const val = Number(e.target.value);
                        setFormData(prev => ({
                            ...prev, 
                            qty_available: val,
                            status: val === 0 ? ItemStatus.SOLD : (prev.status === ItemStatus.SOLD ? ItemStatus.IN_STOCK : prev.status)
                        }))
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">အရင်းစျေး (Ks)</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                    value={formData.landed_cost}
                    onChange={e => setFormData({...formData, landed_cost: Number(e.target.value)})}
                  />
                </div>
                 <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">အရောင်းစျေး (Ks)</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                    value={formData.retail_price}
                    onChange={e => setFormData({...formData, retail_price: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">နေရာ</label>
                    <input 
                        type="text" 
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                        value={formData.location || ''}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">သတိပေးချက်အမှတ်</label>
                    <input 
                        type="number" 
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                        value={formData.reorder_point}
                        onChange={e => setFormData({...formData, reorder_point: Number(e.target.value)})}
                    />
                 </div>
              </div>
              
               <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">အခြေအနေ</label>
                    <select 
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as ItemStatus})}
                    >
                        {Object.values(ItemStatus).map(s => <option key={s} value={s} className="bg-slate-900">{getStatusLabel(s)}</option>)}
                    </select>
                 </div>
            </div>
            <div className="px-6 py-5 bg-white/5 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors whitespace-nowrap">မလုပ်တော့ပါ</button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 border border-white/10 transition-all flex items-center gap-2 whitespace-nowrap">
                {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                {editingId ? 'ပြင်ဆင်မည်' : 'သိမ်းဆည်းမည်'}
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
                        <h2 className="text-lg font-bold text-white">အရောင်းမှတ်တမ်းတင်ရန်</h2>
                        <p className="text-xs text-slate-400">{sellingItem.name}</p>
                    </div>
                    <button onClick={() => setIsSellModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                     <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex gap-3">
                        <DollarSign className="text-emerald-400 shrink-0" />
                        <p className="text-sm text-emerald-200">အရောင်းမှတ်တမ်းတင်ခြင်းသည် စာရင်းမှ ပစ္စည်းကို လျှော့ချပြီး <b>ဝင်ငွေ</b> နှင့် <b>COGS</b> ကို စာရင်းချုပ်တွင် ထည့်သွင်းပေးမည်ဖြစ်သည်။</p>
                     </div>

                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">ရောင်းရသည့် အရေအတွက်</label>
                        <input 
                            type="number" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:outline-none"
                            value={sellQty}
                            max={sellingItem.qty_available}
                            min={1}
                            onChange={(e) => setSellQty(Number(e.target.value))}
                        />
                        <p className="text-xs text-right text-slate-500 mt-1">လက်ကျန်: {sellingItem.qty_available}</p>
                     </div>

                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">ရောင်းစျေး (Ks)</label>
                        <input 
                            type="number" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 focus:outline-none"
                            value={sellPrice}
                            onChange={(e) => setSellPrice(Number(e.target.value))}
                        />
                     </div>

                     <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                        <span className="text-slate-400 text-sm">စုစုပေါင်း ဝင်ငွေ:</span>
                        <span className="text-xl font-bold text-emerald-400 tabular-nums">Ks {(sellQty * sellPrice).toLocaleString()}</span>
                     </div>
                </div>
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={() => setIsSellModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors whitespace-nowrap">မလုပ်တော့ပါ</button>
                    <button onClick={handleConfirmSell} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/20 whitespace-nowrap">
                         <CheckCircle size={18} /> အရောင်းအတည်ပြုမည်
                    </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};