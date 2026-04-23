"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, PowerOff, Power, Plus, ChevronDown, ChevronRight, Upload, X } from "lucide-react";
import Papa from "papaparse";
import type { Product, Supplier } from "@/types";
import { formatUSD, formatWeight } from "@/lib/formatters";
import { ProductForm } from "./ProductForm";
import { Button } from "@/components/ui/button";

interface Props {
  products: Product[];
  suppliers?: Supplier[];
}

interface CsvRow {
  name: string;
  category: string;
  pricePerKgUSD: string;
  soldByWeight: string;
  costPricePerKgUSD?: string;
  lowStockThresholdKg?: string;
}

interface ImportPreview {
  valid: CsvRow[];
  invalid: { row: number; reason: string }[];
}

export function ProductList({ products, suppliers = [] }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [addingVariantFor, setAddingVariantFor] = useState<Product | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const topLevel = products.filter((p) => p.parentId === null);

  async function handleSave(id: string, data: Partial<Product>) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    startTransition(() => router.refresh());
  }

  async function handleAdd(data: Partial<Product>) {
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, stockKg: 0 }),
    });
    setAdding(false);
    startTransition(() => router.refresh());
  }

  async function handleAddVariant(parentId: string, data: Partial<Product>) {
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, stockKg: 0, parentId }),
    });
    setAddingVariantFor(null);
    setExpanded((prev) => new Set([...prev, parentId]));
    startTransition(() => router.refresh());
  }

  async function toggleActive(product: Product) {
    const method = product.active ? "DELETE" : "PATCH";
    const body = product.active ? undefined : JSON.stringify({ active: true });
    await fetch(`/api/admin/products/${product.id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });
    startTransition(() => router.refresh());
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid: CsvRow[] = [];
        const invalid: { row: number; reason: string }[] = [];
        results.data.forEach((row, i) => {
          const rowNum = i + 2;
          if (!row.name?.trim()) { invalid.push({ row: rowNum, reason: "Missing name" }); return; }
          if (!row.category?.trim()) { invalid.push({ row: rowNum, reason: "Missing category" }); return; }
          const price = parseFloat(row.pricePerKgUSD);
          if (!price || price <= 0) { invalid.push({ row: rowNum, reason: "Invalid pricePerKgUSD" }); return; }
          valid.push(row);
        });
        setImportPreview({ valid, invalid });
        if (fileRef.current) fileRef.current.value = "";
      },
    });
  }

  async function confirmImport() {
    if (!importPreview?.valid.length) return;
    setImporting(true);
    await fetch("/api/admin/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: importPreview.valid }),
    });
    setImportPreview(null);
    setImporting(false);
    startTransition(() => router.refresh());
  }

  if (importPreview) {
    return (
      <div className="rounded-xl border border-dark/10 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-dark">CSV Import Preview</h3>
          <button onClick={() => setImportPreview(null)} className="text-dark/40 hover:text-dark">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-dark/60">
          <strong className="text-dark">{importPreview.valid.length}</strong> valid rows ·{" "}
          <strong className={importPreview.invalid.length > 0 ? "text-alert" : "text-dark"}>
            {importPreview.invalid.length}
          </strong>{" "}
          invalid rows (will be skipped)
        </p>
        {importPreview.invalid.length > 0 && (
          <div className="rounded-lg bg-alert/10 p-3 space-y-1">
            {importPreview.invalid.map((e) => (
              <p key={e.row} className="text-xs text-alert">Row {e.row}: {e.reason}</p>
            ))}
          </div>
        )}
        {importPreview.valid.length > 0 && (
          <div className="rounded-lg border border-dark/10 overflow-hidden">
            <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-dark/3 border-b border-dark/5">
              <p className="text-xs font-bold text-dark/40 uppercase">Name</p>
              <p className="text-xs font-bold text-dark/40 uppercase">Category</p>
              <p className="text-xs font-bold text-dark/40 uppercase text-right">Price/kg</p>
            </div>
            {importPreview.valid.slice(0, 10).map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 px-3 py-2 border-b border-dark/5 last:border-0">
                <p className="text-sm text-dark truncate">{row.name}</p>
                <p className="text-xs text-dark/50">{row.category}</p>
                <p className="text-sm text-dark text-right">{formatUSD(parseFloat(row.pricePerKgUSD))}</p>
              </div>
            ))}
            {importPreview.valid.length > 10 && (
              <p className="text-xs text-dark/40 text-center py-2">+{importPreview.valid.length - 10} more…</p>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setImportPreview(null)}>Cancel</Button>
          <Button
            className="flex-1"
            disabled={importPreview.valid.length === 0 || importing}
            onClick={confirmImport}
          >
            {importing ? "Importing…" : `Import ${importPreview.valid.length} Products`}
          </Button>
        </div>
      </div>
    );
  }

  if (adding) {
    return (
      <div className="rounded-xl border border-dark/10 bg-white p-5">
        <h3 className="font-semibold text-dark mb-4">New Product</h3>
        <ProductForm suppliers={suppliers} onSave={handleAdd} onCancel={() => setAdding(false)} />
      </div>
    );
  }

  if (addingVariantFor) {
    return (
      <div className="rounded-xl border border-dark/10 bg-white p-5">
        <h3 className="font-semibold text-dark mb-1">New Variant</h3>
        <p className="text-xs text-dark/50 mb-4">of {addingVariantFor.name}</p>
        <ProductForm
          suppliers={suppliers}
          parentId={addingVariantFor.id}
          onSave={(data) => handleAddVariant(addingVariantFor.id, data)}
          onCancel={() => setAddingVariantFor(null)}
        />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-dark/10 bg-white p-5">
        <h3 className="font-semibold text-dark mb-4">Edit — {editing.name}</h3>
        <ProductForm
          product={editing}
          suppliers={suppliers}
          onSave={(data) => handleSave(editing.id, data)}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 justify-end">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload size={14} /> Import CSV
        </Button>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={15} /> Add Product
        </Button>
      </div>

      <div className="rounded-xl border border-dark/10 overflow-hidden bg-white">
        {topLevel.map((product, idx) => {
          const hasVariants = (product.variants?.length ?? 0) > 0;
          const isExpanded = expanded.has(product.id);

          return (
            <div key={product.id}>
              <div
                className={`flex items-center gap-3 px-4 py-3 ${
                  idx < topLevel.length - 1 || isExpanded ? "border-b border-dark/5" : ""
                } ${!product.active ? "opacity-50" : ""}`}
              >
                {/* Expand toggle */}
                <button
                  onClick={() => hasVariants && toggleExpand(product.id)}
                  className={`shrink-0 text-dark/30 ${hasVariants ? "hover:text-dark cursor-pointer" : "cursor-default opacity-0"}`}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-dark truncate">{product.name}</p>
                    {hasVariants && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-medium">
                        {product.variants!.length} variant{product.variants!.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {!product.active && (
                      <span className="rounded-full bg-dark/10 px-2 py-0.5 text-[10px] text-dark/50 font-medium">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark/50">
                    {product.category} · {formatUSD(product.pricePerKgUSD)}/kg
                    {product.pricePerUnitUSD ? ` · ${formatUSD(product.pricePerUnitUSD)}/unit` : ""}
                    {" · "}{formatWeight(product.stockKg)} in stock
                  </p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setAddingVariantFor(product)}
                    className="rounded-lg p-2 text-dark/30 hover:bg-dark/5 hover:text-dark/60 transition-colors"
                    title="Add variant"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    onClick={() => setEditing(product)}
                    className="rounded-lg p-2 text-dark/40 hover:bg-dark/5 hover:text-primary transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => toggleActive(product)}
                    className={`rounded-lg p-2 transition-colors ${
                      product.active
                        ? "text-dark/40 hover:bg-alert/10 hover:text-alert"
                        : "text-dark/40 hover:bg-primary/10 hover:text-primary"
                    }`}
                    title={product.active ? "Deactivate" : "Reactivate"}
                  >
                    {product.active ? <PowerOff size={15} /> : <Power size={15} />}
                  </button>
                </div>
              </div>

              {/* Variants */}
              {hasVariants && isExpanded && product.variants!.map((variant, vIdx) => (
                <div
                  key={variant.id}
                  className={`flex items-center gap-3 pl-10 pr-4 py-2.5 bg-dark/2 ${
                    vIdx < product.variants!.length - 1 ? "border-b border-dark/5" : "border-b border-dark/5"
                  } ${!variant.active ? "opacity-50" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark truncate">{variant.name}</p>
                    <p className="text-xs text-dark/40">
                      {formatUSD(variant.pricePerKgUSD)}/kg · {formatWeight(variant.stockKg)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setEditing(variant)}
                      className="rounded-lg p-2 text-dark/40 hover:bg-dark/5 hover:text-primary transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => toggleActive(variant)}
                      className={`rounded-lg p-2 transition-colors ${
                        variant.active
                          ? "text-dark/40 hover:bg-alert/10 hover:text-alert"
                          : "text-dark/40 hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {variant.active ? <PowerOff size={13} /> : <Power size={13} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
