import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import Navbar from '../../components/navigation/Navbar';
import AnnouncementBar from '../../components/navigation/AnnouncementBar';
import SubNav from '../../components/navigation/SubNav';
import Footer from '../../components/navigation/Footer';
import CartDrawer from '../../components/cart/CartDrawer';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  Phone,
  MessageSquare,
  Flower2,
  Clock,
  ShieldCheck,
  Plane,
  CreditCard,
  Droplets,
  Scissors,
  Sun
} from 'lucide-react';

const FAQ_DATA = [
  // Category: Ordering & Customization
  {
    id: 'faq-1',
    category: 'Ordering & Customization',
    question: 'Can I include a personalized handwritten message card with my floral order?',
    answer: 'Absolutely. Every Dhanvikk Blooms creation includes a complimentary embossed card printed or hand-calligraphed with your personal message. You can enter your personalized message during checkout in the "Greeting Card Message" box.',
  },
  {
    id: 'faq-2',
    category: 'Ordering & Customization',
    question: 'How do I place a bespoke floral arrangement or custom color request?',
    answer: 'For custom stem counts, bespoke color palettes (e.g., dual-tone Ecuadorian roses, cascading rare orchids), or oversized velvet hatboxes, please connect with our VIP Concierge via WhatsApp (+91 91089 16328). Our master floral designers will tailor the curation to your exact specifications.',
  },
  {
    id: 'faq-3',
    category: 'Ordering & Customization',
    question: 'Are the velvet hatboxes and glass vases reusable keepsakes?',
    answer: 'Yes. Our hatboxes are handcrafted in France with premium water-resistant velvet, gold-foil stamping, and protective inner linings designed to serve as luxury jewelry and keepsake boxes for years to come.',
  },

  // Category: Delivery & Timings
  {
    id: 'faq-4',
    category: 'Delivery & Timings',
    question: 'What are your delivery time slots and cutoff times for same-day delivery?',
    answer: 'We offer three precision daily slots: Morning (9:00 AM – 1:00 PM), Afternoon Prime (2:00 PM – 6:00 PM), and Evening Sunset (6:00 PM – 9:30 PM). For same-day delivery, orders must be placed prior to 6:00 PM local time. We also offer our Midnight Special delivery (11:30 PM – 12:30 AM) for unforgettable celebrations.',
  },
  {
    id: 'faq-5',
    category: 'Delivery & Timings',
    question: 'How does your refrigerated cold-chain delivery work in high summer temperatures?',
    answer: 'All our logistics vehicles are equipped with active refrigeration units calibrated between 2°C and 4°C. Stems travel in specialized temperature-regulated containers with hydrating floral hydration packs, ensuring petals arrive crisp, turgid, and cool even during peak desert summers in Dubai.',
  },
  {
    id: 'faq-6',
    category: 'Delivery & Timings',
    question: 'Do you deliver across all Emirates in the UAE and major Indian metros?',
    answer: 'Yes. In the UAE, we offer direct doorstep delivery across Dubai, Abu Dhabi, Sharjah, Ajman, and Ras Al Khaimah. In India, our primary hub operates across Bengaluru, with express cold-chain connections to Mumbai, Delhi, and Chennai.',
  },

  // Category: Freshness & Care Guide
  {
    id: 'faq-7',
    category: 'Freshness & Care Guide',
    question: 'What is the Dhanvikk 7-Day Stem Freshness Guarantee?',
    answer: 'We harvest stems at precise bud maturity and chill them within 30 minutes of harvest. As a result, our garden roses, lilies, and orchids stay vibrant for a minimum of 7 days when cared for according to our botanical instructions. If your arrangement wilts prematurely, notify our concierge with a photo for an immediate replacement.',
  },
  {
    id: 'faq-8',
    category: 'Freshness & Care Guide',
    question: 'How should I care for my fresh bouquet once delivered?',
    answer: 'Trim 1-2 cm off each stem at a 45-degree angle under cool water. Place in a clean vase filled with fresh, cool water and mix in the provided floral food sachet. Keep the arrangement away from direct sunlight, heating radiators, and air conditioning vents, changing the water every 2-3 days.',
  },
  {
    id: 'faq-9',
    category: 'Freshness & Care Guide',
    question: 'How long do your Forever Roses (Preserved Roses) last?',
    answer: 'Our Infinity Forever Roses undergo a natural non-toxic preservation process that locks in cellular hydration and velvet texture. They require zero water or sunlight and last in pristine condition for 1 to 3 full years.',
  },

  // Category: International Air Export
  {
    id: 'faq-10',
    category: 'International Air Export',
    question: 'Are your international flower exports phytosanitary certified?',
    answer: 'Yes. Dhanvikk is an officially registered export house. Every commercial and bulk air cargo consignment undergoes rigorous plant quarantine inspections and receives official Phytosanitary Certificates issued by government authorities prior to loading onto air cargo flights to Dubai International (DXB) and global airports.',
  },
  {
    id: 'faq-11',
    category: 'International Air Export',
    question: 'Can I order bulk wholesale stems for weddings or luxury events abroad?',
    answer: 'Yes. We cater to premier wedding planners, 5-star hotel chains, and event designers across the Middle East and Europe. Please submit an inquiry through our Contact page or WhatsApp with your stem quantities and event dates.',
  },

  // Category: Payments & Refunds
  {
    id: 'faq-12',
    category: 'Payments & Refunds',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, UPI (for India), and international payment gateways via Razorpay with 256-bit bank-grade encryption.',
  },
  {
    id: 'faq-13',
    category: 'Payments & Refunds',
    question: 'What is your cancellation and modification policy?',
    answer: 'Because fresh blooms are harvested and conditioned specifically for your order, cancellations and delivery address modifications are accepted up to 12 hours before your scheduled delivery slot. Once an arrangement has entered the refrigerated dispatch vehicle, modifications cannot be guaranteed.',
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFaqId, setOpenFaqId] = useState('faq-1');

  const categories = [
    'All',
    'Ordering & Customization',
    'Delivery & Timings',
    'Freshness & Care Guide',
    'International Air Export',
    'Payments & Refunds',
  ];

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <SEO
        title="Frequently Asked Questions (FAQ) & Flower Care Guide | Dhanvikk Blooms"
        description="Find answers to common questions about Dhanvikk Blooms luxury flower delivery in Dubai & India, same-day delivery timings, stem freshness guarantee, and international air export."
        canonical="/faq"
      />

      <CartDrawer />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col font-['Poppins']">
        <AnnouncementBar />
        <Navbar />
        <SubNav />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'FAQ & Care Guide' },
            ]}
            className="mb-6"
          />

          {/* Hero Header Card */}
          <div className="bg-gradient-to-r from-[#FFF0F4] via-[#FFFDF9] to-[#FFF0F4] rounded-3xl p-6 sm:p-12 border border-[#F2D7DE] shadow-xs mb-10 text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#FCC1C5] text-[#C2185B] text-xs font-bold uppercase tracking-wider shadow-2xs">
                <HelpCircle className="w-3.5 h-3.5 text-[#EC407A]" />
                <span>Knowledge Base & Floral Care Protocol</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#242124] font-['Poppins'] leading-tight">
                Frequently Asked <span className="text-[#EC407A]">Questions</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                Everything you need to know about our farm harvests, refrigerated air-cargo transit, delivery timings, and keeping your fresh stems vibrant at home.
              </p>

              {/* Dynamic Instant Search Bar */}
              <div className="pt-2 max-w-lg mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search e.g. same day delivery, midnight, vase life, Dubai..."
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-[#DCD5CD] bg-white text-xs sm:text-sm text-[#242124] focus:outline-none focus:border-[#EC407A] shadow-xs transition-all"
                  />
                  <Search className="w-4 h-4 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none justify-start lg:justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#EC407A] text-white shadow-xs'
                    : 'bg-white hover:bg-[#FFF3F6] text-[#555555] hover:text-[#EC407A] border border-[#EAE2D8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQs Accordion Grid */}
          <div className="max-w-4xl mx-auto space-y-4 mb-16">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#EFE7DE] shadow-xs space-y-3">
                <HelpCircle className="w-10 h-10 text-[#FCC1C5] mx-auto" />
                <h3 className="text-base font-bold text-[#242124]">
                  No matching questions found
                </h3>
                <p className="text-xs text-[#777777]">
                  Try adjusting your search terms or connect directly with our WhatsApp concierge.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'border-[#FCC1C5] shadow-md ring-1 ring-[#EC407A]/15'
                        : 'border-[#EFE7DE] shadow-xs hover:border-[#E8DFD7]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#EC407A] block">
                          {faq.category}
                        </span>
                        <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#242124] group-hover:text-[#EC407A] transition-colors leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#FAF7F2] text-[#EC407A] flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#FFF0F4]' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-[#555555] leading-relaxed border-t border-[#F7F2ED] animate-in fade-in duration-200">
                        <div className="pt-3">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Botanical Care Protocol (Bonus Value Section) */}
          <section className="bg-gradient-to-r from-[#FFFDF9] via-[#FFF3F6] to-[#FFFDF9] rounded-3xl p-6 sm:p-10 border border-[#F2ECE6] mb-16">
            <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C2185B]">
                Floral Longevity Guide
              </span>
              <h2 className="text-xl sm:text-3xl font-bold text-[#242124] font-['Poppins']">
                4 Steps to Keep Your Stems Fresh for 7+ Days
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-[#EFE7DE] shadow-xs space-y-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center mx-auto">
                  <Scissors className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#242124]">1. 45° Angle Cut</h4>
                <p className="text-[11px] text-[#666] leading-relaxed">
                  Trim 1-2 cm off stem bottoms under running water to reopen xylem capillaries.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE7DE] shadow-xs space-y-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center mx-auto">
                  <Droplets className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#242124]">2. Fresh Nutrient Water</h4>
                <p className="text-[11px] text-[#666] leading-relaxed">
                  Dissolve the provided floral nutrition sachet in clean, cool water before arranging.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE7DE] shadow-xs space-y-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center mx-auto">
                  <Flower2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#242124]">3. Prune Lower Leaves</h4>
                <p className="text-[11px] text-[#666] leading-relaxed">
                  Remove any submerged foliage to eliminate bacterial growth in the vase water.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE7DE] shadow-xs space-y-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center mx-auto">
                  <Sun className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#242124]">4. Cool Ambient Shade</h4>
                <p className="text-[11px] text-[#666] leading-relaxed">
                  Display away from direct AC blasts, heaters, fruit bowls, or direct harsh sunlight.
                </p>
              </div>
            </div>
          </section>

          {/* Bottom Concierge Card */}
          <div className="bg-white rounded-3xl p-8 border border-[#EFE7DE] shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#242124] font-['Poppins']">
              Still Have Questions?
            </h3>
            <p className="text-xs sm:text-sm text-[#777777]">
              Our VIP concierge is available 7 days a week from 8:00 AM to 11:30 PM GST for live assistance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="https://wa.me/919108916328?text=Hello%20Dhanvikk%20Concierge!%20I%20have%20a%20question%20regarding%20my%20flower%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <Link
                to="/contact"
                className="px-6 py-2.5 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs font-bold transition-all shadow-md"
              >
                Send Concierge Inquiry
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
