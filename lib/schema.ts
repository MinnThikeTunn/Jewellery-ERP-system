export const DB_SCHEMA_SQL = `
-- Enable UUID extension if needed (optional)
-- create extension if not exists "uuid-ossp";

-- 1. Vendors
create table if not exists vendors (
  id bigint primary key generated always as identity,
  name text not null,
  contact_email text,
  payment_terms text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Raw Materials
create table if not exists raw_materials (
  id bigint primary key generated always as identity,
  name text not null,
  unit_of_measure text not null, -- 'Gram', 'Carat', 'Piece'
  current_stock numeric default 0,
  cost_per_unit numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Inventory Items (Master Stock)
create table if not exists inventory_items (
  id bigint primary key generated always as identity,
  sku text not null,
  name text not null,
  item_type text not null, -- 'Finished Good', 'Loose Stone', 'Raw Material'
  status text not null, -- 'In Stock', 'In Service', 'Sold'
  location text,
  qty_available integer default 0,
  landed_cost numeric default 0,
  retail_price numeric default 0,
  reorder_point integer default 0,
  certificate_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Purchase Orders
create table if not exists purchase_orders (
  id bigint primary key generated always as identity,
  vendor_id bigint references vendors(id),
  date date not null,
  status text not null, -- 'Pending', 'Received', 'Paid'
  total_amount numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. General Ledger Entries
create table if not exists general_ledger_entries (
  id bigint primary key generated always as identity,
  entry_date date not null,
  account_code text not null,
  description text,
  debit numeric default 0,
  credit numeric default 0,
  related_id bigint,
  related_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
`;