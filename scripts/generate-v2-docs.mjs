import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, NumberFormat,
  Header, Footer, PageNumber,
} from "docx";
import { writeFileSync } from "fs";

// Brand colours (approximated as hex for docx shading)
const SLATE   = "3D5A80";
const CHAMP   = "C9A96E";
const SURFACE = "FAF7F2";
const DARK    = "1E2A3A";
const WHITE   = "FFFFFF";

// ── Helpers ──────────────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    shading: { type: ShadingType.SOLID, color: SLATE, fill: SLATE },
    indent: { left: 200, right: 200 },
    run: { color: WHITE, bold: true, size: 32 },
  });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: SLATE })],
    spacing: { before: 320, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: CHAMP } },
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: DARK })],
    spacing: { before: 200, after: 60 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color: DARK })],
    spacing: { before: 60, after: 60 },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color: DARK })],
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
  });
}

function subbullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color: DARK })],
    bullet: { level: 1 },
    spacing: { before: 20, after: 20 },
  });
}

function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "555555" })],
    shading: { type: ShadingType.SOLID, color: "F4F4F4", fill: "F4F4F4" },
    spacing: { before: 40, after: 40 },
    indent: { left: 400 },
  });
}

function spacer() {
  return new Paragraph({ text: "", spacing: { before: 80, after: 80 } });
}

function note(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: "ℹ  ", bold: true, color: CHAMP, size: 20 }),
      new TextRun({ text, size: 20, color: "555555", italics: true }),
    ],
    shading: { type: ShadingType.SOLID, color: "FDF8F0", fill: "FDF8F0" },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: CHAMP } },
    indent: { left: 200 },
    spacing: { before: 80, after: 80 },
  });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: WHITE })] })],
            shading: { type: ShadingType.SOLID, color: SLATE, fill: SLATE },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
          })
        ),
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map(cell =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, color: DARK })] })],
              shading: { type: ShadingType.SOLID, color: ri % 2 === 0 ? WHITE : SURFACE, fill: ri % 2 === 0 ? WHITE : SURFACE },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
            })
          ),
        })
      ),
    ],
  });
}

// ── Document Sections ─────────────────────────────────────────────────────────

const coverPage = [
  new Paragraph({
    children: [new TextRun({ text: "", size: 40 })],
    spacing: { before: 1200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "CounterStock", bold: true, size: 72, color: SLATE })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 40 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Version 2.0 — Feature Documentation", size: 36, color: CHAMP })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "by Reed & Carter", size: 24, color: "777777", italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "─────────────────────────────────────────", color: CHAMP, size: 22 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "April 2026", size: 22, color: "999999" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Confidential — Internal Use Only", size: 18, color: "AAAAAA", italics: true })],
    alignment: AlignmentType.CENTER,
  }),
];

const tableOfContents = [
  h1("Table of Contents"),
  body("1.  Overview"),
  body("2.  What's New in v2.0"),
  body("3.  Multi-User System & Role-Based Access"),
  body("4.  Supplier Management"),
  body("5.  Product Variants"),
  body("6.  Bulk CSV Product Import"),
  body("7.  Enhanced Reports"),
  body("8.  Split Payments"),
  body("9.  Audit Log"),
  body("10. Technical Architecture"),
  body("11. Default Credentials & First Login"),
  body("12. API Reference"),
];

const overview = [
  h1("1. Overview"),
  body(
    "CounterStock is a Point-of-Sale and inventory management system built for small business owners " +
    "in Zimbabwe — butchers, delis, spaza shops, and general dealers. It runs on a tablet or desktop at " +
    "the counter, supports offline operation, and handles both USD and ZWG (Zimbabwe Gold) natively."
  ),
  spacer(),
  body("Version 2.0 is a major release that introduces:"),
  bullet("A full multi-user authentication system with role-based access control"),
  bullet("Supplier management linked to restock events"),
  bullet("Product variants (e.g. Commercial vs. Retail cuts)"),
  bullet("Bulk product import via CSV"),
  bullet("Enhanced reporting with cost prices, gross profit, and per-staff sales"),
  bullet("Split payment support (USD cash + ZWG cash in a single transaction)"),
  bullet("A tamper-evident audit log for all key operations"),
  spacer(),
  makeTable(
    ["Component", "Technology"],
    [
      ["Framework", "Next.js 15 (App Router, Server Components)"],
      ["Database", "SQLite via Prisma 5 (local, offline-first)"],
      ["Authentication", "bcryptjs password hashing + session cookie"],
      ["CSV Parsing", "papaparse (client-side)"],
      ["PDF Export", "jspdf + jspdf-autotable"],
      ["Styling", "Tailwind CSS with brand tokens"],
      ["State", "Zustand (cart)"],
    ]
  ),
];

