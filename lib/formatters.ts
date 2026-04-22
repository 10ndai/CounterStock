export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatZWG(amount: number): string {
  return `ZWG ${amount.toFixed(2)}`;
}

export function convertToZWG(usdAmount: number, rate: number): number {
  return usdAmount * rate;
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(3)} kg`;
}
