import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Building,
  CheckCircle2,
  Calendar,
  DollarSign,
  Plus,
  Eye,
  X,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentsStudio({ settings, products = [], onLogAudit }) {
  const [docType, setDocType] = useState('proforma'); // 'proforma' | 'commercial' | 'packing_list'
  const [buyerCompany, setBuyerCompany] = useState('Royal Gulf Floral Distribution LLC');
  const [buyerAddress, setBuyerAddress] = useState('Warehouse 14, Al Quoz Industrial Area 3, Dubai, UAE');
  const [invoiceNumber, setInvoiceNumber] = useState(`DHN-INV-${new Date().getFullYear()}-019`);
  const [selectedIncoterm, setSelectedIncoterm] = useState('CIF');
  const [portOfDischarge, setPortOfDischarge] = useState('Dubai Cargo Terminal (DXB)');
  const [currency, setCurrency] = useState('USD');
  const [exchangeRateToINR, setExchangeRateToINR] = useState(86.5);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Default Line Items
  const [lineItems, setLineItems] = useState([
    {
      description: 'Dutch Velvet Long Stem Cut Roses (Grade A+ Cold-Chain Certified)',
      hsCode: '0603.11.00',
      quantity: 10000,
      unit: 'stems',
      unitPriceUSD: 1.75,
    },
    {
      description: 'Living Amethyst Phalaenopsis Potted Orchids (Barcoded Crate)',
      hsCode: '0603.13.00',
      quantity: 500,
      unit: 'boxes',
      unitPriceUSD: 14.50,
    },
  ]);

  const subtotalUSD = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPriceUSD, 0);
  const freightInsuranceUSD = selectedIncoterm === 'CIF' ? 1850 : 0;
  const grandTotalUSD = subtotalUSD + freightInsuranceUSD;

  const handlePrint = () => {
    window.print();
    onLogAudit?.('CREATE', 'DOCUMENTS', invoiceNumber, `Generated & printed ${docType.toUpperCase()}: ${invoiceNumber}`);
    toast.success('Document sent to print dialog.');
  };

  const handleAddItem = () => {
    if (products.length > 0) {
      const sample = products[0];
      setLineItems((prev) => [
        ...prev,
        {
          description: sample.name,
          hsCode: sample.hsCode || '0603.11.00',
          quantity: 1000,
          unit: 'stems',
          unitPriceUSD: 2.00,
        },
      ]);
    }
  };

  const handleRemoveItem = (index) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Studio Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
              International Trade Documentation
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Export Invoice & Packing List Generator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compliant with Indian Directorate General of Foreign Trade (DGFT) & international customs standards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview & Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500 font-semibold"
            >
              <option value="proforma">Proforma Invoice (PI)</option>
              <option value="commercial">Commercial Export Invoice (CI)</option>
              <option value="packing_list">Customs Packing List</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Invoice / Reference #</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Delivery Incoterm</label>
            <select
              value={selectedIncoterm}
              onChange={(e) => setSelectedIncoterm(e.target.value)}
              className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500 font-semibold"
            >
              <option value="CIF">CIF (Cost, Insurance & Freight)</option>
              <option value="FOB">FOB (Free On Board)</option>
              <option value="CFR">CFR (Cost and Freight)</option>
              <option value="EXW">EXW (Ex Works)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Buyer / Consignee Company</label>
            <input
              type="text"
              value={buyerCompany}
              onChange={(e) => setBuyerCompany(e.target.value)}
              className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Port of Discharge</label>
            <input
              type="text"
              value={portOfDischarge}
              onChange={(e) => setPortOfDischarge(e.target.value)}
              className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Billing Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500 font-semibold"
            >
              <option value="USD">USD ($)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="EUR">EUR (€)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Consignment Line Items
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stem / Crate</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">HS Code</th>
                  <th className="py-2.5 px-3 text-center">Quantity</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total ({currency})</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[240px]">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{item.hsCode}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">{item.unit}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      ${item.unitPriceUSD.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ${(item.quantity * item.unitPriceUSD).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-2 text-xs">
          <div className="w-64 space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-slate-500">
              <span>FOB Subtotal:</span>
              <span className="font-mono font-semibold text-slate-800">${subtotalUSD.toLocaleString()}</span>
            </div>
            {selectedIncoterm === 'CIF' && (
              <div className="flex justify-between text-slate-500">
                <span>Freight & Air Insurance:</span>
                <span className="font-mono font-semibold text-slate-800">${freightInsuranceUSD.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Total Invoice Value:</span>
              <span className="font-mono text-rose-700">${grandTotalUSD.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[95vh] overflow-y-auto p-6 sm:p-10 shadow-2xl border border-slate-200 space-y-6 text-slate-900 print:p-0 print:border-none print:shadow-none animate-in zoom-in-95 duration-150">
            {/* Modal Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-semibold text-slate-500">Official Document Preview</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 uppercase">
                  {docType === 'proforma' ? 'Proforma Invoice' : docType === 'commercial' ? 'Commercial Invoice' : 'Export Packing List'}
                </h1>
                <p className="text-xs font-mono text-slate-500 mt-1">Invoice No: <strong>{invoiceNumber}</strong></p>
                <p className="text-xs font-mono text-slate-500">Date: {new Date().toLocaleDateString('en-GB')}</p>
                <p className="text-xs font-mono text-indigo-700 font-bold mt-0.5">Incoterms 2020: {selectedIncoterm} ({portOfDischarge})</p>
              </div>

              <div className="text-right text-xs">
                <h2 className="font-bold text-slate-900">{settings?.companyName || 'Dhanvikk Exports Private Limited'}</h2>
                <p className="text-slate-500 max-w-xs">{settings?.headquarters || 'Central Floristry District, Hosur, Tamil Nadu, India'}</p>
                <p className="font-mono text-slate-600">IEC: {settings?.iecCode || 'IEC-072026-BLM-991'}</p>
                <p className="font-mono text-slate-600">GSTIN: {settings?.gstin || '33AAACD1234F1Z5'}</p>
                <p className="font-mono text-slate-600">APEDA Reg: {settings?.apedaRegNo || 'APEDA/FLOR/2026/0419'}</p>
              </div>
            </div>

            {/* Consignee Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Buyer / Consignee:
                </span>
                <p className="font-bold text-slate-900">{buyerCompany}</p>
                <p className="text-slate-600">{buyerAddress}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Port & Logistics:
                </span>
                <p className="text-slate-700">Port of Loading: <strong>Kempegowda Int'l Airport (BLR)</strong></p>
                <p className="text-slate-700">Port of Discharge: <strong>{portOfDischarge}</strong></p>
                <p className="text-slate-700">Country of Origin: <strong>India</strong></p>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5">HS Tariff</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5 text-right">Amount ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-medium">{item.description}</td>
                    <td className="p-2.5 font-mono text-slate-500">{item.hsCode}</td>
                    <td className="p-2.5 text-center font-mono font-bold">{item.quantity.toLocaleString()} {item.unit}</td>
                    <td className="p-2.5 text-right font-mono">${item.unitPriceUSD.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-mono font-bold">${(item.quantity * item.unitPriceUSD).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bank Wire Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Wire Transfer & Bank Details:
                </span>
                <p className="text-slate-700">Beneficiary: <strong>{settings?.companyName || 'Dhanvikk Exports Pvt Ltd'}</strong></p>
                <p className="text-slate-700">Bank: <strong>{settings?.bankName || 'HDFC Bank International'}</strong></p>
                <p className="text-slate-700">A/C: <strong className="font-mono">{settings?.bankAccountNumber || '50200088991122'}</strong></p>
                <p className="text-slate-700">SWIFT Code: <strong className="font-mono text-rose-700">{settings?.swiftCode || 'HDFCINBBXXX'}</strong></p>
              </div>

              <div className="flex flex-col justify-between text-right">
                <div>
                  <span className="text-slate-400 block text-[10px]">TOTAL VALUE ({selectedIncoterm}):</span>
                  <span className="font-mono text-xl font-bold text-rose-700">${grandTotalUSD.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 mt-2">
                  <span className="text-[10px] text-slate-400 block">Authorized Signatory</span>
                  <span className="font-bold text-xs text-slate-800">For Dhanvikk Exports Private Limited</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
