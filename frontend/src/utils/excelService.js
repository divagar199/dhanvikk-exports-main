import * as XLSX from 'xlsx';
import {
  getNextProductSKU,
  generateProductSKU,
  isValid10DigitSKU,
  isSKUUnique,
  isInvoiceNumberUsedForInward,
  formatDateToPrefix,
} from './skuGenerator';

/**
 * Parses an Excel (.xlsx, .xls) or CSV file and extracts standardized product records.
 * Enforces:
 *  1. Strict 100% unique 10-digit registered SKU (YYMMDDXXXX) for every product.
 *  2. Inward invoice numbers can be imported ONLY ONE TIME to prevent duplicate stock.
 */
export async function parseProductsExcelFile(file, existingProducts = [], existingLedger = []) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('The uploaded spreadsheet contains no data rows.');
        }

        const now = new Date();
        const datePrefix = formatDateToPrefix(now);
        const importedProducts = [];
        const inwardRecords = [];
        const skippedDuplicateInvoices = [];

        // Track used SKUs across existing catalog + this import batch
        const usedSKUs = new Set(
          (existingProducts || [])
            .map((p) => String(p.sku || p.serialNumber || '').trim())
            .filter((s) => isValid10DigitSKU(s))
        );

        // Track used inward invoices across existing ledger + this import batch
        const usedInwardInvoices = new Set(
          (existingLedger || [])
            .filter((entry) => String(entry.type || '').toLowerCase() === 'inward')
            .map((entry) => String(entry.invoiceNo || entry.invoiceNumber || '').trim().toUpperCase())
            .filter(Boolean)
        );

        let sequenceCounter = 1;

        rawRows.forEach((row, idx) => {
          const name = String(row['Product Name'] || row['Name'] || row['Title'] || '').trim();
          if (!name) return; // Skip empty rows

          const category = String(row['Category'] || 'Bouquets & Arrangements').trim();
          const price = Number(row['Price (INR)'] || row['Price'] || row['Rate'] || 1299);
          const stock = Number(row['Stock Quantity'] || row['Stock'] || row['Quantity'] || 10);
          const image = String(row['Image URL'] || row['Image'] || row['Photo'] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80').trim();
          const description = String(row['Description'] || `Premium hand-selected ${name} curated by master florists at Dhanvikk.`).trim();
          const rawInvoice = String(row['Supplier Invoice No'] || row['Invoice Number'] || row['Invoice No'] || '').trim().toUpperCase();

          // Ensure 100% strictly UNIQUE 10-digit SKU
          let candidateSKU = String(row['SKU'] || row['Serial Number'] || '').trim();

          if (!isValid10DigitSKU(candidateSKU) || usedSKUs.has(candidateSKU)) {
            // Find next unique sequence for today
            while (usedSKUs.has(`${datePrefix}${String(sequenceCounter).padStart(4, '0')}`)) {
              sequenceCounter += 1;
            }
            candidateSKU = `${datePrefix}${String(sequenceCounter).padStart(4, '0')}`;
            sequenceCounter += 1;
          }

          usedSKUs.add(candidateSKU);

          const newProduct = {
            id: `prod-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
            name,
            sku: candidateSKU,
            serialNumber: candidateSKU,
            category,
            subCategory: String(row['Subcategory'] || 'Luxury Bouquets').trim(),
            flowerType: String(row['Flower Type'] || 'Roses').trim(),
            price: isNaN(price) || price < 0 ? 1299 : price,
            stock: isNaN(stock) || stock < 0 ? 0 : stock,
            images: [image],
            image,
            description,
            inStock: stock > 0,
            rating: 5,
            reviewsCount: 1,
            supplierInvoiceNo: rawInvoice || `INW-${now.getFullYear()}-${String(idx + 1).padStart(4, '0')}`,
            registeredDate: now.toISOString().split('T')[0],
            createdAt: now.toISOString(),
          };

          importedProducts.push(newProduct);

          // Handle 1-time inward invoice rule
          const finalInvoiceNo = rawInvoice || newProduct.supplierInvoiceNo;

          if (usedInwardInvoices.has(finalInvoiceNo)) {
            // This invoice number was already processed in inward!
            skippedDuplicateInvoices.push({
              invoiceNo: finalInvoiceNo,
              productName: name,
              reason: 'Already used in previous inward record',
            });
          } else {
            // Mark invoice number as used so it can NEVER be reused
            usedInwardInvoices.add(finalInvoiceNo);

            inwardRecords.push({
              id: `inw-${Date.now()}-${idx}`,
              date: now.toISOString().split('T')[0],
              invoiceNo: finalInvoiceNo,
              productSku: candidateSKU,
              productName: name,
              category,
              type: 'Inward',
              quantity: newProduct.stock,
              unitRate: Math.round(newProduct.price * 0.6),
              supplier: String(row['Supplier Name'] || 'Dhanvikk Floral Estates & Growers').trim(),
              notes: 'Imported via Excel catalog batch (Verified 1-time inward invoice)',
            });
          }
        });

        resolve({
          products: importedProducts,
          inwardRecords,
          count: importedProducts.length,
          skippedDuplicateInvoices,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read spreadsheet file.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Downloads a standardized Excel import template with registered SKU and Invoice columns.
 */
export function downloadProductExcelTemplate() {
  const templateHeaders = [
    {
      'SKU': '2610300001',
      'Product Name': 'Royal Moroccan Blush Hatbox',
      'Category': 'Flowers',
      'Subcategory': 'Hatboxes',
      'Flower Type': 'Roses',
      'Price (INR)': 2499,
      'Stock Quantity': 25,
      'Supplier Invoice No': 'INV-GROWER-2026-001',
      'Supplier Name': 'Nilgiris Highland Estates',
      'Image URL': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      'Description': 'Luxury preserved pink roses conditioned in artisanal velvet hatbox.',
    },
    {
      'SKU': '2610300002',
      'Product Name': 'Pure Snow Avalanche Lilies',
      'Category': 'Flowers',
      'Subcategory': 'Hand Bouquets',
      'Flower Type': 'Lilies',
      'Price (INR)': 1899,
      'Stock Quantity': 40,
      'Supplier Invoice No': 'INV-GROWER-2026-002',
      'Supplier Name': 'Ooty Floral Conservatory',
      'Image URL': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      'Description': 'Fresh fragrant white lilies harvest conditioned at 2°C.',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateHeaders);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products_Import_Template');

  XLSX.writeFile(workbook, `Dhanvikk_Products_Import_Template.xlsx`);
}

/**
 * Exports any javascript object array to an official downloadable Excel (.xlsx) file.
 */
export function exportArrayToExcel(dataArray, filename = 'Dhanvikk_Export') {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    throw new Error('No data records available to export.');
  }

  const worksheet = XLSX.utils.json_to_sheet(dataArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export_Data');

  const cleanFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, cleanFilename);
}
