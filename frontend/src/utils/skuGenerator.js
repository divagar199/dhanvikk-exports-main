/**
 * Dhanvikk Blooms & Exports - 10-Digit Serial Number / SKU Engine
 * Format: YYMMDDXXXX (10 numeric digits)
 * Example for 30 Oct 2026: '2610300001'
 *   - YY: 2-digit year (e.g. '26')
 *   - MM: 2-digit month (e.g. '10')
 *   - DD: 2-digit day (e.g. '30')
 *   - XXXX: 4-digit zero-padded sequence (e.g. '0001', '0002'...)
 */

export function formatDateToPrefix(date = new Date()) {
  const d = date instanceof Date && !isNaN(date) ? date : new Date(date || Date.now());
  const year = String(d.getFullYear()).slice(-2);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Validates whether an input is a genuine 10-digit numeric SKU.
 */
export function isValid10DigitSKU(sku) {
  return /^\d{10}$/.test(String(sku || '').trim());
}

/**
 * Generates a 10-digit SKU from a date and a 1-based sequence number.
 */
export function generateProductSKU(date = new Date(), sequence = 1) {
  const prefix = formatDateToPrefix(date);
  const seqPadded = String(Math.max(1, Number(sequence) || 1)).padStart(4, '0');
  return `${prefix}${seqPadded}`;
}

/**
 * Flexible alias supporting (sequence, date) or (date, sequence).
 */
export function generate10DigitSKU(sequenceOrDate = 1, dateOrSeq = new Date()) {
  if (typeof sequenceOrDate === 'number') {
    return generateProductSKU(dateOrSeq instanceof Date ? dateOrSeq : new Date(), sequenceOrDate);
  }
  return generateProductSKU(sequenceOrDate instanceof Date ? sequenceOrDate : new Date(), typeof dateOrSeq === 'number' ? dateOrSeq : 1);
}

/**
 * Calculates the next available 10-digit SKU for a specific date given existing catalog items.
 */
export function getNextProductSKU(existingProducts = [], targetDate = new Date()) {
  const prefix = formatDateToPrefix(targetDate);
  let highestSeq = 0;

  if (Array.isArray(existingProducts)) {
    existingProducts.forEach((p) => {
      const sku = String(p.sku || p.serialNumber || '');
      if (sku.startsWith(prefix) && sku.length === 10) {
        const seqPart = parseInt(sku.slice(6), 10);
        if (!isNaN(seqPart) && seqPart > highestSeq) {
          highestSeq = seqPart;
        }
      }
    });
  }

  return generateProductSKU(targetDate, highestSeq + 1);
}

/**
 * Guarantees every product in catalog has a valid registered 10-digit SKU.
 */
export function ensureProductHasSKU(product, fallbackSeq = 1, registrationDate = new Date()) {
  if (!product) return product;

  const existing = String(product.sku || product.serialNumber || '').trim();
  if (/^\d{10}$/.test(existing)) {
    return {
      ...product,
      sku: existing,
      serialNumber: existing,
    };
  }

  // Derive date from product createdAt or registrationDate
  const dateObj = product.createdAt ? new Date(product.createdAt) : registrationDate;
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const newSku = generateProductSKU(validDate, fallbackSeq);

  return {
    ...product,
    sku: newSku,
    serialNumber: newSku,
    registeredDate: product.registeredDate || validDate.toISOString().split('T')[0],
  };
}

/**
 * Generates category SKU/Code (e.g. 'CAT-261030-01' or 10-digit numeric).
 */
export function generateCategorySKU(index = 1, date = new Date()) {
  const prefix = formatDateToPrefix(date);
  const seqPadded = String(Math.max(1, Number(index) || 1)).padStart(4, '0');
  return `${prefix}${seqPadded}`;
}

/**
 * Parses a 10-digit SKU into its human-readable metadata components.
 */
export function parseSKU(sku) {
  const s = String(sku || '').trim();
  if (s.length !== 10 || !/^\d{10}$/.test(s)) {
    return null;
  }

  const yy = parseInt(s.slice(0, 2), 10);
  const mm = parseInt(s.slice(2, 4), 10);
  const dd = parseInt(s.slice(4, 6), 10);
  const seq = parseInt(s.slice(6, 10), 10);

  const fullYear = 2000 + yy;
  const dateStr = `${fullYear}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;

  return {
    valid: true,
    sku: s,
    year: String(fullYear),
    month: String(mm).padStart(2, '0'),
    day: String(dd).padStart(2, '0'),
    dateString: dateStr,
    sequence: seq,
  };
}
