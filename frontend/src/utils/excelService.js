import * as XLSX from 'xlsx';
import { getNextProductSKU, generateProductSKU } from './skuGenerator';

/**
 * Parses an Excel (.xlsx, .xls) or CSV file and extracts standardized product records.
 */
export async function parseProductsExcelFile(file, existingProducts = []) {
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
        let runningProducts = [...existingProducts];
        const importedProducts = [];
        const inwardRecords = [];

        rawRows.forEach((row, idx) => {
          const name = String(row['Product Name'] || row['Name'] || row['Title'] || '').trim();
          if (!name) return; // Skip empty rows

          const category = String(row['Category'] || 'Bouquets & Arrangements').trim();
          const price = Number(row['Price (INR)'] || row['Price'] || row['Rate'] || 1299);
          const stock = Number(row['Stock Quantity'] || row['Stock'] || row['Quantity'] || 10);
          const image = String(row['Image URL'] || row['Image'] || row['Photo'] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80').trim();
          const description = String(row['Description'] || `Premium hand-selected ${name} curated by master florists at Dhanvikk.`).trim();
          const invoiceNo = String(row['Supplier Invoice No'] || row['Invoice Number'] || row['Invoice No'] || `INW-${now.getFullYear()}-${String(idx + 1).padStart(3, '0')}`).trim();

          // Check if SKU is explicitly provided or auto-generate 10-digit YYMMDDXXXX
          let sku = String(row['SKU'] || row['Serial Number'] || '').trim();
          if (!/^\d{10}$/.test(sku)) {
            sku = getNextProductSKU(runningProducts, now);
          }

          const newProduct = {
            id: `prod-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
            name,
            sku,
            serialNumber: sku,
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
            supplierInvoiceNo: invoiceNo,
            registeredDate: now.toISOString().split('T')[0],
            createdAt: now.toISOString(),
          };

          importedProducts.push(newProduct);
          runningProducts.push(newProduct);

          // Auto-generate corresponding Inward Inventory Entry
          inwardRecords.push({
            id: `inw-${Date.now()}-${idx}`,
            date: now.toISOString().split('T')[0],
            invoiceNo,
            productSku: sku,
            productName: name,
            category,
            type: 'Inward',
            quantity: newProduct.stock,
            unitRate: Math.round(newProduct.price * 0.6), // Estimated procurement rate
            supplier: String(row['Supplier Name'] || 'Dhanvikk Floral Estates & Growers').trim(),
            notes: 'Imported via Excel catalog batch with registered 10-digit serial',
          });
        });

        resolve({
          products: importedProducts,
          inwardRecords,
          count: importedProducts.length,
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
 * Downloads a prefilled Product Import Template as an Excel file (.xlsx).
 */
export function downloadProductExcelTemplate() {
  const sampleData = [
    {
      'Product Name': 'Velvet Scarlet Grand Roses',
      'Category': 'Fresh Cut Blooms',
      'Subcategory': 'Rose Stems',
      'Flower Type': 'Red Dutch Rose',
      'Price (INR)': 1899,
      'Stock Quantity': 50,
      'Supplier Invoice No': 'INV-GROW-2026-101',
      'Supplier Name': 'Nilgiris Highlands Farm',
      'Image URL': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      'Description': 'Farm-fresh Dutch crimson roses conditioned under active cold-chain.',
      'SKU': '', // Left blank to demonstrate automatic 10-digit serial generation
    },
    {
      'Product Name': 'Casablanca Lily Majesty',
      'Category': 'Luxury Bouquets',
      'Subcategory': 'Oriental Lilies',
      'Flower Type': 'Casablanca White Lily',
      'Price (INR)': 2499,
      'Stock Quantity': 35,
      'Supplier Invoice No': 'INV-GROW-2026-102',
      'Supplier Name': 'Bangalore Floriculture Estate',
      'Image URL': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
      'Description': 'Fragrant oriental lilies bundled in luxury wrapping paper with floral food.',
      'SKU': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products_Template');
  XLSX.writeFile(workbook, 'Dhanvikk_Product_Import_Template.xlsx');
}

/**
 * Generic export of array data to Excel (.xlsx) file download.
 */
export function exportArrayToExcel(data, fileName = 'Report.xlsx', sheetName = 'Data') {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No records available to export.');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}

/**
 * Exports data to standard CSV.
 */
export function exportArrayToCSV(data, fileName = 'Report.csv') {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No records available to export.');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
