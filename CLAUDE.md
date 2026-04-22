# CLAUDE.md — CounterStock by Reed & Carter

> Read this file at the start of every session. This is your briefing. Do not deviate from the stack, structure, or conventions defined here without explicit instruction.

---

## 🧾 North Star

**CounterStock** is a Point-of-Sale and inventory management system for small business owners in Zimbabwe — butchers, delis, spaza shops, and general dealers. It handles product management, sales transactions, receipt generation, stock tracking, and daily reporting. It runs on a tablet or desktop at the counter. Offline-capable. Fast. Simple enough for a non-technical shop owner to use every day.

This is a **Reed & Carter** product. It must look and feel polished, marketable, and trustworthy — not like a prototype.

Zimbabwe operates a **dual currency environment** — the system must support both **USD** and **ZWG (Zimbabwe Gold)** natively. The cashier selects the payment currency at checkout. Products are priced in USD as the base currency; ZWG prices are derived from the live or manually-set exchange rate.

---

## 🛠️ Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma (local, offline-first) |
| State | Zustand |
| UI Components | shadcn/ui |
| Receipt Printing | react-to-print |
| Testing | Vitest + React Testing Library |
| Package Manager | npm |

> Do not introduce libraries not listed here without asking first. If a library is needed, flag it before adding it.

---

## 📁 Folder Structure

```
/app
  /(pos)              → POS terminal (main selling interface)
  /(admin)            → Admin panel (products, pricing, reports)
  /(inventory)        → Inventory management (stock levels, restocks, adjustments)
  /api                → API route handlers
/components
  /ui                 → shadcn/ui base components (do not edit these)
  /pos                → POS-specific components
  /admin              → Admin-specific components
  /inventory          → Inventory-specific components
  /shared             → Components used across all sections
/lib
  /db.ts              → Prisma client singleton
  /utils.ts           → Shared utility functions
  /formatters.ts      → Currency, weight, date formatters
/hooks                → Custom React hooks
/types                → TypeScript interfaces and types
/prisma
  schema.prisma       → Database schema
  seed.ts             → Seed data for products
/public               → Static assets
```

> Always place new files in the correct folder. Never create files at the root unless instructed.

---

## 🧱 Data Models

### Product
```ts
{
  id: string
  name: string               // e.g. "Beef Ribeye", "Matemba", "Road Runner"
  category: string           // e.g. "Beef", "Pork", "Poultry", "Goat", "Processed"
  pricePerKgUSD: number      // base price per kg in USD — source of truth
  pricePerUnitUSD: number | null  // for fixed-price items (e.g. sausage packs), in USD
  soldByWeight: boolean      // true = weighed at counter, false = sold by unit
  stockKg: number            // current stock in kg (auto-decremented on sale)
  lowStockThresholdKg: number // alert threshold — e.g. 2.000 kg
  active: boolean
}
```

### Settings
```ts
{
  id: string                 // always a single row — "global"
  usdToZwgRate: number       // e.g. 35.50 means 1 USD = 35.50 ZWG
  updatedAt: Date
}
```

### SaleItem
```ts
{
  id: string
  saleId: string
  productId: string
  quantity: number           // kg if soldByWeight, units if not
  unitPriceUSD: number       // USD price at time of sale (snapshot)
  totalUSD: number
}
```

### Sale
```ts
{
  id: string
  items: SaleItem[]
  subtotalUSD: number
  totalUSD: number
  paymentCurrency: "USD" | "ZWG"
  exchangeRateUsed: number   // rate at time of sale — always snapshot, never recalculate
  totalInPaymentCurrency: number  // USD amount or ZWG equivalent at checkout
  paymentMethod: "cash" | "card"
  cashReceived: number | null     // in the payment currency
  changeGiven: number | null      // in the payment currency
  createdAt: Date
}
```

### StockMovement
```ts
{
  id: string
  productId: string
  type: "sale" | "restock" | "adjustment" | "wastage"
  quantityKg: number         // positive = stock added, negative = stock removed
  notes: string | null       // e.g. "Weekly delivery from supplier" or "Expired stock"
  createdBy: "system" | "admin"  // system = auto from sale, admin = manual entry
  createdAt: Date
}
```

