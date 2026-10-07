import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import Navbar from '../../components/navigation/Navbar';
import AnnouncementBar from '../../components/navigation/AnnouncementBar';
import SubNav from '../../components/navigation/SubNav';
import Footer from '../../components/navigation/Footer';
import CartDrawer from '../../components/cart/CartDrawer';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  Sparkles,
  Plane,
  ShieldCheck,
  Flower2,
  Heart,
  Award,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Globe,
  Leaf,
  Users
} from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Us - Haute Floristry Atelier & Botanical Exports | Dhanvikk Blooms"
        description="Discover the heritage of Dhanvikk Blooms. Handcrafted Parisian velvet flower boxes, high-altitude Ecuadorian roses, unbroken 2°C–4°C cold-chain logistics, and official phytosanitary export across Dubai, UAE & international destinations."
        canonical="/about"
        ogType="article"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About Dhanvikk Blooms', url: '/about' },
        ]}
        keywords={[
          'about Dhanvikk Blooms',
          'luxury florist Bangalore',
          'botanical exports Dubai',
          'cold chain flower delivery',
          'Ecuadorian roses India',
          'haute floristry atelier',
          'Madurai jasmine export',
          'premium floral gifting',
          'sustainable floral packaging',
        ]}
        geo={{
          region: 'IN-KA',
          placename: 'Bengaluru, Karnataka, India',
          position: '12.9467;77.6006',
          icbm: '12.9467, 77.6006',
        }}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': ['Florist', 'Organization'],
          '@id': 'https://dhanvikkexports.com/#organization',
          name: 'Dhanvikk Blooms & Botanical Exports',
          alternateName: 'Dhanvikk Blooms',
          url: 'https://dhanvikkexports.com/about',
          logo: 'https://dhanvikkexports.com/dhanvikk-brand-logo.png',
          image: 'https://dhanvikkexports.com/dhanvikk-brand-logo.png',
          description:
            'Haute couture luxury florist and international botanical export atelier specializing in unbroken 2°C–4°C cold-chain delivery.',
          foundingDate: '2024',
          priceRange: '$$$$',
          telephone: '+91 91089 16328',
          email: 'concierge@dhanvikkexports.com',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Atelier Suites, MG Road & Indiranagar',
            addressLocality: 'Bengaluru',
            addressRegion: 'Karnataka',
            postalCode: '560001',
            addressCountry: 'IN',
          },
          areaServed: [
            { '@type': 'Country', name: 'United Arab Emirates' },
            { '@type': 'Country', name: 'India' },
            { '@type': 'Country', name: 'United States' },
            { '@type': 'Country', name: 'United Kingdom' },
            { '@type': 'Country', name: 'Singapore' },
          ],
          sameAs: [
            'https://www.instagram.com/dhanvikkblooms',
            'https://www.facebook.com/dhanvikkblooms',
          ],
          knowsAbout: [
            'Luxury Flower Arrangements',
            'Cold-Chain Floral Export',
            'Ecuadorian Long-Stemmed Roses',
            'Preserved Forever Roses',
            'Fresh Sacred Jasmine Garlands',
            'Handcrafted Parisian Velvet Boxes',
          ],
        }}
      />

      <CartDrawer />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col font-['Poppins']">
        <AnnouncementBar />
        <Navbar />
        <SubNav />

        <main className="flex-1">
          {/* 1. Atelier Hero Banner */}
          <section className="relative py-16 sm:py-24 bg-gradient-to-b from-[#FFF0F4] via-[#FFFDF9] to-[#FFFDF9] border-b border-[#F7F2ED] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <Breadcrumb
                items={[
                  { label: 'Home', path: '/' },
                  { label: 'About Dhanvikk Blooms' },
                ]}
                className="mb-8"
              />

              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#FCC1C5] text-[#C2185B] text-xs font-bold uppercase tracking-widest shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
                  <span>The Dhanvikk Heritage & Atelier</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#242124] leading-[1.15] font-['Poppins']">
                  Where Botanical Artistry Meets{' '}
                  <span className="text-[#EC407A] italic font-serif">Cold-Chain Perfection.</span>
                </h1>

                <p className="text-sm sm:text-base text-[#666666] leading-relaxed max-w-2xl font-light">
                  Founded with a singular passion: to elevate floral gifting into an art form. We curate farm-fresh, grade-A botanical stems conditioned at dawn and transported through continuous 2°C–4°C refrigeration directly to luxury residences, royal occasions, and international celebrations.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    to="/category/flowers"
                    className="px-7 py-3.5 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Explore Curated Collections</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="px-7 py-3.5 rounded-full bg-white hover:bg-[#FFF3F6] text-[#EC407A] border border-[#E9E2E5] hover:border-[#FCC1C5] text-xs sm:text-sm font-bold transition-all shadow-2xs"
                  >
                    <span>Connect With Concierge</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Decorative Ambient Radial Gradient */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#EC407A]/10 rounded-full blur-3xl pointer-events-none" />
          </section>

          {/* 2. Key Metrics Bar */}
          <section className="border-b border-[#F2ECE6] bg-white py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#EC407A] font-mono block">
                    50,000+
                  </span>
                  <span className="text-xs font-semibold text-[#242124] uppercase tracking-wider block">
                    Curations Hand-Delivered
                  </span>
                  <span className="text-[11px] text-[#777777]">Across India, Dubai & GCC</span>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#EC407A] font-mono block">
                    99.8%
                  </span>
                  <span className="text-xs font-semibold text-[#242124] uppercase tracking-wider block">
                    On-Time Chilled Dispatches
                  </span>
                  <span className="text-[11px] text-[#777777]">Precision time-slot adherence</span>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#EC407A] font-mono block">
                    7 Days
                  </span>
                  <span className="text-xs font-semibold text-[#242124] uppercase tracking-wider block">
                    Stem Longevity Assurance
                  </span>
                  <span className="text-[11px] text-[#777777]">Conditioned at harvest source</span>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#EC407A] font-mono block">
                    24/7
                  </span>
                  <span className="text-xs font-semibold text-[#242124] uppercase tracking-wider block">
                    Dedicated White-Glove Care
                  </span>
                  <span className="text-[11px] text-[#777777]">Live WhatsApp floral concierge</span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. The 4 Pillars of Dhanvikk Excellence */}
          <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C2185B]">
                Uncompromising Quality
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#242124] font-['Poppins']">
                The Four Pillars of Dhanvikk Blooms
              </h2>
              <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                Every stem, box, and ribbon reflects our commitment to exceptional floristry standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pillar 1 */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE7DE] shadow-xs hover:border-[#FCC1C5] hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center shadow-2xs">
                  <Flower2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                  Master Botanical Architects
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Trained in Parisian symmetry and Japanese Ikebana aesthetics, our floral designers handcraft each bouquet stem-by-stem for unmatched visual harmony.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE7DE] shadow-xs hover:border-[#FCC1C5] hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center shadow-2xs">
                  <Plane className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                  Unbroken 2°C–4°C Cold-Chain
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Stems are cooled immediately after harvesting in Nilgiris & Ecuador, traveling in refrigerated containers so petals never dehydrate or wilt in transit.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE7DE] shadow-xs hover:border-[#FCC1C5] hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center shadow-2xs">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                  Sustainable Luxury Craft
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  We use keepsake French velvet hatboxes, recyclable organic cardstock, and non-toxic flower food sachets, eliminating single-use plastic wrappings entirely.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE7DE] shadow-xs hover:border-[#FCC1C5] hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                  Certified Export Quality
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Official government phytosanitary clearance enables daily air cargo dispatches to Dubai International Airport (DXB) and major international hubs.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Editorial Story: From Farm to Velvet Hatbox */}
          <section className="bg-gradient-to-r from-[#FFFDF9] via-[#FFF3F6] to-[#FFFDF9] border-y border-[#F2ECE6] py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#FCC1C5] text-[#C2185B] text-xs font-bold uppercase tracking-wider">
                    <span>Our Sourcing Philosophy</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-bold text-[#242124] font-['Poppins'] leading-tight">
                    Harvested at 4:30 AM Dawn.{' '}
                    <span className="text-[#EC407A] block">Delivered with Dew Still on Petals.</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                    Unlike conventional florists who store cut flowers in stagnant room temperatures for days, Dhanvikk operates on a just-in-time harvest protocol. Every rose stem is cut at precise bud maturity stage 3 to ensure it opens gloriously in your recipient's home.
                  </p>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#EC407A] flex-shrink-0 mt-0.5" />
                      <span><strong>High-Altitude Volcano Estates:</strong> Ecuadorian stems with 6cm+ head diameters and sturdy 70cm stalks.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#EC407A] flex-shrink-0 mt-0.5" />
                      <span><strong>Nilgiris & Ooty Farms:</strong> Crisp morning mist blooms conditioned in organic nutrient solution before packaging.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#EC407A] flex-shrink-0 mt-0.5" />
                      <span><strong>White-Glove Doorstep Delivery:</strong> Trained couriers deliver in climate-controlled transport vehicles with handwritten calligraphed cards.</span>
                    </div>
                  </div>
                </div>

                {/* Editorial Visual Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-3xl overflow-hidden shadow-lg border border-[#EFE7DE] h-48 sm:h-64 bg-rose-100">
                      <img
                        src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
                        alt="Ecuadorian Red Roses"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs text-center">
                      <span className="text-xs font-bold text-[#242124] block">Grade-A Stems</span>
                      <span className="text-[11px] text-[#777777]">Hand-selected daily</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6">
                    <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs text-center">
                      <span className="text-xs font-bold text-[#EC407A] block">Parisian Velvet Boxes</span>
                      <span className="text-[11px] text-[#777777]">Keepsake packaging</span>
                    </div>
                    <div className="rounded-3xl overflow-hidden shadow-lg border border-[#EFE7DE] h-48 sm:h-64 bg-pink-100">
                      <img
                        src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80"
                        alt="Luxury Botanical Hatbox"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Call to Action Section */}
          <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#242124] font-['Poppins']">
              Celebrate Life's Sovereign Moments
            </h2>
            <p className="text-xs sm:text-sm text-[#777777] max-w-xl mx-auto leading-relaxed">
              Whether surprising a loved one in Dubai, celebrating an anniversary in Bengaluru, or staging a grand gala, Dhanvikk ensures sheer elegance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/category/roses"
                className="px-8 py-3.5 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                Shop Grand Roses Collection
              </Link>
              <Link
                to="/faq"
                className="px-8 py-3.5 rounded-full bg-white hover:bg-[#FFF3F6] text-[#EC407A] border border-[#E9E2E5] text-xs sm:text-sm font-semibold transition-all"
              >
                Read FAQs & Care Guide
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
