import React, { useState, useRef } from 'react';
import {
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Upload,
  Calendar,
  Truck,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Boxes,
  MapPin,
  Barcode,
} from 'lucide-react';
import { toast } from 'sonner';
import { getNextProductSKU } from '../../../../utils/skuGenerator';
import {
  parseProductsExcelFile,
  downloadProductExcelTemplate,
  exportArrayToExcel,
} from '../../../../utils/excelService';
import { logStaffAction } from '../../../../utils/telemetryService';

export default function InventoryLedger({
  products = [],
  ledger = [],
  onUpdateLedger,
  onUpdateProducts,
  authUser,
}) {
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [showOutwardModal, setShowOutwardModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Inward Form State
  const [inwardForm, setInwardForm] = useState({
    productId: products[0]?.id || products[0]?._id || '',
    invoiceNo: '',
    supplier: '',
    quantity: 50,
    unitCost: 650,
    grade: 'A+ Export Grade',
    notes: 'Inward cold-chain delivery received at central hub.',
  });

  // Outward Form State
  const [outwardForm, setOutwardForm] = useState({
    productId: products[0]?.id || products[0]?._id || '',
    invoiceNo: '',
    customer: '',
    deliveryAddress: '',
    shippingPartner: 'Dhanvikk Express Cold-Chain Reefer',
    quantity: 10,
    unitPrice: 1299,
    notes: 'Outward cargo dispatched with temperature telemetry.',
  });

  const selectedInwardProduct = products.find((p) => (p.id || p._id) === inwardForm.productId) || products[0];
  const selectedOutwardProduct = products.find((p) => (p.id || p._id) === outwardForm.productId) || products[0];

  // Filtered Ledger Entries
  const filteredEntries = ledger.filter((item) => {
    const matchesType = filterType === 'all' ? true : item.type?.toLowerCase() === filterType.toLowerCase();
    const q = search.toLowerCase().trim();
    if (!q) return matchesType;
    const matchesSearch =
      (item.productName || '').toLowerCase().includes(q) ||
      (item.productSku || item.sku || '').toLowerCase().includes(q) ||
      (item.invoiceNo || '').toLowerCase().includes(q) ||
      (item.supplier || item.customer || '').toLowerCase().includes(q) ||
      (item.deliveryAddress || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  // KPI Calculations
  const totalInwardStems = ledger
    .filter((e) => e.type?.toLowerCase() === 'inward')
    .reduce((acc, e) => acc + (Number(e.quantity) || 0), 0);

  const totalOutwardStems = ledger
    .filter((e) => e.type?.toLowerCase() === 'outward')
    .reduce((acc, e) => acc + (Number(e.quantity) || 0), 0);

  const totalCatalogStock = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

  // 1. Submit Inward Purchase Receipt
  const handleSaveInward = (e) => {
    e.preventDefault();
    if (!selectedInwardProduct) {
      toast.error('Please select a valid product.');
      return;
    }
    if (!inwardForm.invoiceNo.trim()) {
      toast.error('Supplier invoice number is mandatory for stock inward.');
      return;
    }

    const qty = parseInt(inwardForm.quantity, 10) || 0;
    if (qty <= 0) {
      toast.error('Quantity must be greater than zero.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry = {
      id: `inw-${Date.now()}`,
      date: todayStr,
      type: 'inward',
      invoiceNo: inwardForm.invoiceNo.trim().toUpperCase(),
      productId: selectedInwardProduct.id || selectedInwardProduct._id,
      productSku: selectedInwardProduct.sku || selectedInwardProduct.serialNumber || '2610300001',
      productName: selectedInwardProduct.name,
      category: selectedInwardProduct.category || 'Fresh Cut Flowers',
      quantity: qty,
      unitCost: parseFloat(inwardForm.unitCost) || 600,
      supplier: inwardForm.supplier.trim() || 'Nilgiris Highlands Grower Association',
      grade: inwardForm.grade,
      notes: inwardForm.notes,
      loggedBy: authUser?.name || 'Divagar (Super Admin)',
    };

    // Increment product live stock
    const updatedProducts = products.map((p) => {
      if ((p.id || p._id) === (selectedInwardProduct.id || selectedInwardProduct._id)) {
        const newStock = (Number(p.stock) || 0) + qty;
        return { ...p, stock: newStock, inStock: newStock > 0 };
      }
      return p;
    });

    const updatedLedger = [newEntry, ...ledger];
    onUpdateLedger(updatedLedger);
    onUpdateProducts(updatedProducts);

    logStaffAction({
      action: 'INWARD_STOCK',
      module: 'INVENTORY',
      resourceId: newEntry.productSku,
      details: `Logged inward receipt of ${qty} units of SKU ${newEntry.productSku} under Invoice #${newEntry.invoiceNo}`,
      staffEmail: authUser?.email,
      staffName: authUser?.name,
    });

    toast.success(`Inward receipt logged! +${qty} units added to ${selectedInwardProduct.name} stock.`);
    setShowInwardModal(false);
    setInwardForm({
      productId: products[0]?.id || products[0]?._id || '',
      invoiceNo: '',
      supplier: '',
      quantity: 50,
      unitCost: 650,
      grade: 'A+ Export Grade',
      notes: 'Inward cold-chain delivery received at central hub.',
    });
  };

  // 2. Submit Outward Shipment Dispatch
  const handleSaveOutward = (e) => {
    e.preventDefault();
    if (!selectedOutwardProduct) {
      toast.error('Please select a valid product.');
      return;
    }
    const qty = parseInt(outwardForm.quantity, 10) || 0;
    const currentStock = Number(selectedOutwardProduct.stock) || 0;

    if (qty <= 0) {
      toast.error('Quantity must be greater than zero.');
      return;
    }
    if (qty > currentStock) {
      toast.error(`Insufficient stock! Available: ${currentStock} units. Cannot dispatch ${qty} units.`);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry = {
      id: `out-${Date.now()}`,
      date: todayStr,
      type: 'outward',
      invoiceNo: outwardForm.invoiceNo.trim().toUpperCase() || `DHN-INV-${Date.now().toString().slice(-6)}`,
      productId: selectedOutwardProduct.id || selectedOutwardProduct._id,
      productSku: selectedOutwardProduct.sku || selectedOutwardProduct.serialNumber || '2610300001',
      productName: selectedOutwardProduct.name,
      category: selectedOutwardProduct.category || 'Fresh Cut Flowers',
      quantity: qty,
      unitPrice: parseFloat(outwardForm.unitPrice) || selectedOutwardProduct.price || 1299,
      customer: outwardForm.customer.trim() || 'Direct Client Consignment',
      deliveryAddress: outwardForm.deliveryAddress.trim() || 'Doorstep Delivery Hub',
      shippingPartner: outwardForm.shippingPartner,
      notes: outwardForm.notes,
      loggedBy: authUser?.name || 'Divagar (Super Admin)',
    };

    // Decrement product live stock
    const updatedProducts = products.map((p) => {
      if ((p.id || p._id) === (selectedOutwardProduct.id || selectedOutwardProduct._id)) {
        const newStock = Math.max(0, currentStock - qty);
        return { ...p, stock: newStock, inStock: newStock > 0 };
      }
      return p;
    });

    const updatedLedger = [newEntry, ...ledger];
    onUpdateLedger(updatedLedger);
    onUpdateProducts(updatedProducts);

    logStaffAction({
      action: 'OUTWARD_DISPATCH',
      module: 'INVENTORY',
      resourceId: newEntry.productSku,
      details: `Recorded outward dispatch of ${qty} units of SKU ${newEntry.productSku} to ${newEntry.deliveryAddress} via ${newEntry.shippingPartner}`,
      staffEmail: authUser?.email,
      staffName: authUser?.name,
    });

    toast.success(`Outward dispatch confirmed! -${qty} units deducted from live stock.`);
    setShowOutwardModal(false);
  };

  // 3. Handle Excel Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const res = await parseProductsExcelFile(file, products);

      if (res.products && res.products.length > 0) {
        const mergedProducts = [...products, ...res.products];
        const mergedLedger = [...res.inwardRecords, ...ledger];

        onUpdateProducts(mergedProducts);
        onUpdateLedger(mergedLedger);

        toast.success(`Excel Import Complete: ${res.count} products added with registered 10-digit serials & inward stock! 🌸`);
        setShowImportModal(false);
      }
    } catch (err) {
      toast.error(err.message || 'Error importing Excel spreadsheet.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 4. Export Ledger to Excel
  const handleExportExcel = () => {
    try {
      const exportRows = ledger.map((item, idx) => ({
        '#': idx + 1,
        'Date': item.date || '2026-10-30',
        'Type': (item.type || 'Inward').toUpperCase(),
        '10-Digit SKU': item.productSku || item.sku || '2610300001',
        'Product Name': item.productName || 'Botanical Bouquet',
        'Category': item.category || 'Fresh Cut Flowers',
        'Quantity': item.quantity || 0,
        'Invoice / Bill No': item.invoiceNo || 'N/A',
        'Supplier / Customer': item.supplier || item.customer || 'Direct Consignment',
        'Transport Address': item.deliveryAddress || 'N/A',
        'Carrier Partner': item.shippingPartner || 'Reefer Cold-Chain',
        'Logged By': item.loggedBy || 'Divagar (Super Admin)',
      }));

      exportArrayToExcel(exportRows, `Dhanvikk_Inventory_Ledger_${Date.now()}`);
      toast.success('Inventory ledger exported successfully to Excel!');
    } catch {
      toast.error('Failed to export inventory records.');
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Inward Stems</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">+{totalInwardStems.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Procured & Stored</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Outward Dispatches</span>
            <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block">-{totalOutwardStems.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Shipped & Exported</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Live Available Stock</span>
            <span className="text-2xl font-bold font-mono text-[#E11D48] mt-1 block">{totalCatalogStock.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Across {products.length} Products</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#E11D48] border border-rose-200 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Registered 10-Digit SKUs</span>
            <span className="text-2xl font-bold font-mono text-indigo-600 mt-1 block">{products.length}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">YYMMDDXXXX Standard</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
            <Barcode className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Actions & Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, Product Name, Invoice # or Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {['all', 'inward', 'outward'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                  filterType === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInwardModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Inward (Purchase)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOutwardModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Outward (Dispatch)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <Upload className="w-4 h-4 text-rose-400" />
            <span>Excel Import</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">10-Digit SKU & Product</th>
                <th className="py-3 px-4">Invoice / Bill #</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4">Supplier / Customer & Transport Address</th>
                <th className="py-3 px-4">Carrier / Partner</th>
                <th className="py-3 px-4">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No inventory transactions match your criteria.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Use the buttons above to log inward purchases or record dispatches.</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item) => {
                  const isInward = item.type?.toLowerCase() === 'inward';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            isInward
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isInward ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isInward ? 'Inward' : 'Outward'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">{item.date}</td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.productName}</span>
                        <span className="font-mono text-[11px] text-[#E11D48] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 inline-block mt-0.5">
                          SKU: {item.productSku || item.sku || '2610300001'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.invoiceNo || 'INV-2026-001'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono text-sm font-bold ${isInward ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isInward ? '+' : '-'}{item.quantity}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {item.supplier || item.customer || 'Consignment Lead'}
                        </span>
                        {item.deliveryAddress && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{item.deliveryAddress}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.shippingPartner || (isInward ? 'Direct Farm Freight' : 'Dhanvikk Express Reefer')}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {item.loggedBy || 'Divagar (Super Admin)'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Log Inward Delivery / Purchase */}
      {showInwardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Log Inward Stock (Purchase)</h3>
                  <p className="text-xs text-slate-500">Record incoming stems from growers & automatically update live stock.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInwardModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInward} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Product & Registered 10-Digit SKU *</label>
                <select
                  required
                  value={inwardForm.productId}
                  onChange={(e) => setInwardForm({ ...inwardForm, productId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name} — [SKU: {p.sku || p.serialNumber || '2610300001'}] (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Supplier Invoice Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="INV-GROW-2026-001"
                    value={inwardForm.invoiceNo}
                    onChange={(e) => setInwardForm({ ...inwardForm, invoiceNo: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 font-mono uppercase bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Inward Quantity (Stems) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={inwardForm.quantity}
                    onChange={(e) => setInwardForm({ ...inwardForm, quantity: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 font-mono bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Supplier / Grower Estate *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nilgiris Rose Growers Ltd"
                    value={inwardForm.supplier}
                    onChange={(e) => setInwardForm({ ...inwardForm, supplier: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unit Procurement Rate (₹)</label>
                  <input
                    type="number"
                    value={inwardForm.unitCost}
                    onChange={(e) => setInwardForm({ ...inwardForm, unitCost: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 font-mono bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cold-Chain Receiving Notes</label>
                <textarea
                  rows={2}
                  value={inwardForm.notes}
                  onChange={(e) => setInwardForm({ ...inwardForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInwardModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Confirm Inward & Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Outward Dispatch */}
      {showOutwardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Outward Dispatch</h3>
                  <p className="text-xs text-slate-500">Deduct dispatched stems, assign shipping partner, and generate invoice.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOutwardModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOutward} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Product & Registered 10-Digit SKU *</label>
                <select
                  required
                  value={outwardForm.productId}
                  onChange={(e) => setOutwardForm({ ...outwardForm, productId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name} — [SKU: {p.sku || p.serialNumber || '2610300001'}] (Available: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Outward Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedOutwardProduct?.stock || 999}
                    required
                    value={outwardForm.quantity}
                    onChange={(e) => setOutwardForm({ ...outwardForm, quantity: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 font-mono bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Max available: {selectedOutwardProduct?.stock || 0}</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bill / Invoice Number</label>
                  <input
                    type="text"
                    placeholder="DHN-INV-261030-001"
                    value={outwardForm.invoiceNo}
                    onChange={(e) => setOutwardForm({ ...outwardForm, invoiceNo: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 font-mono uppercase bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer / Consignee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Noor Luxury Florals Dubai"
                  value={outwardForm.customer}
                  onChange={(e) => setOutwardForm({ ...outwardForm, customer: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transport Delivery Address & Destination *</label>
                <input
                  type="text"
                  required
                  placeholder="Plot 42, Dubai Flower Centre, Dubai International Airport, UAE"
                  value={outwardForm.deliveryAddress}
                  onChange={(e) => setOutwardForm({ ...outwardForm, deliveryAddress: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Logistics / Delivery Partner *</label>
                <select
                  value={outwardForm.shippingPartner}
                  onChange={(e) => setOutwardForm({ ...outwardForm, shippingPartner: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400 font-semibold"
                >
                  <option value="Dhanvikk Express Cold-Chain Reefer">Dhanvikk Express Cold-Chain Reefer (Fleet Hub)</option>
                  <option value="Emirates SkyCargo Reefer Air Freight">Emirates SkyCargo Reefer Air Freight</option>
                  <option value="DHL Express Cold-Chain Worldwide">DHL Express Cold-Chain Worldwide</option>
                  <option value="Blue Dart Express Air Cargo">Blue Dart Express Air Cargo</option>
                  <option value="Delhivery Doorstep Logistics">Delhivery Doorstep Logistics</option>
                  <option value="FedEx Priority Cold-Chain">FedEx Priority Cold-Chain</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOutwardModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Confirm Outward & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Excel Catalog & Stock Import */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Import Products & Stock via Excel</h3>
                  <p className="text-xs text-slate-500">Auto-generates 10-digit serials (YYMMDDXXXX) and logs inward purchase.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-slate-700 space-y-2">
                <p className="font-semibold text-rose-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E11D48]" />
                  <span>Standard Excel Specifications</span>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Supports <strong>.xlsx, .xls, and .csv</strong> files.</li>
                  <li>Columns: <code>Product Name, Category, Price, Stock Quantity, Supplier Invoice No, Image URL</code></li>
                  <li>SKU can be left blank — the system automatically generates unique 10-digit registered serial numbers (e.g. <code>2610300001</code>).</li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={downloadProductExcelTemplate}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Download Sample Excel Template (.xlsx)</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-rose-400 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">Upload Spreadsheet File</p>
                <p className="text-[11px] text-slate-500 mt-1">Select an .xlsx or .csv file from your computer</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  disabled={isImporting}
                  className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#E11D48] file:text-white hover:file:bg-[#BE123C] cursor-pointer"
                />
              </div>

              {isImporting && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 text-slate-600">
                  <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                  <span>Processing and registering 10-digit SKUs...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
