import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isLowStock(stockKg: number, thresholdKg: number): boolean {
  return stockKg <= thresholdKg;
}

export function groupByCategory<T extends { category: string }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

export function calculateTotal(items: { totalUSD: number }[]): number {
  return items.reduce((sum, item) => sum + item.totalUSD, 0);
}
