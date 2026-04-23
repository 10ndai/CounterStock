export interface User {
  id: string;
  username: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
  active: boolean;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactNumber: string | null;
  notes: string | null;
  active: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  pricePerKgUSD: number;
  pricePerUnitUSD: number | null;
  costPricePerKgUSD: number | null;
  soldByWeight: boolean;
  stockKg: number;
  lowStockThresholdKg: number;
  unitWeightKg: number | null;
  active: boolean;
  parentId: string | null;
  defaultSupplierId: string | null;
  createdAt: Date;
  updatedAt: Date;
  variants?: Product[];
}

export interface Settings {
  id: string;
  usdToZwgRate: number;
  updatedAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPriceUSD: number;
  totalUSD: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotalUSD: number;
  totalUSD: number;
  paymentCurrency: "USD" | "ZWG";
  exchangeRateUsed: number;
  totalInPaymentCurrency: number;
  paymentMethod: "cash" | "card" | "split";
  cashReceived: number | null;
  changeGiven: number | null;
  splitUsdCash: number | null;
  splitZwgCash: number | null;
  userId: string | null;
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "sale" | "restock" | "adjustment" | "wastage";
  quantityKg: number;
  notes: string | null;
  createdBy: "system" | "admin";
  userId: string | null;
  supplierId: string | null;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  totalUSD: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  detail: string;
  createdAt: Date;
  user: { username: string };
}

export type PaymentCurrency = "USD" | "ZWG";
export type PaymentMethod = "cash" | "card" | "split";
export type UserRole = "OWNER" | "MANAGER" | "CASHIER";
