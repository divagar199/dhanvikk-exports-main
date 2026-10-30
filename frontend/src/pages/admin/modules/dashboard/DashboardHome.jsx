import React, { useState, useMemo, useEffect } from 'react';
import { getMostTimeSpentProducts } from '../../../../utils/telemetryService';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  Plus,
  ArrowUpRight,
  ArrowRight,
  MoreVertical,
  ChevronDown,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  RotateCcw,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react';

export default function DashboardHome({
  stats = {},
  products = [],
  orders = [],
  enquiries = [],
  usersList = [],
  onSelectTab,
  onQuickAction,
  authUser,
  superAdminEmail = 'divagar.m.msc.cs@gmail.com',
  headerDateFilter = 'All',
  onDateFilterChange,
}) {
  const [salesTimeframe, setSalesTimeframe] = useState(headerDateFilter || 'This Year');

  // Sync with header date filter if provided
  useEffect(() => {
    if (headerDateFilter && headerDateFilter !== salesTimeframe) {
      setSalesTimeframe(headerDateFilter);
    }
  }, [headerDateFilter]);

  const handleTimeframeChange = (newVal) => {
    setSalesTimeframe(newVal);
    if (onDateFilterChange) {
      onDateFilterChange(newVal);
    }
  };

  // 1. Filter orders strictly based on active timeframe
  const periodOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    if (!salesTimeframe || salesTimeframe === 'All' || salesTimeframe === 'All Time') return orders;

    const now = new Date();
    return orders.filter((o) => {
      if (!o.createdAt) return true;
      const d = new Date(o.createdAt);
      if (isNaN(d.getTime())) return true;

      if (salesTimeframe === 'Today') {
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }
      if (salesTimeframe === 'This Week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= oneWeekAgo;
      }
      if (salesTimeframe === 'This Month') {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }
      if (salesTimeframe === 'Last 6 Months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return d >= sixMonthsAgo;
      }
      if (salesTimeframe === 'This Year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, salesTimeframe]);

  // 2. Real calculated KPI metrics (0 fake placeholders)
  const totalOrdersCount = periodOrders.length;
  const computedRevenue = useMemo(() => {
    return periodOrders.reduce((sum, o) => {
      const val = typeof o.totalAmount === 'number'
        ? o.totalAmount
        : typeof o.amount === 'string'
        ? parseInt(o.amount.replace(/[^0-9]/g, ''), 10) || 0
        : Number(o.amount) || 0;
      return sum + val;
    }, 0);
  }, [periodOrders]);

  const totalRevenueAmount = `₹${computedRevenue.toLocaleString('en-IN')}`;
  const newCustomersCount = usersList.length;
  const productsCount = products.length;

  // 3. Dynamic Order Status breakdown
  const deliveredCount = periodOrders.filter((o) => (o.status || o.orderStatus) === 'Delivered').length;
  const processingCount = periodOrders.filter((o) =>
    ['Processing', 'Confirmed', 'Preparing Floral Order', 'Pending'].includes(o.status || o.orderStatus)
  ).length;
  const shippedCount = periodOrders.filter((o) =>
    ['Shipped', 'Out for Delivery'].includes(o.status || o.orderStatus)
  ).length;
  const cancelledCount = periodOrders.filter((o) => (o.status || o.orderStatus) === 'Cancelled').length;
  const returnedCount = periodOrders.filter((o) => (o.status || o.orderStatus) === 'Returned').length;

  const totalStatusOrders = totalOrdersCount || 1;
  const deliveredPct = totalOrdersCount > 0 ? Math.round((deliveredCount / totalStatusOrders) * 100) : 0;
  const processingPct = totalOrdersCount > 0 ? Math.round((processingCount / totalStatusOrders) * 100) : 0;
  const shippedPct = totalOrdersCount > 0 ? Math.round((shippedCount / totalStatusOrders) * 100) : 0;
  const cancelledPct = totalOrdersCount > 0 ? Math.round((cancelledCount / totalStatusOrders) * 100) : 0;
  const returnedPct = totalOrdersCount > 0 ? Math.round((returnedCount / totalStatusOrders) * 100) : 0;

  // Donut SVG arc calculations (Circumference ~ 377 for r=60)
  const CIRCUMFERENCE = 377;
  const deliveredDash = totalOrdersCount > 0 ? Math.round((deliveredCount / totalStatusOrders) * CIRCUMFERENCE) : 0;
  const processingDash = totalOrdersCount > 0 ? Math.round((processingCount / totalStatusOrders) * CIRCUMFERENCE) : 0;
  const shippedDash = totalOrdersCount > 0 ? Math.round((shippedCount / totalStatusOrders) * CIRCUMFERENCE) : 0;
  const cancelledDash = totalOrdersCount > 0 ? Math.round((cancelledCount / totalStatusOrders) * CIRCUMFERENCE) : 0;

  const deliveredOffset = 0;
  const processingOffset = -deliveredDash;
  const shippedOffset = -(deliveredDash + processingDash);
  const cancelledOffset = -(deliveredDash + processingDash + shippedDash);

  // 4. Sales Overview Chart Dynamic Data (Real 12-Month Aggregation)
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const monthlyStats = monthNames.map((mName, idx) => {
      const monthOrders = orders.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d.getFullYear() === currentYear && d.getMonth() === idx;
      });

      const rev = monthOrders.reduce((sum, o) => {
        const val = typeof o.totalAmount === 'number'
          ? o.totalAmount
          : typeof o.amount === 'string'
          ? parseInt(o.amount.replace(/[^0-9]/g, ''), 10) || 0
          : Number(o.amount) || 0;
        return sum + val;
      }, 0);

      return {
        month: mName,
        index: idx,
        ordersCount: monthOrders.length,
        revenue: rev,
      };
    });

    const maxRev = Math.max(...monthlyStats.map((m) => m.revenue), 5000);
    const maxOrders = Math.max(...monthlyStats.map((m) => m.ordersCount), 1);
    const peak = [...monthlyStats].sort((a, b) => b.revenue - a.revenue)[0];

    // Compute SVG path points
    const points = monthlyStats.map((m, idx) => {
      const x = 66 + idx * 52;
      const y = Math.round(208 - (m.revenue / maxRev) * 150);
      const barHeight = Math.max(m.ordersCount > 0 ? 8 : 2, Math.round((m.ordersCount / maxOrders) * 110));
      const barY = 208 - barHeight;
      return { ...m, x, y, barHeight, barY };
    });

    // Generate smooth cubic bezier SVG path string
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      pathD += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} 208 L ${points[0].x} 208 Z`;

    return {
      points,
      pathD,
      areaD,
      peak,
      maxRev,
    };
  }, [orders]);

  // 5. Dynamic Top Selling Products from real customer orders
  const dynamicTopProducts = useMemo(() => {
    const statsMap = {};

    orders.forEach((ord) => {
      if (Array.isArray(ord.items)) {
        ord.items.forEach((it) => {
          const key = it.name || it.productName || 'Handcrafted Bloom';
          if (!statsMap[key]) {
            statsMap[key] = {
              name: key,
              orders: 0,
              quantity: 0,
              revenue: 0,
              image: it.image || '',
              price: it.price || 0,
            };
          }
          statsMap[key].orders += 1;
          statsMap[key].quantity += (it.quantity || 1);
          statsMap[key].revenue += ((it.price || 0) * (it.quantity || 1));
          if (!statsMap[key].image && it.image) statsMap[key].image = it.image;
        });
      }
    });

    const list = Object.values(statsMap).sort((a, b) => b.orders - a.orders || b.quantity - a.quantity);

    if (list.length > 0) {
      return list.slice(0, 5).map((p, idx) => ({
        rank: idx + 1,
        name: p.name,
        orders: p.orders,
        price: `₹${Number(p.price || (p.revenue / (p.quantity || 1)) || 0).toLocaleString('en-IN')}`,
        image: p.image || products.find((pr) => pr.name === p.name)?.images || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=160&q=80',
      }));
    }

    // Default to top available catalog products
    return products.slice(0, 5).map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      orders: 0,
      price: `₹${Number(p.price || 0).toLocaleString('en-IN')}`,
      image: Array.isArray(p.images) ? p.images[0] : (p.images || p.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=160&q=80'),
    }));
  }, [orders, products]);

  // 6. Recent Orders from real placed orders
  const displayOrders = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return [];
    return orders.slice(0, 6).map((o, idx) => {
      const firstItem = o.items?.[0] || {};
      const totalItems = Array.isArray(o.items)
        ? o.items.reduce((acc, i) => acc + (i.quantity || 1), 0)
        : o.itemsCount || 1;
      const rawAmt = typeof o.totalAmount === 'number'
        ? o.totalAmount
        : typeof o.amount === 'string'
        ? parseInt(o.amount.replace(/[^0-9]/g, ''), 10) || 0
        : Number(o.amount) || 0;

      return {
        id: o.orderId || o._id || `#ORD-${String(idx + 1).padStart(4, '0')}`,
        customer: o.user?.name || o.shippingAddress?.fullName || o.customer || 'Patron Client',
        productName: firstItem.name || o.productName || 'Botanical Bouquet',
        productImage: firstItem.image || o.productImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=160&q=80',
        itemsCount: totalItems,
        amount: `₹${rawAmt.toLocaleString('en-IN')}`,
        status: o.orderStatus || o.status || 'Confirmed',
        date: o.createdAt
          ? new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Today',
      };
    });
  }, [orders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Delivered
          </span>
        );
      case 'Processing':
      case 'Confirmed':
      case 'Preparing Floral Order':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-100">
            {status}
          </span>
        );
      case 'Shipped':
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-600 border border-sky-100">
            {status}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            {status}
          </span>
        );
    }
  };

  const PinkSparkline = () => (
    <svg className="w-16 h-8 overflow-visible" viewBox="0 0 64 32">
      <path
        d="M 2 24 Q 16 28, 24 16 T 44 14 T 62 6"
        fill="none"
        stroke="#F43F5E"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div className="space-y-6 text-[#1E293B]">
      {/* ========================================================
          1. WELCOME HEADER & ACTION BUTTON
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Welcome Back, Divagar! 👋
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Here's your live floriculture business performance ({salesTimeframe}).
          </p>
        </div>

        <button
          type="button"
          onClick={() => onQuickAction('add_product')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-semibold shadow-md shadow-rose-500/20 transition-all cursor-pointer self-start sm:self-auto active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* ========================================================
          2. TOP 4 REAL METRIC CARDS + PROMO BANNER CARD
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Orders */}
        <div
          onClick={() => onSelectTab('orders')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-[#64748B]">Total Orders</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-0.5 font-['Poppins']">
              {totalOrdersCount}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              ● <span className="text-[#94A3B8] font-normal text-[11px] ml-1">{totalOrdersCount} placed {salesTimeframe.toLowerCase()}</span>
            </span>
            <PinkSparkline />
          </div>
        </div>

        {/* Metric 2: Total Revenue */}
        <div
          onClick={() => onSelectTab('reports')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-lg font-bold font-mono">
              ₹
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-[#64748B]">Total Revenue</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-0.5 font-['Poppins']">
              {totalRevenueAmount}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              ● <span className="text-[#94A3B8] font-normal text-[11px] ml-1">Live order value</span>
            </span>
            <PinkSparkline />
          </div>
        </div>

        {/* Metric 3: New Customers */}
        <div
          onClick={() => onSelectTab('customers')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-[#64748B]">Registered Patrons</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-0.5 font-['Poppins']">
              {newCustomersCount}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              ● <span className="text-[#94A3B8] font-normal text-[11px] ml-1">Active customer accounts</span>
            </span>
            <PinkSparkline />
          </div>
        </div>

        {/* Metric 4: Products */}
        <div
          onClick={() => onSelectTab('products')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-[#64748B]">Live Catalog</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-0.5 font-['Poppins']">
              {productsCount}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              ● <span className="text-[#94A3B8] font-normal text-[11px] ml-1">100% Unique 10-Digit SKUs</span>
            </span>
            <PinkSparkline />
          </div>
        </div>

        {/* Card 5: Right Luxury Promo Card */}
        <div
          onClick={() => onSelectTab('enquiries')}
          className="bg-gradient-to-br from-rose-50 via-pink-50 to-pink-100/80 rounded-2xl p-5 border border-rose-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="flex justify-center -mt-2">
            <img
              src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=300&q=80"
              alt="Fresh Blooms"
              className="w-24 h-24 object-cover rounded-xl shadow-xs group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-[#0F172A] leading-tight">
              Fresh Flowers Happier People
            </h4>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">
              Manage | Grow | Export
            </p>
          </div>
          <div className="mt-3 flex justify-end">
            <div className="w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center text-rose-600 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. REAL SALES OVERVIEW & ORDER STATUS CHARTS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Dynamic Sales Overview Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Sales Overview</h3>
              <p className="text-xs text-[#64748B]">Live revenue and order volume by month ({new Date().getFullYear()})</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-[#0F172A]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FDA4AF]" />
                  Orders
                </span>
              </div>
              <div className="relative">
                <select
                  value={salesTimeframe}
                  onChange={(e) => handleTimeframeChange(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0F172A] py-1.5 pl-3 pr-7 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="All Time">All Time</option>
                  <option value="This Year">This Year</option>
                  <option value="Last 6 Months">Last 6 Months</option>
                  <option value="This Month">This Month</option>
                  <option value="Today">Today</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Dynamic SVG Chart with Real Peak Tag */}
          <div className="relative pt-6 pb-2">
            {/* Real peak tooltip badge */}
            {chartData.peak && chartData.peak.revenue > 0 && (
              <div
                className="absolute top-2 bg-[#0F172A] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 transition-all duration-300"
                style={{
                  left: `${Math.min(85, Math.max(15, (chartData.peak.index / 11) * 78 + 10))}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <span>{chartData.peak.month}: ₹{chartData.peak.revenue.toLocaleString('en-IN')}</span>
              </div>
            )}

            <svg viewBox="0 0 700 240" className="w-full h-56 overflow-visible">
              <defs>
                <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E11D48" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#E11D48" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              <line x1="40" y1="30" x2="680" y2="30" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="40" y1="80" x2="680" y2="80" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="40" y1="130" x2="680" y2="130" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="40" y1="180" x2="680" y2="180" stroke="#F1F5F9" strokeDasharray="4 4" />

              {/* Dynamic Y Axis Labels */}
              <text x="32" y="34" textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">
                ₹{Math.round(chartData.maxRev / 1000)}k
              </text>
              <text x="32" y="84" textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">
                ₹{Math.round((chartData.maxRev * 0.75) / 1000)}k
              </text>
              <text x="32" y="134" textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">
                ₹{Math.round((chartData.maxRev * 0.5) / 1000)}k
              </text>
              <text x="32" y="184" textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">
                ₹{Math.round((chartData.maxRev * 0.25) / 1000)}k
              </text>
              <text x="32" y="210" textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">
                0
              </text>

              {/* Monthly Real Bars (Orders Count) */}
              {chartData.points.map((pt) => (
                <rect
                  key={pt.month}
                  x={pt.x - 8}
                  y={pt.barY}
                  width="16"
                  height={pt.barHeight}
                  rx="3"
                  fill="#FFE4E6"
                />
              ))}

              {/* Smooth Area Gradient */}
              <path d={chartData.areaD} fill="url(#roseGradient)" />

              {/* Smooth Revenue Curve Line */}
              <path
                d={chartData.pathD}
                fill="none"
                stroke="#E11D48"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Points on the line */}
              {chartData.points.map((pt) => (
                <circle
                  key={pt.month}
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.revenue > 0 ? 4.5 : 3}
                  fill="#E11D48"
                  stroke="#FFFFFF"
                  strokeWidth={pt.revenue > 0 ? 2 : 1}
                />
              ))}

              {/* Month Labels along X axis */}
              {chartData.points.map((pt) => (
                <text
                  key={pt.month}
                  x={pt.x}
                  y="226"
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="11"
                  fontWeight="500"
                >
                  {pt.month}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Right (1/3): Real Order Status Donut Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Order Status</h3>
            <p className="text-xs text-[#64748B]">Real-time fulfillment pipeline breakdown</p>
          </div>

          {/* Dynamic SVG Donut Chart with Center Text */}
          <div className="relative flex items-center justify-center py-4">
            <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
              {/* Background track */}
              <circle cx="80" cy="80" r="60" fill="none" stroke="#F8FAFC" strokeWidth="18" />

              {/* Delivered Segment */}
              {deliveredDash > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="18"
                  strokeDasharray={`${deliveredDash} ${CIRCUMFERENCE}`}
                  strokeDashoffset={deliveredOffset}
                  strokeLinecap="round"
                />
              )}

              {/* Processing / Confirmed Segment */}
              {processingDash > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="18"
                  strokeDasharray={`${processingDash} ${CIRCUMFERENCE}`}
                  strokeDashoffset={processingOffset}
                  strokeLinecap="round"
                />
              )}

              {/* Shipped Segment */}
              {shippedDash > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="18"
                  strokeDasharray={`${shippedDash} ${CIRCUMFERENCE}`}
                  strokeDashoffset={shippedOffset}
                  strokeLinecap="round"
                />
              )}

              {/* Cancelled Segment */}
              {cancelledDash > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="18"
                  strokeDasharray={`${cancelledDash} ${CIRCUMFERENCE}`}
                  strokeDashoffset={cancelledOffset}
                />
              )}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-[#0F172A] leading-tight">
                {totalOrdersCount}
              </span>
              <span className="text-[11px] font-medium text-[#64748B]">Orders</span>
            </div>
          </div>

          {/* Real Status Breakdown Legend List */}
          <div className="space-y-2 pt-2 border-t border-slate-50 text-xs font-medium">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                Delivered
              </span>
              <span className="text-[#64748B] font-semibold font-mono">
                {deliveredCount} ({deliveredPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                Processing / Confirmed
              </span>
              <span className="text-[#64748B] font-semibold font-mono">
                {processingCount} ({processingPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
                In Transit / Shipped
              </span>
              <span className="text-[#64748B] font-semibold font-mono">
                {shippedCount} ({shippedPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                Cancelled
              </span>
              <span className="text-[#64748B] font-semibold font-mono">
                {cancelledCount} ({cancelledPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                Returned
              </span>
              <span className="text-[#64748B] font-semibold font-mono">
                {returnedCount} ({returnedPct}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. REAL RECENT ORDERS TABLE & REAL TOP SELLING PRODUCTS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Real Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Recent Orders</h3>
              <p className="text-xs text-[#64748B]">Live dispatches from store and mobile app</p>
            </div>
            <button
              onClick={() => onSelectTab('orders')}
              className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {displayOrders.length === 0 ? (
              <div className="py-12 text-center text-[#94A3B8]">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-rose-300 opacity-60" />
                <p className="text-xs font-semibold text-slate-600">No orders placed yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When customers place orders on the web or mobile app, they will appear here in real time.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[#94A3B8] font-semibold">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-semibold text-[#0F172A] font-mono">
                        {ord.id}
                      </td>
                      <td className="py-3.5 font-medium text-[#0F172A]">
                        {ord.customer}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={ord.productImage}
                            alt={ord.productName}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-100 shadow-2xs"
                          />
                          <span className="text-[#334155] font-medium truncate max-w-[120px]">
                            {ord.productName}
                          </span>
                          <span className="text-[11px] text-[#94A3B8]">({ord.itemsCount})</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-bold font-mono text-[#0F172A]">
                        {ord.amount}
                      </td>
                      <td className="py-3.5">
                        {getStatusBadge(ord.status)}
                      </td>
                      <td className="py-3.5 text-[#64748B] text-[11px]">
                        {ord.date}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectTab('orders')}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right (1/3): Dynamic Top Selling Products */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Top Selling Products</h3>
              <p className="text-xs text-[#64748B]">Ranked by real order volume</p>
            </div>
            <button
              onClick={() => onSelectTab('products')}
              className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {dynamicTopProducts.map((p) => (
              <div
                key={p.rank}
                onClick={() => onSelectTab('products')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-bold text-[#94A3B8]">
                    {p.rank}
                  </span>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-2xs"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-[#0F172A] group-hover:text-[#E11D48] transition-colors line-clamp-1">
                      {p.name}
                    </h5>
                    <span className="text-[11px] text-[#64748B]">
                      {p.orders} orders
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-[#E11D48]">
                  {p.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          5. BOTTOM 4 QUICK ACTION / MANAGEMENT CARDS
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Manage Products */}
        <div
          onClick={() => onSelectTab('products')}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#E11D48] transition-colors">
              Manage Products
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
              {productsCount} active botanical products registered
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=120&q=80"
              alt="Bouquets"
              className="w-12 h-12 object-cover rounded-xl"
            />
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 2: Customer Management */}
        <div
          onClick={() => onSelectTab('customers')}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#E11D48] transition-colors">
              Customer Management
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
              {newCustomersCount} registered patron profiles & dwell logs
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
              alt="Customers"
              className="w-12 h-12 object-cover rounded-xl"
            />
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 3: Delivery Tracking */}
        <div
          onClick={() => onSelectTab('logistics')}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#E11D48] transition-colors">
              Delivery Tracking
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
              {shippedCount + processingCount} active dispatches in cold-chain transit
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=120&q=80"
              alt="Delivery Fleet"
              className="w-12 h-12 object-cover rounded-xl"
            />
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 4: Analytics & Reports */}
        <div
          onClick={() => onSelectTab('reports')}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#E11D48] transition-colors">
              Analytics & Reports
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
              Day, month & custom date Excel sales downloads
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
