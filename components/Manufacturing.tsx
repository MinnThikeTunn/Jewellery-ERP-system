import React, { useState } from 'react';
import { RawMaterial, UnitOfMeasure, InventoryItem, ItemType, ItemStatus } from '../types';
import { Hammer, Layers, ArrowRight } from 'lucide-react';

interface ManufacturingProps {
  rawMaterials: RawMaterial[];
  onCreateJob: (materialId: number, amountUsed: number, newItem: Omit<InventoryItem, 'id'>) => void;
}

export const Manufacturing: React.FC<ManufacturingProps> = ({ rawMaterials, onCreateJob }) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'job'>('job');
  const [selectedMaterialId, setSelectedMaterialId] = useState<number>(rawMaterials[0]?.id || 0);
  const [usageAmount, setUsageAmount] = useState<number>(0);
  const [laborCost, setLaborCost] = useState<number>(0);
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductName, setNewProductName] = useState('');

  // Ensure selectedMaterialId is valid if rawMaterials loads late
  React.useEffect(() => {
    if (selectedMaterialId === 0 && rawMaterials.length > 0) {
      setSelectedMaterialId(rawMaterials[0].id);
    }
  }, [rawMaterials, selectedMaterialId]);

  // Calculation for the "Job"
  const selectedMaterial = rawMaterials.find(m => m.id === Number(selectedMaterialId));
  const materialCost = selectedMaterial ? selectedMaterial.cost_per_unit * usageAmount : 0;
  const totalCost = materialCost + Number(laborCost);

  const handleCreateJob = () => {
    if (selectedMaterial && usageAmount > 0) {
        // Create Finished Good Object (ID will be assigned by DB)
        const newItem: Omit<InventoryItem, 'id'> = {
            sku: newProductSku || `MFG-${Date.now()}`,
            name: newProductName || 'Custom Job',
            item_type: ItemType.FINISHED_GOOD,
            status: ItemStatus.IN_STOCK,
            location: 'Manufacturing Output',
            qty_available: 1,
            landed_cost: totalCost,
            retail_price: totalCost * 1.5, // Auto markup logic 1.5x
            reorder_point: 0
        };

        // Trigger parent handler for atomic update
        onCreateJob(selectedMaterial.id, usageAmount, newItem);
        
        // Reset form
        setUsageAmount(0);
        setLaborCost(0);
        setNewProductSku('');
        setNewProductName('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            ထုတ်လုပ်မှုနှင့် ကုန်ကျစရိတ်တွက်ချက်ခြင်း 🛠️
          </h1>
          <p className="text-slate-400 mt-1">ကုန်ကြမ်းများနှင့် ထုတ်လုပ်မှုလုပ်ငန်းစဉ်များကို စီမံခန့်ခွဲရန်</p>
        </div>
      </div>

      {/* Glass Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-fit">
        <button 
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'materials' 
                ? 'bg-slate-800 text-cyan-400 shadow-lg border border-white/5' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('materials')}
        >
            ကုန်ကြမ်းပစ္စည်း စာရင်း
        </button>
        <button 
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'job' 
                ? 'bg-slate-800 text-cyan-400 shadow-lg border border-white/5' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('job')}
        >
            ထုတ်လုပ်မှုအသစ်စရန်
        </button>
      </div>

      {activeTab === 'materials' ? (
         <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl animate-in fade-in duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
                    <tr>
                        <th className="px-6 py-5 whitespace-nowrap">ကုန်ကြမ်းအမည်</th>
                        <th className="px-6 py-5 whitespace-nowrap">ယူနစ်</th>
                        <th className="px-6 py-5 text-right whitespace-nowrap">လက်ရှိစာရင်း</th>
                        <th className="px-6 py-5 text-right whitespace-nowrap">တစ်ယူနစ်ကျသင့်ငွေ</th>
                        <th className="px-6 py-5 text-right whitespace-nowrap">စုစုပေါင်းတန်ဖိုး</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                    {rawMaterials.map((mat) => (
                        <tr key={mat.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5 font-medium text-white">{mat.name}</td>
                        <td className="px-6 py-5 text-slate-500">{mat.unit_of_measure}</td>
                        <td className="px-6 py-5 text-right font-mono text-slate-300">{mat.current_stock}</td>
                        <td className="px-6 py-5 text-right text-slate-400 tabular-nums">
                            <span className="text-xs text-slate-600 mr-1">Ks</span>
                            {mat.cost_per_unit.toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-right font-medium text-white tabular-nums">
                            <span className="text-xs text-slate-600 mr-1">Ks</span>
                            {(mat.current_stock * mat.cost_per_unit).toLocaleString()}
                        </td>
                        </tr>
                    ))}
                    {rawMaterials.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">ကုန်ကြမ်းပစ္စည်းများ မရှိပါ</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
            {/* Job Form */}
            <div className="bg-slate-950/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
                <h3 className="text-lg font-semibold text-amber-400 mb-6 flex items-center gap-2">
                    <Hammer size={20} />
                    ထုတ်လုပ်မှုအတွက် လိုအပ်ချက်များ
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">ကုန်ကြမ်းရွေးချယ်ရန်</label>
                        <div className="relative">
                            <select 
                                className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none transition-all hover:border-slate-600"
                                value={selectedMaterialId}
                                onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
                            >
                                {rawMaterials.map(m => (
                                    <option key={m.id} value={m.id} className="bg-slate-900">
                                        {m.name} (Stock: {m.current_stock} {m.unit_of_measure})
                                    </option>
                                ))}
                                {rawMaterials.length === 0 && <option disabled>No materials available</option>}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                ▼
                            </div>
                        </div>
                         {selectedMaterial && (
                            <div className="mt-2 text-xs text-cyan-400/80 font-mono px-1">
                                Cost: Ks {selectedMaterial.cost_per_unit.toLocaleString()} / {selectedMaterial.unit_of_measure}
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">သုံးစွဲသည့် ပမာဏ</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                                placeholder="0.00"
                                value={usageAmount}
                                onChange={(e) => setUsageAmount(Number(e.target.value))} 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">လက်ခ (Ks)</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                                placeholder="0"
                                value={laborCost}
                                onChange={(e) => setLaborCost(Number(e.target.value))} 
                            />
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6 mt-2">
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            ထုတ်ကုန် အသေးစိတ်
                        </h4>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">ထုတ်ကုန်အမည်</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                                    placeholder="e.g. Custom Gold Ring"
                                    value={newProductName}
                                    onChange={(e) => setNewProductName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost Preview Card */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Layers size={120} className="text-white" />
                     </div>
                     
                     <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 relative z-10">
                        <Layers size={20} className="text-blue-400" />
                        ကုန်ကျစရိတ် အနှစ်ချုပ်
                    </h3>
                    
                    <div className="space-y-4 text-sm relative z-10">
                        <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                            <span className="text-slate-400">ကုန်ကြမ်းတန်ဖိုး ({selectedMaterial?.unit_of_measure})</span>
                            <span className="font-mono text-slate-200">Ks {materialCost.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                            <span className="text-slate-400">လက်ခ</span>
                            <span className="font-mono text-slate-200">Ks {laborCost.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>
                        <div className="flex justify-between text-xl font-bold text-white items-center pt-2">
                            <span>စုစုပေါင်း ကုန်ကျစရိတ်</span>
                            <span className="tabular-nums text-emerald-400 drop-shadow-sm">Ks {totalCost.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-right text-slate-500">
                            ခန့်မှန်းရောင်းစျေး: Ks {(totalCost * 1.5).toLocaleString()}
                        </div>
                    </div>

                    <button 
                        onClick={handleCreateJob}
                        disabled={totalCost === 0 || !newProductName}
                        className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-semibold shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 relative z-10 whitespace-nowrap"
                    >
                        ထုတ်လုပ်မှု ပြီးစီးကြောင်း မှတ်သားမည် <ArrowRight size={18} />
                    </button>
                </div>
                
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 text-sm text-blue-300/80 flex gap-3">
                    <div className="mt-1"><Hammer size={16} /></div>
                    <p>ဤလုပ်ဆောင်ချက်သည် သင့်ကုန်ကြမ်းစာရင်းမှ <strong>{usageAmount} {selectedMaterial?.unit_of_measure}</strong> ကို နှုတ်ယူမည်ဖြစ်ပြီး တွက်ချက်ထားသော ကုန်ကျစရိတ်ဖြင့် <strong>အချောထည်</strong> အသစ်တစ်ခုကို ကုန်ပစ္စည်းစာရင်းတွင် ထည့်သွင်းမည်ဖြစ်သည်။</p>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};