import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Heart,
  ShoppingCart,
  Clock,
  Eye,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  UserCheck,
  UserPlus,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Plus,
  Crown,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getCustomerActivityLogs,
  getMostTimeSpentProducts,
  getStaffAuditLogs,
  getStaffAttendanceLogs,
  logStaffAttendance,
} from '../../../../utils/telemetryService';
import { exportArrayToExcel } from '../../../../utils/excelService';

const STAFF_POSITIONS = [
  { id: 'manager', label: 'Store Manager (Operations & Orders)' },
  { id: 'florist_lead', label: 'Master Florist (Catalog & Stems Atelier)' },
  { id: 'inventory_manager', label: 'Inventory Lead (Inward Purchases & Storage)' },
  { id: 'delivery_manager', label: 'Cold-Chain Dispatch Coordinator' },
  { id: 'staff', label: 'General Operations Staff' },
];

export default function CustomerStaffManager({
  usersList = [],
  staffList = [],
  superAdminEmail = 'divagar.m.msc.cs@gmail.com',
  onSaveStaff,
  onDeleteStaff,
  authUser,
}) {
  const [activeStream, setActiveStream] = useState('customers'); // 'customers' | 'staff'
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Customer Telemetry States
  const [customerLogs, setCustomerLogs] = useState(() => getCustomerActivityLogs());
  const [dwellProducts, setDwellProducts] = useState(() => getMostTimeSpentProducts());

  // Staff States
  const [staffAudit, setStaffAudit] = useState(() => getStaffAuditLogs());
  const [attendanceRecords, setAttendanceRecords] = useState(() => getStaffAttendanceLogs());
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    position: 'Store Manager (Operations & Orders)',
    role: 'manager',
    phone: '',
    status: 'Active',
  });

  const [attendanceForm, setAttendanceForm] = useState({
    staffName: authUser?.name || 'Divagar (Super Admin)',
    position: 'Super Admin',
    status: 'Present',
    clockIn: '09:00 AM',
    clockOut: '06:00 PM',
    notes: 'On-duty shift active at floriculture facility.',
  });

  // Refresh logs on mount and listener
  useEffect(() => {
    const handleCustomerEvent = (e) => {
      setCustomerLogs((prev) => [e.detail, ...prev.slice(0, 499)]);
      setDwellProducts(getMostTimeSpentProducts());
    };
    const handleStaffEvent = (e) => {
      setStaffAudit((prev) => [e.detail, ...prev.slice(0, 499)]);
    };

    window.addEventListener('dhanvikk_customer_activity', handleCustomerEvent);
    window.addEventListener('dhanvikk_staff_audit', handleStaffEvent);

    return () => {
      window.removeEventListener('dhanvikk_customer_activity', handleCustomerEvent);
      window.removeEventListener('dhanvikk_staff_audit', handleStaffEvent);
    };
  }, []);

  // Filter customers
  const patrons = usersList.filter(
    (u) => (u.role || 'customer') !== 'admin' && (u.role || 'customer') !== 'super_admin'
  );
  const staffAccounts = usersList.filter(
    (u) => u.role === 'admin' || u.role === 'super_admin' || u.role === 'staff'
  );

  const filteredPatrons = patrons.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q)
    );
  });

  const handleClockIn = (e) => {
    e.preventDefault();
    const rec = logStaffAttendance({
      staffId: `STF-${Date.now().toString().slice(-4)}`,
      staffName: attendanceForm.staffName,
      position: attendanceForm.position,
      status: attendanceForm.status,
      clockIn: attendanceForm.clockIn,
      clockOut: attendanceForm.clockOut,
      notes: attendanceForm.notes,
    });
    if (rec) {
      setAttendanceRecords(getStaffAttendanceLogs());
      toast.success(`Attendance logged for ${attendanceForm.staffName}: ${attendanceForm.status}! 🌸`);
      setShowAttendanceModal(false);
    }
  };

  const handleExportCustomersExcel = () => {
    try {
      const rows = patrons.map((c, idx) => ({
        '#': idx + 1,
        'Customer Name': c.name || 'Valued Patron',
        'Email Address': c.email || 'N/A',
        'Phone': c.phone || 'N/A',
        'Registered Date': c.createdAt ? c.createdAt.split('T')[0] : '2026-10-30',
        'Total Logins': c.loginHistory?.length || 1,
        'Role': 'Patron',
      }));
      exportArrayToExcel(rows, 'Dhanvikk_Registered_Patrons_Directory');
      toast.success('Exported customer directory to Excel! 🌸');
    } catch {
      toast.error('Failed to export customers.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Dual Stream Switcher */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase tracking-wider">
              Dual Identity Stream
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              MongoDB & Telemetry Engine
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-['Poppins'] text-slate-900 mt-1">
            {activeStream === 'customers' ? 'Patron Clientele & Customer Telemetry' : 'Staff Roster & Operations Console'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeStream === 'customers'
              ? 'Maintain customer accounts, wishlist additions, cart updates, and dwell time browsing logs.'
              : 'Maintain staff accounts, assigned positions (Manager, Florist, Dispatch), daily attendance, and audit logs.'}
          </p>
        </div>

        {/* Stream Toggle Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveStream('customers');
              setSelectedUser(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStream === 'customers'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patrons ({patrons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveStream('staff');
              setSelectedUser(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStream === 'staff'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Staff & Admin ({staffAccounts.length || 1})</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* STREAM 1: CUSTOMERS STREAM (WISHLIST, CART, DWELL TIME LOGS) */}
      {/* ============================================================= */}
      {activeStream === 'customers' && (
        <div className="space-y-6">
          {/* 4 Customer KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Registered Patrons</span>
                <Users className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{patrons.length}</p>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Active Patron Accounts</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Wishlist Actions</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-rose-600 mt-1">
                {customerLogs.filter((l) => l.type?.includes('WISHLIST')).length}
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5">Customer saves to wishlist</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Cart Additions</span>
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {customerLogs.filter((l) => l.type === 'ADD_TO_CART').length}
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5">Bouquets moved to checkout</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Tracked Products Dwell</span>
                <Clock className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-sky-600 mt-1">{dwellProducts.length}</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">Bouquets with active view time</span>
            </div>
          </div>

          {/* Dwell Time & Most Time Spent Products Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Poppins'] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-500" />
                  <span>Customer Most Time Spent Products (Dwell Telemetry Logs)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time analytics of botanical bouquets and plants where patrons spend the most browsing time.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Sorted by Total Engagement Seconds
              </span>
            </div>

            {dwellProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-rose-400" />
                <p>No customer browsing time recorded yet today.</p>
                <p className="text-[10px] mt-0.5">As patrons explore arrangements on the website and app, their dwell logs will populate here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {dwellProducts.slice(0, 8).map((dp, idx) => (
                  <div
                    key={dp.productId || idx}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-rose-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center font-mono">
                          #{idx + 1}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200">
                          SKU: {dp.sku || '2610300001'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs mt-2 line-clamp-1">{dp.productName}</h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Dwell Time</span>
                        <span className="font-mono font-bold text-slate-900">
                          {Math.floor(dp.totalSeconds / 60)}m {dp.totalSeconds % 60}s
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Views</span>
                        <span className="font-mono font-bold text-emerald-600">{dp.viewCount} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patrons Table + Real-Time Telemetry Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Patrons Directory Table */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search patrons by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportCustomersExcel}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Patrons</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Patron Name</th>
                      <th className="py-3 px-4 font-semibold">Contact Email</th>
                      <th className="py-3 px-4 font-semibold">Logins</th>
                      <th className="py-3 px-4 text-right font-semibold">Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatrons.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-10 text-center text-slate-400 text-xs">
                          No registered customer patrons found.
                        </td>
                      </tr>
                    ) : (
                      filteredPatrons.map((p) => (
                        <tr
                          key={p._id || p.id}
                          className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                            selectedUser?._id === p._id ? 'bg-rose-50/40' : ''
                          }`}
                          onClick={() => setSelectedUser(p)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xs">
                                {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                              </div>
                              <span className="font-bold text-slate-900 block truncate">{p.name || 'Patron'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{p.email}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {p.loginHistory?.length || 1} logins
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(p);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Real-time Customer Activity Stream Panel */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Poppins']">
                    {selectedUser ? `${selectedUser.name}'s History` : 'Customer Activity Stream'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Live feed of logins, cart additions, & wishlists</p>
                </div>
                {selectedUser && (
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    View All Activity
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {customerLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-30 text-rose-400" />
                    <p>No customer activities logged yet.</p>
                  </div>
                ) : (
                  customerLogs
                    .filter((log) => !selectedUser || log.email === selectedUser.email)
                    .slice(0, 25)
                    .map((log) => {
                      const isCart = log.type === 'ADD_TO_CART';
                      const isWish = log.type?.includes('WISHLIST');
                      const isView = log.type === 'VIEW_PRODUCT';

                      return (
                        <div
                          key={log.id}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1 hover:border-slate-200 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isCart
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isWish
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isView
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isCart && <ShoppingCart className="w-3 h-3" />}
                              {isWish && <Heart className="w-3 h-3" />}
                              {isView && <Eye className="w-3 h-3" />}
                              <span>{log.type?.replace(/_/g, ' ')}</span>
                            </span>

                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="text-slate-800">
                            <span className="font-semibold">{log.name || log.email}</span>
                            {log.productName && (
                              <span className="text-slate-600 block text-[11px] mt-0.5 font-medium">
                                Arrangement: <strong>{log.productName}</strong>
                                {log.sku && <span className="font-mono text-rose-600 ml-1.5">[SKU: {log.sku}]</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* STREAM 2: STAFF STREAM (ROSTER, POSITIONS, ATTENDANCE, AUDIT) */}
      {/* ============================================================= */}
      {activeStream === 'staff' && (
        <div className="space-y-6">
          {/* Top Staff Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Active Staff Accounts: <strong>{staffAccounts.length || 1}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAttendanceModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>Mark Staff Attendance</span>
              </button>
            </div>
          </div>

          {/* 3 Staff KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Super Administrator</span>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">{superAdminEmail}</p>
              <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Root Console Authority</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Today's Attendance Recorded</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {attendanceRecords.filter((a) => a.date === new Date().toISOString().split('T')[0]).length || 1}
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5">Shifts active on console</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Staff Audit Modifications</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{staffAudit.length}</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">Catalog, stock & settings updates</span>
            </div>
          </div>

          {/* Staff Roster & Assigned Position Choices */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Poppins']">
                  Staff Members & Role Designations
                </h3>
                <p className="text-xs text-slate-500">
                  Configured positions: Store Manager, Master Florist, Inventory Lead, Dispatch Coordinator
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-5 font-semibold">Staff Identity</th>
                    <th className="py-3.5 px-4 font-semibold">Designated Position Choice</th>
                    <th className="py-3.5 px-4 font-semibold">Access Level</th>
                    <th className="py-3.5 px-4 font-semibold">Today's Attendance</th>
                    <th className="py-3.5 px-5 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-sm relative">
                          D
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-white flex items-center justify-center">
                            <Crown className="w-2.5 h-2.5 fill-current" />
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">Divagar M</span>
                          <span className="text-[11px] text-slate-500 font-mono">{superAdminEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-900 block">
                        Super Administrator & Founder
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Global floriculture operations, exports & inventory
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                        SUPER ADMIN
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Present (Console Active)</span>
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                  </tr>

                  {/* Operational position options */}
                  {STAFF_POSITIONS.map((pos) => (
                    <tr key={pos.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                            {pos.label.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block text-xs">{pos.label.split('(')[0]}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Dhanvikk Staff Atelier</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {pos.label}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {pos.id.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        Available for Attendance
                      </td>

                      <td className="py-3 px-5 text-right">
                        <span className="text-[11px] text-slate-500 font-medium">Ready</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff Modification Audit Logs */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Poppins'] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-500" />
                  <span>Staff Administrative Modification Audit Trail</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Track catalog updates, price modifications, inward purchases, and settings updates.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {staffAudit.length} Historical Logs
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {staffAudit.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-500" />
                  <p>No modification audit entries recorded yet.</p>
                </div>
              ) : (
                staffAudit.slice(0, 30).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200/80 text-slate-800 uppercase font-mono">
                          {log.action}
                        </span>
                        <span className="font-bold text-slate-900">{log.details}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Logged by: <strong>{log.staffName || log.staffEmail}</strong>
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Mark Staff Daily Attendance */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Staff Daily Attendance</h3>
                  <p className="text-xs text-slate-500">Record daily clock-in & on-duty operational shift</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttendanceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleClockIn} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Staff Member Name *</label>
                <input
                  type="text"
                  required
                  value={attendanceForm.staffName}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, staffName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Staff Position Choice *</label>
                <select
                  value={attendanceForm.position}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, position: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400 font-medium"
                >
                  <option value="Super Admin">Super Administrator & Founder</option>
                  {STAFF_POSITIONS.map((pos) => (
                    <option key={pos.id} value={pos.label}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Shift Status *</label>
                  <select
                    value={attendanceForm.status}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400 font-medium"
                  >
                    <option value="Present">Present (On-Duty)</option>
                    <option value="Late">Late Arrival</option>
                    <option value="Half-Day">Half Day</option>
                    <option value="On-Leave">On Approved Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Clock In Time</label>
                  <input
                    type="text"
                    value={attendanceForm.clockIn}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, clockIn: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 font-mono bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operational Shift Notes</label>
                <textarea
                  rows={2}
                  value={attendanceForm.notes}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Confirm Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

