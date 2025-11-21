import { 
  InventoryItem, 
  ItemType, 
  ItemStatus, 
  RawMaterial, 
  UnitOfMeasure, 
  Vendor, 
  GLEntry,
  PurchaseOrder
} from '../types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    sku: 'DIA-RNG-001',
    name: '18k White Gold Diamond Ring',
    item_type: ItemType.FINISHED_GOOD,
    status: ItemStatus.IN_STOCK,
    location: 'Vault A1',
    qty_available: 5,
    landed_cost: 2550000,
    retail_price: 6600000,
    reorder_point: 2
  },
  {
    id: 2,
    sku: 'GLD-NEC-045',
    name: '24k Gold Chain Necklace',
    item_type: ItemType.FINISHED_GOOD,
    status: ItemStatus.IN_STOCK,
    location: 'Showroom Case 3',
    qty_available: 12,
    landed_cost: 1250000,
    retail_price: 2850000,
    reorder_point: 5
  },
  {
    id: 3,
    sku: 'LSE-DIA-099',
    name: '1.5ct Round Cut Diamond (VS1)',
    item_type: ItemType.LOOSE_STONE,
    status: ItemStatus.RESERVED,
    location: 'Vault B2',
    qty_available: 1,
    landed_cost: 10500000,
    retail_price: 17400000,
    reorder_point: 1
  }
];

export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 1,
    name: '18k White Gold Casting Grain',
    unit_of_measure: UnitOfMeasure.GRAM,
    current_stock: 250.5,
    cost_per_unit: 187500
  },
  {
    id: 2,
    name: 'Yellow Gold Wire',
    unit_of_measure: UnitOfMeasure.GRAM,
    current_stock: 100.0,
    cost_per_unit: 195000
  },
  {
    id: 3,
    name: 'Melee Diamonds (1mm)',
    unit_of_measure: UnitOfMeasure.PIECE,
    current_stock: 500,
    cost_per_unit: 45000
  }
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 1,
    name: 'Global Bullion Supply',
    contact_email: 'orders@gbs.com',
    payment_terms: 'Net 30'
  },
  {
    id: 2,
    name: 'Precious Gems Intl.',
    contact_email: 'sales@preciousgems.com',
    payment_terms: 'Due on Receipt'
  }
];

export const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 101,
    vendor_id: 1,
    date: '2023-10-15',
    status: 'Received',
    total_amount: 16200000
  },
  {
    id: 102,
    vendor_id: 2,
    date: '2023-10-20',
    status: 'Pending',
    total_amount: 37500000
  }
];

export const INITIAL_GL_ENTRIES: GLEntry[] = [
  {
    id: 1,
    entry_date: '2023-10-01',
    account_code: '6001',
    description: 'Shop Rent - October',
    debit: 7500000,
    credit: 0
  },
  {
    id: 2,
    entry_date: '2023-10-05',
    account_code: '4001',
    description: 'Sales Revenue - Weekly',
    debit: 0,
    credit: 46200000
  },
  {
    id: 3,
    entry_date: '2023-10-10',
    account_code: '5001',
    description: 'COGS - Custom Order #442',
    debit: 9600000,
    credit: 0
  }
];