import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Check,
  Globe,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCurrency, COUNTRY_TO_CURRENCY_MAP } from '../../../context/CurrencyContext';
import { toast } from 'sonner';

// Comprehensive Country, Flag & Currency Directory for Dhanvikk International Hubs
export const SKIPER_COUNTRIES = [
  {
    code: 'AE',
    name: 'United Arab Emirates',
    region: 'Middle East',
    flag: '🇦🇪',
    currency: 'AED',
    currencySymbol: 'د.إ',
    phoneCode: '+971',
    popular: true,
    hubs: 'Dubai, Abu Dhabi, Sharjah',
  },
  {
    code: 'US',
    name: 'United States',
    region: 'North America',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    phoneCode: '+1',
    popular: true,
    hubs: 'New York, Los Angeles, Chicago',
  },
  {
    code: 'IN',
    name: 'India',
    region: 'South Asia',
    flag: '🇮🇳',
    currency: 'INR',
    currencySymbol: '₹',
    phoneCode: '+91',
    popular: true,
    hubs: 'Chennai, Mumbai, Bengaluru, Delhi',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    phoneCode: '+44',
    popular: true,
    hubs: 'London, Manchester, Edinburgh',
  },
  {
    code: 'SG',
    name: 'Singapore',
    region: 'Southeast Asia',
    flag: '🇸🇬',
    currency: 'SGD',
    currencySymbol: 'S$',
    phoneCode: '+65',
    popular: true,
    hubs: 'Marina Bay, Orchard, Changi',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    region: 'Middle East',
    flag: '🇸🇦',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    phoneCode: '+966',
    popular: true,
    hubs: 'Riyadh, Jeddah, Dammam',
  },
  {
    code: 'QA',
    name: 'Qatar',
    region: 'Middle East',
    flag: '🇶🇦',
    currency: 'QAR',
    currencySymbol: 'ر.ق',
    phoneCode: '+974',
    popular: true,
    hubs: 'Doha, Lusail, Al Wakrah',
  },
  {
    code: 'OM',
    name: 'Oman',
    region: 'Middle East',
    flag: '🇴🇲',
    currency: 'OMR',
    currencySymbol: 'ر.ع.',
    phoneCode: '+968',
    popular: true,
    hubs: 'Muscat, Salalah, Sohar',
  },
  {
    code: 'KW',
    name: 'Kuwait',
    region: 'Middle East',
    flag: '🇰🇼',
    currency: 'KWD',
    currencySymbol: 'د.ك',
    phoneCode: '+965',
    popular: false,
    hubs: 'Kuwait City, Hawalli',
  },
  {
    code: 'BH',
    name: 'Bahrain',
    region: 'Middle East',
    flag: '🇧🇭',
    currency: 'BHD',
    currencySymbol: 'ب.د',
    phoneCode: '+973',
    popular: false,
    hubs: 'Manama, Riffa',
  },
  {
    code: 'MY',
    name: 'Malaysia',
    region: 'Southeast Asia',
    flag: '🇲🇾',
    currency: 'MYR',
    currencySymbol: 'RM',
    phoneCode: '+60',
    popular: false,
    hubs: 'Kuala Lumpur, Penang',
  },
  {
    code: 'DE',
    name: 'Germany (Eurozone)',
    region: 'Europe',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€',
    phoneCode: '+49',
    popular: true,
    hubs: 'Frankfurt, Berlin, Munich',
  },
  {
    code: 'FR',
    name: 'France',
    region: 'Europe',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    phoneCode: '+33',
    popular: false,
    hubs: 'Paris, Lyon, Marseille',
  },
  {
    code: 'CA',
    name: 'Canada',
    region: 'North America',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: 'C$',
    phoneCode: '+1',
    popular: false,
    hubs: 'Toronto, Vancouver, Montreal',
  },
  {
    code: 'AU',
    name: 'Australia',
    region: 'Oceania',
    flag: '🇦🇺',
    currency: 'AUD',
    currencySymbol: 'A$',
    phoneCode: '+61',
    popular: false,
    hubs: 'Sydney, Melbourne, Brisbane',
  },
  {
    code: 'LK',
    name: 'Sri Lanka',
    region: 'South Asia',
    flag: '🇱🇰',
    currency: 'LKR',
    currencySymbol: 'Rs',
    phoneCode: '+94',
    popular: false,
    hubs: 'Colombo, Kandy, Galle',
  },
  {
    code: 'JP',
    name: 'Japan',
    region: 'East Asia',
    flag: '🇯🇵',
    currency: 'JPY',
    currencySymbol: '¥',
    phoneCode: '+81',
    popular: false,
    hubs: 'Tokyo, Osaka, Kyoto',
  },
];

/**
 * Skiper20 UniSwap-Style Country & Currency Selection Dialog
 * Clicking a region automatically updates the application currency.
 */
