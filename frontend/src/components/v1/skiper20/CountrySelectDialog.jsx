import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  Check,
  Globe,
  ChevronDown,
  ChevronRight,
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
 * Crisp Flag renderer using FlagCDN with seamless emoji fallback
 */
export function CountryFlag({
  code,
  name,
  flag,
  className = "w-6 h-4.5 rounded object-cover shadow-2xs",
}) {
  const [error, setError] = useState(false);
  const codeLower = (code || 'ae').toLowerCase();

  if (error || !code) {
    return <span className="select-none leading-none text-base">{flag || '🌐'}</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${codeLower}.png`}
      srcSet={`https://flagcdn.com/w80/${codeLower}.png 2x`}
      alt={`${name || code} flag`}
      loading="lazy"
      className={className}
      onError={() => setError(true)}
    />
  );
}

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
    isCurrencyDialogOpen,
    closeCurrencyDialog,
  } = useCurrency();

  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Sync with either direct isOpen prop OR global CurrencyContext dialog state
  const isDialogVisible = Boolean(isOpen || isCurrencyDialogOpen || modalOpen);

  // Focus search input when dialog opens
  useEffect(() => {
    if (isDialogVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isDialogVisible]);

  // Safe selected country code
  const safeCountryCode = useMemo(() => {
    return (selectedCountry || 'AE').toUpperCase();
  }, [selectedCountry]);

  // Find active country details
  const activeCountry = useMemo(() => {
    return (
      SKIPER_COUNTRIES.find(
        (c) => c.code.toUpperCase() === safeCountryCode
      ) ||
      SKIPER_COUNTRIES.find((c) => c.currency === currency) ||
      SKIPER_COUNTRIES[0]
    );
  }, [safeCountryCode, currency]);

  // Comprehensive search matching country, code, currency, symbol, region, and aliases
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SKIPER_COUNTRIES;

    // Common synonyms and aliases
    const aliasMap = {
      'uae': ['ae', 'aed', 'united arab emirates', 'dubai', 'dirham', 'د.إ'],
      'dubai': ['ae', 'aed', 'united arab emirates', 'dirham'],
      'dirham': ['ae', 'aed', 'united arab emirates', 'dubai'],
      'india': ['in', 'inr', 'rupee', '₹'],
      'rupee': ['inr', 'in', '₹', 'lkr'],
      'usa': ['us', 'usd', 'united states', 'dollar', '$'],
      'us': ['us', 'usd', 'dollar', '$'],
      'uk': ['gb', 'gbp', 'united kingdom', 'pound', '£'],
      'britain': ['gb', 'gbp', 'pound', '£'],
      'pound': ['gb', 'gbp', 'united kingdom'],
      'ksa': ['sa', 'sar', 'saudi arabia', 'riyal', 'ر.س'],
      'saudi': ['sa', 'sar', 'saudi arabia', 'riyal', 'ر.س'],
      'qatar': ['qa', 'qar', 'doha', 'riyal', 'ر.ق'],
      'oman': ['om', 'omr', 'muscat', 'rial', 'ر.ع.'],
      'kuwait': ['kw', 'kwd', 'dinar', 'د.ك'],
      'bahrain': ['bh', 'bhd', 'dinar', 'ب.د'],
      'riyal': ['sa', 'sar', 'qa', 'qar', 'om', 'omr'],
      'dinar': ['kw', 'kwd', 'bh', 'bhd'],
      'europe': ['de', 'fr', 'eur', 'euro', '€'],
      'euro': ['eur', '€', 'de', 'fr'],
      'dollar': ['usd', '$', 'cad', 'aud', 'sgd'],
      'singapore': ['sg', 'sgd', 's$'],
      'japan': ['jp', 'jpy', '¥', 'yen'],
      'yen': ['jp', 'jpy', 'japan', '¥'],
    };

    const extraTerms = aliasMap[q] || [];

    return SKIPER_COUNTRIES.filter((c) => {
      const matchDirect =
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        (c.currencySymbol && c.currencySymbol.toLowerCase().includes(q)) ||
        c.region.toLowerCase().includes(q) ||
        (c.hubs && c.hubs.toLowerCase().includes(q)) ||
        c.phoneCode.includes(q);

      const matchAlias = extraTerms.some(
        (term) =>
          c.code.toLowerCase() === term ||
          c.currency.toLowerCase() === term ||
          c.name.toLowerCase().includes(term)
      );

      return matchDirect || matchAlias;
    });
  }, [searchQuery]);

  const handleSelectCountry = (country) => {
    const result = selectRegion(country.code, country.currency);
    toast.success(
      `Delivery region set to ${country.name} • Bloom currency updated to ${result.currency} (${country.currencySymbol}) 🌸`
    );
    handleModalClose();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (closeCurrencyDialog) closeCurrencyDialog();
    if (onClose) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDialogVisible) {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogVisible]);

  return (
    <>
      {/* Optional Trigger Pill (UniSwap styled button) */}
      {showTrigger && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`luxury-touch-press group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#FFF3F6] border border-[#EAE4DD] hover:border-[#FCC1C5] text-xs font-semibold text-[#242124] transition-all cursor-pointer shadow-2xs ${triggerClassName}`}
          aria-label="Change delivery region and currency"
        >
          <CountryFlag
            code={activeCountry.code}
            name={activeCountry.name}
            flag={activeCountry.flag}
            className="w-4 h-3 rounded-[2px] object-cover shrink-0 shadow-2xs"
          />
          <span className="font-bold text-[#242124] group-hover:text-[#C2185B] transition-colors">
            {currency}
          </span>
          <span className="text-[10px] text-[#777777] font-medium hidden sm:inline">
            ({activeCountry.currencySymbol})
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#EC407A] transition-colors" />
        </button>
      )}

      {/* Responsive UniSwap Style Dialog Modal (Mounted to body via createPortal) */}
      {isDialogVisible && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-md animate-backdrop-fade overflow-y-auto">
            {/* Backdrop click area */}
            <div
              className="fixed inset-0 cursor-pointer"
              onClick={handleModalClose}
              aria-hidden="true"
            />

            {/* Modal Card - 100% Responsive for 360px Mobile to Desktop */}
            <div
              className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#F0E4D8] overflow-hidden flex flex-col h-auto max-h-[92vh] sm:max-h-[85vh] my-auto z-10 animate-modal-pop"
              role="dialog"
              aria-modal="true"
              aria-labelledby="skiper-dialog-title"
            >
              {/* Modal Header */}
              <div className="shrink-0 p-3.5 sm:p-5 border-b border-[#F7F2ED] bg-[#FFFDFB]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FFF0F4] border border-[#FCC1C5]/50 flex items-center justify-center text-[#C2185B] shrink-0">
                      <Globe className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        id="skiper-dialog-title"
                        className="text-xs sm:text-base font-bold font-['Poppins'] text-[#242124] truncate"
                      >
                        Select Delivery Country & Currency
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-[#777777] truncate">
                        Prices, tax, and delivery automatically adapt to your country
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#777777] hover:text-[#EC407A] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Real-time Search Box */}
                <div className="relative mt-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by country, symbol (₹, $, د.إ, £), or currency..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 sm:h-11 pl-10 pr-9 rounded-xl sm:rounded-2xl bg-[#FAF7F2] border border-[#EAE4DD] text-xs text-[#242124] placeholder:text-[#888888] focus:bg-white focus:outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#C2185B]/15 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#888888] hover:text-[#242124] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Popular / Quick-Pick Badges */}
                <div className="mt-2.5 sm:mt-3">
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#EC407A]" />
                    <span>Popular Hubs</span>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {SKIPER_COUNTRIES.filter((c) => c.popular).map((country) => {
                      const isSelected = safeCountryCode === country.code.toUpperCase();
                      return (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleSelectCountry(country)}
                          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FFF0F4] border-[#C2185B] text-[#C2185B] shadow-2xs ring-1 ring-[#C2185B]/30'
                              : 'bg-white border-[#EAE4DD] text-[#444] hover:border-[#FCC1C5] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <CountryFlag
                            code={country.code}
                            name={country.name}
                            flag={country.flag}
                            className="w-4 h-3 rounded-[2px] object-cover shrink-0 shadow-2xs"
                          />
                          <span>{country.code}</span>
                          <span className="font-mono text-[10px] text-[#C2185B] font-bold">
                            {country.currencySymbol || country.currency}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Scrollable Country List - min-h-0 is essential for inner scrolling */}
              <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-3 divide-y divide-[#F7F2ED]">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => {
                    const isSelected =
                      safeCountryCode === country.code.toUpperCase() ||
                      (currency === country.currency && activeCountry.code === country.code);

                    return (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleSelectCountry(country)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all cursor-pointer border flex items-center justify-between gap-2.5 sm:gap-3 group my-1 ${
                          isSelected
                            ? 'bg-[#FFF0F5] border-[#FCC1C5] shadow-2xs ring-1 ring-[#EC407A]/20'
                            : 'bg-white hover:bg-[#FAF7F2] border-[#F2ECE6] hover:border-[#E8E1DA]'
                        }`}
                      >
                        {/* Left: Flag Box + Country Name + Currency Symbol details */}
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          {/* Flag Box with Border */}
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF7F2] border border-[#EAE4DD] flex items-center justify-center shadow-2xs shrink-0 select-none overflow-hidden group-hover:scale-105 transition-transform">
                            <CountryFlag
                              code={country.code}
                              name={country.name}
                              flag={country.flag}
                              className="w-6.5 h-4.5 rounded-[2px] object-cover shadow-2xs"
                            />
                          </div>

                          {/* Country Info & Currency Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                              <span className="font-bold text-xs sm:text-sm text-[#242124] group-hover:text-[#C2185B] transition-colors truncate">
                                {country.name}
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FAF7F2] text-[#666666] border border-[#EAE4DD] shrink-0 uppercase">
                                {country.code}
                              </span>
                            </div>

                            {/* Symbol & Currency Badge (Prominently Aligned) */}
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="font-mono font-bold text-[#C2185B] bg-[#FFF0F4] px-1.5 py-0.2 rounded border border-[#F2D7DE] text-[10px] sm:text-xs shrink-0">
                                {country.currency} • {country.currencySymbol}
                              </span>
                              <span className="text-[10px] text-[#777777] truncate hidden xs:inline">
                                {country.region}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Selection Checkmark or Arrow */}
                        <div className="shrink-0 flex items-center">
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-[#D5CDC5] group-hover:border-[#C2185B] flex items-center justify-center text-[#999999] group-hover:text-[#C2185B] transition-colors">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 sm:py-10 px-4 space-y-2">
                    <div className="text-2xl">🌍</div>
                    <p className="text-xs font-semibold text-[#242124]">
                      No country or currency found for "{searchQuery}"
                    </p>
                    <p className="text-[11px] text-[#777777]">
                      Try searching by name, symbol (₹, $, د.إ, £), or currency code (AED, USD, INR).
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Trust Bar */}
              <div className="shrink-0 p-2.5 sm:p-3 bg-[#FAF7F2] border-t border-[#F0E4D8] flex items-center justify-between text-[10px] sm:text-[11px] text-[#777777] gap-2">
                <div className="flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Cold-Chain Export Ready</span>
                </div>
                <div className="font-semibold text-[#242124] truncate text-right flex items-center gap-1.5">
                  <CountryFlag
                    code={activeCountry.code}
                    name={activeCountry.name}
                    flag={activeCountry.flag}
                    className="w-3.5 h-2.5 rounded-[1px] object-cover inline-block"
                  />
                  <span>Active:</span>
                  <span className="text-[#C2185B]">{activeCountry.name}</span>
                  <span className="text-stone-500 font-mono">({currency} • {activeCountry.currencySymbol})</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default CountrySelectDialog;
