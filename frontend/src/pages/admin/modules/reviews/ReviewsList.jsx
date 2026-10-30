import React, { useState } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, ShieldCheck, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    productName: 'Red Roses Hatbox Grande',
    productImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=160&q=80',
    reviewerName: 'Meera Krishnan',
    reviewerEmail: 'meera.k@gmail.com',
    rating: 5,
    comment: 'The Ecuadorian red roses arrived impeccably fresh with velvety petals. The cold-chain delivery is truly five stars!',
    date: '28 Oct 2026',
    status: 'Approved',
    verifiedBuyer: true,
  },
  {
    id: 'rev-2',
    productName: 'White Casablanca Lilies',
    productImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=160&q=80',
    reviewerName: 'Farhan Al-Mansoor',
    reviewerEmail: 'farhan.dxb@gmail.com',
    rating: 5,
    comment: 'Export consignment to Dubai arrived with pristine stems and intense fragrance. Best floriculture export from India.',
    date: '27 Oct 2026',
    status: 'Approved',
    verifiedBuyer: true,
  },
  {
    id: 'rev-3',
    productName: 'Phalaenopsis Orchid Arrangement',
    productImage: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=160&q=80',
    reviewerName: 'Dr. Suresh Varma',
    reviewerEmail: 'suresh.varma@apollo.org',
    rating: 4,
    comment: 'Ceramic pot and orchid blooms look stunning in our hospital lobby. Beautiful presentation.',
    date: '26 Oct 2026',
    status: 'Approved',
    verifiedBuyer: true,
  },
  {
    id: 'rev-4',
    productName: 'Pink Rose Bouquet',
    productImage: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=160&q=80',
    reviewerName: 'Ananya Ramesh',
    reviewerEmail: 'ananya.r@outlook.com',
    rating: 5,
    comment: 'The greeting card and packaging were breathtaking. Highly recommend Dhanvikk Blooms for anniversary gifting!',
    date: '25 Oct 2026',
    status: 'Approved',
    verifiedBuyer: true,
  },
];

export default function ReviewsList() {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [filterRating, setFilterRating] = useState('all');

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === Number(filterRating);
  });

  const handleToggleStatus = (id) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'Approved' ? 'Hidden' : 'Approved' }
          : r
      )
    );
    toast.success('Review visibility updated');
  };

  const handleDelete = (id) => {
    if (confirm('Permanently remove this customer review?')) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review removed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Star className="w-5 h-5 text-[#E11D48] fill-[#E11D48]" />
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Moderate and showcase verified customer feedback across web and mobile apps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">★★★★★ (5 Stars)</option>
            <option value="4">★★★★☆ (4 Stars)</option>
            <option value="3">★★★☆☆ (3 Stars)</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.productImage}
                    alt={rev.productName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">
                      {rev.productName}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] font-bold text-slate-700 ml-1">
                        {rev.rating}.0
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rev.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {rev.status}
                </span>
              </div>

              <p className="text-xs text-[#334155] mt-3 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100/80">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <div>
                <div className="flex items-center gap-1 font-bold text-[#0F172A]">
                  <span>{rev.reviewerName}</span>
                  {rev.verifiedBuyer && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Buyer" />
                  )}
                </div>
                <span className="text-slate-400">{rev.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(rev.id)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-[#E11D48] hover:border-rose-200 font-semibold transition-colors cursor-pointer"
                >
                  {rev.status === 'Approved' ? 'Hide' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(rev.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
