import React, { useState, useEffect } from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation 
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Diamond, 
  Hammer, 
  ShoppingCart, 
  BarChart3,
  Menu,
  X,
  Loader2,
  Database,
  RefreshCw
} from 'lucide-react';

import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Manufacturing } from './components/Manufacturing';
import { Purchasing } from './components/Purchasing';
import { Accounting } from './components/Accounting';
import { NotFound } from './components/NotFound';
import { InventoryItem, RawMaterial, Vendor, PurchaseOrder, GLEntry, ReceiveData, ItemType, ItemStatus, UnitOfMeasure } from './types';
import { supabase, isConfigured } from './lib/supabaseClient';
import { seedDatabase } from './lib/seeder';

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        isActive 
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-cyan-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`} />
      <Icon size={20} className={`relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span className="font-medium relative z-10">{label}</span>
    </Link>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-900 text-slate-200 overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950/50 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between lg:justify-start gap-4">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
            <Diamond size={24} className="text-white" />
          </div>
          {/* Rebranded Title: Aung (Large) Yadanar (Small) */}
          <div className="flex items-baseline gap-1.5 font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
            <span className="text-2xl">Aung</span>
            <span className="text-lg tracking-wider text-slate-400">Yadanar</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="px-6 space-y-2 mt-2">
          <NavItem to="/" icon={LayoutDashboard} label="ဒက်ရှ်ဘုတ်" />
          <NavItem to="/inventory" icon={Diamond} label="ကုန်ပစ္စည်းစာရင်း" />
          <NavItem to="/manufacturing" icon={Hammer} label="ထုတ်လုပ်မှု" />
          <NavItem to="/purchasing" icon={ShoppingCart} label="ဝယ်ယူရေး" />
          <NavItem to="/accounting" icon={BarChart3} label="စာရင်းကိုင်" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between lg:hidden">
           <button onClick={() => setSidebarOpen(true)} className="text-slate-300 hover:text-white">
             <Menu size={24} />
           </button>
           {/* Mobile Header Branding */}
           <div className="flex items-baseline gap-1 font-bold text-slate-100">
             <span>Aung</span>
             <span className="text-sm text-slate-300">Yadanar</span>
           </div>
           <div className="w-6" /> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [glEntries, setGLEntries] = useState<GLEntry[]>([]);

  // Helper to get Local Date as YYYY-MM-DD to avoid UTC timezone issues
  const getLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    // 1. Check if keys are present. If not, show a helpful message instead of crashing.
    if (!isConfigured()) {
      setLoading(false);
      setError("Configuration Missing: Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel Environment Variables and Redeploy.");
      return;
    }

    try {
      const [invRes, rawRes, vendRes, poRes, glRes] = await Promise.all([
        supabase.from('inventory_items').select('*').order('id', { ascending: false }),
        supabase.from('raw_materials').select('*'),
        supabase.from('vendors').select('*').order('id', { ascending: true }),
        supabase.from('purchase_orders').select('*').order('id', { ascending: false }),
        supabase.from('general_ledger_entries').select('*').order('entry_date', { ascending: false }),
      ]);

      if (invRes.error) throw invRes.error;
      if (rawRes.error) throw rawRes.error;
      if (vendRes.error) throw vendRes.error;
      if (poRes.error) throw poRes.error;
      if (glRes.error) throw glRes.error;

      setInventory(invRes.data as InventoryItem[] || []);
      setRawMaterials(rawRes.data as RawMaterial[] || []);
      setVendors(vendRes.data as Vendor[] || []);
      setPos(poRes.data as PurchaseOrder[] || []);
      setGLEntries(glRes.data as GLEntry[] || []);

    } catch (err: any) {
      console.error("Error fetching data:", err);
      // 2. Handle "Failed to fetch" specifically (Network error or Paused project)
      if (err.message === "Failed to fetch") {
        setError("Network Error: Cannot connect to Supabase. Your project might be paused (check Supabase dashboard) or you have connection issues.");
      } else {
        setError(err.message || "Failed to connect to Supabase.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSeed = async () => {
    if (!confirm("This will attempt to inject sample data into your database. Continue?")) return;
    
    setSeeding(true);
    try {
      await seedDatabase();
      alert("Database seeded successfully!");
      fetchAllData(); // Refresh data
    } catch (err: any) {
      console.error(err);
      alert("Seeding failed: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  // Inventory Handlers
  const handleAddItem = async (item: Omit<InventoryItem, 'id'>) => {
    // Business Rule: If Quantity is 0, Status must be 'Sold'
    const finalItem = { ...item };
    if (finalItem.qty_available === 0) {
        finalItem.status = ItemStatus.SOLD;
    }

    const tempId = Date.now();
    const optimisticItem = { ...finalItem, id: tempId };
    setInventory([optimisticItem, ...inventory]);

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([finalItem])
      .select()
      .single();

    if (error) {
      alert('Failed to save item to database: ' + error.message);
      setInventory(prev => prev.filter(i => i.id !== tempId));
    } else if (data) {
      setInventory(prev => [data, ...prev.filter(i => i.id !== tempId)]);
    }
  };

  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    // Business Rule: If Quantity is 0, Status must be 'Sold'
    const finalItem = { ...updatedItem };
    if (finalItem.qty_available === 0) {
        finalItem.status = ItemStatus.SOLD;
    }

    const originalInventory = [...inventory];
    setInventory(prev => prev.map(item => item.id === finalItem.id ? finalItem : item));

    const { error } = await supabase
      .from('inventory_items')
      .update({
        // sku: finalItem.sku, // SKU Removed
        name: finalItem.name,
        item_type: finalItem.item_type,
        status: finalItem.status,
        location: finalItem.location,
        qty_available: finalItem.qty_available,
        landed_cost: finalItem.landed_cost,
        retail_price: finalItem.retail_price,
        reorder_point: finalItem.reorder_point
      })
      .eq('id', finalItem.id);

    if (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item: " + error.message);
      setInventory(originalInventory);
    }
  };

  const handleDeleteItem = async (id: number) => {
    const originalInventory = [...inventory];
    setInventory(prev => prev.filter(item => item.id !== id));

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item: " + error.message);
      setInventory(originalInventory);
    }
  };

  const handleSellItem = async (itemId: number, quantity: number, salePrice: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    if (quantity > item.qty_available) {
        alert('Insufficient stock!');
        return;
    }

    const newStock = item.qty_available - quantity;
    // Business Rule: If New Stock is 0, Status changes to Sold
    let newStatus = item.status;
    if (newStock === 0) {
        newStatus = ItemStatus.SOLD;
    }

    const totalRevenue = quantity * salePrice;
    const totalCOGS = quantity * item.landed_cost;
    // Use local date to ensure profit is recorded in the correct month for the user
    const today = getLocalDate();

    setLoading(true);
    try {
        // 1. Update Inventory
        const { error: invError } = await supabase
            .from('inventory_items')
            .update({ 
                qty_available: newStock,
                status: newStatus 
            })
            .eq('id', itemId);
        
        if (invError) throw invError;

        // 2. GL Entries (4-legged transaction)
        // Debit Cash, Credit Revenue
        // Debit COGS, Credit Inventory
        const { error: glError } = await supabase.from('general_ledger_entries').insert([
            {
                entry_date: today,
                account_code: '1001', // Cash/Bank
                description: `Sale Receipt: ${item.name} (Qty ${quantity})`,
                debit: totalRevenue,
                credit: 0,
                related_id: itemId,
                related_type: 'sale'
            },
            {
                entry_date: today,
                account_code: '4001', // Sales Revenue
                description: `Revenue from ${item.name}`,
                debit: 0,
                credit: totalRevenue,
                related_id: itemId,
                related_type: 'sale'
            },
            {
                entry_date: today,
                account_code: '5001', // Cost of Goods Sold
                description: `COGS: ${item.name}`,
                debit: totalCOGS,
                credit: 0,
                related_id: itemId,
                related_type: 'sale'
            },
            {
                entry_date: today,
                account_code: '1200', // Inventory Asset
                description: `Inventory reduction: ${item.name}`,
                debit: 0,
                credit: totalCOGS,
                related_id: itemId,
                related_type: 'sale'
            }
        ]);

        if (glError) throw glError;

        await fetchAllData();
        alert('Sale recorded successfully!');
    } catch (err: any) {
        console.error(err);
        alert('Failed to record sale: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  // Manufacturing Handlers
  const handleCreateJob = async (materialId: number, amountUsed: number, newItem: Omit<InventoryItem, 'id'>) => {
    const material = rawMaterials.find(m => m.id === materialId);
    if(!material) return;

    const materialCost = material.cost_per_unit * amountUsed;
    // Total Landed Cost of new item includes Labor. 
    // So Labor = Total - Material.
    const laborCost = newItem.landed_cost - materialCost;

    const newStock = material.current_stock - amountUsed;
    setRawMaterials(prev => prev.map(m => m.id === materialId ? {...m, current_stock: newStock} : m));
    
    try {
      // Step A: Deduct Material
      const { error: matError } = await supabase
        .from('raw_materials')
        .update({ current_stock: newStock })
        .eq('id', materialId);

      if (matError) throw matError;

      // Step B: Add Finished Good
      const { data: savedItem, error: invError } = await supabase
        .from('inventory_items')
        .insert([newItem])
        .select()
        .single();

      if (invError) throw invError;

      // Step C: Write GL Entries (Triple Entry for Manufacturing)
      // 1. Credit Raw Materials (Asset Decrease)
      // 2. Credit Cash/Wages Payable (Liability Increase)
      // 3. Debit Finished Goods (Asset Increase)
      
      // Use local date
      const today = getLocalDate();

      const { error: glError } = await supabase.from('general_ledger_entries').insert([
        {
          entry_date: today,
          account_code: '1100', // Raw Material Asset Code
          description: `Material Usage: ${material.name} (${amountUsed} ${material.unit_of_measure})`,
          debit: 0,
          credit: materialCost,
          related_type: 'manufacturing_job'
        },
        {
          entry_date: today,
          account_code: '5002', // Labor/Overhead Cost Code
          description: `Labor for Job: ${newItem.name}`,
          debit: 0, 
          credit: laborCost, // Crediting Cash (assuming paid) or Payable
          related_type: 'manufacturing_job'
        },
        {
          entry_date: today,
          account_code: '1200', // Finished Goods Asset Code
          description: `Production Output: ${newItem.name}`,
          debit: newItem.landed_cost,
          credit: 0,
          related_type: 'manufacturing_job',
          related_id: savedItem?.id
        }
      ]);

      if (glError) throw glError;

      // Refresh Data to show new item and GL entries
      await fetchAllData();
      alert('Manufacturing Job Recorded Successfully: Inventory & Ledger Updated.');

    } catch (err: any) {
      console.error(err);
      alert('Error processing manufacturing job: ' + err.message);
      fetchAllData(); // Revert optimistic updates on error
    }
  };

  // Purchasing Handlers - Vendors
  const handleAddVendor = async (vendor: Omit<Vendor, 'id'>) => {
    const tempId = Date.now();
    setVendors(prev => [...prev, { ...vendor, id: tempId }]);

    const { data, error } = await supabase
      .from('vendors')
      .insert([vendor])
      .select()
      .single();

    if (error) {
      alert('Failed to add vendor: ' + error.message);
      setVendors(prev => prev.filter(v => v.id !== tempId));
    } else if (data) {
      setVendors(prev => prev.map(v => v.id === tempId ? data : v));
    }
  };

  const handleDeleteVendor = async (id: number) => {
    if (!confirm('Are you sure? This might affect existing POs connected to this vendor.')) return;

    const originalVendors = [...vendors];
    setVendors(prev => prev.filter(v => v.id !== id));

    const { error } = await supabase.from('vendors').delete().eq('id', id);

    if (error) {
      alert('Failed to delete vendor: ' + error.message);
      setVendors(originalVendors);
    }
  };

  // Purchasing Handlers - Purchase Orders
  const handleAddPO = async (po: Omit<PurchaseOrder, 'id'>) => {
    const tempId = Date.now();
    setPos(prev => [{ ...po, id: tempId }, ...prev]);

    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([po])
      .select()
      .single();

    if (error) {
      alert('Failed to add PO: ' + error.message);
      setPos(prev => prev.filter(p => p.id !== tempId));
    } else if (data) {
      setPos(prev => prev.map(p => p.id === tempId ? data : p));
    }
  };

  const handleUpdatePO = async (updatedPO: PurchaseOrder) => {
    const originalPos = [...pos];
    setPos(prev => prev.map(p => p.id === updatedPO.id ? updatedPO : p));

    const { error } = await supabase
      .from('purchase_orders')
      .update(updatedPO)
      .eq('id', updatedPO.id);

    if (error) {
      alert('Failed to update PO: ' + error.message);
      setPos(originalPos);
    }
  };

  const handleDeletePO = async (id: number) => {
    if (!confirm('Are you sure you want to delete this Purchase Order?')) return;
    
    const originalPos = [...pos];
    setPos(prev => prev.filter(p => p.id !== id));

    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete PO: ' + error.message);
      setPos(originalPos);
    }
  };

  // --- AUTOMATED RECEIVING LOGIC ---
  // This function closes the loop: Update PO -> Update Inventory -> Write GL
  const handleReceivePO = async (poId: number, receiveData: ReceiveData) => {
    const po = pos.find(p => p.id === poId);
    if (!po) return;
    if (po.status === 'Received') {
        alert('This PO has already been received.');
        return;
    }
    
    // Safety check for Division by Zero
    if (!receiveData.quantity || receiveData.quantity <= 0) {
        alert('Quantity must be greater than 0.');
        return;
    }

    setLoading(true);
    try {
        // 1. Update PO Status
        const { error: poError } = await supabase
            .from('purchase_orders')
            .update({ status: 'Received' })
            .eq('id', poId);
        
        if (poError) throw new Error('Failed to update PO status: ' + poError.message);

        // 2. Update Inventory (Physical Stock)
        if (receiveData.target === 'raw_material') {
            if (receiveData.itemId === 'new') {
                // Create new raw material
                const { error: rmError } = await supabase.from('raw_materials').insert([{
                    name: receiveData.newItemName,
                    unit_of_measure: UnitOfMeasure.GRAM, // Defaulting for simplicity
                    current_stock: receiveData.quantity,
                    cost_per_unit: po.total_amount / receiveData.quantity // Calculated Cost
                }]);
                if (rmError) throw new Error('Failed to create raw material: ' + rmError.message);
            } else {
                // Update existing raw material (Weighted Average Costing could go here, simplified for now)
                const existing = rawMaterials.find(r => r.id === Number(receiveData.itemId));
                if (existing) {
                     // Calculate new weighted average cost
                    const totalValue = (existing.current_stock * existing.cost_per_unit) + po.total_amount;
                    const totalQty = existing.current_stock + receiveData.quantity;
                    const newCost = totalValue / totalQty;

                    const { error: rmUpdateError } = await supabase
                        .from('raw_materials')
                        .update({ 
                            current_stock: totalQty,
                            cost_per_unit: newCost
                        })
                        .eq('id', receiveData.itemId);
                    if (rmUpdateError) throw new Error('Failed to update raw material stock: ' + rmUpdateError.message);
                }
            }
        } else {
            // Finished Goods
            if (receiveData.itemId === 'new') {
                const { error: invError } = await supabase.from('inventory_items').insert([{
                    // sku: receiveData.newItemSku, // SKU Removed
                    name: receiveData.newItemName,
                    item_type: receiveData.newItemType,
                    status: ItemStatus.IN_STOCK,
                    location: receiveData.location,
                    qty_available: receiveData.quantity,
                    landed_cost: po.total_amount / receiveData.quantity,
                    retail_price: (po.total_amount / receiveData.quantity) * 1.5, // Mock markup
                    reorder_point: 1
                }]);
                if (invError) throw new Error('Failed to create inventory item: ' + invError.message);
            } else {
                const existing = inventory.find(i => i.id === Number(receiveData.itemId));
                if (existing) {
                    const { error: invUpdateError } = await supabase
                        .from('inventory_items')
                        .update({ qty_available: existing.qty_available + receiveData.quantity })
                        .eq('id', receiveData.itemId);
                    if (invUpdateError) throw new Error('Failed to update inventory stock: ' + invUpdateError.message);
                }
            }
        }

        // 3. Write GL Entry (Financial)
        // Debit Inventory (Asset increases), Credit Accounts Payable/Cash
        
        // Use local date
        const today = getLocalDate();

        const { error: glError } = await supabase.from('general_ledger_entries').insert([
            {
                entry_date: today,
                account_code: '1200', // Inventory Asset
                description: `Received Goods from PO #${poId}`,
                debit: po.total_amount,
                credit: 0,
                related_id: poId,
                related_type: 'purchase_order'
            },
            {
                entry_date: today,
                account_code: '2000', // Accounts Payable
                description: `Liability for PO #${poId}`,
                debit: 0,
                credit: po.total_amount,
                related_id: poId,
                related_type: 'purchase_order'
            }
        ]);
        if (glError) throw new Error('Failed to write GL entries: ' + glError.message);

        alert("Receiving successful! Inventory updated and GL entries created.");
        await fetchAllData(); // Refresh all data

    } catch (err: any) {
        console.error(err);
        alert("Error during receiving: " + err.message);
        setLoading(false);
    }
  };

  return (
    <Router>
      <Layout>
        
        {seeding && (
           <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-md">
             <div className="bg-slate-900/80 border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
               <Loader2 className="animate-spin text-cyan-400 w-10 h-10" />
               <span className="font-medium text-slate-200">Seeding Database...</span>
             </div>
           </div>
        )}

        {/* Error Banner */}
        {error && (
           <div className="bg-red-900/20 border border-red-500/30 backdrop-blur-md text-red-200 px-6 py-4 rounded-xl mb-8 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
             <div className="flex items-center gap-3">
                <span>⚠️ {error}</span>
             </div>
             <div className="flex gap-2">
                <button onClick={fetchAllData} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-lg transition-colors text-red-200 font-medium">
                    <RefreshCw size={16} /> Retry
                </button>
             </div>
           </div>
        )}

        {/* Loading State */}
        {loading && !inventory.length && !error && (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                  <Loader2 className="animate-spin h-12 w-12 text-cyan-400 relative z-10" />
                </div>
                <p className="text-slate-400 font-medium animate-pulse">Connecting to JewelERP Backend...</p>
            </div>
        )}

        {/* Empty State / Welcome Screen */}
        {!loading && !error && inventory.length === 0 && rawMaterials.length === 0 && (
           <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-16 text-center mb-8 shadow-2xl max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-500/20">
                <Database size={40} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Database Connected</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-8 text-lg leading-relaxed">
                Your Supabase backend is active but empty. Seed it with sample data to visualize the system.
              </p>
              <button 
                onClick={handleSeed}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 transform hover:scale-[1.02]"
              >
                Initialize Sample Data
              </button>
           </div>
        )}

        <Routes>
          <Route path="/" element={
            <Dashboard 
              inventory={inventory}
              rawMaterials={rawMaterials}
              purchaseOrders={pos}
              glEntries={glEntries}
            />
          } />
          <Route path="/inventory" element={
            <Inventory 
              items={inventory} 
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onSellItem={handleSellItem}
            />
          } />
          <Route path="/manufacturing" element={
            <Manufacturing 
              rawMaterials={rawMaterials}
              onCreateJob={handleCreateJob}
            />
          } />
          <Route path="/purchasing" element={
            <Purchasing 
              vendors={vendors} 
              purchaseOrders={pos}
              rawMaterials={rawMaterials}
              inventoryItems={inventory}
              onAddVendor={handleAddVendor}
              onDeleteVendor={handleDeleteVendor}
              onAddPO={handleAddPO}
              onUpdatePO={handleUpdatePO}
              onDeletePO={handleDeletePO}
              onReceivePO={handleReceivePO}
            />
          } />
          <Route path="/accounting" element={
            <Accounting glEntries={glEntries} />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;