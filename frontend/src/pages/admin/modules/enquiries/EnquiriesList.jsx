import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Plus,
  ChevronRight,
  X,
  Phone,
  Mail,
  Building,
  Anchor,
  DollarSign,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EnquiriesList({ enquiries = [], onUpdateStatus, onLogAudit }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [quoteInput, setQuoteInput] = useState('');

  const STATUS_TABS = ['All', 'New', 'Contacted', 'Quoted', 'Won', 'Lost'];

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q
      ? true
      : (item.buyerName || '').toLowerCase().includes(q) ||
        (item.companyName || '').toLowerCase().includes(q) ||
        (item.country || '').toLowerCase().includes(q) ||
        (item.destinationPort || '').toLowerCase().includes(q) ||
        (item.productInterest || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (enquiryId, newStatus) => {
    await onUpdateStatus(enquiryId, newStatus, internalNote);
    if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
      setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
    }
    setInternalNote('');
    toast.success(`Enquiry status updated to ${newStatus}`);
    onLogAudit?.('UPDATE', 'ENQUIRIES', enquiryId, `Updated enquiry status to ${newStatus}`);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    toast.success(`Official export quotation / reply sent to ${selectedEnquiry.email}`);
    onLogAudit?.('UPDATE', 'ENQUIRIES', selectedEnquiry.id, `Sent email reply to ${selectedEnquiry.email}`);
    setReplyText('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by buyer, company, country, or port..."
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

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 text-xs shadow-xs overflow-x-auto max-w-full">
            {STATUS_TABS.map((tab) => {
              const count =
                tab === 'All'
                  ? enquiries.length
                  : enquiries.filter((e) => e.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium shrink-0 flex items-center gap-1.5 ${
                    statusFilter === tab
                      ? 'bg-rose-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      statusFilter === tab
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Showing <strong>{filteredEnquiries.length}</strong> inquiries
          </span>
        </div>
      </div>

      {/* Enquiries Grid / List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {filteredEnquiries.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="font-semibold text-slate-700 text-sm">No export inquiries found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Incoming international buyer RFQs from Dubai, Europe, and Asia will automatically synchronize here.
            </p>
          </div>
        ) : (
          filteredEnquiries.map((enq) => {
            const statusColors = {
              New: 'bg-blue-50 text-blue-700 border-blue-200',
              Contacted: 'bg-purple-50 text-purple-700 border-purple-200',
              Quoted: 'bg-amber-50 text-amber-700 border-amber-200',
              Won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              Lost: 'bg-rose-50 text-rose-700 border-rose-200',
            };

            return (
              <div
                key={enq.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-slate-400">
                          {enq.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusColors[enq.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {enq.status.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          <Globe className="w-3 h-3 text-slate-500" />
                          {enq.country}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5">
                        {enq.companyName || enq.buyerName}
                      </h3>
                      <p className="text-xs text-slate-500">Contact: {enq.buyerName}</p>
                    </div>

                    {enq.quoteAmountUSD && (
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Quoted Value</span>
                        <span className="font-mono text-sm sm:text-base font-bold text-emerald-700">
                          ${enq.quoteAmountUSD.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Interest & Target Volume */}
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Interest:</span>
                      <span className="font-semibold text-slate-800">{enq.productInterest}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Volume: <strong>{enq.targetVolume}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200">
                        <Anchor className="w-3 h-3" />
                        Incoterm: {enq.preferredIncoterm || 'CIF'}
                      </span>
                    </div>
                    {enq.destinationPort && (
                      <div className="text-[11px] text-slate-500 truncate">
                        Port of Discharge: <strong>{enq.destinationPort}</strong>
                      </div>
                    )}
                  </div>

                  {/* Message Quote */}
                  <p className="text-xs text-slate-600 line-clamp-2 italic mb-3">
                    "{enq.message}"
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(enq.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEnquiry(enq)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Manage RFQ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail & Quotation Drawer / Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {selectedEnquiry.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {selectedEnquiry.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedEnquiry.companyName || selectedEnquiry.buyerName}
                </h2>
                <p className="text-xs text-slate-500">
                  Import Destination: {selectedEnquiry.country} • {selectedEnquiry.destinationPort}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Buyer Contact Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-slate-400" />
                <span>Contact: <strong>{selectedEnquiry.buyerName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${selectedEnquiry.email}`} className="text-rose-600 hover:underline">
                  {selectedEnquiry.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-mono">{selectedEnquiry.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Anchor className="w-4 h-4 text-slate-400" />
                <span>Preferred Incoterm: <strong>{selectedEnquiry.preferredIncoterm || 'CIF'}</strong></span>
              </div>
            </div>

            {/* Requirements Full Text */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Buyer Requirements</span>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 leading-relaxed">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Status Transition Action Buttons */}
            <div className="space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Update Lead Status</span>
              <div className="flex flex-wrap gap-2">
                {['New', 'Contacted', 'Quoted', 'Won', 'Lost'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(selectedEnquiry.id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedEnquiry.status === st
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Set as {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Send Official Reply / Quote Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Send Official Export Quotation via Email
              </span>
              <textarea
                rows={3}
                required
                placeholder={`Dear ${selectedEnquiry.buyerName},\n\nThank you for your inquiry regarding our export grade roses. We are pleased to provide CIF quotation...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Quotation to Buyer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