---

## 📦 Inventory Rules

- **Stock is always tracked in kg**, even for unit-sold items (convert: 1 unit = estimated kg equivalent set on the product)
- **Every sale auto-decrements stock** via a `StockMovement` record of type `"sale"` — this happens server-side on sale completion, never client-side
- **Restocks are logged manually** by the admin — type `"restock"` with notes (e.g. supplier name, delivery date)
- **Adjustments** are for corrections — damaged stock, counting errors, spoilage — type `"adjustment"` or `"wastage"`
- **Low stock alerts** trigger when `stockKg` falls below `lowStockThresholdKg` — shown as a badge on the product in the POS and a summary in the admin panel
- **Stock history** is always derived from `StockMovement` records — never edit `stockKg` directly, always go through a movement
- The inventory screen shows: current stock levels, low stock warnings, restock history, and a button to log a new restock

---

## 🏷️ Naming Conventions

- **Components**: PascalCase — `ProductCard`, `SaleReceipt`, `WeightInput`, `CurrencyToggle`, `StockBadge`, `RestockForm`
- **Hooks**: camelCase with `use` prefix — `useSaleCart`, `useProducts`, `useExchangeRate`, `useStockMovements`
- **API routes**: kebab-case — `/api/products`, `/api/sales/today`, `/api/settings/rate`, `/api/inventory/restock`
- **Utility functions**: camelCase — `formatUSD()`, `formatZWG()`, `convertToZWG()`, `calculateTotal()`, `groupByCategory()`, `isLowStock()`
- **Database queries**: live in `/lib/db.ts` or dedicated `/lib/queries/` files, never inline in components
- **Constants**: SCREAMING_SNAKE_CASE — `MAX_WEIGHT_KG`, `DEFAULT_USD_TO_ZWG_RATE`, `DEFAULT_LOW_STOCK_THRESHOLD_KG`

---

## 💱 Currency & Units

### Dual Currency — Zimbabwe
Zimbabwe uses two currencies simultaneously. The system must handle both:

| Currency | Code | Symbol | Notes |
|---|---|---|---|
| US Dollar | USD | `$` | Base pricing currency. Stored in DB. |
| Zimbabwe Gold | ZWG | `ZWG` | Derived at checkout via exchange rate. |

### Rules
- **All products are priced and stored in USD** — this is the source of truth in the database
- **ZWG prices are always calculated at checkout**, never stored as a fixed value (the rate changes)
- The **exchange rate** (USD → ZWG) is set by the admin and stored in a `Settings` table — e.g. `1 USD = 35.50 ZWG`
- The admin can update the rate daily from the admin panel
- At checkout, cashier selects payment currency: **USD or ZWG**
- If ZWG is selected, the total is converted using the current rate and displayed in ZWG
- Receipts must show: the currency used, the rate applied, and the total in that currency

### Formatter Functions (all in `/lib/formatters.ts`)
- `formatUSD(amount: number)` → `$2.50`
- `formatZWG(amount: number)` → `ZWG 88.75`
- `convertToZWG(usdAmount: number, rate: number)` → `number`
- `formatWeight(kg: number)` → `1.250 kg`

### Weight
- Weight in **kilograms (kg)** — display to 3 decimal places (e.g. `1.250 kg`)
- Use `formatWeight()` from `/lib/formatters.ts`

---

## 🖥️ POS Terminal Rules

- The POS screen is the **primary interface** — optimise for speed and fat-finger use (large tap targets, minimum scrolling)
- Keypad for weight input must support decimal entry (e.g. `1.250`)
- Cart must update totals in real-time as items are added/removed
- **Cart always shows prices in USD** — ZWG equivalent shown as secondary info if rate is set
- Payment flow: select currency (USD or ZWG) → select method (cash/card) → enter cash amount if cash → show change in same currency → print/skip receipt → clear cart
- **Receipt must show**: items in USD, payment currency selected, exchange rate used, total in payment currency, change given
- Low stock products show a subtle warning badge — they can still be sold but the cashier is informed
- No login required for cashier — admin panel has a PIN gate
- If the ZWG rate has not been set today, show a **warning banner** on the POS: "Exchange rate not updated — contact admin"

