
import React, { useState } from 'react';
import { RawMaterial, UnitOfMeasure, InventoryItem, ItemType, ItemStatus } from '../types';
import { Hammer, Layers, ArrowRight } from 'lucide-react';

interface ManufacturingProps {
  rawMaterials: RawMaterial[];
  onCreateJob: (materialId: number, amountUsed: number, newItem: Omit<InventoryItem, 'id'>) => void;
}

export const Manufacturing: React.FC<ManufacturingProps> = ({ rawMaterials, onCreateJob }) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'job'>('materials');
  const [selectedMaterialId, setSelectedMaterialId] = useState<number>(rawMaterials[0]?.id);
  const [usageAmount, setUsageAmount] = useState<number>(0);
  const [laborCost, setLaborCost] = useState<number>(0);
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductName, setNewProductName] = useState('');

  // Calculation for the "Job"
  const selectedMaterial = rawMaterials.find(m => m.id === Number(selectedMaterialId));
  const materialCost = selectedMaterial ? selectedMaterial.cost_per_unit * usageAmount : 0;
  const totalCost = materialCost + Number(laborCost);

  const handleCreateJob = () => {
    if (selectedMaterial && usageAmount > 0 && newProductSku) {
        // Create Finished Good Object (ID will be assigned by DB)
        const newItem: Omit<InventoryItem, 'id'> = {
            sku: newProductSku,
            name: newProductName || 'Custom Job',
            item_type: ItemType.FINISHED_GOOD,
            status: ItemStatus.IN_STOCK,
            location: 'Manufacturing Output',
            qty_available: 1,
            landed_cost: totalCost,
            retail_price: totalCost * 2.5, // Auto markup logic
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Manufacturing & Costing 🛠️</h1>
          <p className="text-slate-400 mt-1">Manage raw materials and production jobs.</p>
        </div>
      </div>

      {/* Glass Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-fit">
        <button 
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'materials' 
                ? 'bg-slate-800 text-cyan-400 shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('materials')}
        >
            Raw Materials Ledger
        </button>
        <button 
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'job' 
                ? 'bg-slate-800 text-cyan-400 shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('job')}
        >
            New Production Job
        </button>
      </div>

      {activeTab === 'materials' ? (
         <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
                <tr>
                    <th className="px-6 py-5">Material Name</th>
                    <th className="px-6 py-5">Unit</th>
                    <th className="px-6 py-5 text-right">Current Stock</th>
                    <th className="px-6 py-5 text-right">Cost/Unit</th>
                    <th className="px-6 py-5 text-right">Total Value</th>
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
                </tbody>
            </table>
        </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Form */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Hammer size={20} className="text-amber-400" />
                    Production Inputs
                </h3>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Select Raw Material</label>
                        <select 
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none appearance-none"
                            value={selectedMaterialId}
                            onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
                        >
                            {rawMaterials.map(m => (
                                <option key={m.id} value={m.id} className="bg-slate-900">{m.name} (Ks {m.cost_per_unit.toLocaleString()}/{m.unit_of_measure})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Quantity Used</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                                value={usageAmount}
                                onChange={(e) => setUsageAmount(Number(e.target.value))} 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Labor Cost (Ks)</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                                value={laborCost}
                                onChange={(e) => setLaborCost(Number(e.target.value))} 
                            />
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6 mt-2">
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Output Product Name</label>
                        <input 
                            type="text"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none mb-4 transition-all"
                            placeholder="e.g. Custom Gold Ring"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                        />
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">New SKU</label>
                        <input 
                            type="text"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all"
                            placeholder="e.g. CUST-001"
                            value={newProductSku}
                            onChange={(e) => setNewProductSku(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Cost Preview Card */}
            <div className="bg-slate-800/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 h-fit shadow-xl">
                 <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Layers size={20} className="text-blue-400" />
                    Cost Summary
                </h3>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="text-slate-400">Material Cost</span>
                        <span className="font-medium tabular-nums text-slate-200">Ks {materialCost.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="text-slate-400">Labor Cost</span>
                        <span className="font-medium tabular-nums text-slate-200">Ks {laborCost.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-white/10 my-4"></div>
                    <div className="flex justify-between text-xl font-bold text-white items-center">
                        <span>Total COGS</span>
                        <span className="tabular-nums text-emerald-400">Ks {totalCost.toLocaleString()}</span>
                    </div>
                </div>
                <button 
                    onClick={handleCreateJob}
                    disabled={totalCost === 0 || !newProductSku}
                    className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3.5 rounded-xl font-medium shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    Complete Job <ArrowRight size={18} />
                </button>
            </div>
          </div>
      )}
    </div>
  );
};
