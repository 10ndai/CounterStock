export interface Product {
  id: string;
  name: string;
  category: string;
  pricePerKgUSD: number;
  pricePerUnitUSD: number | null;
  soldByWeight: boolean;
  stockKg: number;
  lowStockThresholdKg: number;
  unitWeightKg: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  paymentMethod: "cash" | "card";
  cashReceived: number | null;
  changeGiven: number | null;
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "sale" | "restock" | "adjustment" | "wastage";
  quantityKg: number;
  notes: string | null;
  createdBy: "system" | "admin";
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  totalUSD: number;
}

export type PaymentCurrency = "USD" | "ZWG";
export type PaymentMethod = "cash" | "card";