---

## ⚙️ What NOT To Do

- Do **not** use `useEffect` for data fetching — use Server Components or React Query
- Do **not** hardcode prices, product names, or currency amounts in components
- Do **not** use `any` in TypeScript — always type properly
- Do **not** mix admin, POS, or inventory logic in the same component
- Do **not** modify files in `/components/ui/` — these are shadcn-managed
- Do **not** use `console.log` in production code — use a logger utility if needed
- Do **not** create a new Prisma client instance outside of `/lib/db.ts`
- Do **not** store ZWG prices in the database — always calculate from USD + rate at runtime
- Do **not** recalculate the exchange rate on a completed sale — always use `exchangeRateUsed` from the Sale record
- Do **not** edit `stockKg` directly — always create a `StockMovement` record and let the DB trigger or server action update the total

---

## 🔁 Session Workflow

Follow this order every session:

1. Read this file
2. Check `DEVLOG.md` for what was last built and what's pending
3. Confirm the task with the user before starting
4. Make one change at a time — one concern per prompt
5. Commit after every working feature: `git commit -m "feat: [what you built]"`
6. Run `/compact` at the end of each feature block
7. Update `DEVLOG.md` before ending the session

---

## ✅ Quick Reference

| Rule | Always |
|---|---|
| `CLAUDE.md` | Read at session start |
| `DEVLOG.md` | Update at session end |
| Git commit | After every working state |
| One concern | Per prompt |
| `formatUSD()` | For all USD display |
| `formatZWG()` | For all ZWG display |
| `convertToZWG()` | At checkout only, never in DB |
| `formatWeight()` | For all kg display |
| Prisma client | Only from `/lib/db.ts` |
| No `any` | TypeScript strict mode |
| Prices in DB | Always USD — never ZWG |
| Stock changes | Always via StockMovement — never direct edit |

---

*CounterStock — built by Reed & Carter. Vibe with intent. Ship with clarity.*

---

## 🎨 Brand & Colour Palette

**CounterStock** uses a **Slate & Champagne** colour system — chosen for trust, calm, and approachability. Do not deviate from these values. Do not introduce new colours without instruction.

### Colour Tokens

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-primary` | Slate Blue | `#3D5A80` | Buttons, nav active states, links, key UI actions |
| `--color-secondary` | Champagne | `#C9A96E` | Highlights, badges, accents, receipt header |
| `--color-alert` | Dusty Rose | `#C17C74` | Low stock warnings, error states, destructive actions |
| `--color-surface` | Warm White | `#FAF7F2` | Page backgrounds, card backgrounds |
| `--color-dark` | Charcoal | `#1E2A3A` | Body text, headings, sidebar backgrounds |

### Rules
- **Primary** is the action colour — buttons, selected states, active nav
- **Champagne** is the warmth colour — use sparingly for highlights and brand moments (receipt header, logo lockup)
- **Dusty Rose** is the only alert/warning colour — low stock badge, rate warning banner, delete confirmations
- **Warm White** is always the background — never pure `#FFFFFF`
- **Charcoal** is always the text colour — never pure `#000000`
- All components use CSS custom properties — never hardcode hex values in component files

### Tailwind Config
Add to `tailwind.config.ts`:
```ts
colors: {
  primary: '#3D5A80',
  secondary: '#C9A96E',
  alert: '#C17C74',
  surface: '#FAF7F2',
  dark: '#1E2A3A',
}
```

### Logo Colours
- Wordmark: **Charcoal** `#1E2A3A` on light backgrounds
- Wordmark: **Warm White** `#FAF7F2` on dark backgrounds
- Logo accent mark: **Champagne** `#C9A96E` — always

---

*CounterStock — built by Reed & Carter. Vibe with intent. Ship with clarity.*
