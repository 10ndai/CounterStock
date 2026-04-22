# DEVLOG.md — CounterStock by Reed & Carter

> Log every session here. What was built, what decisions were made, what's broken or pending. Future you will thank present you.

---

## Session Format

```
## [DATE] — [SESSION GOAL]
**Built:** ...
**Decisions:** ...
**Pending / Known Issues:** ...
**Commit:** git hash or message
```

---

## Session Log

<!-- Start logging below this line -->

## [2026-04-22] — Project Kickoff / Phase 1 Scaffold
**Built:**
- [x] Next.js 15 + React 19 with App Router + TypeScript
- [x] Tailwind CSS with brand colour tokens (primary, secondary, alert, surface, dark)
- [x] shadcn/ui base components: Button, Badge, Card, Input, Label, Separator
- [x] Prisma 5 + SQLite — full schema: Product, Settings, Sale, SaleItem, StockMovement
- [x] Full folder structure per CLAUDE.md (pos, admin, inventory, shared)
- [x] `/lib/db.ts` — Prisma singleton
- [x] `/lib/formatters.ts` — formatUSD, formatZWG, convertToZWG, formatWeight
- [x] `/lib/utils.ts` — cn, isLowStock, groupByCategory, calculateTotal
- [x] `/types/index.ts` — all TypeScript interfaces
- [x] Seed: 23 products across Beef, Pork, Poultry, Goat, Processed categories
- [x] Route shells: `/pos`, `/admin`, `/inventory`, home page

**Decisions:**
- Upgraded to Next.js 15 / React 19 (Next.js 14 had a critical security vulnerability)
- `unitWeightKg` added to Product schema for unit-sold items (used for stock kg tracking)
- SQLite db file excluded from git via .gitignore

**Pending (Phase 1 — Core POS):**
- Product grid (filterable by category) — Server Component
- Weight input keypad — Client Component
- Cart Zustand store (`useSaleCart`)
- Payment flow UI
- Receipt component (react-to-print)
- `/api/products` route
- `/api/sales` route (creates Sale + StockMovements)
- Stale rate warning banner

**Commit:** `init: scaffold CounterStock — Next.js 15, Tailwind, Prisma/SQLite, shadcn/ui base, 23 seeded products`

---

## Upcoming Features (Backlog)

### Phase 1 — Core POS
- [ ] Product grid (filterable by category)
- [ ] Weight input keypad
- [ ] Cart with real-time totals (shown in USD)
- [ ] **Currency selector at checkout** (USD or ZWG)
- [ ] ZWG total calculated from current rate at checkout
- [ ] Payment flow (cash + card, in selected currency)
- [ ] Change calculator (in selected currency)
- [ ] Receipt generation — shows USD prices, payment currency, rate used, total + change
- [ ] Stale rate warning banner on POS if rate not updated today
- [ ] Clear cart after sale

### Phase 2 — Inventory Management
- [ ] Stock levels dashboard (current kg per product)
- [ ] Low stock alerts list
- [ ] Log a restock (product, quantity, supplier, date)
- [ ] Log wastage / adjustment with notes
- [ ] Full stock movement history per product
- [ ] StockMovement auto-created on every sale (server-side)

### Phase 3 — Admin Panel
- [ ] PIN gate
- [ ] Product CRUD (add, edit, deactivate)
- [ ] Stock level updates
- [ ] **USD price management**
- [ ] **Exchange rate management** — set today's USD → ZWG rate

### Phase 4 — Reporting
- [ ] Daily sales summary (totals in USD + ZWG split)
- [ ] Top products by revenue
- [ ] Sales by payment currency (USD vs ZWG breakdown)
- [ ] Sales by payment method (cash vs card)
- [ ] Export to CSV

### Phase 5 — Polish
- [ ] Low stock alerts
- [ ] End-of-day cash up report (USD cash + ZWG cash separately)
- [ ] Offline indicator
- [ ] Tablet layout optimisation

---

*One feature at a time. Commit often. Stay in the CLAUDE.md.*

---

## Project Identity
**Product:** CounterStock
**By:** Reed & Carter
**Target:** Small business owners in Zimbabwe (butchers, delis, spaza shops)
**Tagline:** *Simple selling software for small businesses.*
