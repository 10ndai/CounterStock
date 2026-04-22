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

**Commit:** `init: scaffold CounterStock — Next.js 15, Tailwind, Prisma/SQLite, shadcn/ui base, 23 seeded products`

---

## [2026-04-22] — Phase 1: POS Terminal
**Built:**
- [x] `/api/products` GET — active products ordered by category
- [x] `/api/settings/rate` GET + POST — exchange rate management
- [x] `/api/sales` POST — creates Sale + SaleItems + StockMovements in a transaction; decrements stock
- [x] `useSaleCart` Zustand store — addItem (merges duplicates), removeItem, clearCart, totalUSD
- [x] `ProductGrid` — category filter tabs + responsive grid
- [x] `ProductCard` — shows name, price, stock level, low-stock badge
- [x] `WeightInput` — decimal keypad for kg (3dp) or unit quantities
- [x] `CartPanel` — live cart with USD total + ZWG equivalent
- [x] `CheckoutModal` — 4-step flow: currency → method → cash amount → complete
- [x] `SaleReceipt` — printable monospace receipt (react-to-print)
- [x] `StaleRateBanner` — warns if rate not updated today
- [x] `POSTerminal` — Server Component page wires everything together

**Decisions:**
- POS page is a Server Component — fetches products + settings via Prisma directly (no useEffect)
- Stock decrement happens server-side in the `/api/sales` transaction — never client-side
- Cart merges duplicate products by quantity, recalculates total on every change
- Receipt is hidden in DOM, revealed only for react-to-print

---

## [2026-04-22] — Phase 2: Inventory Management
**Built:**
- [x] `/api/inventory/restock` POST — increments stockKg + creates StockMovement (admin)
- [x] `/api/inventory/adjustment` POST — decrements stockKg + creates StockMovement (wastage/adjustment)
- [x] `/api/inventory/movements` GET — last 100 movements, optionally filtered by productId
- [x] `StockBadge` — green/red badge with stock kg + low-stock icon
- [x] `RestockForm` — product selector, kg input, notes field
- [x] `AdjustmentForm` — product selector, wastage/adjustment toggle, kg input, notes
- [x] `MovementHistory` — chronological feed with type icons and quantity delta
- [x] `InventoryClient` — tabbed shell: Restock / Adjustment / History
- [x] `/inventory` page — stock levels table grouped by category + management panel

**Decisions:**
- All stock changes go through Prisma transactions — product.stockKg + StockMovement created atomically
- Adjustments always remove stock (quantityKg stored as negative); restocks always add (positive)
- router.refresh() used after form submit to re-fetch Server Component data without full navigation

---

## [2026-04-22] — Phase 3: Admin Panel
**Built:**
- [x] `ADMIN_PIN` env var in `.env.local` (default: 1234, change before production)
- [x] `/api/admin/pin` POST — verifies PIN server-side against env var
- [x] `/api/admin/products` GET + POST — list all (including inactive) + create
- [x] `/api/admin/products/[id]` PATCH + DELETE — edit fields + soft-deactivate
- [x] `PinGate` — numeric keypad, auto-submits on 4th digit, dot-indicator feedback
- [x] `RateManager` — inline rate editor, shows last-updated timestamp and today/stale badge
- [x] `ProductForm` — add/edit with weight vs unit toggle, all fields validated
- [x] `ProductList` — full list with edit pencil + activate/deactivate toggle
- [x] `AdminClient` — Products / Exchange Rate tab shell
- [x] `/admin` page — Server Component behind PinGate

**Decisions:**
- PIN verified server-side only — never exposed to client
- Deactivate is a soft delete (active: false) — product history preserved, reactivation possible
- `.env.local` excluded from git; default PIN documented here for handoff

**Pending (Phase 4 — Reporting):**
- Daily sales summary (USD + ZWG split)
- Top products by revenue
- Sales by payment currency + method breakdown
- Export to CSV

**Commit:** `feat: POS terminal — product grid, weight keypad, cart, checkout flow, receipt`

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
