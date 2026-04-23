"use client";
import { useState } from "react";
import type { Product, Supplier, User, UserRole } from "@/types";
import { ProductList } from "./ProductList";
import { RateManager } from "./RateManager";
import { UserManager } from "./UserManager";
import { SupplierManager } from "./SupplierManager";
import { AuditLogView } from "./AuditLogView";

interface Props {
  products: Product[];
  exchangeRate: number;
  rateUpdatedAt: Date;
  users?: User[];
  suppliers?: Supplier[];
  role?: UserRole;
}

type Tab = "products" | "rate" | "suppliers" | "users" | "audit";

export function AdminClient({
  products,
  exchangeRate,
  rateUpdatedAt,
  users = [],
  suppliers = [],
  role,
}: Props) {
  const isOwner = role === "OWNER";

  const tabs: { key: Tab; label: string }[] = [
    { key: "products", label: `Products (${products.length})` },
    { key: "rate", label: "Exchange Rate" },
    { key: "suppliers", label: `Suppliers (${suppliers.length})` },
    ...(isOwner ? [{ key: "users" as Tab, label: `Users (${users.length})` }] : []),
    ...(isOwner ? [{ key: "audit" as Tab, label: "Audit Log" }] : []),
  ];

  const [tab, setTab] = useState<Tab>("products");

  return (
    <div className="space-y-5">
      <div className="flex gap-1 rounded-xl bg-dark/5 p-1 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors min-w-[80px] ${
              tab === t.key
                ? "bg-white text-dark shadow-sm"
                : "text-dark/50 hover:text-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductList products={products} suppliers={suppliers} />}
      {tab === "rate" && <RateManager currentRate={exchangeRate} updatedAt={rateUpdatedAt} />}
      {tab === "suppliers" && <SupplierManager suppliers={suppliers} />}
      {tab === "users" && isOwner && <UserManager users={users} />}
      {tab === "audit" && isOwner && <AuditLogView />}
    </div>
  );
}
