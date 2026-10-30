import React from 'react';
import { X, Printer, Download, Share2, Mail, CheckCircle2, ShieldCheck, Flower2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceModal({ order, settings = {}, onClose }) {
  if (!order) return null;

  const invoiceNumber = order.invoiceNumber || `DHN-INV-${String(order.orderId || order.id || '2451').replace(/[^a-zA-Z0-9]/g, '')}`;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 Oct 2026';
  const customerName = order.user?.name || order.shippingAddress?.fullName || order.customer || 'Valued Customer';
  const customerPhone = order.shippingAddress?.phone || order.user?.phone || '+91 98765 43210';
  const customerEmail = order.user?.email || order.shippingAddress?.email || 'customer@dhanvikk.com';
  const shippingAddress = order.shippingAddress
    ? `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.pincode || ''}`
    : 'Doorstep Delivery, Chennai, Tamil Nadu, India';

  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [
    {
      name: order.productName || 'Signature Red Roses Hatbox Grande',
      sku: '2610300001',
      quantity: order.itemsCount || 1,
      price: typeof order.amount === 'string' ? parseInt(order.amount.replace(/[^0-9]/g, ''), 10) || 1299 : order.amount || 1299,
      hsn: '060311',
    }
  ];

  const subtotal = items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
  const taxRate = settings.taxRate || 5; // 5% GST
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const shippingCharge = order.shippingCharge || 0;
  const grandTotal = subtotal + taxAmount + shippingCharge;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🌸 *DHANVIKK BLOOMS & EXPORTS - TAX INVOICE*\n` +
      `Bill No: ${invoiceNumber}\n` +
      `Date: ${orderDate}\n` +
      `Customer: ${customerName}\n` +
      `Total Amount: ₹${grandTotal.toLocaleString('en-IN')}\n` +
      `Status: Paid & Confirmed\n\n` +
      `Thank you for patronizing Dhanvikk Exports. Your cold-chain floral consignment is in transit.`;
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Tax Invoice & Order Confirmation - ${invoiceNumber}`);
    const body = encodeURIComponent(`Dear ${customerName},\n\nPlease find your tax invoice details for order ${invoiceNumber}.\nGrand Total: ₹${grandTotal.toLocaleString('en-IN')}\n\nWarm regards,\nDhanvikk Blooms & Exports`);
    window.location.href = `mailto:${customerEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden print:border-none print:shadow-none my-6">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Tax Invoice & Bill Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleShareEmail}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-10 font-['Poppins'] text-slate-800 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Flower2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">Dhanvikk Blooms & Exports</h2>
                <p className="text-[11px] text-slate-500">Premium Floriculture • Reefer Cold-Chain Logistics • Global Trade</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: {settings.gstNumber || '33AAACD1234F1Z5'} | IEC: 0412039841</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#E11D48] border border-rose-200 uppercase tracking-widest inline-block">
                TAX INVOICE
              </span>
              <p className="font-mono text-sm font-bold text-slate-900 mt-2">{invoiceNumber}</p>
              <p className="text-xs text-slate-500">Date: {orderDate}</p>
            </div>
          </div>

          {/* Billing & Shipping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billed To (Client / Consignee)</span>
              <p className="font-bold text-slate-900 text-sm">{customerName}</p>
              <p className="text-slate-600 font-mono mt-0.5">{customerPhone}</p>
              <p className="text-slate-600">{customerEmail}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Dispatch & Transport Address</span>
              <p className="text-slate-700 leading-relaxed">{shippingAddress}</p>
              <p className="text-slate-500 mt-1">Carrier Partner: <span className="font-semibold text-slate-800">{order.shippingPartner || 'Dhanvikk Express Cold-Chain Reefer'}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">10-Digit SKU / Item Description</th>
                  <th className="py-2.5 px-2">HSN</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Rate</th>
                  <th className="py-2.5 px-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-2 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-slate-900">{it.name || it.title || 'Botanical Bouquet'}</p>
                      <p className="text-[10px] font-mono text-[#E11D48] mt-0.5">SKU: {it.sku || it.serialNumber || '2610300001'}</p>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-500">{it.hsn || '060311'}</td>
                    <td className="py-3 px-2 text-center font-bold text-slate-800">{it.quantity || 1}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700">₹{Number(it.price || 1299).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-2 text-right font-bold font-mono text-slate-900">
                      ₹{(Number(it.price || 1299) * Number(it.quantity || 1)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 max-w-xs space-y-1">
              <p className="font-bold text-slate-700">Payment & Bank Details:</p>
              <p>Bank: HDFC Bank Ltd (Commercial Floriculture Branch)</p>
              <p className="font-mono">A/C: 50200084920194 | IFSC: HDFC0001234</p>
              <p className="text-[10px] text-slate-400 mt-2">Goods conditioned at 2°C-4°C. Subject to Chennai jurisdiction.</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST ({taxRate}%):</span>
                <span className="font-mono font-semibold">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              {shippingCharge > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Reefer Freight:</span>
                  <span className="font-mono font-semibold">₹{shippingCharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono text-[#E11D48]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Authorized Tax Bill</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
