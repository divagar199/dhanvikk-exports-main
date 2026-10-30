import React, { useState } from 'react';
import { Sparkles, Plus, Edit3, Trash2, Eye, Tag, CheckCircle2, Gift } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_OCCASIONS = [
  {
    id: 'occ-1',
    name: 'Birthday Celebrations',
    slug: 'birthday',
    description: 'Bright and cheerful bouquets, vibrant roses and luxury gift boxes for unforgettable birthdays.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    itemCount: 48,
    active: true,
    tag: 'POPULAR',
  },
  {
    id: 'occ-2',
    name: 'Anniversary & Romance',
    slug: 'anniversary',
    description: 'Deep crimson Ecuadorian roses, eternity roses and romantic floral hatboxes.',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80',
    itemCount: 64,
    active: true,
    tag: 'SIGNATURE',
  },
  {
    id: 'occ-3',
    name: 'Wedding & Grand Reception',
    slug: 'wedding',
    description: 'Bespoke bridal bouquets, white lilies, cascade orchids and luxury venue arrangements.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
    itemCount: 32,
    active: true,
    tag: 'LUXURY',
  },
  {
    id: 'occ-4',
    name: 'Corporate & Executive Gifting',
    slug: 'corporate',
    description: 'Potted greens, architectural orchids and sophisticated office floral displays.',
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=600&q=80',
    itemCount: 26,
    active: true,
    tag: 'CORPORATE',
  },
  {
    id: 'occ-5',
    name: 'Festive & Cultural Specials',
    slug: 'festive',
    description: 'Traditional blooms, festive marigolds, and colorful ceremonial arrangements.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
    itemCount: 54,
    active: true,
    tag: 'SEASONAL',
  },
  {
    id: 'occ-6',
    name: 'Congratulations & Cheer',
    slug: 'congratulations',
    description: 'Fresh colorful garden baskets, tulips and carnations celebrating new milestones.',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80',
    itemCount: 38,
    active: true,
    tag: 'TRENDING',
  },
];

export default function OccasionsList() {
  const [occasions, setOccasions] = useState(DEFAULT_OCCASIONS);
  const [showModal, setShowModal] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    tag: 'POPULAR',
    active: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingOccasion) {
      setOccasions((prev) =>
        prev.map((o) => (o.id === editingOccasion.id ? { ...o, ...form } : o))
      );
      toast.success(`Occasion "${form.name}" updated!`);
    } else {
      const newOcc = {
        id: `occ-${Date.now()}`,
        itemCount: 0,
        ...form,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      };
      setOccasions((prev) => [newOcc, ...prev]);
      toast.success(`New occasion "${form.name}" published!`);
    }
    setShowModal(false);
    setEditingOccasion(null);
  };

  const handleDelete = (id, name) => {
    if (confirm(`Remove occasion "${name}"?`)) {
      setOccasions((prev) => prev.filter((o) => o.id !== id));
      toast.success(`Occasion removed`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E11D48]" />
            Occasions & Seasonal Collections
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Curate and manage flower collections for festive, wedding, and celebratory moments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingOccasion(null);
            setForm({
              name: '',
              slug: '',
              description: '',
              image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
              tag: 'POPULAR',
              active: true,
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Occasion</span>
        </button>
      </div>

      {/* Occasions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {occasions.map((occ) => (
          <div
            key={occ.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={occ.image}
                  alt={occ.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E11D48] text-white shadow-xs">
                    {occ.tag}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${occ.active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                    {occ.active ? 'Active' : 'Draft'}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg">
                  {occ.itemCount} Arrangements
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#E11D48] transition-colors">
                  {occ.name}
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-2">
                  {occ.description}
                </p>
              </div>
            </div>

            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">/{occ.slug}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingOccasion(occ);
                    setForm({ ...occ });
                    setShowModal(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#E11D48] hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(occ.id, occ.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">
              {editingOccasion ? 'Edit Occasion' : 'Add New Occasion'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Occasion Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Valentine Day & Romance"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Slug URL</label>
                <input
                  type="text"
                  placeholder="e.g. valentines-day"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Banner Image URL</label>
                <input
                  type="url"
                  required
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="text-slate-700 font-medium">Visible on Storefront</span>
                </label>

                <div className="flex items-center gap-2">
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
                    Save Occasion
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

