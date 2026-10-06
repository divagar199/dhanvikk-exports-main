import React, { createContext, useContext, useState, useEffect } from 'react';

export const CURRENCY_CONFIGS = {
  AED: {
    code: 'AED',
    symbol: 'AED',
    nativeSymbol: 'د.إ',
    label: 'AED (د.إ) • Dubai/UAE',
    name: 'Dubai & UAE Dirham',
    country: 'Dubai & UAE',
    rateFromINR: 1 / 22.8, // 1 AED = ~22.8 INR
    format: (val) => `AED ${val.toLocaleString()}`,
  },
  OMR: {
    code: 'OMR',
    symbol: 'OMR',
    nativeSymbol: 'ر.ع.',
    label: 'OMR (ر.ع.) • Oman',
    name: 'Omani Rial',
    country: 'Oman',
    rateFromINR: 1 / 217, // 1 OMR = ~217 INR
    format: (val) => `OMR ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    nativeSymbol: 'S$',
    label: 'SGD (S$) • Singapore',
    name: 'Singapore Dollar',
    country: 'Singapore',
    rateFromINR: 1 / 62.5, // 1 SGD = ~62.5 INR
    format: (val) => `S$${val.toLocaleString()}`,
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    nativeSymbol: 'RM',
    label: 'MYR (RM) • Malaysia',
    name: 'Malaysian Ringgit',
    country: 'Malaysia',
    rateFromINR: 1 / 18.8, // 1 MYR = ~18.8 INR
    format: (val) => `RM ${val.toLocaleString()}`,
  },
  LKR: {
    code: 'LKR',
    symbol: 'Rs',
    nativeSymbol: 'රු',
    label: 'LKR (Rs) • Sri Lanka',
    name: 'Sri Lankan Rupee',
    country: 'Sri Lanka',
    rateFromINR: 3.55, // 1 INR = ~3.55 LKR
    format: (val) => `LKR ${val.toLocaleString()}`,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    nativeSymbol: '₹',
    label: 'INR (₹) • India',
    name: 'Indian Rupee',
    country: 'India',
    rateFromINR: 1,
    format: (val) => `₹${val.toLocaleString('en-IN')}`,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    nativeSymbol: '$',
    label: 'USD ($) • Global/USA',
    name: 'US Dollar',
    country: 'Global / USA',
    rateFromINR: 1 / 83.5, // 1 USD = ~83.5 INR
    format: (val) => `$${val.toLocaleString()}`,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    nativeSymbol: '€',
    label: 'EUR (€) • Europe',
    name: 'Euro',
    country: 'Europe / EU',
    rateFromINR: 1 / 90.5, // 1 EUR = ~90.5 INR
    format: (val) => `€${val.toLocaleString()}`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    nativeSymbol: '£',
    label: 'GBP (£) • United Kingdom',
    name: 'British Pound',
    country: 'United Kingdom',
    rateFromINR: 1 / 106.5, // 1 GBP = ~106.5 INR
    format: (val) => `£${val.toLocaleString()}`,
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR',
    nativeSymbol: 'ر.س',
    label: 'SAR (ر.س) • Saudi Arabia',
    name: 'Saudi Riyal',
    country: 'Saudi Arabia',
    rateFromINR: 1 / 22.3, // 1 SAR = ~22.3 INR
    format: (val) => `SAR ${val.toLocaleString()}`,
  },
  QAR: {
    code: 'QAR',
    symbol: 'QAR',
    nativeSymbol: 'ر.ق',
    label: 'QAR (ر.ق) • Qatar',
    name: 'Qatari Riyal',
    country: 'Qatar',
    rateFromINR: 1 / 22.9, // 1 QAR = ~22.9 INR
    format: (val) => `QAR ${val.toLocaleString()}`,
  },
  KWD: {
    code: 'KWD',
    symbol: 'KWD',
    nativeSymbol: 'د.ك',
    label: 'KWD (د.ك) • Kuwait',
    name: 'Kuwaiti Dinar',
    country: 'Kuwait',
    rateFromINR: 1 / 272, // 1 KWD = ~272 INR
    format: (val) => `KWD ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  BHD: {
    code: 'BHD',
    symbol: 'BHD',
    nativeSymbol: 'ب.د',
    label: 'BHD (ب.د) • Bahrain',
    name: 'Bahraini Dinar',
    country: 'Bahrain',
    rateFromINR: 1 / 221, // 1 BHD = ~221 INR
    format: (val) => `BHD ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    nativeSymbol: 'C$',
    label: 'CAD (C$) • Canada',
    name: 'Canadian Dollar',
    country: 'Canada',
    rateFromINR: 1 / 61.5, // 1 CAD = ~61.5 INR
    format: (val) => `C$${val.toLocaleString()}`,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    nativeSymbol: 'A$',
    label: 'AUD (A$) • Australia',
    name: 'Australian Dollar',
    country: 'Australia',
    rateFromINR: 1 / 55.2, // 1 AUD = ~55.2 INR
    format: (val) => `A$${val.toLocaleString()}`,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    nativeSymbol: '¥',
    label: 'JPY (¥) • Japan',
    name: 'Japanese Yen',
    country: 'Japan',
    rateFromINR: 1.82, // 1 INR = ~1.82 JPY
    format: (val) => `¥${Math.round(val).toLocaleString()}`,
  },
};

// Map ISO country codes to default currencies
export const COUNTRY_TO_CURRENCY_MAP = {
  AE: 'AED',
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  SG: 'SGD',
  OM: 'OMR',
  SA: 'SAR',
  QA: 'QAR',
  KW: 'KWD',
  BH: 'BHD',
  MY: 'MYR',
  LK: 'LKR',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  EU: 'EUR',
  CA: 'CAD',
  AU: 'AUD',
  JP: 'JPY',
};

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [selectedCountry, setSelectedCountryState] = useState(() => {
    try {
      const savedCountry = localStorage.getItem('dhanvikk_country');
      if (savedCountry) return savedCountry.toUpperCase();
    } catch {
      // ignore
    }
    return 'AE'; // Default to UAE
  });

  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('dhanvikk_currency');
      if (saved && CURRENCY_CONFIGS[saved]) {
        return saved;
      }
      const savedCountry = localStorage.getItem('dhanvikk_country');
      if (savedCountry && COUNTRY_TO_CURRENCY_MAP[savedCountry.toUpperCase()]) {
        return COUNTRY_TO_CURRENCY_MAP[savedCountry.toUpperCase()];
      }
    } catch {
      // ignore
    }
    return 'AED'; // Default currency for Dhanvikk Luxury Flowers
  });

  const setCurrency = (newCurrency) => {
    if (CURRENCY_CONFIGS[newCurrency]) {
      setCurrencyState(newCurrency);
      try {
        localStorage.setItem('dhanvikk_currency', newCurrency);
      } catch {
        // ignore
      }
    }
  };

  /**
   * Automatically select a region/country and automatically change the currency.
   * @param {string} countryCode - ISO-2 code (e.g. 'AE', 'US', 'IN', 'GB', 'SG', 'SA')
   * @param {string} [customCurrency] - Optional currency override
   */
  const selectRegion = (countryCode, customCurrency = null) => {
    const code = (countryCode || 'AE').toUpperCase();
    setSelectedCountryState(code);
    try {
      localStorage.setItem('dhanvikk_country', code);
    } catch {
      // ignore
    }

    const targetCurrency = customCurrency || COUNTRY_TO_CURRENCY_MAP[code] || 'USD';
    if (CURRENCY_CONFIGS[targetCurrency]) {
      setCurrency(targetCurrency);
    }
    return { countryCode: code, currency: targetCurrency };
  };

  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false);
  const openCurrencyDialog = () => setIsCurrencyDialogOpen(true);
  const closeCurrencyDialog = () => setIsCurrencyDialogOpen(false);

  const currentConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.AED;

  /**
   * Converts a base INR amount to the current or target currency as a number.
   * @param {number} amountInINR - Price in Indian Rupees.
   * @param {string} [targetCurrency] - Optional specific currency code.
   * @returns {number}
   */
  const convertPrice = (amountInINR, targetCurrency = null) => {
    if (amountInINR == null || isNaN(amountInINR)) return 0;
    const num = Number(amountInINR);
    if (num === 0) return 0;

    const config = targetCurrency ? (CURRENCY_CONFIGS[targetCurrency] || currentConfig) : currentConfig;
    if (config.code === 'INR') {
      return Math.round(num);
    }
    if (config.code === 'OMR') {
      return Number((num * config.rateFromINR).toFixed(2));
    }
    return Math.round(num * config.rateFromINR);
  };

  /**
   * Formats a base INR amount into a localized currency string with symbol.
   * @param {number} amountInINR - Price in Indian Rupees.
   * @param {string} [targetCurrency] - Optional specific currency code.
   * @returns {string} e.g. "AED 66", "₹1,499", "$18"
   */
  const formatPrice = (amountInINR, targetCurrency = null) => {
    if (amountInINR == null || isNaN(amountInINR)) return '';
    const config = targetCurrency ? (CURRENCY_CONFIGS[targetCurrency] || currentConfig) : currentConfig;
    const converted = convertPrice(amountInINR, config.code);
    return config.format(converted);
  };

  /**
   * Formats an already converted number in the active currency.
   * @param {number} convertedVal - Already converted number.
   * @param {string} [targetCurrency] - Optional specific currency code.
   * @returns {string}
   */
  const formatRaw = (convertedVal, targetCurrency = null) => {
    if (convertedVal == null || isNaN(convertedVal)) return '';
    const config = targetCurrency ? (CURRENCY_CONFIGS[targetCurrency] || currentConfig) : currentConfig;
    return config.format(Math.round(Number(convertedVal)));
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        selectedCountry,
        setSelectedCountry: setSelectedCountryState,
        selectRegion,
        isCurrencyDialogOpen,
        setIsCurrencyDialogOpen,
        openCurrencyDialog,
        closeCurrencyDialog,
        currentConfig,
        currencySymbol: currentConfig.symbol,
        currencies: CURRENCY_CONFIGS,
        convertPrice,
        formatPrice,
        formatRaw,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export default CurrencyContext;