const whatsNew = [
  h1("2. What's New in v2.0"),
  body("The following table summarises every major feature added in this release compared to v1.1:"),
  spacer(),
  makeTable(
    ["Feature", "v1.1", "v2.0"],
    [
      ["User login", "Single shared PIN gate", "Username + password per user"],
      ["Roles", "None", "OWNER / MANAGER / CASHIER"],
      ["Route protection", "None", "Middleware enforced per role"],
      ["Suppliers", "Not tracked", "Full supplier management + linked to restocks"],
      ["Product variants", "Not supported", "Self-referencing parent/variant model"],
      ["Bulk import", "Manual entry only", "CSV import with validation preview"],
      ["Cost prices", "Not tracked", "Per-product cost price + gross profit"],
      ["Reports — staff", "Not available", "Per-cashier transaction & revenue breakdown"],
      ["Reports — PDF", "CSV only", "PDF export via jspdf"],
      ["Payment methods", "Cash / Card", "Cash / Card / Split (USD + ZWG)"],
      ["Audit trail", "None", "Timestamped log of all key events"],
    ]
  ),
];

const multiUser = [
  h1("3. Multi-User System & Role-Based Access"),

  h2("3.1 Login Screen"),
  body(
    "On first load, users are presented with a username and password login screen. After a successful " +
    "login, a brief animated splash screen plays before the home page appears. The session is stored in " +
    "a secure, server-readable cookie named cs_session."
  ),
  spacer(),
  note(
    "The splash animation only plays on login — returning sessions skip straight to the app."
  ),

  h2("3.2 User Roles"),
  body("Three roles are available, each with different access permissions:"),
  spacer(),
  makeTable(
    ["Role", "POS", "Inventory", "Reports", "Admin"],
    [
      ["CASHIER", "✓ Full access", "✗ No access", "✗ No access", "✗ No access"],
      ["MANAGER", "✓ Full access", "✓ Full access", "✓ Full access", "✗ No access"],
      ["OWNER", "✓ Full access", "✓ Full access", "✓ Full access", "✓ Full access"],
    ]
  ),
  spacer(),
  body("Role enforcement happens at two levels:"),
  bullet("Server-side middleware (middleware.ts) intercepts every page request and redirects unauthorised users"),
  bullet("UI-level: the POS nav bar hides links the current user cannot access"),

  h2("3.3 Managing Users (Admin → Users tab)"),
  body("Visible to OWNER only. From this screen an Owner can:"),
  bullet("View all registered staff with their role and active status"),
  bullet("Add a new user — set username, password, and role"),
  bullet("Edit an existing user — change role or reset password"),
  bullet("Deactivate a user — they can no longer log in (the account is preserved for audit history)"),
  subbullet("A user cannot deactivate their own account"),
  subbullet("Deactivated users appear greyed out with an Inactive badge"),

  h2("3.4 Session Management"),
  body("Sessions are encoded as base64url JSON and stored in a cookie called cs_session with a 24-hour TTL. " +
    "The cookie is readable by both the Next.js middleware (for server-side routing) and client-side JavaScript " +
    "(for UI role awareness). It contains userId, username, and role."),
];

