export function formatFixed(value: unknown, fractionDigits = 0): string {
  const numericValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return (0).toFixed(fractionDigits);
  }

  return numericValue.toFixed(fractionDigits);
}

export function formatPercent(value: unknown, fractionDigits = 0): string {
  return `${formatFixed(value, fractionDigits)}%`;
}
