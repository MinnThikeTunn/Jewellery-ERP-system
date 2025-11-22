
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
import { InventoryItem, RawMaterial, Vendor, PurchaseOrder, GLEntry } from './types';
import { supabase } from './lib/supabaseClient';
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

const Layout = ({ children, onSeed }: { children?: React.ReactNode, onSeed: () => void }) => {
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
          <span className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">JewelERP</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="px-6 space-y-2 mt-2">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/inventory" icon={Diamond} label="Inventory" />
          <NavItem to="/manufacturing" icon={Hammer} label="Manufacturing" />
          <NavItem to="/purchasing" icon={ShoppingCart} label="Purchasing" />
          <NavItem to="/accounting" icon={BarChart3} label="Accounting" />
        </nav>

        <div className="absolute bottom-0 w-full p-8 border-t border-white/5 space-y-6 bg-gradient-to-t from-slate-900/80 to-transparent">
           <button 
             onClick={onSeed}
             className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors group"
           >
             <Database size={14} className="group-hover:scale-110 transition-transform" /> Seed Database (Dev)
           </button>
           
           <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                AD
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-slate-500">Owner</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between lg:hidden">
           <button onClick={() => setSidebarOpen(true)} className="text-slate-300 hover:text-white">
             <Menu size={24} />
           </button>
           <span className="font-bold text-slate-100">JewelERP</span>
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

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, rawRes, vendRes, poRes, glRes] = await Promise.all([
        supabase.from('inventory_items').select('*').order('id', { ascending: false }),
        supabase.from('raw_materials').select('*'),
        supabase.from('vendors').select('*').order('id', { ascending: true }),
        supabase.from('purchase_orders').select('*').order('id', { ascending: false }),
        supabase.from('general_ledger_entries').select('*'),
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
      setError(err.message || "Failed to connect to Supabase.");
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
    const tempId = Date.now();
    const optimisticItem = { ...item, id: tempId };
    setInventory([optimisticItem, ...inventory]);

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([item])
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
    const originalInventory = [...inventory];
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));

    const { error } = await supabase
      .from('inventory_items')
      .update({
        sku: updatedItem.sku,
        name: updatedItem.name,
        item_type: updatedItem.item_type,
        status: updatedItem.status,
        location: updatedItem.location,
        qty_available: updatedItem.qty_available,
        landed_cost: updatedItem.landed_cost,
        retail_price: updatedItem.retail_price,
        reorder_point: updatedItem.reorder_point
      })
      .eq('id', updatedItem.id);

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

  // Manufacturing Handlers
  const handleCreateJob = async (materialId: number, amountUsed: number, newItem: Omit<InventoryItem, 'id'>) => {
    const material = rawMaterials.find(m => m.id === materialId);
    if(!material) return;

    const newStock = material.current_stock - amountUsed;
    setRawMaterials(prev => prev.map(m => m.id === materialId ? {...m, current_stock: newStock} : m));
    
    // Step A: Deduct Material
    const { error: matError } = await supabase
      .from('raw_materials')
      .update({ current_stock: newStock })
      .eq('id', materialId);

    if (matError) {
      alert('Error updating material stock: ' + matError.message);
      fetchAllData();
      return;
    }

    // Step B: Add Finished Good
    await handleAddItem(newItem);
    alert('Manufacturing Job Recorded Successfully');
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

  return (
    <Router>
      <Layout onSeed={handleSeed}>
        
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
            />
          } />
          <Route path="/inventory" element={
            <Inventory 
              items={inventory} 
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
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
              onAddVendor={handleAddVendor}
              onDeleteVendor={handleDeleteVendor}
              onAddPO={handleAddPO}
              onUpdatePO={handleUpdatePO}
              onDeletePO={handleDeletePO}
            />
          } />
          <Route path="/accounting" element={
            <Accounting glEntries={glEntries} />
          } />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
