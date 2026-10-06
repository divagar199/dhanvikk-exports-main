import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  MapPin, 
  Plane, 
  Truck, 
  ShieldCheck, 
  Flower2, 
  Clock, 
  Sparkles,
  ThermometerSnowflake,
  HeartHandshake
} from 'lucide-react';

export const STORE_FAQS = [
  {
    question: 'How does Dhanvikk Blooms ensure flower freshness during delivery?',
    answer:
      'Every arrangement is hand-tied by master florists using stems harvested at high altitudes in the Nilgiris and Ecuador. Blooms are transferred directly into temperature-controlled cold-chain logistics maintained at 2°C to 4°C with moist floral sponge reservoirs, guaranteeing morning-dew freshness upon doorstep arrival.',
  },
  {
    question: 'Do you offer same-day flower delivery in Bengaluru and other cities?',
    answer:
      'Yes. We provide 2-hour express and same-day delivery across all major zones in Bengaluru (including Indiranagar, Koramangala, Whitefield, HSR Layout, Jayanagar, and CBD) for orders placed before 7:00 PM. We also offer morning (9 AM - 1 PM), standard evening (2 PM - 6 PM), and midnight surprise (11:30 PM - 12:30 AM) delivery slots.',
  },
  {
    question: 'How long do Dhanvikk Forever Roses last, and what care is required?',
    answer:
      'Our preserved Forever Roses last 3 to 5 years looking completely natural. They undergo a specialized non-toxic botanical preservation process replacing natural sap with natural glycerin and organic dyes. They require zero watering, zero sunlight, and should be kept in indoor room temperatures away from high humidity.',
  },
  {
    question: 'What traditional flowers does Dhanvikk export to the UAE and global markets?',
    answer:
      'Dhanvikk Blooms exports authentic GI-tagged Madurai Malli (Jasmine), Sevvanthi (Chrysanthemum), Button Roses, Lotus flowers, and handcrafted wedding garlands to Indian diaspora communities and temple trusts in Dubai/UAE, Singapore, Malaysia, the United Kingdom, and the USA via daily refrigerated air cargo.',
  },
  {
    question: 'Can I include a personalized card message and schedule future dates?',
    answer:
      'Every order includes a complimentary custom embossed greeting card. You can type your personal love note, celebratory message, or condolences and select any future delivery date up to 90 days in advance during checkout.',
  },
  {
    question: 'What payment methods are supported on Dhanvikk Blooms?',
    answer:
      'We accept all major payment methods powered by Razorpay with 256-bit SSL encryption, including UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking across 50+ banks, and international cards in multiple currencies (INR, AED, USD, EUR, GBP).',
  },
];

export const SERVICE_ZONES = [
  {
    title: 'Bengaluru 2-Hour Express',
    subtitle: 'Direct local atelier fulfillment',
    icon: Truck,
    color: '#EC407A',
    bg: '#FFF0F4',
    areas: [
      'Koramangala',
      'Indiranagar',
      'HSR Layout',
      'Whitefield',
      'Jayanagar',
      'Electronic City',
      'CBD & MG Road',
      'JP Nagar',
      'Hebbal',
      'Sadashivanagar',
    ],
    timing: 'Same-Day & 2-Hour Express',
  },
  {
    title: 'Pan-India Metro Air Cargo',
    subtitle: 'Temperature-controlled hub flights',
    icon: Plane,
    color: '#C2185B',
    bg: '#FFF3F6',
    areas: [
      'Chennai',
      'Coimbatore',
      'Hyderabad',
      'Mumbai',
      'Delhi NCR',
      'Pune',
      'Kolkata',
      'Kochi',
      'Ahmedabad',
      'Chandigarh',
    ],
    timing: 'Next-Day Delivery by 12 PM',
  },
  {
    title: 'International Wholesale Cargo',
    subtitle: 'APEDA & Phytosanitary certified export',
    icon: MapPin,
    color: '#0284C7',
    bg: '#F0F9FF',
    areas: [
      'Dubai & Abu Dhabi (UAE)',
      'Singapore',
      'London (United Kingdom)',
      'Kuala Lumpur (Malaysia)',
      'New York & California (USA)',
      'Toronto (Canada)',
    ],
    timing: 'Daily Cold-Chain Flights',
  },
];

export default function FaqAndGeoSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      {/* 1. SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#FCC1C5] text-[#C2185B] text-xs font-bold tracking-wider uppercase shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5 text-[#EC407A]" />
          <span>Botanical Concierge & Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold font-['Poppins'] text-[#242124] tracking-tight">
          Everything You Need to Know About Dhanvikk Floristry
        </h2>
        <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
          Authoritative answers on our farm sourcing, cold-chain preservation, doorstep delivery slots, and international floral export standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* 2. LEFT: FAQ ACCORDION (7 COLS - AEO OPTIMIZED) */}
        <div className="lg:col-span-7 space-y-3.5">
          {STORE_FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#FCC1C5] shadow-md shadow-[#C2185B]/5 ring-1 ring-[#FCC1C5]/50'
                    : 'bg-white/80 hover:bg-white border-[#F0E6DE] hover:border-[#FCC1C5]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-[#242124] font-['Poppins'] leading-snug">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      isOpen
                        ? 'bg-[#C2185B] text-white rotate-180'
                        : 'bg-[#FAF7F2] text-[#777777]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#555555] leading-relaxed border-t border-[#F7F2ED]">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 3. RIGHT: GEOGRAPHIC SERVICE CORRIDORS (5 COLS - GEO OPTIMIZED) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-gradient-to-br from-[#FFF0F4] via-[#FFFDF9] to-[#FAF7F2] rounded-3xl p-6 sm:p-7 border border-[#F2D7DE] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#C2185B] text-white flex items-center justify-center shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#242124] font-['Poppins']">
                  Service Zones & Delivery Corridors
                </h3>
                <p className="text-[11px] text-[#777777]">
                  From local express doorstep drops to global airport cold-cargo
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {SERVICE_ZONES.map((zone, zIdx) => {
                const IconComponent = zone.icon;
                return (
                  <div
                    key={zIdx}
                    className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: zone.bg, color: zone.color }}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#242124]">
                          {zone.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#777777] border border-[#EAE0D6]">
                        {zone.timing}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#666666]">
                      {zone.subtitle}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {zone.areas.map((area, aIdx) => (
                        <span
                          key={aIdx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#444444] border border-[#F0E6DE]"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Florist Concierge Callout */}
            <div className="p-4 rounded-2xl bg-white/90 border border-[#FCC1C5] flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2185B] block">
                  Need Custom Destination Delivery?
                </span>
                <p className="text-[11px] text-[#444444]">
                  WhatsApp our Master Florist for express route confirmation.
                </p>
              </div>
              <a
                href="https://wa.me/919108916328?text=Hello%20Dhanvikk%20Blooms!%20Can%20you%20deliver%20to%20my%20pincode?"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold transition-all shadow-xs flex-shrink-0 cursor-pointer"
              >
                Inquire
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
