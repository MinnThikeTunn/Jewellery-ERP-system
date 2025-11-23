# JewelERP 💎

**JewelERP** is a specialized, internal Enterprise Resource Planning system designed for jewelry manufacturers, wholesalers, and business owners in Myanmar. Unlike generic POS systems, JewelERP focuses on **Value Tracking**—monitoring the flow of expensive assets (Gold, Diamonds) from raw material purchase to manufacturing and final sale.

The application features a modern **Glassmorphism UI** with a dark aesthetic, fully localized in **Burmese**, and backed by a real-time **Supabase** database.

---

## 🚀 Key Features

### 1. 📊 Executive Dashboard
- **Real-time Valuation:** Calculates the total liquid asset value (Raw Materials + Finished Goods) in Myanmar Kyats (Ks).
- **Financial Trends:** Line charts visualizing Sales vs. Net Profit based on actual General Ledger entries.
- **Active PO Tracking:** Monitors cash flow commitments to suppliers.

### 2. 💎 Master Inventory
- **Asset Tracking:** Track items by Name, Type (Finished Good, Loose Stone), and Location (Vault, Showroom).
- **Advanced Filtering:** Filter by Stock Level, Location, and Status.
- **Sales Workflow:** "Sell" items directly from inventory, triggering automatic 4-legged accounting entries (Debit Cash, Credit Revenue, Debit COGS, Credit Inventory).
- **Smart Status:** Auto-updates status to "Sold" when stock hits 0.

### 3. 🛠️ Manufacturing & Costing
- **Job Costing Engine:** Convert **Raw Materials** (e.g., Gold Grain) + **Labor Costs** into **Finished Goods**.
- **Automated Calculations:** Automatically calculates the *Landed Cost* of the new item and suggests a Retail Price (1.5x markup).
- **Ledger Integration:** Completing a job writes a triple-entry transaction to the GL (Credit Material Asset, Credit Cash/Wages, Debit Finished Good Asset).

### 4. 💵 Purchasing (AP)
- **Vendor Management:** Track suppliers and payment terms (Net 30, Due on Receipt).
- **Purchase Orders:** Create, Update, and Delete POs.
- **Receiving Workflow:** When goods arrive, the "Receive" action updates Physical Stock and Financial Liability simultaneously.

### 5. 📉 Accounting (General Ledger)
- **Double-Entry System:** Full debit/credit tracking for all transactions.
- **Profit & Loss:** Generates real-time P&L reports (Revenue - COGS - Expenses).
- **Localized Formatting:** All financial figures are formatted in Myanmar Kyats (e.g., `Ks 1,500,000`).

---

## 🛠️ Tech Stack

- **Frontend:** React 18 (TypeScript), Vite
- **Styling:** Tailwind CSS (Glassmorphism, Dark Mode)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Backend/DB:** Supabase (PostgreSQL)
- **State Management:** React Hooks + Supabase Realtime

---

## 🎨 Design Philosophy

The UI follows a strict **Glassmorphism** design language:
- **Backgrounds:** Deep slate gradients with ambient neon glows.
- **Panels:** Translucent white/black layers with `backdrop-blur`.
- **Typography:** Inter font, optimized for both English numbers and Burmese text.
- **UX:** Floating sidebars and modal-driven workflows for focus.

---

## 📦 Database Schema

The system uses **Supabase** with the following core relational tables:

1.  **`inventory_items`**: Finished goods and loose stones.
2.  **`raw_materials`**: Gold, silver, and bulk stones (tracked by weight/unit).
3.  **`vendors`**: Supplier profiles.
4.  **`purchase_orders`**: Financial commitments.
5.  **`general_ledger_entries`**: The financial brain. Every business action (Buy, Make, Sell) writes to this table.

---

## 🏁 Getting Started

### Prerequisites
1.  Node.js installed.
2.  A Supabase project created.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/jewelerp.git
    cd jewelerp
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Database**
    - Copy the SQL from `lib/schema.ts`.
    - Run it in your Supabase Project's **SQL Editor** to create tables.

4.  **Run Locally**
    ```bash
    npm run dev
    ```

### Seeding Data
The app includes a powerful seeding script.
1.  Run the app locally.
2.  (Optional) If enabled in code, use the Seed function to populate 6 months of historical sales/expense data to visualize the charts.

---

## 💼 Business Workflows

### The "Manufacturing" Loop
1.  Go to **Purchasing** -> Buy 100g of Gold -> Receive it.
    *   *Result:* Raw Material Stock goes up.
2.  Go to **Manufacturing** -> Select Gold -> Use 5g + Add Labor Cost -> Create "Gold Ring".
    *   *Result:* Raw Material Stock -5g. Inventory +1 Ring.
3.  Go to **Inventory** -> Find "Gold Ring" -> Sell it.
    *   *Result:* Inventory -1 Ring. Cash +Profit. GL records Revenue.

---

**Built for the Jewelry Industry.**
