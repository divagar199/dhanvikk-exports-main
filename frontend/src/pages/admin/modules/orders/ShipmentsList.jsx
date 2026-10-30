import React, { useState } from 'react';
import {
  Package,
  Plane,
  Anchor,
  Thermometer,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShipmentsList({ shipments = [], onUpdateStatus, onLogAudit }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedShipment, setSelectedShipment] = useState(null);

  const STATUS_TABS = ['All', 'Packed', 'Customs Cleared', 'In Transit', 'Delivered'];

  const filteredShipments = shipments.filter((shp) => {
    const matchesStatus = statusFilter === 'All' ? true : shp.shippingStatus === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q
      ? true
      : (shp.id || '').toLowerCase().includes(q) ||
        (shp.buyerCompany || '').toLowerCase().includes(q) ||
        (shp.destinationPort || '').toLowerCase().includes(q) ||
        (shp.awbOrBlNumber || '').toLowerCase().includes(q) ||
        (shp.carrierName || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async (shipmentId, newStatus) => {
    await onUpdateStatus(shipmentId, newStatus);
    if (selectedShipment && selectedShipment.id === shipmentId) {
      setSelectedShipment((prev) => ({ ...prev, shippingStatus: newStatus }));
    }
    toast.success(`Shipment ${shipmentId} status updated to ${newStatus}`);
    onLogAudit?.('STATUS_CHANGE', 'ORDERS', shipmentId, `Changed shipment status to ${newStatus}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by AWB, shipment #, buyer, port..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 text-xs shadow-xs overflow-x-auto max-w-full">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium shrink-0 ${
                  statusFilter === tab
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-500">
          Showing <strong>{filteredShipments.length}</strong> active export consignments
        </span>
      </div>

      {/* Shipments Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredShipments.map((shp) => {
          const isDelivered = shp.shippingStatus === 'Delivered';
          const isInTransit = shp.shippingStatus === 'In Transit';

          return (
            <div
              key={shp.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-400">{shp.id}</span>
                    <span className="px-2 py-0.2 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200">
                      {shp.incoterm || 'CIF'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isDelivered
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isInTransit
                          ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {shp.shippingStatus.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    {shp.buyerCompany}
                  </h3>
                  <p className="text-xs text-slate-500">Destination: {shp.destinationPort}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Invoice</span>
                  <span className="font-mono text-base font-bold text-emerald-700">
                    ${shp.totalAmountUSD?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Carrier & AWB Details */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Air Waybill / BL #:</span>
                  <span className="font-mono font-bold text-slate-800">{shp.awbOrBlNumber || 'Pending AWB'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Flight / Line:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Plane className="w-3 h-3 text-slate-500" />
                    {shp.carrierName}
                  </span>
                </div>
              </div>

              {/* Cold-Chain Telemetry Pill */}
              {shp.temperatureTelemetry && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-semibold uppercase block">
                        Reefer Cargo Telemetry
                      </span>
                      <span className="font-mono font-bold text-emerald-950">
                        {shp.temperatureTelemetry.currentTemp} (Target {shp.temperatureTelemetry.targetTemp})
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-emerald-800">
                    <div>Humidity: <strong>{shp.temperatureTelemetry.humidity}</strong></div>
                    <span className="text-[10px] text-emerald-600">Active Sensor Ping</span>
                  </div>
                </div>
              )}

              {/* Milestones Stepper */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Customs & Air Freight Progression
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-[10px] text-center">
                  {(shp.milestones || []).map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-1.5 rounded-lg border font-medium ${
                        m.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : m.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                      title={`${m.title} (${m.time})`}
                    >
                      <div className="truncate">{m.title.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <select
                  value={shp.shippingStatus}
                  onChange={(e) => handleStatusUpdate(shp.id, e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-rose-500"
                >
                  <option value="Packed">Packed</option>
                  <option value="Phytosanitary Inspection">Phytosanitary Inspection</option>
                  <option value="Customs Cleared">Customs Cleared</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    toast.info(`Air Waybill ${shp.awbOrBlNumber} tracking link generated.`);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Track Carrier Cargo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
