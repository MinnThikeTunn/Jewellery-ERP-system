
import { supabase } from './supabaseClient';
import { 
  INITIAL_INVENTORY, 
  INITIAL_RAW_MATERIALS, 
  INITIAL_VENDORS, 
  INITIAL_POS
} from '../services/mockData';

export const seedDatabase = async () => {
  console.log("Starting database seed...");

  // 1. Vendors
  // We strip the hardcoded IDs and let the DB assign them.
  const vendorsPayload = INITIAL_VENDORS.map(({ id, ...rest }) => rest);
  
  const { data: createdVendors, error: vendorError } = await supabase
    .from('vendors')
    .insert(vendorsPayload)
    .select(); // Select to get the new IDs back
  
  if (vendorError) throw new Error('Failed to seed Vendors: ' + vendorError.message);

  // Create a map of Old ID -> New ID to maintain relationships for POs
  const vendorIdMap = new Map<number, number>();
  if (createdVendors) {
    createdVendors.forEach(newV => {
      const original = INITIAL_VENDORS.find(oldV => oldV.name === newV.name);
      if (original) {
        vendorIdMap.set(original.id, newV.id);
      }
    });
  }

  // 2. Purchase Orders
  // We map the old vendor_id to the new real vendor_id from the DB
  const posPayload = INITIAL_POS.map(({ id, vendor_id, ...rest }) => ({
    ...rest,
    vendor_id: vendorIdMap.get(vendor_id) || vendor_id
  }));
  
  const { error: poError } = await supabase.from('purchase_orders').insert(posPayload);
  if (poError) console.error('Failed to seed POs:', poError.message);

  // 3. Raw Materials
  const rawPayload = INITIAL_RAW_MATERIALS.map(({ id, ...rest }) => rest);
  const { error: rawError } = await supabase.from('raw_materials').insert(rawPayload);
  if (rawError) throw new Error('Failed to seed Raw Materials: ' + rawError.message);

  // 4. Inventory Items
  const invPayload = INITIAL_INVENTORY.map(({ id, ...rest }) => rest);
  const { error: invError } = await supabase.from('inventory_items').insert(invPayload);
  if (invError) throw new Error('Failed to seed Inventory: ' + invError.message);

  // 5. General Ledger Entries - DYNAMIC GENERATION
  // Instead of using static mock data, we generate 6 months of data relative to today
  // so the charts always look populated and current.
  
  const glPayload = [];
  const today = new Date();
  
  // Generate data for the last 6 months (including current)
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthStr = String(month + 1).padStart(2, '0');
    
    // A. Monthly Rent (Fixed Expense) - 1st of the month
    glPayload.push({
      entry_date: `${year}-${monthStr}-01`,
      account_code: '6001',
      description: 'Shop Monthly Rent',
      debit: 7500000, // 7.5 Million Kyats
      credit: 0
    });

    // B. Weekly Sales (Income) & COGS - 4 times a month
    for (let week = 1; week <= 4; week++) {
        const day = Math.min(week * 7, 28);
        
        // Randomized Sales: Between 12M and 17M per week
        const salesAmount = 12000000 + Math.floor(Math.random() * 5000000); 
        
        // Income Entry
        glPayload.push({
            entry_date: `${year}-${monthStr}-${String(day).padStart(2, '0')}`,
            account_code: '4001',
            description: `Weekly Sales - Week ${week}`,
            debit: 0,
            credit: salesAmount
        });

        // COGS Entry (Approx 60-70% of sales)
        const cogsAmount = Math.floor(salesAmount * (0.6 + (Math.random() * 0.1)));
        glPayload.push({
            entry_date: `${year}-${monthStr}-${String(day).padStart(2, '0')}`,
            account_code: '5001',
            description: `COGS - Week ${week}`,
            debit: cogsAmount,
            credit: 0
        });
    }
  }

  const { error: glError } = await supabase.from('general_ledger_entries').insert(glPayload);
  if (glError) throw new Error('Failed to seed GL Entries: ' + glError.message);

  return true;
};