const suppliers = [
  h1("4. Supplier Management"),

  h2("4.1 Suppliers Tab (Admin)"),
  body(
    "A new Suppliers tab in the Admin panel allows staff to maintain a supplier directory. " +
    "Each supplier record holds a name, optional contact number, and optional notes."
  ),
  bullet("Add a supplier — name is required; contact and notes are optional"),
  bullet("Edit a supplier — update any field at any time"),
  spacer(),
  note("Suppliers are shared across all users. Only one active record per supplier name is expected."),

  h2("4.2 Linking Suppliers to Restocks"),
  body(
    "When logging a restock in the Inventory section, staff can now select a supplier from a dropdown " +
    "(populated from the supplier directory) instead of typing free-text notes. The supplier ID is stored " +
    "on the StockMovement record, enabling supplier-based reporting in a future release."
  ),
  bullet("If no suppliers have been added, the restock form shows the notes field only (backward compatible)"),
  bullet("An optional notes field is still available alongside the supplier dropdown"),

  h2("4.3 Default Supplier per Product"),
  body(
    "Each product can have a default supplier assigned (set in the product edit form). This is informational " +
    "and pre-selects the supplier when logging a restock for that product in future."
  ),
];

const variants = [
  h1("5. Product Variants"),

  h2("5.1 What Are Variants?"),
  body(
    "Variants allow a single parent product to have multiple sub-products with different prices or weights. " +
    "For example, 'Beef Steak' could have variants 'Ribeye', 'Sirloin', and 'T-Bone' — each with their own " +
    "price per kg but grouped under the same parent."
  ),

  h2("5.2 Creating Variants (Admin → Products)"),
  bullet("Every product row now has a small + icon next to the edit button"),
  bullet("Clicking + opens an 'Add Variant' form pre-linked to the parent product"),
  bullet("The variant inherits the parent's category but can have a completely different price, cost, and stock threshold"),
  bullet("Parent products show a coloured badge: '3 variants'"),
  bullet("Click the expand arrow (▶) to see all variants nested beneath the parent"),

  h2("5.3 Variant Selector in POS"),
  body(
    "When a cashier taps a product that has variants in the POS grid, an overlay appears showing the " +
    "parent product and all active variants. Tapping a variant proceeds to the weight/unit input as normal."
  ),
  bullet("The overlay appears centred on screen, with a backdrop"),
  bullet("Tapping outside the overlay (or pressing ×) dismisses it"),
  bullet("Inactive variants are never shown in the POS"),

  h2("5.4 Stock Tracking"),
  body(
    "Each variant maintains its own independent stock level (stockKg). Sales and restocks always target " +
    "the specific variant, not the parent."
  ),
];

const csvImport = [
  h1("6. Bulk CSV Product Import"),

  h2("6.1 CSV Format"),
  body("The expected CSV column headers are:"),
  spacer(),
  makeTable(
    ["Column", "Required", "Description"],
    [
      ["name", "Yes", "Product name (e.g. Beef Ribeye)"],
      ["category", "Yes", "Category (e.g. Beef, Pork, Poultry, Goat, Processed, Other)"],
      ["pricePerKgUSD", "Yes", "Price per kilogram in USD (e.g. 4.50)"],
      ["soldByWeight", "No", "true or false (defaults to true if omitted)"],
      ["costPricePerKgUSD", "No", "Cost price per kg in USD (leave blank if unknown)"],
      ["lowStockThresholdKg", "No", "Alert threshold in kg (defaults to 2.000)"],
    ]
  ),
  spacer(),
  body("Example CSV:"),
  code("name,category,pricePerKgUSD,soldByWeight,costPricePerKgUSD"),
  code("Beef Ribeye,Beef,7.50,true,4.20"),
  code("Beef Brisket,Beef,5.00,true,2.80"),
  code("Pork Chops,Pork,6.00,true,"),

  h2("6.2 Import Workflow"),
  bullet("In Admin → Products, click the Import CSV button"),
  bullet("Select a .csv file from your device"),
  bullet("CounterStock validates every row client-side using papaparse"),
  bullet("A preview screen shows:"),
  subbullet("Number of valid rows to be imported"),
  subbullet("Number of invalid rows (with row number and reason — will be skipped)"),
  subbullet("A preview table of the first 10 valid rows"),
  bullet("Click 'Import N Products' to confirm — all valid rows are created in a single database transaction"),
  bullet("Invalid rows are skipped silently (shown in the preview before confirming)"),
  spacer(),
  note(
    "All imported products start with stockKg = 0. Use the Inventory section to log opening stock via a Restock entry."
  ),
];

