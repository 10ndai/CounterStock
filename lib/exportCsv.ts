interface SaleRow {
  id: string;
  createdAt: string;
  totalUSD: number;
  paymentCurrency: string;
  exchangeRateUsed: number;
  totalInPaymentCurrency: number;
  paymentMethod: string;
  itemCount: number;
}

interface ProductStat {
  name: string;
  category: string;
  revenueUSD: number;
  quantitySold: number;
}

export function exportSalesCsv(sales: SaleRow[], dateLabel: string) {
  const header = ["Date", "Time", "Ref", "Items", "Total USD", "Currency", "Total in Currency", "Exchange Rate", "Method"];
  const rows = sales.map((s) => {
    const d = new Date(s.createdAt);
    return [
      d.toLocaleDateString("en-ZW"),
      d.toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" }),
      s.id.slice(-8).toUpperCase(),
      s.itemCount,
      s.totalUSD.toFixed(2),
      s.paymentCurrency,
      s.totalInPaymentCurrency.toFixed(2),
      s.exchangeRateUsed,
      s.paymentMethod,
    ];
  });

  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  download(`counterstock-sales-${dateLabel}.csv`, csv);
}

export function exportProductsCsv(products: ProductStat[], dateLabel: string) {
  const header = ["Product", "Category", "Revenue USD", "Quantity Sold"];
  const rows = products.map((p) => [
    `"${p.name}"`,
    p.category,
    p.revenueUSD.toFixed(2),
    p.quantitySold.toFixed(3),
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  download(`counterstock-products-${dateLabel}.csv`, csv);
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
