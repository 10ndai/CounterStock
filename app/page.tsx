import Image from "next/image";
import Link from "next/link";
import { LoginGate } from "@/components/auth/LoginGate";

export default function HomePage() {
  return (
    <LoginGate>
      <main className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <div className="text-center space-y-10">
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/logo.png"
              alt="CounterStock"
              width={490}
              height={140}
              className="object-contain"
              style={{ maxWidth: "100%", height: "auto" }}
              priority
            />
            <p className="text-secondary font-medium text-sm tracking-wide">by Reed &amp; Carter</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/pos"
              className="px-10 py-3 bg-primary text-surface rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Launch
            </Link>
            <Link
              href="/admin"
              className="px-10 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </main>
    </LoginGate>
  );
}
