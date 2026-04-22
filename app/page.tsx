import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="CounterStock" width={280} height={80} className="object-contain" priority />
          <p className="text-secondary font-medium text-sm">by Reed &amp; Carter</p>
        </div>
        <p className="text-dark/50 text-sm">Simple selling software for small businesses.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/pos" className="px-8 py-3 bg-primary text-surface rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Open POS
          </Link>
          <Link href="/inventory" className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors">
            Inventory
          </Link>
          <Link href="/admin" className="px-8 py-3 border border-dark/20 text-dark rounded-lg font-semibold hover:bg-dark/5 transition-colors">
            Admin
          </Link>
          <Link href="/reports" className="px-8 py-3 border border-dark/20 text-dark rounded-lg font-semibold hover:bg-dark/5 transition-colors">
            Reports
          </Link>
        </div>
      </div>
    </main>
  );
}