const reports = [
  h1("7. Enhanced Reports"),

  h2("7.1 Cost Prices & Gross Profit"),
  body(
    "Products can now have a costPricePerKgUSD field set. When cost data is available, the Reports section " +
    "shows additional information:"
  ),
  bullet("Gross Profit card on the Summary tab — total revenue minus total estimated cost"),
  bullet("Profit margin percentage shown next to the Gross Profit figure"),
  bullet("Top Products table shows a Cost column and a Profit/Margin column for each product that has cost data"),
  bullet("Products without cost data show 'no cost data' in the cost column"),
  spacer(),
  note(
    "Cost data is optional. If no products have a cost price set, the Gross Profit card is hidden " +
    "and the report behaves exactly as in v1.1."
  ),

  h2("7.2 Staff Report Tab"),
  body(
    "A new Staff tab is visible on the Reports page for MANAGER and OWNER roles. It shows a breakdown of " +
    "sales activity by cashier for the selected date range:"
  ),
  bullet("Cashier name and role"),
  bullet("Number of transactions processed"),
  bullet("Total revenue (USD equivalent)"),
  bullet("Totals row at the bottom"),
  spacer(),
  body("The Staff tab supports the same date ranges as the main report: Today, Yesterday, Last 7 Days, This Month."),

  h2("7.3 PDF Export"),
  body(
    "Each report view now includes an Export PDF button alongside the existing CSV export. The PDF is " +
    "generated entirely client-side using jspdf and jspdf-autotable — no server call is required."
  ),
  bullet("The PDF includes a header with the report title, period, and generation timestamp"),
  bullet("A summary line shows total transactions and total revenue"),
  bullet("A Top Products table is included with rank, name, category, quantity sold, and revenue"),
  bullet("The file is saved as counterstock-report-{period}.pdf"),

  h2("7.4 Split Payment Reporting"),
  bullet("Summary tab: shows a Split column in the 'By Method' section when split transactions exist"),
  bullet("Cash Up tab: a new Split Payments section shows count, USD cash portion, ZWG cash portion, and total USD equivalent"),
];

const splitPay = [
  h1("8. Split Payments"),

  h2("8.1 Overview"),
  body(
    "Split payment allows a customer to pay part of their total in USD cash and the remainder in ZWG cash. " +
    "This is common in the Zimbabwean market where customers may not have the exact amount in one currency."
  ),

  h2("8.2 Checkout Flow"),
  body("The checkout modal now offers three payment methods — Cash, Card, and Split:"),
  bullet("Step 1 — Select currency: still shown (for Cash and Card). Split skips this step and uses USD as the base."),
  bullet("Step 2 — Select method: Cash / Card / Split (shown as a 3-column grid with icons)"),
  bullet("Step 3 (Split only) — Enter USD cash amount and ZWG cash amount"),
  subbullet("The total due in USD is shown at the top"),
  subbullet("A running balance shows how much is still outstanding as amounts are entered"),
  subbullet("The Confirm button is disabled until the combined amounts cover the total"),
  subbullet("1 USD = {current rate} ZWG is shown for reference"),

  h2("8.3 Database Storage"),
  body("Split transactions are stored with:"),
  code("paymentMethod = 'split'"),
  code("splitUsdCash = <amount paid in USD>"),
  code("splitZwgCash = <amount paid in ZWG>"),
  code("paymentCurrency = 'USD' (base reference)"),
  code("totalUSD = full sale total"),

  h2("8.4 Receipt"),
  body("Receipts for split payments show:"),
  bullet("'Paid by: Split payment'"),
  bullet("'USD cash: $X.XX'"),
  bullet("'ZWG cash: ZWG X.XX'"),
  spacer(),
  note("No change is calculated for split payments — the cashier is expected to collect exact amounts."),
];

