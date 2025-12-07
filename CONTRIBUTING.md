# Contributing to JewelERP — Quick Guide

This repo requires careful coordination between physical inventory changes and accounting (GL) entries. This file gives a short checklist and links to the important project files.

## Read first
 - `App.tsx`: business handlers & transactional patterns
 - `lib/schema.ts`: database schema
 - `lib/seeder.ts`: sample data generator
 - `types.ts`: shared types & enums
 - `components/*`: UI contracts and presentational components

## Core Rules
 - Always write `general_ledger_entries` when updating inventory, POs, or manufacturing jobs.
 - Use `getLocalDate()` instead of `new Date().toISOString()` for `entry_date`.
 - Use optimistic state updates with rollback on error.
 - Enforce status business rules in `App.tsx` handlers (e.g., `ItemStatus.SOLD` when `qty_available === 0`).

## Adding features
 1. Create/Update types in `types.ts` if you add new fields.
 2. Add DB columns via `lib/schema.ts` and run migrations in Supabase.
 3. Add handler in `App.tsx` following the 3-step pattern: physical update → GL entries → `fetchAllData()`.
 4. Add tests using Vitest & React Testing Library.

## Testing
 - Install dev deps: `npm install`
 - Run unit tests: `npm run test`
 - Run tests in watch mode: `npm run test:watch`

## PR checklist (also added in `.github/PULL_REQUEST_TEMPLATE.md`)
 - Files changed and intended DB updates
 - GL entries added with account codes
 - `getLocalDate()` used for `entry_date`
 - Tests added or updated

If you'd like a hands-on review or a short walkthrough of the codebase, open an issue or request a teammate to pair-review changes.
