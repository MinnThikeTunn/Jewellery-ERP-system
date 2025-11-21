
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Layout = ({ children, onSeed }: { children?: React.ReactNode, onSeed: () => void }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
          <div className="bg-amber-500 p-2 rounded-lg">
            <Diamond size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">JewelERP</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 space-y-2 mt-4">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/inventory" icon={Diamond} label="Inventory" />
          <NavItem to="/manufacturing" icon={Hammer} label="Manufacturing" />
          <NavItem to="/purchasing" icon={ShoppingCart} label="Purchasing" />
          <NavItem to="/accounting" icon={BarChart3} label="Accounting" />
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 space-y-4">
           <button 
             onClick={onSeed}
             className="w-full flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400 transition-colors"
           >
             <Database size={14} /> Seed Database (Dev)
           </button>
           
           <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                AD
              </div>
              <div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-slate-500">Owner</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between lg:hidden">
           <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
             <Menu size={24} />
           </button>
           <span className="font-bold text-slate-800">JewelERP</span>
           <div className="w-6" /> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
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
        supabase.from('vendors').select('*'),
        supabase.from('purchase_orders').select('*'),
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

  // Handlers
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
    // Optimistic update
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
      setInventory(originalInventory); // Revert
    }
  };

  const handleDeleteItem = async (id: number) => {
    // Optimistic delete
    const originalInventory = [...inventory];
    setInventory(prev => prev.filter(item => item.id !== id));

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item: " + error.message);
      setInventory(originalInventory); // Revert
    }
  };

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
      fetchAllData(); // Revert state
      return;
    }

    // Step B: Add Finished Good
    await handleAddItem(newItem);
    alert('Manufacturing Job Recorded Successfully');
  };

  return (
    <Router>
      <Layout onSeed={handleSeed}>
        
        {seeding && (
           <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
             <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center gap-4">
               <Loader2 className="animate-spin text-amber-500" />
               <span className="font-medium text-slate-800">Seeding Database...</span>
             </div>
           </div>
        )}

        {/* Error Banner */}
        {error && (
           <div className="bg-red-50 text-red-800 px-4 py-4 rounded-lg mb-6 text-sm border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div className="flex items-center gap-2">
                <span>⚠️ {error}</span>
             </div>
             <div className="flex gap-2">
                <button onClick={fetchAllData} className="flex items-center gap-2 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors text-red-900 font-medium">
                    <RefreshCw size={14} /> Retry
                </button>
             </div>
           </div>
        )}

        {/* Loading State */}
        {loading && !inventory.length && !error && (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="text-center">
                <Loader2 className="animate-spin h-10 w-10 text-slate-900 mx-auto mb-4" />
                <p className="text-slate-500">Connecting to JewelERP Backend...</p>
                </div>
            </div>
        )}

        {/* Empty State / Welcome Screen */}
        {!loading && !error && inventory.length === 0 && rawMaterials.length === 0 && (
           <div className="bg-white border border-slate-200 rounded-xl p-12 text-center mb-8 shadow-sm">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Database Connected but Empty</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                Your Supabase backend is connected, but no data was found. Would you like to seed it with sample data?
              </p>
              <button 
                onClick={handleSeed}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md shadow-amber-500/20"
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
