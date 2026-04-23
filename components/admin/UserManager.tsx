"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, UserX, UserCheck } from "lucide-react";
import type { User, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  users: User[];
}

const ROLES: UserRole[] = ["CASHIER", "MANAGER", "OWNER"];

function UserForm({
  user,
  onSave,
  onCancel,
}: {
  user?: User;
  onSave: (data: { username: string; password?: string; role: UserRole }) => Promise<void>;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? "CASHIER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim()) { setError("Username is required."); return; }
    if (!user && !password) { setError("Password is required for new users."); return; }
    setSaving(true);
    try {
      await onSave({ username: username.trim(), ...(password ? { password } : {}), role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="um-username">Username</Label>
        <Input
          id="um-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. jane"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="um-password">{user ? "New password (leave blank to keep)" : "Password"}</Label>
        <Input
          id="um-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="um-role">Role</Label>
        <select
          id="um-role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="mt-1 w-full rounded-md border border-dark/20 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-alert">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? "Saving…" : user ? "Save Changes" : "Add User"}
        </Button>
      </div>
    </form>
  );
}

export function UserManager({ users }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [error, setError] = useState("");

  async function handleAdd(data: { username: string; password?: string; role: UserRole }) {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json() as { error?: string };
      throw new Error(json.error ?? "Failed to create user.");
    }
    setAdding(false);
    startTransition(() => router.refresh());
  }

  async function handleEdit(id: string, data: { username: string; password?: string; role: UserRole }) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    startTransition(() => router.refresh());
  }

  async function toggleActive(user: User) {
    setError("");
    if (!user.active) {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
    } else {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        setError(json.error ?? "Cannot deactivate this user.");
        return;
      }
    }
    startTransition(() => router.refresh());
  }

  if (adding) {
    return (
      <div className="rounded-xl border border-dark/10 bg-white p-5">
        <h3 className="font-semibold text-dark mb-4">New User</h3>
        <UserForm onSave={handleAdd} onCancel={() => setAdding(false)} />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-dark/10 bg-white p-5">
        <h3 className="font-semibold text-dark mb-4">Edit — {editing.username}</h3>
        <UserForm
          user={editing}
          onSave={(data) => handleEdit(editing.id, data)}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-alert bg-alert/10 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setError(""); setAdding(true); }}>
          <Plus size={15} /> Add User
        </Button>
      </div>
      <div className="rounded-xl border border-dark/10 overflow-hidden bg-white">
        {users.map((user, idx) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 px-4 py-3 ${idx < users.length - 1 ? "border-b border-dark/5" : ""} ${!user.active ? "opacity-50" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-dark">{user.username}</p>
                <span className="rounded-full bg-dark/8 px-2 py-0.5 text-[10px] font-medium text-dark/60">
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </span>
                {!user.active && (
                  <span className="rounded-full bg-alert/10 px-2 py-0.5 text-[10px] text-alert font-medium">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setEditing(user)}
                className="rounded-lg p-2 text-dark/40 hover:bg-dark/5 hover:text-primary transition-colors"
                title="Edit"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => toggleActive(user)}
                className={`rounded-lg p-2 transition-colors ${
                  user.active
                    ? "text-dark/40 hover:bg-alert/10 hover:text-alert"
                    : "text-dark/40 hover:bg-primary/10 hover:text-primary"
                }`}
                title={user.active ? "Deactivate" : "Reactivate"}
              >
                {user.active ? <UserX size={15} /> : <UserCheck size={15} />}
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-dark/40 text-center py-6">No users yet.</p>
        )}
      </div>
    </div>
  );
}
