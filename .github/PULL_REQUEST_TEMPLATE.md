## Summary

Please provide a short description of the change and why it is needed.

---

### Checklist (PR authors)
- [ ] I updated `types.ts` if I added/changed a DB model
- [ ] I updated `lib/schema.ts` if I changed DB schema
- [ ] The PR includes changes to any business handlers in `App.tsx` and lists which physical tables are updated (inventory / raw_materials / purchase_orders)
- [ ] If I changed inventory or values, I created corresponding `general_ledger_entries` rows; include the account codes used and a small example (debit/credit pairs)
- [ ] I used `getLocalDate()` for ledger `entry_date` fields
- [ ] I updated or added tests (unit or integration) for new behavior and ran `npm run test`
- [ ] The PR description includes any required environment variable changes and a short verification checklist

### Reviewer notes
- Pay attention to business logic in `App.tsx` — ensure every physical change is accompanied by GL entries.
- If this PR modifies finance flows, consider requesting an accounting review.
