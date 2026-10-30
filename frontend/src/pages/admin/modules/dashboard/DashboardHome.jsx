import React from 'react';
import {
  TrendingUp,
  MessageSquare,
  Package,
  Globe,
  Layers,
  ArrowDownUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Plane,
  Shield,
  Plus,
  FileSpreadsheet,
  FileText,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardHome({
  stats,
  products = [],
  enquiries = [],
  shipments = [],
  auditLogs = [],
  onSelectTab,
  onQuickAction,
}) {
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;
  const inTransitCount = shipments.filter((s) => s.shippingStatus === 'In Transit').length;
  const lowStockCount = products.filter((p) => (Number(p.stock) || 0) <= 5).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Executive Welcome & Live Beacon */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
              Executive Terminal
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Global Cloud In Sync
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            Dhanvikk Global Floriculture & Export Operations
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Live international trade overview: managing cold-chain air freight, overseas buyer RFQs, and greenhouse stocks across Dubai, Riyadh & European markets.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => onQuickAction('add_product')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('enquiries')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Review RFQs ({newEnquiriesCount})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Active Catalog SKUs */}
        <div
          onClick={() => onSelectTab('products')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Export Catalog SKUs</span>
            <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-rose-50 text-slate-600 group-hover:text-rose-600 transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
            {products.length || 219}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Live on Web & Mobile</span>
            <span className="text-emerald-600 font-semibold">100% In Sync</span>
          </div>
        </div>

        {/* KPI 2: International Enquiries / RFQs */}
        <div
          onClick={() => onSelectTab('enquiries')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-blue-700">
            <span className="font-medium">Active Export RFQs</span>
            <div className="p-1.5 rounded-lg bg-blue-50 group-hover:bg-blue-100 text-blue-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
            {enquiries.length}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="text-blue-700 font-semibold">{newEnquiriesCount} New Leads</span>
            <span className="text-slate-400">GCC & EU</span>
          </div>
        </div>

        {/* KPI 3: Shipments in Transit */}
        <div
          onClick={() => onSelectTab('orders')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-indigo-700">
            <span className="font-medium">Air Freight in Transit</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 transition-colors">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
            {inTransitCount} Consignments
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="text-indigo-600 font-semibold">Cold-Chain (3.6°C)</span>
            <span className="text-slate-400">Emirates Cargo</span>
          </div>
        </div>

        {/* KPI 4: Low Stock Warnings */}
        <div
          onClick={() => onSelectTab('products')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-amber-700">
            <span className="font-medium">Low Stock Alerts</span>
            <div className="p-1.5 rounded-lg bg-amber-50 group-hover:bg-amber-100 text-amber-600 transition-colors">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-amber-900 mt-2">
            {lowStockCount} SKUs
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="text-amber-700 font-semibold">Requires Reorder</span>
            <span className="text-slate-400">≤ 5 units</span>
          </div>
        </div>
      </div>

      {/* Two-Column Middle Grid: Recent RFQs + Air Cargo Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Widget 1: Urgent Buyer RFQs */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900">
                  Priority Export RFQs & Buyer Leads
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('enquiries')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>View All ({enquiries.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {enquiries.slice(0, 3).map((enq) => (
                <div key={enq.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {enq.companyName}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {enq.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Destination: {enq.country} ({enq.destinationPort})
                    </p>
                    <p className="text-xs text-slate-700 font-medium truncate mt-1">
                      {enq.productInterest} • <strong>{enq.targetVolume}</strong>
                    </p>
                  </div>
                  {enq.quoteAmountUSD && (
                    <span className="font-mono font-bold text-xs text-emerald-700 shrink-0">
                      ${enq.quoteAmountUSD.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('enquiries')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <span>Open Enquiries Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Widget 2: Live Export Shipments & Cold-Chain Telemetry */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Active International Cargo Telemetry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('orders')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>View Logistics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {shipments.slice(0, 2).map((shp) => (
                <div key={shp.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-400">{shp.id}</span>
                      <h4 className="font-bold text-xs text-slate-900">{shp.buyerCompany}</h4>
                      <p className="text-[11px] text-slate-500">AWB: {shp.awbOrBlNumber} • {shp.carrierName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {shp.shippingStatus}
                    </span>
                  </div>

                  {shp.temperatureTelemetry && (
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Reefer Temp: {shp.temperatureTelemetry.currentTemp}
                      </span>
                      <span className="text-slate-500 font-mono">
                        Humidity: {shp.temperatureTelemetry.humidity}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('inward_outward')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <span>Open Inward & Outward Logistics Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Security & Activity Audit Log Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-900">
              Live System Activity & Audit Trail
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('audit')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>Full Audit Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(auditLogs.slice(0, 3)).map((log, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700 font-mono">
                  {log.action}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="font-medium text-slate-800 line-clamp-1 truncate" title={log.details}>
                {log.details}
              </p>
              <p className="text-[10px] text-slate-400">By {log.actorName}</p>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <div className="col-span-full text-center py-4 text-xs text-slate-400">
              No recent administrative actions recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

