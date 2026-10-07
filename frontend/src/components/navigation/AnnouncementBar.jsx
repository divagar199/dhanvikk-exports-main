import React, { useMemo } from "react";
import { Truck, Gift, MessageCircle, ChevronDown } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { SKIPER_COUNTRIES, CountryFlag } from "../v1/skiper20";

export default function AnnouncementBar() {
  const { currency, selectedCountry, openCurrencyDialog } = useCurrency();

  const currentCountry = useMemo(() => {
    const code = (selectedCountry || 'AE').toUpperCase();
    return (
      SKIPER_COUNTRIES.find((c) => c.code.toUpperCase() === code) ||
      SKIPER_COUNTRIES.find((c) => c.currency === currency) ||
      SKIPER_COUNTRIES[0]
    );
  }, [selectedCountry, currency]);

  return (
    <></>
  );
}
