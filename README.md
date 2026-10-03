# CounterStock

Point-of-sale and stock system for small butcheries and food retailers in Zimbabwe.

Most small shops track sales in a notebook and stock by eye. CounterStock records every sale and stock movement as it happens, handles the USD and ZWG prices that Zimbabwean shops deal with every day, and turns the day's trading into reports the owner can actually use.

## What it does

- **Point of sale.** Product grid by category, sell by unit or by weight (kg), cash, card or split payments, and printable receipts.
- **Dual currency.** Prices in USD and ZWG, with a manager-set exchange rate and a warning when the rate is out of date.
- **Inventory.** Restocks, adjustments and a full stock movement history, with low-stock alerts on the till screen.
- **Reports.** Daily cash-up, sales summary, top products and per-staff sales, exportable to PDF.
- **Admin.** Products (including CSV import), suppliers, staff accounts and an audit log of changes.
- **Roles.** Owner, manager and cashier accounts. Cashiers only see the till, and admin pages need a PIN.

It runs on the shop's own computer with a local database, so sales keep working without an internet connection.

## Stack

| Layer | Tools |
| --- | --- |
| App | Next.js 15, React 19, TypeScript |
| UI | Tailwind CSS, shadcn/ui, Radix UI |
| State | Zustand |
| Database | SQLite with Prisma |
| Exports | jsPDF (reports), PapaParse (CSV import) |

## Run locally

Requires Node 20+.

```bash
npm install
npm run db:push      # create the local SQLite database
npm run db:seed      # load demo products and accounts
npm run dev          # http://localhost:3000
```

The seed data is a demo product list. No real shop's data is stored in this repository.

## Status

This repository holds an earlier version. A newer version is in development and not yet published here.