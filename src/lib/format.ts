export function formatMad(n: number, digits = 0): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
}

export function formatFx(n: number, digits = 4): string {
  return new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function formatPct(n: number, digits = 2): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)} %`;
}

export function formatNumber(n: number, digits = 0): string {
  return new Intl.NumberFormat("fr-MA", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
}
