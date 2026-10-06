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
};

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('dhanvikk_currency');
      if (saved && CURRENCY_CONFIGS[saved]) {
        return saved;
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
