/**
 * Formats a minor-unit integer (e.g., 250000) into a localized currency string.
 * @param value - The price in minor units (kobo/cents).
 * @param currencyCode - The ISO 4217 currency code (default: 'NGN').
 * @param locale - The locale string (default: 'en-NG').
 */
export const formatMinorUnitToCurrency = (
  value: number | bigint,
  currencyCode: string = 'NGN',
  locale: string = 'en-NG'
): string => {
  // Convert minor units (int64) to major units (float)
  // 250000 becomes 2500.00
  const majorUnit = Number(value) / 100;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    // Use 'narrowSymbol' to ensure you get ₦ instead of NGN
    currencyDisplay: 'narrowSymbol',
    // Often prices on cards don't need .00 if they are whole numbers
    // But for currency, it's safer to keep 2 decimal places:
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(majorUnit);
};