export function CountrySelectDialog({
  isOpen,
  onClose,
  triggerClassName = '',
  showTrigger = false,
}) {
  const {
    currency,
    selectedCountry,
    selectRegion,
    currencies,
  } = useCurrency();

  const [modalOpen, setModalOpen] = useState(isOpen || false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Sync external open state
  useEffect(() => {
    if (typeof isOpen === 'boolean') {
      setModalOpen(isOpen);
    }
  }, [isOpen]);

  // Focus search input when dialog opens
  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [modalOpen]);

  // Find active country details
  const activeCountry = useMemo(() => {
    return (
      SKIPER_COUNTRIES.find(
        (c) => c.code.toUpperCase() === (selectedCountry || 'AE').toUpperCase()
      ) ||
      SKIPER_COUNTRIES.find((c) => c.currency === currency) ||
      SKIPER_COUNTRIES[0]
    );
  }, [selectedCountry, currency]);

  // Filter countries by query (name, code, currency, phoneCode)
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SKIPER_COUNTRIES;
    return SKIPER_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.phoneCode.includes(q)
    );
  }, [searchQuery]);

  const handleSelectCountry = (country) => {
    // Automatically change the currency to the country's currency
    const result = selectRegion(country.code, country.currency);
    toast.success(
      `Region set to ${country.name} ${country.flag} • Currency automatically changed to ${result.currency} 🌸`
    );
    setModalOpen(false);
    if (onClose) onClose();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (onClose) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  return (
    <>
      {/* Optional Trigger Pill (UniSwap styled button) */}
      {showTrigger && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#FFF3F6] border border-[#EAE4DD] hover:border-[#FCC1C5] text-xs font-semibold text-[#242124] transition-all cursor-pointer shadow-2xs ${triggerClassName}`}
          aria-label="Change delivery region and currency"
        >
          <span className="text-base leading-none">{activeCountry.flag}</span>
          <span className="font-bold text-[#242124] group-hover:text-[#C2185B] transition-colors">
            {currency}
          </span>
          <span className="text-[10px] text-[#777777] hidden md:inline">
            ({activeCountry.currencySymbol})
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#EC407A] transition-colors" />
        </button>
      )}

      {/* UniSwap Style Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop click area */}
          <div
            className="fixed inset-0"
            onClick={handleModalClose}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#F0E4D8] overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="skiper-dialog-title"
          >
            {/* Modal Header (UniSwap Style) */}
            <div className="p-4 sm:p-5 border-b border-[#F7F2ED] bg-[#FFFDFB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0F4] border border-[#FCC1C5]/50 flex items-center justify-center text-[#C2185B]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      id="skiper-dialog-title"
                      className="text-sm sm:text-base font-bold font-['Poppins'] text-[#242124]"
                    >
                      Select Delivery Region & Currency
                    </h3>
                    <p className="text-[11px] text-[#777777]">
                      Selecting your country automatically updates all bloom prices
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleModalClose}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#777777] hover:text-[#242124] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Real-time Search Box */}
              <div className="relative mt-3.5">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search country, currency (AED, USD, INR), or phone code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-9 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DD] text-xs text-[#242124] placeholder:text-[#888888] focus:bg-white focus:outline-none focus:border-[#EC407A] focus:ring-2 focus:ring-[#EC407A]/15 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#888888] hover:text-[#242124]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Popular / Quick-Pick Badges (UniSwap Token Chips Style) */}
              <div className="mt-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#EC407A]" />
                  <span>Popular Export Destinations</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SKIPER_COUNTRIES.filter((c) => c.popular).map((country) => {
                    const isSelected =
                      selectedCountry.toUpperCase() === country.code.toUpperCase();
                    return (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleSelectCountry(country)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFF0F4] border-[#EC407A] text-[#C2185B] shadow-2xs ring-1 ring-[#EC407A]/30'
                            : 'bg-white border-[#EAE4DD] text-[#444] hover:border-[#FCC1C5] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span className="text-sm">{country.flag}</span>
                        <span>{country.code}</span>
                        <span className="text-[10px] opacity-75">({country.currency})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Scrollable Country List (UniSwap Token List Style) */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-[#F7F2ED]">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => {
                  const isSelected =
                    selectedCountry.toUpperCase() === country.code.toUpperCase() ||
                    (currency === country.currency &&
                      activeCountry.code === country.code);
                  const currConfig = currencies[country.currency];

                  return (
                    <div
                      key={country.code}
                      onClick={() => handleSelectCountry(country)}
                      className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#FFF0F5] border border-[#FCC1C5] shadow-2xs'
                          : 'hover:bg-[#FAF7F2] border border-transparent'
                      }`}
                    >
                      {/* Left: Flag & Country Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-[#EAE4DD] flex items-center justify-center text-2xl shadow-2xs flex-shrink-0 group-hover:scale-105 transition-transform">
                          {country.flag}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[#242124] group-hover:text-[#C2185B] transition-colors truncate">
                              {country.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#777777] border border-[#EAE4DD]">
                              {country.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#777777] truncate mt-0.5">
                            {country.region} • {country.hubs}
                          </p>
                        </div>
                      </div>

                      {/* Right: Currency Badge & Selection Indicator */}
                      <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-[#242124]">
                            {country.currency} ({country.currencySymbol})
                          </div>
                          <div className="text-[10px] text-[#EC407A] font-semibold">
                            Auto Currency
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-[#EC407A] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-[#D5CDC5] group-hover:border-[#EC407A] flex items-center justify-center text-transparent group-hover:text-[#EC407A] transition-colors">
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 px-4 space-y-2">
                  <div className="text-2xl">🌍</div>
                  <p className="text-xs font-semibold text-[#242124]">
                    No region found for "{searchQuery}"
                  </p>
                  <p className="text-[11px] text-[#777777]">
                    Try searching by country name, calling code, or currency abbreviation (e.g. AED, USD, EUR).
                  </p>
                </div>
              )}
            </div>

            {/* Footer Trust Bar */}
            <div className="p-3 bg-[#FAF7F2] border-t border-[#F0E4D8] flex items-center justify-between text-[11px] text-[#777777]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cold-Chain Insulated Export Available</span>
              </div>
              <span className="font-semibold text-[#242124]">
                Active: {activeCountry.name} ({currency})
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CountrySelectDialog;
