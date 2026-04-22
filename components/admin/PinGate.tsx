"use client";
import { useState } from "react";
import Image from "next/image";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export function PinGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function press(key: string) {
    if (key === "⌫") { setPin((p) => p.slice(0, -1)); setError(false); return; }
    if (pin.length >= 4) return;
    setPin((p) => p + key);
    setError(false);
  }

  async function verify(finalPin: string) {
    if (finalPin.length < 4) return;
    setLoading(true);
    const res = await fetch("/api/admin/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: finalPin }),
    });
    const { ok } = await res.json() as { ok: boolean };
    setLoading(false);
    if (ok) { setUnlocked(true); }
    else { setError(true); setPin(""); }
  }

  function handleKey(key: string) {
    if (!key) return;
    if (key === "⌫") { press(key); return; }
    const next = pin + key;
    setPin(next);
    setError(false);
    if (next.length === 4) verify(next);
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-80 space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="CounterStock" width={180} height={50} className="object-contain" />
          <p className="text-sm text-dark/50">Enter your PIN to continue</p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full transition-colors ${
                i < pin.length
                  ? error ? "bg-alert" : "bg-primary"
                  : "bg-dark/15"
              }`}
            />
          ))}
        </div>
        {error && <p className="text-sm text-alert -mt-2">Incorrect PIN. Try again.</p>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((key, idx) => (
            <button
              key={idx}
              onClick={() => handleKey(key)}
              disabled={!key || loading}
              className={`flex items-center justify-center rounded-xl py-4 text-xl font-semibold transition-colors select-none
                ${!key ? "invisible" : key === "⌫"
                  ? "bg-dark/5 text-alert hover:bg-alert/10"
                  : "bg-dark/5 text-dark hover:bg-dark/10 active:bg-dark/20"
                } disabled:opacity-50`}
            >
              {key === "⌫" ? <Delete size={20} /> : key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
