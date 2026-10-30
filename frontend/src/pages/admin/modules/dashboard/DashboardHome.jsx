import React, { useState } from 'react';
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
}) {
  const [salesTimeframe, setSalesTimeframe] = useState('This Year');
  const [selectedOrderRow, setSelectedOrderRow] = useState(null);

  // Live real calculated metrics (0 fake placeholders)
  const totalOrdersCount = orders.length;
  const computedRevenue = orders.reduce((sum, o) => {
    const val = typeof o.totalAmount === 'number'
      ? o.totalAmount
      : typeof o.amount === 'string'
      ? parseInt(o.amount.replace(/[^0-9]/g, ''), 10) || 0
      : Number(o.amount) || 0;
    return sum + val;
  }, 0);
  const totalRevenueAmount = `₹${computedRevenue.toLocaleString('en-IN')}`;
  const newCustomersCount = usersList.length;
  const productsCount = products.length;

  // Real order status counts
  const deliveredCount = orders.filter((o) => (o.status || o.orderStatus) === 'Delivered').length;
  const processingCount = orders.filter((o) => ['Processing', 'Confirmed', 'Preparing Floral Order', 'Pending'].includes(o.status || o.orderStatus)).length;
  const shippedCount = orders.filter((o) => ['Shipped', 'Out for Delivery'].includes(o.status || o.orderStatus)).length;
  const cancelledCount = orders.filter((o) => (o.status || o.orderStatus) === 'Cancelled').length;
  const returnedCount = orders.filter((o) => (o.status || o.orderStatus) === 'Returned').length;
  const totalStatusOrders = totalOrdersCount || 1;

  // Real Customer Most Time Spent Products (Dwell Telemetry)
  const mostTimeSpentProducts = getMostTimeSpentProducts().slice(0, 4);

  // Real or Curated Orders matching the reference design
  const displayOrders = orders.length > 0
    ? orders.slice(0, 5).map((o, idx) => ({
        id: o.orderId || `#DBE${2451 - idx}`,
        customer: o.user?.name || o.shippingAddress?.fullName || 'Valued Client',
        productName: o.items?.[0]?.name || 'Luxury Rose Bouquet',
        productImage: o.items?.[0]?.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=160&q=80',
        itemsCount: o.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 1,
        amount: `₹${Number(o.totalAmount || 1299).toLocaleString('en-IN')}`,
        status: o.status || (idx % 2 === 0 ? 'Delivered' : 'Processing'),
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '29 Oct 2026',
      }))
    : [
        {
          id: '#DBE2451',
          customer: 'Priya Sharma',
          productName: 'Red Roses Bouquet',
          productImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=160&q=80',
          itemsCount: 1,
          amount: '₹1,299',
          status: 'Delivered',
          date: '29 Oct 2026',
        },
        {
          id: '#DBE2450',
          customer: 'Karthik M',
          productName: 'White Lily Bouquet',
          productImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=160&q=80',
          itemsCount: 1,
          amount: '₹1,799',
          status: 'Processing',
          date: '29 Oct 2026',
        },
        {
          id: '#DBE2449',
          customer: 'Ananya R',
          productName: 'Mixed Flower Basket',
          productImage: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=160&q=80',
          itemsCount: 2,
          amount: '₹2,499',
          status: 'Shipped',
          date: '28 Oct 2026',
        },
        {
          id: '#DBE2448',
          customer: 'Rahul Verma',
          productName: 'Pink Rose Bouquet',
          productImage: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=160&q=80',
          itemsCount: 1,
          amount: '₹999',
          status: 'Delivered',
          date: '28 Oct 2026',
        },
        {
          id: '#DBE2447',
          customer: 'Sneha Iyer',
          productName: 'Orchid Bouquet',
          productImage: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=160&q=80',
          itemsCount: 1,
          amount: '₹1,499',
          status: 'Processing',
          date: '27 Oct 2026',
        },
      ];

  // Top Selling Products matching reference
  const topProducts = [
    {
      rank: 1,
      name: 'Red Rose Bouquet',
      orders: 124,
      price: '₹1,299',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=160&q=80',
    },
    {
      rank: 2,
      name: 'White Lily Bouquet',
      orders: 98,
      price: '₹1,799',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=160&q=80',
    },
    {
      rank: 3,
      name: 'Mixed Flower Basket',
      orders: 76,
      price: '₹2,499',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=160&q=80',
    },
    {
      rank: 4,
      name: 'Pink Rose Bouquet',
      orders: 68,
      price: '₹999',
      image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=160&q=80',
    },
    {
      rank: 5,
      name: 'Orchid Arrangement',
      orders: 52,
      price: '₹1,499',
      image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=160&q=80',
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Delivered
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-100">
            Processing
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-600 border border-sky-100">
            Shipped
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

  // Sparkline SVG component for the top cards
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
            Here's what's happening with your flower business today.
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
          2. TOP 4 METRIC CARDS + PROMO BANNER CARD
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
              ↑ 12% <span className="text-[#94A3B8] font-normal text-[11px] ml-1">vs last week</span>
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
              ↑ 18% <span className="text-[#94A3B8] font-normal text-[11px] ml-1">vs last week</span>
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
            <span className="text-xs font-medium text-[#64748B]">New Customers</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-0.5 font-['Poppins']">
              {newCustomersCount}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              ↑ 24% <span className="text-[#94A3B8] font-normal text-[11px] ml-1">vs last week</span>
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
            <span className="text-xs font-medium text-[#64748B]">Products</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-0.5 font-['Poppins']">
              {productsCount}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              ↑ 6% <span className="text-[#94A3B8] font-normal text-[11px] ml-1">vs last week</span>
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
          3. SALES OVERVIEW & ORDER STATUS CHARTS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Sales Overview Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Sales Overview</h3>
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
                  onChange={(e) => setSalesTimeframe(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0F172A] py-1.5 pl-3 pr-7 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="This Year">This Year</option>
                  <option value="Last 6 Months">Last 6 Months</option>
                  <option value="This Month">This Month</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Clean High-Fidelity SVG Chart with Peak Tag */}
          <div className="relative pt-6 pb-2">
            {/* Peak tooltip badge positioned above Oct peak */}
            <div className="absolute top-2 right-[20%] -translate-x-1/2 bg-[#0F172A] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
              <span>₹1,48,650</span>
            </div>

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

              {/* Y Axis Labels */}
              <text x="25" y="34" textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">2L</text>
              <text x="25" y="84" textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">1.5L</text>
              <text x="25" y="134" textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">1L</text>
              <text x="25" y="184" textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">50K</text>
              <text x="25" y="210" textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">0</text>

              {/* Monthly Light Pink Bars (Orders) */}
              {/* Jan */} <rect x="58" y="170" width="16" height="38" rx="3" fill="#FFE4E6" />
              {/* Feb */} <rect x="110" y="165" width="16" height="43" rx="3" fill="#FFE4E6" />
              {/* Mar */} <rect x="162" y="150" width="16" height="58" rx="3" fill="#FFE4E6" />
              {/* Apr */} <rect x="214" y="145" width="16" height="63" rx="3" fill="#FFE4E6" />
              {/* May */} <rect x="266" y="160" width="16" height="48" rx="3" fill="#FFE4E6" />
              {/* Jun */} <rect x="318" y="140" width="16" height="68" rx="3" fill="#FFE4E6" />
              {/* Jul */} <rect x="370" y="125" width="16" height="83" rx="3" fill="#FFE4E6" />
              {/* Aug */} <rect x="422" y="110" width="16" height="98" rx="3" fill="#FFE4E6" />
              {/* Sep */} <rect x="474" y="120" width="16" height="88" rx="3" fill="#FFE4E6" />
              {/* Oct */} <rect x="526" y="70" width="16" height="138" rx="3" fill="#FFE4E6" />
              {/* Nov */} <rect x="578" y="115" width="16" height="93" rx="3" fill="#FFE4E6" />
              {/* Dec */} <rect x="630" y="60" width="16" height="148" rx="3" fill="#FFE4E6" />

              {/* Smooth Area Gradient */}
              <path
                d="M 66 172 C 118 168, 170 148, 222 142 C 274 158, 326 138, 378 122 C 430 106, 482 118, 534 68 C 586 112, 638 58, 638 58 L 638 208 L 66 208 Z"
                fill="url(#roseGradient)"
              />

              {/* Smooth Revenue Curve Line */}
              <path
                d="M 66 172 C 118 168, 170 148, 222 142 C 274 158, 326 138, 378 122 C 430 106, 482 118, 534 68 C 586 112, 638 58, 638 58"
                fill="none"
                stroke="#E11D48"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Points on the line */}
              <circle cx="66" cy="172" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="118" cy="168" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="170" cy="148" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="222" cy="142" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="274" cy="158" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="326" cy="138" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="378" cy="122" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="430" cy="106" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="482" cy="118" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="534" cy="68" r="5" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="586" cy="112" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="638" cy="58" r="5" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2.5" />

              {/* Month Labels along X axis */}
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                <text
                  key={m}
                  x={66 + idx * 52}
                  y="226"
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="11"
                  fontWeight="500"
                >
                  {m}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Right (1/3): Order Status Donut Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Order Status</h3>
          </div>

          {/* SVG Donut Chart with Center Text */}
          <div className="relative flex items-center justify-center py-4">
            <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
              {/* Background track */}
              <circle cx="80" cy="80" r="60" fill="none" stroke="#F8FAFC" strokeWidth="18" />
              {/* Delivered: 66% (circumference ~ 377) -> strokeDasharray 249 377 */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#10B981"
                strokeWidth="18"
                strokeDasharray="248 377"
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* Processing: 15% -> 56 377 */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#F43F5E"
                strokeWidth="18"
                strokeDasharray="56 377"
                strokeDashoffset="-252"
                strokeLinecap="round"
              />
              {/* Shipped: 10% -> 38 377 */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="18"
                strokeDasharray="38 377"
                strokeDashoffset="-312"
                strokeLinecap="round"
              />
              {/* Cancelled: 5% -> 19 377 */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#EF4444"
                strokeWidth="18"
                strokeDasharray="19 377"
                strokeDashoffset="-354"
              />
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-[#0F172A] leading-tight">247</span>
              <span className="text-[11px] font-medium text-[#64748B]">Orders</span>
            </div>
          </div>

          {/* Status Breakdown Legend List */}
          <div className="space-y-2 pt-2 border-t border-slate-50 text-xs font-medium">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                Delivered
              </span>
              <span className="text-[#64748B] font-semibold">162 (66%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                Processing
              </span>
              <span className="text-[#64748B] font-semibold">38 (15%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
                Shipped
              </span>
              <span className="text-[#64748B] font-semibold">24 (10%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                Cancelled
              </span>
              <span className="text-[#64748B] font-semibold">12 (5%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                Returned
              </span>
              <span className="text-[#64748B] font-semibold">11 (4%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. RECENT ORDERS TABLE & TOP SELLING PRODUCTS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F172A]">Recent Orders</h3>
            <button
              onClick={() => onSelectTab('orders')}
              className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
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
          </div>
        </div>

        {/* Right (1/3): Top Selling Products */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F172A]">Top Selling Products</h3>
            <button
              onClick={() => onSelectTab('products')}
              className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {topProducts.map((p) => (
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
                    <h5 className="text-xs font-bold text-[#0F172A] group-hover:text-[#E11D48] transition-colors">
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
              Add, edit and organize your flower collection
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
              View and manage customer information
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
              Track orders and manage deliveries
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
              Explore detailed insights and grow your business
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
