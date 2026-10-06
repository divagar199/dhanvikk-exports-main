import React from 'react';
import { 
  Truck, 
  Flower2, 
  ShieldCheck, 
  ThermometerSnowflake, 
  MapPin, 
  CreditCard,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HauteFloristryPromise() {
  return (
    <div className="w-full py-10 sm:py-16 space-y-16 sm:space-y-24">
      {/* 1. SECTION 1: LEFT IMAGE, RIGHT CONTENT - Cold-Chain Temperature Controlled */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Image */}
          <div className="lg:col-span-6 relative group">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#F2ECE6] bg-[#FAF7F2] aspect-[4/3]">
              <img
                src="/images/features/cold-chain.jpg"
                alt="Cold-Chain Temperature Controlled Floral Delivery in India"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                width="600"
                height="450"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

              {/* Floating Quality Badge */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                <span className="bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <ThermometerSnowflake className="w-4 h-4 text-cyan-300" />
                  <span>Chilled 2°C – 4°C Active Monitored</span>
                </span>
                <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-200 px-3 py-1.5 rounded-full hidden sm:flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dew-Fresh Guarantee
                </span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF0F4] border border-[#FCC1C5] text-[#C2185B] text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-[#EC407A]" />
              <span>Chilled Transit Fleet</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold font-['Poppins'] text-[#242124] leading-tight">
              Cold-Chain Temperature <br />
              <span className="text-[#C2185B] italic font-normal">Controlled Logistics</span>
            </h2>

            <p className="text-sm sm:text-base text-[#666666] leading-relaxed font-normal">
              Specially equipped vans ensure petals arrive chilled, hydrated, and crisp without wilting.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-[#444444]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Custom insulated humidity-lock containers prevent petal dehydration in warm transit.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Real-time thermal tracking from our Bengaluru floral atelier right to your doorstep.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Zero wilting guarantee with complimentary floral life hydration nutrients.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/category/flowers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#242124] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <span>Experience Chilled Freshness</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION 2: RIGHT IMAGE, LEFT CONTENT - Direct Farm Sourcing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Content (on mobile appears after or before via order-2 lg:order-1) */}
          <div className="lg:col-span-6 space-y-5 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Flower2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ethical Farm Harvest</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold font-['Poppins'] text-[#242124] leading-tight">
              Direct Farm <br />
              <span className="text-[#C2185B] italic font-normal">Sourcing & Cultivation</span>
            </h2>

            <p className="text-sm sm:text-base text-[#666666] leading-relaxed font-normal">
              Direct imports from Ecuador, Holland, and Nilgiris for double the lifespan of standard blooms.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-[#444444]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Cultivated at 2,240m elevation in mist-kissed Nilgiris & Ooty greenhouses for thick velvet petals.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Dawn-cut harvesting ensures blooms spend minimum hours off the stem before curation.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Fair-trade partnerships empowering local floral farmers and women artisan collectives.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/category/roses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#FFF0F4] text-[#242124] hover:text-[#C2185B] border border-[#E9E2E5] hover:border-[#FCC1C5] text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                <span>Browse Farm-Fresh Stems</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-6 relative group order-1 lg:order-2">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#F2ECE6] bg-[#FAF7F2] aspect-[4/3]">
              <img
                src="/images/features/farm-sourcing.jpg"
                alt="Direct Farm Sourcing in Nilgiris Ooty India"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                width="600"
                height="450"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

              {/* Floating Quality Badge */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                <span className="bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <MapPin className="w-4 h-4 text-rose-300" />
                  <span>Nilgiris & Ooty Highlands (2,240m)</span>
                </span>
                <span className="bg-amber-950/80 backdrop-blur-md text-amber-200 px-3 py-1.5 rounded-full hidden sm:flex items-center gap-1">
                  <Flower2 className="w-3.5 h-3.5 text-amber-300" /> 2x Longer Vase Life
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 3: LEFT IMAGE, RIGHT CONTENT - Razorpay Secure Checkout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Image */}
          <div className="lg:col-span-6 relative group">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#F2ECE6] bg-[#FAF7F2] aspect-[4/3]">
              <img
                src="/images/features/razorpay-checkout.jpg"
                alt="Razorpay Secure Checkout Indian Floral Boutique"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                width="600"
                height="450"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

              {/* Floating Security Badge */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                <span className="bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Razorpay Verified Merchant</span>
                </span>
                <span className="bg-blue-950/80 backdrop-blur-md text-blue-200 px-3 py-1.5 rounded-full hidden sm:flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-blue-300" /> 256-Bit SSL Encrypted
                </span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Fintech Grade Security</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold font-['Poppins'] text-[#242124] leading-tight">
              Razorpay Secure <br />
              <span className="text-[#C2185B] italic font-normal">Encrypted Checkout</span>
            </h2>

            <p className="text-sm sm:text-base text-[#666666] leading-relaxed font-normal">
              Bank-grade encrypted gateway supporting Credit Cards, Debit Cards, UPI & Net Banking.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-[#444444]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Instant 1-click UPI payments via Google Pay, PhonePe, Paytm, and BHIM.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Global Visa, Mastercard, American Express, and RuPay card tokenization.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Automated instant payment receipts and real-time SMS & email order notifications.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/category/flower-boxes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-[#EC407A]/25"
              >
                <span>Order with Confidence</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
