import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, ShieldCheck, MessageSquare, Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    productId: 'flw-001',
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
    productId: 'flw-002',
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
    productId: 'flw-003',
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
    productId: 'flw-004',
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

export default function ReviewsList({ products = [] }) {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('dhanvikk_admin_master_reviews');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_REVIEWS;
  });

  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    productId: '',
    reviewerName: '',
    reviewerEmail: '',
    rating: 5,
    comment: '',
    verifiedBuyer: true,
  });

  // Pull any dynamic reviews stored across individual products in localStorage
  useEffect(() => {
    try {
      const gathered = [...reviews];
      let hasNew = false;

      // Scan localStorage for product-specific reviews
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dhanvikk_reviews_')) {
          const prodId = key.replace('dhanvikk_reviews_', '');
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              list.forEach((r) => {
                if (!gathered.some((ex) => ex.id === r.id)) {
                  const matchingProd = products.find((p) => p.id === prodId || p._id === prodId);
                  gathered.unshift({
                    id: r.id || `rev-${Date.now()}`,
                    productId: prodId,
                    productName: matchingProd?.name || 'Handcrafted Luxury Bouquet',
                    productImage: matchingProd?.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=160&q=80',
                    reviewerName: r.author || r.userName || 'Verified Patron',
                    reviewerEmail: r.userEmail || '',
                    rating: r.rating || 5,
                    comment: r.comment || '',
                    date: r.date || 'Recent',
                    status: 'Approved',
                    verifiedBuyer: r.verified !== false,
                  });
                  hasNew = true;
                }
              });
            }
          }
        }
      }

      if (hasNew) {
        setReviews(gathered);
        localStorage.setItem('dhanvikk_admin_master_reviews', JSON.stringify(gathered));
      }
    } catch (err) {
      console.warn('Reviews aggregation note:', err);
    }
  }, [products]);

  const persistReviews = (updated) => {
    setReviews(updated);
    try {
      localStorage.setItem('dhanvikk_admin_master_reviews', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('dhanvikk_reviews_updated', { detail: updated }));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesRating = filterRating === 'all' || r.rating === Number(filterRating);
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.productName?.toLowerCase().includes(q) ||
      r.reviewerName?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q);
    return matchesRating && matchesStatus && matchesQuery;
  });

  const handleToggleStatus = (id) => {
    const updated = reviews.map((r) => {
      if (r.id === id) {
        const nextStatus = r.status === 'Approved' ? 'Hidden' : 'Approved';
        return { ...r, status: nextStatus };
      }
      return r;
    });
    persistReviews(updated);
    toast.success('Review visibility status updated live!');
  };

  const handleDelete = (id) => {
    if (confirm('Permanently remove this review across all platforms?')) {
      const updated = reviews.filter((r) => r.id !== id);
      persistReviews(updated);
      toast.success('Review removed');
    }
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewForm.reviewerName.trim() || !newReviewForm.comment.trim()) {
      toast.error('Please fill in reviewer name and comment');
      return;
    }

    const selectedProd = products.find((p) => p.id === newReviewForm.productId || p._id === newReviewForm.productId) || products[0];

    const newRev = {
      id: `rev-${Date.now()}`,
      productId: selectedProd ? (selectedProd.id || selectedProd._id) : 'flw-001',
      productName: selectedProd?.name || 'Signature Fresh Bouquet',
      productImage: selectedProd?.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=160&q=80',
      reviewerName: newReviewForm.reviewerName.trim(),
      reviewerEmail: newReviewForm.reviewerEmail.trim(),
      rating: Number(newReviewForm.rating) || 5,
      comment: newReviewForm.comment.trim(),
      date: 'Just now',
      status: 'Approved',
      verifiedBuyer: newReviewForm.verifiedBuyer,
    };

    const updated = [newRev, ...reviews];
    persistReviews(updated);

    // Also mirror to product-specific storage
    if (newRev.productId) {
      try {
        const existingRaw = localStorage.getItem(`dhanvikk_reviews_${newRev.productId}`);
        const existingList = existingRaw ? JSON.parse(existingRaw) : [];
        localStorage.setItem(
          `dhanvikk_reviews_${newRev.productId}`,
          JSON.stringify([
            {
              id: newRev.id,
              author: newRev.reviewerName,
              rating: newRev.rating,
              comment: newRev.comment,
              date: 'Just now',
              verified: newRev.verifiedBuyer,
            },
            ...existingList,
          ])
        );
      } catch {}
    }

    toast.success(`Published verified review for ${newRev.productName}!`);
    setShowAddModal(false);
    setNewReviewForm({
      productId: '',
      reviewerName: '',
      reviewerEmail: '',
      rating: 5,
      comment: '',
      verifiedBuyer: true,
    });
  };

  const avgRating = (
    reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Star className="w-5 h-5 text-[#E11D48] fill-[#E11D48]" />
            Customer Reviews & Ratings Control
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Unified reviews ledger: live updates sync across Web storefront, Mobile app, and Admin panel.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-700">
            <Star className="w-4 h-4 fill-rose-600 text-rose-600" />
            <span>{avgRating} Avg Rating ({reviews.length} Total)</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Verified Review</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product, customer, comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
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

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-100">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No reviews match your filters</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting the rating or search query.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
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
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-2xs"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A] leading-tight">
                        {rev.productName}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
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
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Customer" />
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
          ))
        )}
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 text-xs text-[#0F172A]">
            <h3 className="text-base font-bold text-[#0F172A]">Publish Customer Review</h3>

            <form onSubmit={handleAddReview} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Product *</label>
                <select
                  value={newReviewForm.productId}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, productId: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                >
                  <option value="">Choose arrangement / bouquet...</option>
                  {products.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima Al-Zahra"
                    value={newReviewForm.reviewerName}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, reviewerName: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={newReviewForm.rating}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                  >
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                    <option value="2">★★☆☆☆ (2 Stars)</option>
                    <option value="1">★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Review Experience & Feedback *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the floral presentation, fragrance, cold-chain delivery..."
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newReviewForm.verifiedBuyer}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, verifiedBuyer: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="text-slate-700 font-medium">Mark as Verified Buyer</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold cursor-pointer shadow-xs"
                  >
                    Publish
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
