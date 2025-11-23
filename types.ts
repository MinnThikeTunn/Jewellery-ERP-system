
export enum ItemType {
  FINISHED_GOOD = 'Finished Good',
  LOOSE_STONE = 'Loose Stone',
  RAW_MATERIAL = 'Raw Material'
}

export enum ItemStatus {
  IN_STOCK = 'In Stock',
  IN_SERVICE = 'In Service',
  SOLD = 'Sold',
  RESERVED = 'Reserved'
}

export enum UnitOfMeasure {
  GRAM = 'Gram',
  CARAT = 'Carat',
  PIECE = 'Piece'
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  item_type: ItemType;
  status: ItemStatus;
  location: string;
  qty_available: number;
  landed_cost: number;
  retail_price: number;
  certificate_url?: string;
  reorder_point: number;
}

export interface RawMaterial {
  id: number;
  name: string;
  unit_of_measure: UnitOfMeasure;
  current_stock: number;
  cost_per_unit: number;
}

export interface Vendor {
  id: number;
  name: string;
  contact_email: string;
  payment_terms: string;
}

export interface PurchaseOrder {
  id: number;
  vendor_id: number;
  date: string;
  status: 'Pending' | 'Received' | 'Paid';
  total_amount: number;
}

export interface GLEntry {
  id: number;
  entry_date: string;
  account_code: string;
  description: string;
  debit: number;
  credit: number;
  related_id?: number;
  related_type?: string;
}

export interface BillOfMaterial {
  id: number;
  finished_good_sku: string; // Linking loosely by SKU for demo flexibility
  raw_material_id: number;
  quantity_needed: number;
}

export interface DashboardMetrics {
  totalInventoryValue: number;
  totalRawMaterialValue: number;
  openPOValue: number;
  grossProfit: number;
}

// Data structure for the Receiving Modal
export interface ReceiveData {
    target: 'inventory' | 'raw_material';
    itemId: number | 'new'; // Existing ID or 'new'
    newItemName?: string; // If new
    newItemSku?: string; // If new inventory
    newItemType?: ItemType; // If new inventory
    quantity: number;
    location?: string;
}