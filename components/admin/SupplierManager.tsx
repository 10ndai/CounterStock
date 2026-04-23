"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import type { Supplier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  suppliers: Supplier[];
}

function SupplierForm({
  supplier,
  onSave,
  onCancel,
}: {
  supplier?: Supplier;
  onSave: (data: { name: string; contactNumber?: string; notes?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(supplier?.name ?? "");
  const [contactNumber, setContactNumber] = useState(supplier?.contactNumber ?? "");
  const [notes, setNotes] = useState(supplier?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    await onSave({
      name: name.trim(),
      contactNumber: contactNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="sf-name">Supplier name</Label>
        <Input
          id="sf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. ABC Abattoir"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="sf-contact">Contact number (optional)</Label>
        <Input
          id="sf-contact"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="e.g. +263 77 123 4567"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="sf-notes">Notes (optional)</Label>
        <Input
          id="sf-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Delivers every Monday"
          className="mt-1"
        />
      </div>
      {error && <p className="text-sm text-alert">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? "Saving…" : supplier ? "Save Changes" : "Add Supplier"}
        </Button>
      </div>
    </form>
  );
}

export function SupplierManager({ suppliers }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  async function handleAdd(data: { name: string; contactNumber?: string; notes?: string }) {
    await fetch("/api/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setAdding(false);
    startTransition(() => router.refresh());
  }

  async function handleEdit(id: string, data: { name: string; contactNumber?: string; notes?: string }) {
    await fetch(`/api/admin/suppliers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    startTransition(() => router.refresh());
  }

  if (adding) {
    return (
      <div className="rounded-xl border border-dark/10 bg-white p-5">
        <h3 className="font-semibold text-dark mb-4">New Supplier</h3>
        <SupplierForm onSave={handleAdd} onCancel={() => setAdding(false)} />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-dark/10 bg-white p-5">
        <h3 className="font-semibold text-dark mb-4">Edit — {editing.name}</h3>
        <SupplierForm
          supplier={editing}
          onSave={(data) => handleEdit(editing.id, data)}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={15} /> Add Supplier
        </Button>
      </div>
      <div className="rounded-xl border border-dark/10 overflow-hidden bg-white">
        {suppliers.map((s, idx) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 px-4 py-3 ${idx < suppliers.length - 1 ? "border-b border-dark/5" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark">{s.name}</p>
              {(s.contactNumber || s.notes) && (
                <p className="text-xs text-dark/50 truncate">
                  {[s.contactNumber, s.notes].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <button
              onClick={() => setEditing(s)}
              className="rounded-lg p-2 text-dark/40 hover:bg-dark/5 hover:text-primary transition-colors shrink-0"
              title="Edit"
            >
              <Pencil size={15} />
            </button>
          </div>
        ))}
        {suppliers.length === 0 && (
          <p className="text-sm text-dark/40 text-center py-6">No suppliers added yet.</p>
        )}
      </div>
    </div>
  );
}
