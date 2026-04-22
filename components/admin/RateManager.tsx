"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  currentRate: number;
  updatedAt: Date;
}

export function RateManager({ currentRate, updatedAt }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rate, setRate] = useState(currentRate.toString());
  const [saved, setSaved] = useState(false);

  const date = new Date(updatedAt);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(rate);
    if (!parsed || parsed <= 0) return;
    await fetch("/api/settings/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rate: parsed }),
    });
    setSaved(true);
    startTransition(() => { router.refresh(); });
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-xl border border-dark/10 bg-white p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-dark">USD → ZWG Rate</h3>
          <p className="text-xs text-dark/50 mt-0.5">
            Last updated: {date.toLocaleDateString("en-ZW", { day: "2-digit", month: "short", year: "numeric" })}
            {" "}at {date.toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isToday ? "bg-primary/10 text-primary" : "bg-alert/10 text-alert"}`}>
          {isToday ? "Updated today" : "Needs update"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="rate-input" className="sr-only">Exchange rate</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40 text-sm">1 USD =</span>
            <Input
              id="rate-input"
              type="number"
              min="0.01"
              step="0.01"
              value={rate}
              onChange={(e) => { setRate(e.target.value); setSaved(false); }}
              className="pl-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 text-sm">ZWG</span>
          </div>
        </div>
        <Button type="submit" disabled={isPending || saved}>
          {saved ? "Saved ✓" : "Update"}
        </Button>
      </form>
    </div>
  );
}
