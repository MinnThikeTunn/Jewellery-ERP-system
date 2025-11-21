
import { supabase } from './supabaseClient';
import { 
  INITIAL_INVENTORY, 
  INITIAL_RAW_MATERIALS, 
  INITIAL_VENDORS, 
  INITIAL_POS, 
  INITIAL_GL_ENTRIES 
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

  // 5. General Ledger Entries
  const glPayload = INITIAL_GL_ENTRIES.map(({ id, ...rest }) => rest);
  const { error: glError } = await supabase.from('general_ledger_entries').insert(glPayload);
  if (glError) throw new Error('Failed to seed GL Entries: ' + glError.message);

  return true;
};
