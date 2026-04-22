import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CounterStock",
  description: "Point-of-Sale and inventory management by Reed & Carter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
