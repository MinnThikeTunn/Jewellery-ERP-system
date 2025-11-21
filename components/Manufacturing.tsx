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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manufacturing & Costing 🛠️</h1>
          <p className="text-slate-500">Manage raw materials and production jobs.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
            className={`pb-2 px-1 ${activeTab === 'materials' ? 'border-b-2 border-amber-500 text-amber-600 font-medium' : 'text-slate-500'}`}
            onClick={() => setActiveTab('materials')}
        >
            Raw Materials Ledger
        </button>
        <button 
            className={`pb-2 px-1 ${activeTab === 'job' ? 'border-b-2 border-amber-500 text-amber-600 font-medium' : 'text-slate-500'}`}
            onClick={() => setActiveTab('job')}
        >
            New Production Job
        </button>
      </div>

      {activeTab === 'materials' ? (
         <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4">Material Name</th>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4 text-right">Current Stock</th>
                    <th className="px-6 py-4 text-right">Cost/Unit</th>
                    <th className="px-6 py-4 text-right">Total Value</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                {rawMaterials.map((mat) => (
                    <tr key={mat.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{mat.name}</td>
                    <td className="px-6 py-4 text-slate-500">{mat.unit_of_measure}</td>
                    <td className="px-6 py-4 text-right font-mono">{mat.current_stock}</td>
                    <td className="px-6 py-4 text-right text-slate-600 tabular-nums">
                         <span className="text-xs text-slate-400 mr-1">Ks</span>
                         {mat.cost_per_unit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 tabular-nums">
                        <span className="text-xs text-slate-400 mr-1">Ks</span>
                        {(mat.current_stock * mat.cost_per_unit).toLocaleString()}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Hammer size={20} className="text-amber-600" />
                    Production Inputs
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Raw Material</label>
                        <select 
                            className="w-full border border-slate-300 rounded-md px-3 py-2"
                            value={selectedMaterialId}
                            onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
                        >
                            {rawMaterials.map(m => (
                                <option key={m.id} value={m.id}>{m.name} (Ks {m.cost_per_unit.toLocaleString()}/{m.unit_of_measure})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Used</label>
                            <input 
                                type="number"
                                className="w-full border border-slate-300 rounded-md px-3 py-2"
                                value={usageAmount}
                                onChange={(e) => setUsageAmount(Number(e.target.value))} 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Labor Cost (Ks)</label>
                            <input 
                                type="number"
                                className="w-full border border-slate-300 rounded-md px-3 py-2"
                                value={laborCost}
                                onChange={(e) => setLaborCost(Number(e.target.value))} 
                            />
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4 mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Output Product Name</label>
                        <input 
                            type="text"
                            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3"
                            placeholder="e.g. Custom Gold Ring"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                        />
                        <label className="block text-sm font-medium text-slate-700 mb-1">New SKU</label>
                        <input 
                            type="text"
                            className="w-full border border-slate-300 rounded-md px-3 py-2"
                            placeholder="e.g. CUST-001"
                            value={newProductSku}
                            onChange={(e) => setNewProductSku(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Cost Preview Card */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 h-fit">
                 <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Layers size={20} className="text-blue-600" />
                    Cost Summary
                </h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Material Cost</span>
                        <span className="font-medium tabular-nums">Ks {materialCost.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500">Labor Cost</span>
                        <span className="font-medium tabular-nums">Ks {laborCost.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-slate-200 my-2"></div>
                    <div className="flex justify-between text-lg font-bold text-slate-900">
                        <span>Total COGS</span>
                        <span className="tabular-nums">Ks {totalCost.toLocaleString()}</span>
                    </div>
                </div>
                <button 
                    onClick={handleCreateJob}
                    disabled={totalCost === 0 || !newProductSku}
                    className="w-full mt-6 bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    Complete Job <ArrowRight size={16} />
                </button>
            </div>
          </div>
      )}
    </div>
  );
};