const auditLog = [
  h1("9. Audit Log"),

  h2("9.1 Overview"),
  body(
    "Every significant system event is recorded in a tamper-evident AuditLog table. Entries are written " +
    "server-side and are never deletable from the UI. The Audit Log tab (Admin → Audit Log, OWNER only) shows " +
    "the 200 most recent entries."
  ),

  h2("9.2 Logged Events"),
  makeTable(
    ["Event Code", "Triggered By", "Details Stored"],
    [
      ["LOGIN", "Any user logging in", "username"],
      ["PRODUCT_CREATE", "Adding a product", "name, category"],
      ["PRODUCT_EDIT", "Editing a product", "id, name"],
      ["PRODUCT_DEACTIVATE", "Deactivating a product", "id, name"],
      ["RESTOCK", "Logging a restock", "productId, quantityKg, supplierId"],
      ["ADJUSTMENT", "Logging a stock adjustment", "productId, quantityKg, type"],
      ["RATE_UPDATE", "Changing the exchange rate", "oldRate, newRate"],
      ["USER_CREATE", "Creating a new user", "newUsername, role"],
      ["USER_EDIT", "Editing a user", "userId, changes"],
      ["USER_DEACTIVATE", "Deactivating a user", "userId, username"],
      ["SUPPLIER_CREATE", "Adding a supplier", "name"],
    ]
  ),
  spacer(),
  note(
    "Audit entries are non-blocking — if the log write fails, the main operation still succeeds. " +
    "This ensures the audit system never interrupts a sale or restock."
  ),

  h2("9.3 Audit Log Display"),
  body("Each entry in the Audit Log view shows:"),
  bullet("Date and time (local Zimbabwe time)"),
  bullet("Human-readable event label (e.g. 'Exchange rate updated')"),
  bullet("Username of the person who performed the action"),
  bullet("Detail summary (e.g. 'oldRate: 35.5 · newRate: 37.0')"),
];

const architecture = [
  h1("10. Technical Architecture"),

  h2("10.1 Authentication Flow"),
  body("1. User submits username + password to POST /api/auth/login"),
  body("2. Server queries the User table, verifies password with bcrypt.compare"),
  body("3. On success: creates a base64url-encoded session cookie (cs_session) containing { userId, username, role }"),
  body("4. Cookie is set with httpOnly: false so both server middleware and client JS can read it"),
  body("5. Login response returns { ok: true, userId, username, role }"),
  body("6. Client stores this in sessionStorage under 'cs_user' for in-session role checks"),

  h2("10.2 Middleware Route Protection"),
  code("matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|api/).*)']"),
  body("The middleware runs on every page route. Logic:"),
  bullet("No cookie → redirect to / (login gate)"),
  bullet("CASHIER role → redirect from /inventory, /reports, /admin to /pos"),
  bullet("MANAGER role → redirect from /admin to /pos"),
  bullet("OWNER → full access"),

  h2("10.3 Prisma Schema — New Models"),
  code("model User {"),
  code("  id           String  @id @default(cuid())"),
  code("  username     String  @unique"),
  code("  passwordHash String"),
  code("  role         String  // OWNER | MANAGER | CASHIER"),
  code("  active       Boolean @default(true)"),
  code("  createdAt    DateTime @default(now())"),
  code("}"),
  spacer(),
  code("model Supplier {"),
  code("  id            String  @id @default(cuid())"),
  code("  name          String"),
  code("  contactNumber String?"),
  code("  notes         String?"),
  code("  active        Boolean @default(true)"),
  code("  createdAt     DateTime @default(now())"),
  code("}"),
  spacer(),
  code("model AuditLog {"),
  code("  id        String   @id @default(cuid())"),
  code("  userId    String"),
  code("  action    String"),
  code("  detail    String   @default('{}')  // JSON string"),
  code("  createdAt DateTime @default(now())"),
  code("}"),

  h2("10.4 New Fields on Existing Models"),
  makeTable(
    ["Model", "New Field", "Type", "Purpose"],
    [
      ["Product", "costPricePerKgUSD", "Float?", "Cost price for gross profit calculation"],
      ["Product", "parentId", "String?", "Self-reference for variant grouping"],
      ["Product", "defaultSupplierId", "String?", "FK to Supplier for restock suggestions"],
      ["Sale", "splitUsdCash", "Float?", "USD cash amount in a split payment"],
      ["Sale", "splitZwgCash", "Float?", "ZWG cash amount in a split payment"],
      ["Sale", "userId", "String?", "FK to User — who processed the sale"],
      ["StockMovement", "userId", "String?", "FK to User — who logged the movement"],
      ["StockMovement", "supplierId", "String?", "FK to Supplier — source of restock"],
    ]
  ),
];

