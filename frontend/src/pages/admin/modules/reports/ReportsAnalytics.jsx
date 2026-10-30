import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  FileSpreadsheet,
  CheckCircle2,
  Globe,
  Filter,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportArrayToExcel } from '../../../../utils/excelService';

export default function ReportsAnalytics({
  orders = [],
  products = [],
  customers = [],
  ledger = [],
}) {
  const [reportType, setReportType] = useState('today'); // 'today' | 'month' | 'year' | 'custom'
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0]);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7); // '2026-10'
  const currentYearStr = todayStr.slice(0, 4); // '2026'

  // Filter orders according to selected timeframe
  const filteredOrders = orders.filter((o) => {
    const oDate = o.createdAt ? o.createdAt.split('T')[0] : todayStr;
    if (reportType === 'today') return oDate === todayStr;
    if (reportType === 'custom') return oDate === customDate;
    if (reportType === 'month') return oDate.startsWith(currentMonthStr);
    if (reportType === 'year') return oDate.startsWith(currentYearStr);
    return true;
  });

  // Calculate real metrics without fake placeholders
  const totalRevenue = filteredOrders.reduce((acc, o) => {
    const amt = typeof o.totalAmount === 'number'
      ? o.totalAmount
      : typeof o.amount === 'string'
      ? parseInt(o.amount.replace(/[^0-9]/g, ''), 10) || 0
      : Number(o.amount) || 0;
    return acc + amt;
  }, 0);

  const totalOrdersCount = filteredOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const totalStemsDispatched = filteredOrders.reduce((acc, o) => {
    const count = o.itemsCount || (Array.isArray(o.items) ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 1);
    return acc + count;
  }, 0);

  // Group sales by country / destination
  const destinationMap = {};
  filteredOrders.forEach((o) => {
    const dest = o.shippingAddress?.country || o.destination || 'India';
    destinationMap[dest] = (destinationMap[dest] || 0) + 1;
  });
  const topDestinations = Object.entries(destinationMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  // 1. Download Sales Report
  const handleDownloadSalesReport = () => {
    if (filteredOrders.length === 0) {
      toast.info('No orders recorded for the selected timeframe.');
      return;
    }
    const rows = filteredOrders.map((o, idx) => ({
      '#': idx + 1,
      'Order / Bill No': o.orderId || o.id || `ORD-${idx + 1}`,
      'Date': o.createdAt ? o.createdAt.split('T')[0] : todayStr,
      'Customer Name': o.user?.name || o.shippingAddress?.fullName || o.customer || 'Customer',
      'Contact Email': o.user?.email || o.shippingAddress?.email || 'N/A',
      'Destination City / Country': `${o.shippingAddress?.city || ''}, ${o.shippingAddress?.country || 'India'}`,
      'Items Count': o.itemsCount || 1,
      'Status': o.status || 'Confirmed',
      'Total Amount (INR)': o.totalAmount || o.amount || 1299,
      'Payment Method': o.paymentMethod || 'Online (Razorpay)',
    }));

    exportArrayToExcel(rows, `Dhanvikk_Sales_Report_${reportType}_${Date.now()}`);
    toast.success('Sales report downloaded successfully!');
  };

  // 2. Download Customer Directory Report
  const handleDownloadCustomerReport = () => {
    if (!customers || customers.length === 0) {
      toast.info('No customer accounts found.');
      return;
    }
    const rows = customers.map((c, idx) => ({
      '#': idx + 1,
      'Customer ID': c.id || c._id || `CUST-${idx + 1}`,
      'Customer Name': c.name || 'Valued Patron',
      'Email': c.email || 'N/A',
      'Phone': c.phone || 'N/A',
      'City / Region': c.city || c.address?.city || 'Chennai',
      'Total Orders': c.orderCount || c.ordersCount || 1,
      'Account Created': c.createdAt ? c.createdAt.split('T')[0] : '2026-01-01',
    }));

    exportArrayToExcel(rows, `Dhanvikk_Customer_Directory_${Date.now()}`);
    toast.success('Customer report downloaded successfully!');
  };

  // 3. Download Product Catalog with 10-Digit SKUs
  const handleDownloadProductReport = () => {
    if (!products || products.length === 0) {
      toast.info('No products in catalog.');
      return;
    }
    const rows = products.map((p, idx) => ({
      '#': idx + 1,
      '10-Digit Registered SKU': p.sku || p.serialNumber || '2610300001',
      'Product Name': p.name,
      'Category': p.category,
      'Subcategory': p.subCategory || 'N/A',
      'Price (INR)': p.price,
      'Live Stock Quantity': p.stock,
      'Stock Status': p.stock > 0 ? 'In Stock' : 'Out of Stock',
      'Rating': p.rating || 5,
      'Registered Date': p.registeredDate || todayStr,
    }));

    exportArrayToExcel(rows, `Dhanvikk_Product_SKU_Catalog_${Date.now()}`);
    toast.success('Product SKU catalog downloaded successfully!');
  };

  // 4. Download Comprehensive Analytics Summary
  const handleDownloadComprehensiveAnalytics = () => {
    const summaryData = [
      { Metric: 'Reporting Timeframe', Value: reportType.toUpperCase() },
      { Metric: 'Reference Date / Period', Value: reportType === 'custom' ? customDate : todayStr },
      { Metric: 'Total Gross Revenue (INR)', Value: `₹${totalRevenue.toLocaleString('en-IN')}` },
      { Metric: 'Total Orders Placed', Value: totalOrdersCount },
      { Metric: 'Average Order Value (AOV)', Value: `₹${avgOrderValue.toLocaleString('en-IN')}` },
      { Metric: 'Total Floral Stems Dispatched', Value: totalStemsDispatched },
      { Metric: 'Active Product SKUs in Catalog', Value: products.length },
      { Metric: 'Total Registered Patrons', Value: customers.length },
      { Metric: 'Generated At', Value: new Date().toLocaleString('en-GB') },
    ];

    exportArrayToExcel(summaryData, `Dhanvikk_Analytics_Summary_${Date.now()}`);
    toast.success('Daily Analytics Summary downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Timeframe Selector & Report Filter Toolbar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#E11D48]" />
            <span>Sales & Commercial Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real dynamic revenue telemetry & download export reports for accounting.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {[
              { id: 'today', label: 'Day Sale (Today)' },
              { id: 'month', label: 'This Month' },
              { id: 'year', label: 'This Year' },
              { id: 'custom', label: 'Specific Date' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setReportType(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  reportType === t.id ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {reportType === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-mono focus:outline-none focus:border-rose-400"
            />
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Revenue</span>
            <span className="text-2xl font-bold font-mono text-[#E11D48] mt-1 block">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{filteredOrders.length} Completed Orders</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#E11D48] border border-rose-200 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Orders Processed</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
              {totalOrdersCount}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Avg Order Value: ₹{avgOrderValue.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Stems Dispatched</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
              {totalStemsDispatched}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Cold-Chain Reefer Cargo</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Export Destinations</span>
            <span className="text-2xl font-bold font-mono text-indigo-600 mt-1 block">
              {topDestinations.length > 0 ? topDestinations.length : 1}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Top: {topDestinations[0]?.country || 'India'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Instant Report Download Center */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Official Report Download Center</h3>
            <p className="text-xs text-slate-500">Download formatted Excel (.xlsx) spreadsheets for taxation, accounting, and audits.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <button
            type="button"
            onClick={handleDownloadSalesReport}
            className="p-4 rounded-2xl border border-slate-200 hover:border-[#E11D48] bg-slate-50 hover:bg-white text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 group-hover:text-[#E11D48]">Sales Report</span>
              <Download className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-[11px]">Itemized orders, bills, customer names & amounts for selected timeframe.</p>
          </button>

          <button
            type="button"
            onClick={handleDownloadCustomerReport}
            className="p-4 rounded-2xl border border-slate-200 hover:border-[#E11D48] bg-slate-50 hover:bg-white text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 group-hover:text-[#E11D48]">Customer Directory</span>
              <Download className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-[11px]">Full client profiles, verified contact emails, phone numbers & order histories.</p>
          </button>

          <button
            type="button"
            onClick={handleDownloadProductReport}
            className="p-4 rounded-2xl border border-slate-200 hover:border-[#E11D48] bg-slate-50 hover:bg-white text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 group-hover:text-[#E11D48]">Product & SKU Catalog</span>
              <Download className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-[11px]">All 10-digit registered SKUs (YYMMDDXXXX), live stock counts, and prices.</p>
          </button>

          <button
            type="button"
            onClick={handleDownloadComprehensiveAnalytics}
            className="p-4 rounded-2xl border border-slate-200 hover:border-[#E11D48] bg-slate-50 hover:bg-white text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 group-hover:text-[#E11D48]">Executive Summary</span>
              <Download className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-[11px]">Overall analytics summary, daily gross turnover, and cargo dispatches.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
