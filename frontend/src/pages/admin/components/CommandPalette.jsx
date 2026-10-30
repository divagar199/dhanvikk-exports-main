import React, { useState, useEffect } from 'react';
import {
  Search,
  Layers,
  ArrowDownUp,
  Package,
  TrendingUp,
  Users,
  Settings,
  Plus,
  FileSpreadsheet,
  X,
  CreditCard,
  MessageSquare,
  Globe,
  FileText,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onQuickAction,
  products = [],
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const NAVIGATION_ITEMS = [
    { id: 'dashboard', label: 'Executive Overview & KPIs', icon: TrendingUp, section: 'Navigation' },
    { id: 'enquiries', label: 'Export Enquiries & RFQ Leads', icon: MessageSquare, section: 'Navigation' },
    { id: 'products', label: 'Export Products & Live Catalog', icon: Layers, section: 'Navigation' },
    { id: 'inward_outward', label: 'Inward & Outward Logistics Flow', icon: ArrowDownUp, section: 'Navigation' },
    { id: 'orders', label: 'Orders & International Shipments', icon: Package, section: 'Navigation' },
    { id: 'customers', label: 'International Importers Directory', icon: Globe, section: 'Navigation' },
    { id: 'documents', label: 'Invoices & Packing Lists Studio', icon: FileText, section: 'Navigation' },
    { id: 'payments', label: 'Financial Payments & Gateways Ledger', icon: CreditCard, section: 'Navigation' },
    { id: 'staff', label: 'Super Admin & Staff Access Control', icon: Shield, section: 'Navigation' },
    { id: 'users', label: 'Registered Patrons Directory', icon: Users, section: 'Navigation' },
    { id: 'settings', label: 'Company Export Profile & Bank Details', icon: Settings, section: 'Navigation' },
  ];

  const QUICK_ACTIONS = [
    { id: 'add_product', label: 'Create New Export Bouquet / SKU', icon: Plus, action: 'add_product' },
    { id: 'log_inward', label: 'Log Farm Cold-Chain Delivery Batch', icon: ArrowDownUp, action: 'log_inward' },
    { id: 'record_outward', label: 'Record International Order Dispatch', icon: Package, action: 'record_outward' },
    { id: 'export_csv', label: 'Export Current Catalog CSV', icon: FileSpreadsheet, action: 'export_csv' },
  ];

  const q = query.toLowerCase().trim();

  const filteredNav = NAVIGATION_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
  );

  const filteredActions = QUICK_ACTIONS.filter((act) =>
    act.label.toLowerCase().includes(q)
  );

  const matchingProducts = products
    .filter((p) => (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q))
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150 font-['Poppins']">
      <div
        className="fixed inset-0"
        onClick={() => onClose(false)}
      />
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a module, action, or flower name... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500 border border-slate-200">
              ESC
            </span>
            <button
              onClick={() => onClose(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3 text-xs">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Operations
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        onQuickAction(act.action);
                        onClose(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-medium transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-rose-100 text-slate-600 group-hover:text-rose-600">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span>{act.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Modules */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Admin Modules
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Jump</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Products Search Matches */}
          {matchingProducts.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Matching Catalog SKUs
              </div>
              <div className="space-y-0.5 mt-1">
                {matchingProducts.map((prod) => (
                  <button
                    key={prod.id || prod._id}
                    onClick={() => {
                      onSelectTab('products');
                      onClose(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={prod.image || (Array.isArray(prod.images) ? prod.images[0] : prod.images)}
                        alt={prod.name}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <span className="truncate">{prod.name}</span>
                    </div>
                    <span className="font-mono text-emerald-700 font-semibold shrink-0">
                      ₹{prod.price?.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && matchingProducts.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No matching commands or products found</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Press <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600">K</kbd> anywhere</span>
          <span>Dhanvikk Global Export Hub</span>
        </div>
      </div>
    </div>
  );
}