const credentials = [
  h1("11. Default Credentials & First Login"),

  h2("11.1 Seed Account"),
  body("When the database is seeded for the first time, one Owner account is created:"),
  spacer(),
  makeTable(
    ["Field", "Value"],
    [
      ["Username", "admin"],
      ["Password", "counterstock"],
      ["Role", "OWNER"],
    ]
  ),
  spacer(),
  note(
    "Change the admin password immediately after first login in a production environment. " +
    "Go to Admin → Users → Edit admin → set a new password."
  ),

  h2("11.2 Adding Staff"),
  body("After logging in as Owner:"),
  bullet("Navigate to Admin → Users tab"),
  bullet("Click 'Add User'"),
  bullet("Set a username, temporary password, and role"),
  bullet("Share the credentials with the staff member and ask them to log in"),
  spacer(),
  body("There is no self-service password reset in v2.0. Only an OWNER can reset another user's password."),
];

const apiRef = [
  h1("12. API Reference — New in v2.0"),
  spacer(),
  makeTable(
    ["Method", "Endpoint", "Access", "Description"],
    [
      ["POST", "/api/auth/login", "Public", "Authenticate user, set cs_session cookie"],
      ["GET", "/api/admin/users", "Any role", "List all users (no password hash)"],
      ["POST", "/api/admin/users", "OWNER only", "Create a new user"],
      ["PATCH", "/api/admin/users/[id]", "OWNER only", "Edit role, password, or active status"],
      ["DELETE", "/api/admin/users/[id]", "OWNER only", "Deactivate user (soft delete)"],
      ["GET", "/api/admin/suppliers", "Any role", "List all suppliers"],
      ["POST", "/api/admin/suppliers", "Any role", "Create a supplier"],
      ["PATCH", "/api/admin/suppliers/[id]", "Any role", "Update a supplier"],
      ["POST", "/api/admin/products/import", "Any role", "Bulk create products from CSV rows"],
      ["GET", "/api/admin/audit", "OWNER only", "Last 200 audit log entries"],
      ["GET", "/api/reports/staff", "MANAGER/OWNER", "Per-cashier sales stats with date range"],
    ]
  ),
  spacer(),
  body("All existing v1.1 endpoints remain unchanged. New fields (splitUsdCash, userId, supplierId, etc.) are additive and optional, so existing integrations are unaffected."),
];

// ── Assemble Document ─────────────────────────────────────────────────────────

const doc = new Document({
  creator: "Reed & Carter",
  title: "CounterStock v2.0 Feature Documentation",
  description: "Complete feature documentation for CounterStock version 2.0",
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 20, color: DARK },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        run: { font: "Calibri", size: 32, bold: true, color: WHITE },
        paragraph: {
          spacing: { before: 400, after: 160 },
          shading: { type: ShadingType.SOLID, color: SLATE, fill: SLATE },
        },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        run: { font: "Calibri", size: 26, bold: true, color: SLATE },
        paragraph: { spacing: { before: 320, after: 100 } },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        run: { font: "Calibri", size: 22, bold: true, color: DARK },
        paragraph: { spacing: { before: 200, after: 60 } },
      },
    ],
  },
  sections: [
    {
      properties: {},
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "CounterStock v2.0 — Feature Documentation", size: 16, color: "999999" }),
                new TextRun({ text: "      by Reed & Carter", size: 16, color: CHAMP }),
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "EEEEEE" } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Page ", size: 16, color: "AAAAAA" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "AAAAAA" }),
                new TextRun({ text: " of ", size: 16, color: "AAAAAA" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "AAAAAA" }),
              ],
              border: { top: { style: BorderStyle.SINGLE, size: 6, color: "EEEEEE" } },
            }),
          ],
        }),
      },
      children: [
        ...coverPage,
        new Paragraph({ text: "", pageBreakBefore: true }),
        ...tableOfContents,
        new Paragraph({ text: "", pageBreakBefore: true }),
        ...overview,
        ...whatsNew,
        ...multiUser,
        ...suppliers,
        ...variants,
        ...csvImport,
        ...reports,
        ...splitPay,
        ...auditLog,
        ...architecture,
        ...credentials,
        ...apiRef,
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("CounterStock_v2.0_Documentation.docx", buffer);
console.log("✓ CounterStock_v2.0_Documentation.docx created");
