"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  children: React.ReactNode;
}

type Phase = "loading" | "login" | "animating" | "app";

export function LoginGate({ children }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("cs_auth") === "1") {
      setPhase("app");
    } else {
      setPhase("login");
    }
  }, []);

  useEffect(() => {
    if (phase !== "animating") return;
    const t1 = setTimeout(() => setLogoVisible(true), 60);
    const t2 = setTimeout(() => setFading(true), 2200);
    const t3 = setTimeout(() => setPhase("app"), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [phase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const { ok } = await res.json() as { ok: boolean };
    setSubmitting(false);
    if (ok) {
      sessionStorage.setItem("cs_auth", "1");
      setLogoVisible(false);
      setFading(false);
      setPhase("animating");
    } else {
      setError("Invalid username or password.");
    }
  }

  if (phase === "loading") return null;

  if (phase === "animating") {
    return (
      <div
        className={`min-h-screen bg-surface flex items-center justify-center transition-opacity duration-500 ${
          fading ? "opacity-0" : "opacity-100"
        }`}
      >
        <div
          className={`flex flex-col items-center gap-4 transition-all duration-700 ${
            logoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Image
            src="/logo.png"
            alt="CounterStock"
            width={340}
            height={96}
            className="object-contain"
            priority
          />
          <p className="text-secondary font-medium text-sm tracking-wide">by Reed &amp; Carter</p>
        </div>
      </div>
    );
  }

  if (phase === "app") return <>{children}</>;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-80 space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt="CounterStock"
            width={200}
            height={56}
            className="object-contain"
            priority
          />
          <p className="text-secondary font-medium text-sm">by Reed &amp; Carter</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark/60 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-dark/15 bg-white px-4 py-3 text-dark placeholder:text-dark/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark/60 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-dark/15 bg-white px-4 py-3 text-dark placeholder:text-dark/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-alert">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-3 text-surface font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
