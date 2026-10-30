/**
 * Dhanvikk Blooms & Exports - 10-Digit Serial Number / SKU & Invoice Engine
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
 * Checks if a candidate SKU is completely unique across the catalog (excluding current product being edited).
 */
export function isSKUUnique(candidateSKU, existingProducts = [], currentProductId = null) {
  if (!isValid10DigitSKU(candidateSKU)) return false;
  const target = String(candidateSKU).trim();

  return !existingProducts.some((p) => {
    const pId = p.id || p._id;
    if (currentProductId && String(pId) === String(currentProductId)) {
      return false; // Skip the product itself when updating
    }
    const pSku = String(p.sku || p.serialNumber || '').trim();
    return pSku === target;
  });
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
 * Enforces strict 100% SKU uniqueness across an entire array of products.
 * Eliminates duplicates by dynamically re-assigning next sequential SKUs.
 */
export function ensureUniqueCatalogSKUs(productsList = [], targetDate = new Date()) {
  if (!Array.isArray(productsList)) return [];

  const usedSKUs = new Set();
  const sanitized = [];

  productsList.forEach((prod, index) => {
    let sku = String(prod.sku || prod.serialNumber || '').trim();

    // If invalid or already taken by a prior product, calculate next unique SKU
    if (!isValid10DigitSKU(sku) || usedSKUs.has(sku)) {
      const prefix = formatDateToPrefix(targetDate);
      let candidateSeq = index + 1;
      let candidateSKU = `${prefix}${String(candidateSeq).padStart(4, '0')}`;

      while (usedSKUs.has(candidateSKU)) {
        candidateSeq += 1;
        candidateSKU = `${prefix}${String(candidateSeq).padStart(4, '0')}`;
      }

      sku = candidateSKU;
    }

    usedSKUs.add(sku);
    sanitized.push({
      ...prod,
      sku,
      serialNumber: sku,
    });
  });

  return sanitized;
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

/**
 * ----------------------------------------------------------------
 * INVOICE NUMBER MANAGEMENT (AUTOMATIC OUTWARD & 1-TIME INWARD RULE)
 * ----------------------------------------------------------------
 */

/**
 * Automatically generates a sequential outward dispatch invoice number:
 * Format: DHN-OUT-YYMMDD-XXXX (e.g. 'DHN-OUT-261030-0001')
 */
export function generateOutwardInvoiceNumber(existingLedger = [], targetDate = new Date()) {
  const prefix = `DHN-OUT-${formatDateToPrefix(targetDate)}-`;
  let highestSeq = 0;

  if (Array.isArray(existingLedger)) {
    existingLedger.forEach((entry) => {
      const inv = String(entry.invoiceNo || entry.invoiceNumber || '').trim().toUpperCase();
      if (inv.startsWith(prefix)) {
        const seqPart = parseInt(inv.replace(prefix, ''), 10);
        if (!isNaN(seqPart) && seqPart > highestSeq) {
          highestSeq = seqPart;
        }
      }
    });
  }

  const nextSeq = String(highestSeq + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

/**
 * Validates whether an invoice number has ALREADY been used for an inward receipt.
 * Enforces the strict rule: "invoice number is used to import for only one time for inward".
 */
export function isInvoiceNumberUsedForInward(invoiceNo, existingLedger = []) {
  if (!invoiceNo) return false;
  const target = String(invoiceNo).trim().toUpperCase();

  if (!Array.isArray(existingLedger)) return false;

  return existingLedger.some((entry) => {
    const isEntryInward = String(entry.type || '').toLowerCase() === 'inward';
    const entryInvoice = String(entry.invoiceNo || entry.invoiceNumber || '').trim().toUpperCase();
    return isEntryInward && entryInvoice === target;
  });
}

/**
 * Returns a list of outward invoice numbers that have NOT yet been used/imported for inward.
 * Enables one-click import from outward dispatches into inward stock (strictly once).
 */
export function getAvailableOutwardInvoicesForInward(existingLedger = []) {
  if (!Array.isArray(existingLedger)) return [];

  const usedInwardInvoices = new Set(
    existingLedger
      .filter((e) => String(e.type || '').toLowerCase() === 'inward')
      .map((e) => String(e.invoiceNo || e.invoiceNumber || '').trim().toUpperCase())
  );

  const availableOutward = [];
  const seenOutward = new Set();

  existingLedger.forEach((entry) => {
    const isOutward = String(entry.type || '').toLowerCase() === 'outward';
    const inv = String(entry.invoiceNo || entry.invoiceNumber || '').trim().toUpperCase();

    if (isOutward && inv && !usedInwardInvoices.has(inv) && !seenOutward.has(inv)) {
      seenOutward.add(inv);
      availableOutward.push({
        invoiceNo: inv,
        date: entry.date,
        productSku: entry.productSku || entry.sku,
        productName: entry.productName,
        quantity: entry.quantity,
        customer: entry.customer,
      });
    }
  });

  return availableOutward;
}
