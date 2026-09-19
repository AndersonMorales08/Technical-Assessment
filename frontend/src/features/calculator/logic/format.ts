const SIGNIFICANT_DIGITS = 12;
const MANTISSA_DECIMALS = 6;
/** Desde este valor (o por debajo del pequeño) se usa notación científica. */
const LARGE_NUMBER_LIMIT = 1e15;
const SMALL_NUMBER_LIMIT = 1e-6;

/** Número → texto interno, sin errores de coma flotante (0.1 + 0.2 → "0.3"). */
export function toRaw(value: number): string {
  if (value === 0) return "0"; // también cubre -0

  const magnitude = Math.abs(value);
  if (magnitude >= LARGE_NUMBER_LIMIT || magnitude < SMALL_NUMBER_LIMIT) {
    return value.toExponential(MANTISSA_DECIMALS).replace(/\.?0+e/, "e");
  }
  return String(parseFloat(value.toPrecision(SIGNIFICANT_DIGITS)));
}

/** Texto interno → texto visible al estilo español ("1234.5" → "1.234,5"). */
export function formatNumber(raw: string): string {
  if (raw.includes("e")) return raw.replace(".", ",").replace("e+", "e");

  const sign = raw.startsWith("-") ? "-" : "";
  const [integerPart, decimalPart] = raw.replace("-", "").split(".");
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimals = decimalPart !== undefined ? `,${decimalPart}` : "";

  return `${sign}${grouped}${decimals}`;
}

export const formatOperand = (value: number): string => formatNumber(toRaw(value));
