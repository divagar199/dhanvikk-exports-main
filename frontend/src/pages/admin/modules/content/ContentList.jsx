import React, { useState } from 'react';
import { FileText, Plus, Edit3, Trash2, Eye, Sparkles, Image as ImageIcon, Save } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_ARTICLES = [
  {
    id: 'post-1',
    title: 'How Cold-Chain Logistics Preserves Export Stems at 2°C',
    category: 'Export Logistics',
    author: 'Divagar M',
    date: '28 Oct 2026',
    status: 'Published',
    views: '1,240',
    excerpt: 'Detailed insight into pre-cooling chambers, reefer air freight pallets, and temperature sensors during Dubai & Riyadh cargo flights.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'post-2',
    title: 'Top 7 Flower Varieties Trending for Luxury Indian Weddings',
    category: 'Trends',
    author: 'Floriculture Lead',
    date: '24 Oct 2026',
    status: 'Published',
    views: '2,890',
    excerpt: 'From Moroccan blush roses to snow-white Phalaenopsis orchids: why luxury wedding planners prefer farm-fresh stems.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'post-3',
    title: 'Essential Florist Care: Keeping Cut Lilies Fresh for 14 Days',
    category: 'Care Guide',
    author: 'Botanical Curator',
    date: '19 Oct 2026',
    status: 'Published',
    views: '3,410',
    excerpt: 'Stem trimming tips, floral nutrition packets, and hydration tricks for Casablanca and Asiatic lilies.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
  },
];

export default function ContentList() {
  const [articles, setArticles] = useState(DEFAULT_ARTICLES);
  const [activeTab, setActiveTab] = useState('blogs');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Export Logistics',
    excerpt: '',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  });

  const [announcement, setAnnouncement] = useState('Worldwide Express Air Delivery Available | Free Dubai & Middle East Customs Documentation on Bulk RFQs');

  const handleSaveArticle = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingArticle) {
      setArticles((prev) =>
        prev.map((a) => (a.id === editingArticle.id ? { ...a, ...form } : a))
      );
      toast.success('Article updated!');
    } else {
      const newPost = {
        id: `post-${Date.now()}`,
        author: 'Divagar M',
        date: 'Today',
        status: 'Published',
        views: '1',
        ...form,
      };
      setArticles((prev) => [newPost, ...prev]);
      toast.success('New article published!');
    }
    setShowModal(false);
    setEditingArticle(null);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this article?')) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success('Article removed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#E11D48]" />
            Blog, Media & Storefront CMS
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Manage stories, floriculture guides, and storefront banners across web and mobile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingArticle(null);
              setForm({
                title: '',
                category: 'Export Logistics',
                excerpt: '',
                image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
              });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Marquee Banner Configuration */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Top Announcement Marquee Banner (Web & App)
          </span>
          <button
            type="button"
            onClick={() => toast.success('Announcement marquee banner updated live!')}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Live Banner</span>
          </button>
        </div>
        <input
          type="text"
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400 bg-slate-50"
        />
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((art) => (
          <div
            key={art.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="h-44 overflow-hidden relative bg-slate-100">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E11D48] text-white shadow-xs">
                  {art.category}
                </span>
                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                  {art.views} Reads
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#E11D48] transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>
            </div>

            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">{art.date} • {art.author}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingArticle(art);
                    setForm({ ...art });
                    setShowModal(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#E11D48] hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(art.id)}
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
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">
              {editingArticle ? 'Edit Article' : 'Write New Article'}
            </h3>

            <form onSubmit={handleSaveArticle} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Preserving Fresh Cut Blooms for Export"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                >
                  <option value="Export Logistics">Export Logistics</option>
                  <option value="Trends">Trends</option>
                  <option value="Care Guide">Care Guide</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Feature Image URL *</label>
                <input
                  type="url"
                  required
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Article Excerpt *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Brief summary shown on blog previews..."
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-400"
                />
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
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
