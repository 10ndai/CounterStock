import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface">
      <div className="text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-dark">CounterStock</h1>
          <p className="text-secondary font-medium mt-1">by Reed &amp; Carter</p>
        </div>
        <p className="text-dark/60 text-sm">Simple selling software for small businesses.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/pos"
            className="px-6 py-3 bg-primary text-surface rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Open POS
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </main>
  );
}
