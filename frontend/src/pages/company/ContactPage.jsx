import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import Navbar from '../../components/navigation/Navbar';
import AnnouncementBar from '../../components/navigation/AnnouncementBar';
import SubNav from '../../components/navigation/SubNav';
import Footer from '../../components/navigation/Footer';
import CartDrawer from '../../components/cart/CartDrawer';
import Breadcrumb from '../../components/common/Breadcrumb';
import Spinner from '../../components/common/Spinner';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Sparkles,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Bespoke Floral Arrangement',
    orderId: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Your message has been dispatched to our VIP Floral Concierge.');
    }, 800);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Dhanvikk Concierge! My name is ${formData.name || 'Valued Patron'}. I have an inquiry regarding: ${formData.inquiryType}. ${formData.orderId ? `Order #${formData.orderId}. ` : ''}${formData.message}`
    );
    window.open(`https://wa.me/919108916328?text=${text}`, '_blank');
  };

  return (
    <>
      <SEO
        title="Contact Our VIP Floral Concierge | Dhanvikk Blooms"
        description="Connect with Dhanvikk Blooms luxury florist concierge for bespoke wedding flowers, corporate gifting, international air cargo inquiries, or live order assistance."
        canonical="/contact"
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
              { label: 'Contact Us' },
            ]}
            className="mb-6"
          />

          {/* Hero Header Card */}
          <div className="bg-gradient-to-r from-[#FFF0F4] via-[#FFFDF9] to-[#FFF0F4] rounded-3xl p-6 sm:p-10 border border-[#F2D7DE] shadow-xs mb-10 text-center sm:text-left">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#FCC1C5] text-[#C2185B] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
                <span>Dedicated White-Glove Support</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#242124] font-['Poppins'] leading-tight">
                Connect With Our <span className="text-[#EC407A]">Floral Concierge</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                Whether arranging custom bridal centerpieces, corporate client gifts, or tracking a scheduled cold-chain delivery in Dubai or India, our team responds with utmost discretion.
              </p>
            </div>
          </div>

          {/* Contact Methods Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {/* WhatsApp VIP */}
            <a
              href="https://wa.me/919108916328?text=Hello%20Dhanvikk%20Blooms!%20I%20would%20like%20to%20connect%20with%20your%20floral%20concierge."
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-3xl border border-[#EFE7DE] hover:border-[#128C7E] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F8F5] text-[#128C7E] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#242124] group-hover:text-[#128C7E] transition-colors">
                    WhatsApp Concierge
                  </h3>
                  <p className="text-[11px] text-[#777777] mt-0.5">Instant live chat & stem photos</p>
                </div>
                <p className="text-xs font-bold text-[#128C7E] font-mono">+91 91089 16328</p>
              </div>
              <div className="pt-4 border-t border-[#F7F2ED] flex items-center justify-between text-[11px] font-bold text-[#128C7E]">
                <span>Open Chat Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>

            {/* Direct Phone */}
            <a
              href="tel:+919108916328"
              className="group bg-white p-6 rounded-3xl border border-[#EFE7DE] hover:border-[#EC407A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#242124] group-hover:text-[#EC407A] transition-colors">
                    VIP Phone Line
                  </h3>
                  <p className="text-[11px] text-[#777777] mt-0.5">Speak with a floral specialist</p>
                </div>
                <p className="text-xs font-bold text-[#EC407A] font-mono">+91 91089 16328</p>
              </div>
              <div className="pt-4 border-t border-[#F7F2ED] flex items-center justify-between text-[11px] font-bold text-[#EC407A]">
                <span>Call Concierge</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>

            {/* Email Support */}
            <a
              href="mailto:care@dhanvikk.com"
              className="group bg-white p-6 rounded-3xl border border-[#EFE7DE] hover:border-[#EC407A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#242124] group-hover:text-[#EC407A] transition-colors">
                    Official Inquiries Email
                  </h3>
                  <p className="text-[11px] text-[#777777] mt-0.5">Tax invoices & corporate quotes</p>
                </div>
                <p className="text-xs font-bold text-[#242124] font-mono truncate">care@dhanvikk.com</p>
              </div>
              <div className="pt-4 border-t border-[#F7F2ED] flex items-center justify-between text-[11px] font-bold text-[#EC407A]">
                <span>Send Email</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>

            {/* Operating Hours */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE7DE] shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#EC407A] flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#242124]">
                    Concierge Hours
                  </h3>
                  <p className="text-[11px] text-[#777777] mt-0.5">Open 7 Days a Week</p>
                </div>
                <p className="text-xs font-semibold text-[#555555]">
                  8:00 AM – 11:30 PM GST
                </p>
              </div>
              <div className="pt-4 border-t border-[#F7F2ED] flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Concierge Online Now</span>
              </div>
            </div>
          </div>

          {/* Form & Atelier Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            {/* Left 7 Columns: Interactive Contact Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE7DE] shadow-xs">
              <div className="pb-5 border-b border-[#F7F2ED] mb-6">
                <h2 className="text-xl font-bold text-[#242124] font-['Poppins']">
                  Send a Direct Message
                </h2>
                <p className="text-xs text-[#777777] mt-0.5">
                  Complete this form and our senior floral designer will respond within 2 hours.
                </p>
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#242124]">
                    Message Received With Gratitude
                  </h3>
                  <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
                    Thank you, {formData.name}. Our concierge team has registered your inquiry and will contact you via email ({formData.email}) or phone shortly.
                  </p>
                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="px-6 py-2.5 rounded-full bg-[#128C7E] text-white text-xs font-bold shadow-md hover:bg-[#075E54] transition-all flex items-center gap-2"
                    >
                      <span>Also Open in WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 rounded-full border border-[#DCD5CD] text-xs font-semibold text-[#555555] hover:bg-[#FAF7F2]"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Amina Al-Mansoor"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DCD5CD] text-xs sm:text-sm text-[#242124] focus:outline-none focus:border-[#EC407A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@luxurymail.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DCD5CD] text-xs sm:text-sm text-[#242124] focus:outline-none focus:border-[#EC407A] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                        Phone Number (WhatsApp Preferred)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+971 50 123 4567"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DCD5CD] text-xs sm:text-sm text-[#242124] focus:outline-none focus:border-[#EC407A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                        Inquiry Topic
                      </label>
                      <select
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DCD5CD] text-xs sm:text-sm text-[#242124] bg-white focus:outline-none focus:border-[#EC407A] transition-colors"
                      >
                        <option value="Bespoke Floral Arrangement">Bespoke Floral Arrangement</option>
                        <option value="Wedding & Royal Gala Decor">Wedding & Royal Gala Decor</option>
                        <option value="International Air Cargo Export">International Air Cargo Export</option>
                        <option value="Delivery Status & Tracking">Delivery Status & Tracking</option>
                        <option value="Corporate Partnerships">Corporate Partnerships</option>
                        <option value="General Question">General Question</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                      Order ID (Optional, if inquiring about an existing delivery)
                    </label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="e.g. ORD-2026-7821"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#DCD5CD] text-xs sm:text-sm text-[#242124] focus:outline-none focus:border-[#EC407A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                      Your Message / Floral Specifications *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please specify flower preferences, event date, venue location, or any custom greeting requests..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#DCD5CD] text-xs sm:text-sm text-[#242124] focus:outline-none focus:border-[#EC407A] transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                    <span className="text-[11px] text-[#777777] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Protected under strict VIP Client Privacy Protocol</span>
                    </span>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {loading ? <Spinner size="sm" color="#ffffff" /> : <Send className="w-4 h-4" />}
                      <span>Dispatch Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right 5 Columns: Atelier Locations & FAQ Snippet */}
            <div className="lg:col-span-5 space-y-6">
              {/* Atelier Locations Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE7DE] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F7F2ED]">
                  <MapPin className="w-4 h-4 text-[#EC407A]" />
                  <h3 className="text-sm font-bold text-[#242124] font-['Poppins']">
                    Atelier Locations & Dispatches
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE] space-y-1">
                    <span className="font-bold text-[#EC407A] uppercase tracking-wider text-[10px] block">
                      Dubai Hub (UAE & GCC)
                    </span>
                    <h4 className="font-bold text-[#242124] text-xs sm:text-sm">
                      Dhanvikk Blooms Luxury Atelier DXB
                    </h4>
                    <p className="text-[#666666]">
                      Downtown Dubai & Al Barsha Chilled Dispatch Center, Dubai, United Arab Emirates
                    </p>
                    <span className="text-[11px] text-[#888888] block pt-1">
                      Direct cold-chain courier dispatches across Dubai, Abu Dhabi, Sharjah, Ajman.
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE] space-y-1">
                    <span className="font-bold text-[#C2185B] uppercase tracking-wider text-[10px] block">
                      India Agro & Harvest Hub
                    </span>
                    <h4 className="font-bold text-[#242124] text-xs sm:text-sm">
                      Dhanvikk Floral Estates Dispatch
                    </h4>
                    <p className="text-[#666666]">
                      Nilgiris Mountain Foothills & Indiranagar Botanical Center, Bengaluru, Karnataka, India
                    </p>
                    <span className="text-[11px] text-[#888888] block pt-1">
                      Direct morning harvest conditioning & air-cargo dispatch.
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick FAQ Link Card */}
              <div className="bg-gradient-to-br from-[#FFF0F4] to-white rounded-3xl p-6 border border-[#FCC1C5] shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#EC407A]" />
                  <h3 className="text-sm font-bold text-[#242124]">
                    Looking for Instant Answers?
                  </h3>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Learn about delivery cutoffs, midnight delivery slots, stem longevity, custom message cards, and international export phytosanitary clearance.
                </p>
                <Link
                  to="/faq"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EC407A] hover:text-[#C2185B] pt-1"
                >
                  <span>Explore Frequently Asked Questions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
