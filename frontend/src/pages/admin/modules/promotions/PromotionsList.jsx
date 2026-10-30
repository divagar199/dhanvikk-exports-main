import React, { useState } from 'react';
import { Tag, Plus, Copy, Trash2, CheckCircle2, Clock, Percent, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_COUPONS = [
  {
    id: 'c-1',
    code: 'DHANVIKK10',
    description: '10% instant discount on all luxury hand bouquets',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 999,
    maxDiscount: 500,
    validUntil: '2026-12-31',
    usageCount: 142,
    active: true,
  },
  {
    id: 'c-2',
    code: 'BLOSSOM20',
    description: '20% off on exotic orchids and imported cut flowers',
    discountType: 'percentage',
    discountValue: 20,
    minOrder: 1999,
    maxDiscount: 1000,
    validUntil: '2026-11-30',
    usageCount: 89,
    active: true,
  },
  {
    id: 'c-3',
    code: 'WELCOME100',
    description: 'Flat ₹100 welcome gift for first-time orders',
    discountType: 'flat',
    discountValue: 100,
    minOrder: 799,
    maxDiscount: 100,
    validUntil: '2027-01-01',
    usageCount: 312,
    active: true,
  },
  {
    id: 'c-4',
    code: 'FESTIVE15',
    description: 'Festive season discount for wedding & grand celebration orders',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 2499,
    maxDiscount: 1500,
    validUntil: '2026-12-15',
    usageCount: 64,
    active: true,
  },
];

export default function PromotionsList() {
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 999,
    maxDiscount: 500,
    validUntil: '2026-12-31',
    active: true,
  });

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
  };

  const handleToggle = (id) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    toast.success('Coupon status updated');
  };

  const handleDelete = (id, code) => {
    if (confirm(`Remove coupon code "${code}"?`)) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success('Coupon deleted');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.code.trim()) return;

    const newCoupon = {
      id: `c-${Date.now()}`,
      usageCount: 0,
      ...form,
      code: form.code.toUpperCase().replace(/\s+/g, ''),
    };

    setCoupons((prev) => [newCoupon, ...prev]);
    toast.success(`Coupon "${newCoupon.code}" created successfully!`);
    setShowModal(false);
    setForm({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrder: 999,
      maxDiscount: 500,
      validUntil: '2026-12-31',
      active: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#E11D48]" />
            Offers & Promo Campaigns
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Manage promotional coupons, seasonal vouchers, and customer loyalty rewards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
          >
            {/* Soft background icon */}
            <div className="absolute -right-3 -bottom-3 text-rose-50/50 pointer-events-none">
              <Percent className="w-28 h-28" />
            </div>

            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold border border-rose-100">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-[#0F172A] tracking-wider">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] font-semibold text-rose-600 block">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} FLAT OFF`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(coupon.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                    coupon.active
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {coupon.active ? '● Active' : '○ Disabled'}
                </button>
              </div>

              <p className="text-xs text-[#64748B] mt-3 font-medium">
                {coupon.description}
              </p>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Min. Order</span>
                  <span className="font-bold text-[#0F172A] font-mono">₹{coupon.minOrder}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Valid Until</span>
                  <span className="font-bold text-[#0F172A]">{coupon.validUntil}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Redeemed</span>
                  <span className="font-bold text-[#0F172A] font-mono">{coupon.usageCount} times</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleDelete(coupon.id, coupon.code)}
                className="text-slate-400 hover:text-rose-600 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Coupon */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">Create New Coupon Code</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ROSEFEST25"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 uppercase font-mono font-bold focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Offer Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 25% off during Rose Festival"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full h-9 px-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Min. Order Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Valid Until Date</label>
                  <input
                    type="date"
                    required
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold cursor-pointer shadow-xs"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

