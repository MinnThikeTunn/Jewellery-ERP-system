# JewelERP AI Agent Instructions

## Project Overview
JewelERP is a **value-tracking ERP** for Myanmar jewelry businesses, not a POS system. The core purpose is tracking expensive assets (gold, diamonds) from raw material → manufacturing → sale with **double-entry accounting** integrated at every business transaction.

**Critical Principle:** Every business action (Buy, Make, Sell) must write to `general_ledger_entries`. Physical inventory changes and financial ledger updates must occur atomically.

## Architecture

### Data Flow Pattern
```
User Action → App.tsx Handler → Supabase Transaction → GL Entries + Physical Stock Update
```

All major workflows follow a **3-step transactional pattern**:
1. Update PO/inventory/raw materials status (physical)
2. Write GL entries (financial - debit/credit pairs)
3. Refresh all data via `fetchAllData()`

**Example:** `handleSellItem()` (App.tsx:266-331)
- Decrements `inventory_items.qty_available`
- Auto-sets status to 'Sold' if qty reaches 0
- Writes 4-legged GL entry: Debit Cash/Credit Revenue, Debit COGS/Credit Inventory
- Uses `getLocalDate()` to avoid UTC timezone issues in Myanmar

### Key Components
- **App.tsx** - State container & business logic. All CRUD handlers live here.
- **components/** - Pure presentational components receiving props + callbacks.
  - `Inventory.tsx`: Includes advanced filtering (Type, Status, Location), sorting, and low-stock alerts.
- **lib/schema.ts** - Supabase DDL (run once in Supabase SQL Editor)
- **lib/seeder.ts** - Dynamic sample data generator (creates 6 months of GL entries relative to current date)
- **types.ts** - Single source of truth for enums (ItemType, ItemStatus, UnitOfMeasure)

## Critical Workflows

### 1. Manufacturing Jobs (`handleCreateJob` - App.tsx:355)
Converts raw materials + labor into finished goods with **triple-entry accounting**:
- Credit Raw Materials Asset (1100)
- Credit Cash/Wages (5002) 
- Debit Finished Goods Asset (1200)

**Costing Logic:** `newItem.landed_cost = materialCost + laborCost`

### 2. Receiving Purchase Orders (`handleReceivePO` - App.tsx:520)
Closes the procurement loop with **weighted average costing**:
- **New Item:** Creates new record in `raw_materials` or `inventory_items`.
- **Existing Item:** Updates stock & recalculates `cost_per_unit` (Weighted Avg).
- Updates PO status to 'Received'.
- Writes GL: Debit Inventory (1200), Credit Accounts Payable (2000).

**Anti-Pattern:** Never update inventory without GL entries.

### 3. Dashboard Metrics (`Dashboard.tsx`)
Real-time calculations from GL entries:
- Groups by `YYYY-MM` month key (substring 0-7 from `entry_date`)
- Revenue = SUM(credit) WHERE account_code starts with '4'
- Expenses = SUM(debit) WHERE account_code starts with '5' or '6'
- Net Profit = Revenue - Expenses

## Conventions & Patterns

### Date Handling
Always use `getLocalDate()` helper (App.tsx:128) for Myanmar timezone:
```typescript
const getLocalDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
```
**Why:** Prevents GL entries from appearing in wrong month due to UTC conversion.

### Optimistic Updates
Standard pattern in all handlers:
1. Update local state immediately
2. Call Supabase
3. On error: alert + revert to `originalState` backup
4. On success: replace temp ID with real DB ID

### Burmese Localization
- UI labels use Myanmar Unicode (e.g., `ဒက်ရှ်ဘုတ်`)
- Numbers formatted with `Ks` prefix (Kyats currency)
- Keep English for code/types/database fields

### Status Business Rules
Enforced in handlers (never just UI):
- If `qty_available === 0` → `status = ItemStatus.SOLD` (auto-applied in `handleAddItem` & `handleUpdateItem`)
- PO received → triggers stock update + GL entry
- Manufacturing job → auto-creates finished good with status 'In Stock'

### UI Patterns
- **Deep Linking:** Dashboard widgets (e.g., Low Stock) navigate to filtered views in other components via `location.state`.
- **Modals:** Used for complex actions (Selling, Editing) to keep context.

## Database

### Account Codes (Chart of Accounts)
```
1001: Cash/Bank (Asset)
1100: Raw Materials (Asset)
1200: Inventory/Finished Goods (Asset)
2000: Accounts Payable (Liability)
4001: Sales Revenue (Income)
5001: Cost of Goods Sold (Expense)
5002: Labor/Overhead (Expense)
6001: Rent (Expense)
```

### Supabase Setup
1. Run `lib/schema.ts` SQL in Supabase SQL Editor
2. Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Use seeder: Click "Initialize Sample Data" button (calls `seedDatabase()`)

**Graceful Degradation:** If env vars missing, app shows error banner instead of crashing (App.tsx:143-146).

## Development

### Commands
```bash
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # Production build
npm run test     # Run unit tests (Vitest + React Testing Library)
npm run test:watch # Run tests in watch mode
```

### Adding New Features
1. Update `types.ts` for new data structures
2. Add Supabase table columns via SQL
3. Create handler in `App.tsx` following transactional pattern
4. Pass handler as prop to component
5. **Always write GL entries** for financial impact

### Design System
- **Glassmorphism:** `bg-white/5 backdrop-blur-lg border border-white/10`
- **Dark palette:** slate-900/950 backgrounds with cyan/blue accents
- **Gradients:** Use for CTAs (`bg-gradient-to-r from-cyan-600 to-blue-600`)
- **Icons:** Lucide React (already imported, use semantic names)

## Common Pitfalls

❌ **Don't** create inventory without GL entries  
✅ **Do** follow the transactional pattern (see `handleSellItem` example)

❌ **Don't** use `new Date().toISOString()` for entry_date  
✅ **Do** use `getLocalDate()` helper

❌ **Don't** mutate state directly  
✅ **Do** use optimistic updates with rollback on error

❌ **Don't** hard-delete critical records  
✅ **Do** add confirmation dialogs for PO/Vendor deletion

## Testing Locally
1. Seed database via UI button
2. Navigate to Manufacturing → Create job (verify GL entries created)
3. Navigate to Inventory → Sell item (verify status changes to 'Sold' when qty=0)
4. Check Dashboard → Verify monthly profit chart populates from GL
5. Run unit tests with `npm run test` (CI also runs tests via `.github/workflows/ci.yml`)
