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

## [DATE: TBD] — Project Kickoff
**Built:**
- [ ] Scaffold Next.js project with App Router
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Configure Prisma with SQLite
- [ ] Define schema: Product, Sale, SaleItem
- [ ] Scaffold folder structure per CLAUDE.md
- [ ] Seed initial product list (beef cuts, pork, poultry, processed)

**Decisions:**
- SQLite chosen for offline-first operation at the counter
- No auth for cashier — PIN gate only for admin panel
- Sold-by-weight vs unit handled via `soldByWeight` boolean on Product

**Pending:**
- POS terminal UI
- Cart logic (Zustand store)
- Payment flow
- Receipt component

**Commit:** `init: scaffold project structure and Prisma schema`

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
