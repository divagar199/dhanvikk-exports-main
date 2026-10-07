import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import Navbar from '../../components/navigation/Navbar';
import AnnouncementBar from '../../components/navigation/AnnouncementBar';
import SubNav from '../../components/navigation/SubNav';
import Footer from '../../components/navigation/Footer';
import CartDrawer from '../../components/cart/CartDrawer';
import Breadcrumb from '../../components/common/Breadcrumb';
import Spinner from '../../components/common/Spinner';
import { orderService } from '../../services/orderService';
import { useCurrency } from '../../context/CurrencyContext';
import { getProductImageUrl } from '../../utils/imageUrl';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  MessageSquare,
  FileText,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  User
} from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { formatPrice } = useCurrency();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, delivered, cancelled
  const [guestLookupId, setGuestLookupId] = useState('');
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      if (res?.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      } else {
        // Fallback default sample orders
        const allRes = await orderService.getAllOrders();
        setOrders(allRes?.orders || []);
      }
    } catch {
      // Fallback
      const allRes = await orderService.getAllOrders();
      setOrders(allRes?.orders || []);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLookup = (e) => {
    e.preventDefault();
    if (!guestLookupId.trim()) {
      toast.error('Please enter a valid Order ID (e.g. ORD-2026-7821)');
      return;
    }
    const cleanId = guestLookupId.trim().toUpperCase();
    const found = orders.find((o) => (o.orderId || o._id || '').toUpperCase().includes(cleanId));
    if (found) {
      toast.success(`Found order #${found.orderId || found._id}`);
      setSelectedOrderReceipt(found);
    } else {
      toast.error(`No order matching "${cleanId}" was found. Please check your confirmation SMS/Email.`);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const id = (order.orderId || order._id || '').toLowerCase();
    const recipient = (order.recipientName || order.shippingAddress?.fullName || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || id.includes(q) || recipient.includes(q);

    const st = (order.orderStatus || order.status || '').toLowerCase();
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = ['confirmed', 'preparing', 'out for delivery', 'in transit'].some((s) => st.includes(s));
    } else if (statusFilter === 'delivered') {
      matchesStatus = st.includes('delivered');
    } else if (statusFilter === 'cancelled') {
      matchesStatus = st.includes('cancelled');
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    }
    if (s.includes('out') || s.includes('transit')) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
          <Truck className="w-3.5 h-3.5" /> Out for Delivery
        </span>
      );
    }
    if (s.includes('prep') || s.includes('confirm')) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0F4] text-[#C2185B] border border-[#FCC1C5]">
          <Sparkles className="w-3.5 h-3.5" /> Floral Artisan Sourcing
        </span>
      );
    }
    if (s.includes('cancel')) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Confirmed
      </span>
    );
  };

  return (
    <>
      <SEO
        title="My Orders & Live Floral Delivery Tracking | Dhanvikk Blooms"
        description="Track your luxury flower bouquets, view temperature-controlled delivery status, download official tax receipts, and manage recent orders."
        canonical="/orders"
        noindex={true}
      />

      <CartDrawer />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col font-['Poppins']">
        <AnnouncementBar />
        <Navbar />
        <SubNav />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Account', path: '/account' },
              { label: 'My Orders' },
            ]}
            className="mb-6"
          />

          {/* Page Hero Header */}
          <div className="bg-gradient-to-r from-[#FFF0F4] via-[#FFFDF9] to-[#FFF0F4] rounded-3xl p-6 sm:p-8 border border-[#F2D7DE] shadow-xs mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-5 h-5 text-[#EC407A]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C2185B]">
                    Active Dispatches & History
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#242124] font-['Poppins']">
                  My Floral Orders
                </h1>
                <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-xl">
                  Real-time cold-chain tracking from our high-altitude floristry estates directly to doorstep presentation.
                </p>
              </div>

              {/* Fast Concierge WhatsApp Link */}
              <a
                href="https://wa.me/919108916328?text=Hello%20Dhanvikk%20Concierge!%20I%20would%20like%20to%20inquire%20about%20my%20recent%20order%20status."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md self-start md:self-auto"
              >
                <span>Live Concierge Chat</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Guest Order Lookup Banner (if not logged in) */}
          {!isAuthenticated && (
            <div className="bg-white rounded-3xl p-6 border border-[#EFE7DE] shadow-sm mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-base font-bold text-[#242124]">
                    Have an Order Number to Track?
                  </h3>
                  <p className="text-xs text-[#777777]">
                    Enter your Order ID (found in your SMS or confirmation email) to inspect live refrigerated dispatch progress.
                  </p>
                </div>

                <form onSubmit={handleGuestLookup} className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <input
                      type="text"
                      value={guestLookupId}
                      onChange={(e) => setGuestLookupId(e.target.value)}
                      placeholder="e.g. ORD-2026-7821"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#EC407A]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Track
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: `All (${orders.length})` },
                { id: 'active', label: 'In Transit / Active' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-[#EC407A] text-white shadow-xs'
                      : 'bg-white hover:bg-[#FFF3F6] text-[#555555] hover:text-[#EC407A] border border-[#EAE2D8]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID or recipient..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-[#E5DFD9] bg-white text-[#242124] focus:outline-none focus:border-[#EC407A] transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Orders Listing Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="#EC407A" />
              <span className="text-xs uppercase tracking-widest text-[#777777]">
                Retrieving your order dispatches...
              </span>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EFE7DE] shadow-xs space-y-4 max-w-lg mx-auto my-8">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#242124] font-['Poppins']">
                No Orders Found
              </h3>
              <p className="text-xs text-[#777777] leading-relaxed max-w-sm mx-auto">
                {searchQuery
                  ? `No orders match your query "${searchQuery}". Try searching by order number.`
                  : "You haven't placed any flower arrangements under this account yet."}
              </p>
              <div className="pt-2">
                <Link
                  to="/category/flowers"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs font-bold transition-all shadow-md"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Explore Fresh Harvest</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const orderIdStr = order.orderId || order._id || 'ORD-2026';
                const items = order.items || [];
                const addressObj = order.deliveryAddress || order.shippingAddress || {};
                const fullAddressStr = [
                  addressObj.street || addressObj.streetAddress,
                  addressObj.district,
                  addressObj.city,
                  addressObj.state,
                  addressObj.country,
                ]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div
                    key={order._id || orderIdStr}
                    className="bg-white rounded-3xl border border-[#EFE7DE] shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Order Card Header */}
                    <div className="p-5 sm:p-6 bg-[#FAF7F2]/60 border-b border-[#F2ECE6] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#777777] block">
                            Order Number
                          </span>
                          <span className="text-sm font-bold text-[#242124] font-mono">
                            #{orderIdStr}
                          </span>
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-[#EAE2D8]" />

                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#777777] block">
                            Placed Date
                          </span>
                          <span className="text-xs font-semibold text-[#555555]">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                          </span>
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-[#EAE2D8]" />

                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#777777] block">
                            Total Paid
                          </span>
                          <span className="text-sm font-bold text-[#EC407A] font-mono">
                            {formatPrice(order.totalAmount || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge & Actions */}
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.orderStatus || order.status)}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderReceipt(order)}
                          className="px-3.5 py-1.5 rounded-full border border-[#E5DFD9] bg-white hover:bg-[#FFF3F6] text-[#EC407A] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Body Details */}
                    <div className="p-5 sm:p-6 space-y-6">
                      {/* Items Row */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-[#242124] uppercase tracking-wider block">
                          Handcrafted Botanical Items ({items.length})
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FFFDF9] border border-[#F2ECE6]"
                            >
                              <img
                                src={getProductImageUrl(item.image)}
                                alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover border border-[#EFE7DE] flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-[#242124] truncate">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-[#777777] mt-0.5">
                                  <span>Qty: {item.quantity || 1}</span>
                                  <span>•</span>
                                  <span className="font-bold text-[#C2185B] font-mono">
                                    {formatPrice(item.price || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Metadata Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F2ECE6] text-xs">
                        <div className="space-y-1">
                          <span className="text-[#888888] flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#EC407A]" /> Destination Address
                          </span>
                          <p className="font-semibold text-[#242124] line-clamp-2">
                            {fullAddressStr || 'Delivery Address on File'}
                          </p>
                          <span className="text-[11px] text-[#777777] block">
                            Recipient: {order.recipientName || order.shippingAddress?.fullName || 'VIP Client'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[#888888] flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-[#EC407A]" /> Delivery Slot
                          </span>
                          <p className="font-semibold text-[#242124]">
                            {order.deliveryDate || 'Scheduled Delivery'}
                          </p>
                          <span className="text-[11px] text-[#777777] block">
                            {order.deliverySlot || order.timeSlot || 'Prime Chilled Courier'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[#888888] flex items-center gap-1 font-medium">
                            <MessageSquare className="w-3.5 h-3.5 text-[#EC407A]" /> Handwritten Note
                          </span>
                          <p className="italic text-[#555555] bg-[#FAF7F2] p-2 rounded-xl text-[11px] line-clamp-2 border border-[#EFE7DE]">
                            "{order.greetingMessage || order.greetingCardMessage || 'No personal message requested.'}"
                          </p>
                        </div>
                      </div>

                      {/* Visual Cold-Chain Dispatch Step Progress Bar */}
                      <div className="pt-4 border-t border-[#F2ECE6]">
                        <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block mb-3">
                          Cold-Chain Journey
                        </span>
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                              ✓
                            </div>
                            <span className="font-bold text-[#242124]">Order Confirmed</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                              ✓
                            </div>
                            <span className="font-bold text-[#242124]">Fresh Stem Conditioning</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                              (order.orderStatus || '').toLowerCase().includes('delivered')
                                ? 'bg-emerald-500 text-white'
                                : 'bg-[#EC407A] text-white animate-pulse'
                            }`}>
                              3
                            </div>
                            <span className="font-bold text-[#242124]">Refrigerated Transit</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                              (order.orderStatus || '').toLowerCase().includes('delivered')
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {(order.orderStatus || '').toLowerCase().includes('delivered') ? '✓' : '4'}
                            </div>
                            <span className="font-bold text-[#777777]">Hand-Delivered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Order Receipt Modal */}
        {selectedOrderReceipt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSelectedOrderReceipt(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EFE7DE] shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#F7F2ED]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#EC407A]">
                    Official Haute Floristry Receipt
                  </span>
                  <h3 className="text-lg font-bold text-[#242124] font-mono">
                    #{selectedOrderReceipt.orderId || selectedOrderReceipt._id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderReceipt(null)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#EC407A] hover:bg-[#FFF0F4] flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2.5 text-xs">
                {(selectedOrderReceipt.items || []).map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-black/5">
                    <span className="text-[#555]">
                      {it.quantity || 1}x {it.name}
                    </span>
                    <span className="font-bold font-mono text-[#242124]">
                      {formatPrice(it.price || 0)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-bold text-sm text-[#242124] border-t border-[#F2ECE6]">
                  <span>Total Paid (Taxes Included)</span>
                  <span className="text-[#EC407A] font-mono text-base">
                    {formatPrice(selectedOrderReceipt.totalAmount || 0)}
                  </span>
                </div>
              </div>

              {/* Security & Guarantee Seal */}
              <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#F2ECE6] flex items-center gap-3 text-xs text-[#777777]">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>7-Day Vase Life Stem Guarantee & Phytosanitary Export Compliant.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-full border border-[#E5DFD9] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#242124] cursor-pointer"
                >
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderReceipt(null)}
                  className="px-6 py-2.5 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
