import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Plane, 
  Flower2, 
  ArrowRight, 
  Gift, 
  Building2, 
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import Logo from '../common/Logo';
import { toast } from 'sonner';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Welcome to the Dhanvikk Floral Club! 🌸 Check your inbox for exclusive privileges.');
    setNewsletterEmail('');
  };

  return (
    <footer 
      className="relative text-[#333333] mt-20 font-['Poppins'] overflow-hidden border-t border-[#F0E6DE] bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5ECE8]"
    >
      {/* Luminous Floral Top Gradient Trim */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#EC407A] via-[#FCC1C5] to-transparent shadow-[0_0_12px_rgba(236,64,122,0.4)]" />

      {/* Atmospheric Floral Ambient Glows */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#FCC1C5]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-[#FFB400]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Newsletter & Floral Concierge Strip */}
      <div className="relative z-10 border-b border-[#F2D7DE] bg-[#FFF0F4]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#FCC1C5] text-[#C2185B] text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Mail className="w-3.5 h-3.5 text-[#EC407A]" />
                <span>The Dhanvikk Floral Guild</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#242124]">
                Subscribe for Bespoke Seasonal Edits
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] max-w-lg leading-relaxed">
                Receive private access to rare botanical harvests, Valentine's & festival previews, and international wholesale export cargo notices.
              </p>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-6">
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto lg:ml-auto">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your private email..."
                    className="w-full h-12 pl-11 pr-4 rounded-full bg-white border border-[#E0D7D0] text-xs text-[#242124] placeholder:text-[#888888] focus:outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B] transition-all shadow-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-7 rounded-full bg-gradient-to-r from-[#C2185B] to-[#EC407A] hover:from-[#AD1457] hover:to-[#D81B60] text-white text-xs font-bold transition-all shadow-md shadow-[#C2185B]/25 flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{subscribed ? 'Subscribed 🌸' : 'Join Guild'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[11px] text-[#777777] text-center lg:text-right mt-2 flex items-center justify-center lg:justify-end gap-1.5">
                <Flower2 className="w-3 h-3 text-[#C2185B]" />
                <span>We respect your discretion. Pure floral inspirations, never spam.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation & Brand Overview Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Col 1: Brand & Atelier Story (4 columns) */}
          <div className="lg:col-span-4 space-y-5">
            <Logo />
            <p className="text-xs text-[#666666] leading-relaxed max-w-sm">
              Haute couture luxury floristry and international fresh floral exports. Handcrafted signature Ecuadorian roses, temple-fresh sacred blooms, and daily cold-chain air cargo across India, the UAE, and global flower markets.
            </p>

            <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
              <a
                href="https://wa.me/919108916328?text=Hello%20Dhanvikk%20Blooms!%20I%20would%20like%20to%20place%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] text-xs font-semibold transition-all hover:scale-105 shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Floral Concierge</span>
              </a>

              <div className="flex items-center gap-1.5 text-[11px] text-[#777777]">
                <Clock className="w-3.5 h-3.5 text-[#C2185B]" />
                <span>Daily 7 AM – 10 PM IST</span>
              </div>
            </div>
          </div>

          {/* Col 2: Haute Collections (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C2185B] pb-2 border-b border-[#EFE7DE] flex items-center gap-2">
              <Flower2 className="w-3.5 h-3.5 text-[#EC407A]" />
              <span>Haute Collections</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-[#555555]">
              <li>
                <Link to="/category/roses" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Roses Collection</span>
                </Link>
              </li>
              <li>
                <Link to="/category/hand-bouquets" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Hand Bouquets</span>
                </Link>
              </li>
              <li>
                <Link to="/category/flower-boxes" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Velvet Hatboxes</span>
                </Link>
              </li>
              <li>
                <Link to="/category/forever-roses" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Forever Preserved Domes</span>
                </Link>
              </li>
              <li>
                <Link to="/category/orchids" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Exotic Orchids & Lilies</span>
                </Link>
              </li>
              <li>
                <Link to="/category/gift-bundles" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Luxury Gift Bundles</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Precious Occasions (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C2185B] pb-2 border-b border-[#EFE7DE] flex items-center gap-2">
              <Gift className="w-3.5 h-3.5 text-[#EC407A]" />
              <span>Occasions</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-[#555555]">
              <li>
                <Link to="/category/birthday" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Birthday Blooms</span>
                </Link>
              </li>
              <li>
                <Link to="/category/anniversary" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Anniversary Roses</span>
                </Link>
              </li>
              <li>
                <Link to="/category/romance" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Love & Romance</span>
                </Link>
              </li>
              <li>
                <Link to="/category/congratulations" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Congratulations</span>
                </Link>
              </li>
              <li>
                <Link to="/category/get-well" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Get Well & Care</span>
                </Link>
              </li>
              <li>
                <Link to="/category/housewarming" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-flex items-center gap-1.5 transition-all">
                  <span className="w-1 h-1 rounded-full bg-[#EC407A]" />
                  <span>Housewarming</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Wholesale Cargo & Portals (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C2185B] pb-2 border-b border-[#EFE7DE] flex items-center gap-2">
              <Plane className="w-3.5 h-3.5 text-[#EC407A]" />
              <span>Export & Portals</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-[#555555]">
              <li>
                <Link to="/login" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-block transition-all">
                  Customer Account Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-block transition-all">
                  Create New Account
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-block transition-all">
                  Track Active Orders
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-[#C2185B] hover:translate-x-1.5 inline-block transition-all">
                  Direct Razorpay Checkout
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/919108916328?text=Hello%20Dhanvikk%20Blooms!%20I%20want%20to%20inquire%20about%20bulk%20flower%20exports."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#128C7E] font-semibold hover:underline inline-flex items-center gap-1.5"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>International Cargo Wholesale Inquiry</span>
                </a>
              </li>
              <li className="pt-1.5">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FFF0F4] text-[#C2185B] border border-[#FCC1C5] transition-all text-xs font-semibold shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#EC407A]" />
                  <span>🛡️ Staff Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Official Government Establishment Dossier Showcase */}
        <div className="mt-12 rounded-2xl bg-white border border-[#EFE7DE] p-6 shadow-sm relative overflow-hidden">
          {/* Dossier Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F2ECE6]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0F4] border border-[#FCC1C5] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#C2185B]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#242124] uppercase tracking-wider font-['Poppins']">
                  Official Government Establishment Dossier
                </h4>
                <p className="text-[11px] text-[#666666]">
                  Registered floral commercial enterprise under the statutory regulations of Karnataka, India
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Verified Entity</span>
              </span>
            </div>
          </div>

          {/* 4 Aligned Columns for Legal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-5">
            {/* Box 1: Establishment */}
            <div className="space-y-1 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EFE7DE]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2185B] block">
                Establishment Name
              </span>
              <p className="text-[#242124] font-semibold text-xs leading-snug">
                Dhanvikk Blooms And Exports
              </p>
              <p className="text-[11px] text-[#666666] pt-1">
                <span className="text-[#888888]">Nature:</span> Trading of retail and wholesale flowers
              </p>
            </div>

            {/* Box 2: Registration & Employer */}
            <div className="space-y-1 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EFE7DE]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2185B] block">
                Government Reg. No.
              </span>
              <p className="text-[#C2185B] font-mono font-bold text-xs tracking-wider">
                14/146/S/0010/2026
              </p>
              <p className="text-[11px] text-[#666666] pt-1">
                <span className="text-[#888888]">Employer:</span> V Kunguma Narmadha
              </p>
            </div>

            {/* Box 3: Postal Address */}
            <div className="space-y-1 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EFE7DE]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2185B] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#EC407A]" /> Registered Postal Address
              </span>
              <p className="text-[#444444] text-[11px] leading-relaxed">
                No. 122/1, Ground Floor, 14th Cross Road, Lakkasandra Extension, 7th Main Road, Bengaluru, Karnataka, 560030
              </p>
            </div>

            {/* Box 4: Official Phone / WhatsApp */}
            <div className="space-y-1 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EFE7DE]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2185B] flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#25D366]" /> Official Helpline & WhatsApp
              </span>
              <a
                href="https://wa.me/919108916328"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#128C7E] font-bold text-xs hover:underline block pt-0.5"
              >
                +91 91089 16328
              </a>
              <p className="text-[10px] text-[#777777] flex items-center gap-1 pt-1">
                <Clock className="w-2.5 h-2.5" /> Retail & Wholesale Support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Trust Bar & Certified Badges */}
      <div className="relative z-10 border-t border-[#EFE7DE] bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Dhanvikk Blooms And Exports. All rights reserved.</span>
            <span className="hidden sm:inline text-[#DCD5CD]">•</span>
            <span className="text-bold text-[12px] text-[##858584]">Developed by <a href="https://haznox.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C2185B]">Haznox.</a></span>
          </div>

          {/* Trust Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Verified 256-Bit SSL
            </span>
            <span className="text-[#DCD5CD]">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Flower2 className="w-3.5 h-3.5" /> 100% Farm Fresh Guarantee
            </span>
            <span className="text-[#DCD5CD]">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Plane className="w-3.5 h-3.5" /> Daily Cold-Chain Air Cargo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
