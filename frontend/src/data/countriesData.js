// Comprehensive Geographic & Address Directory for Dhanvikk Blooms
// Supporting United Arab Emirates (UAE), India, United States (USA), Singapore, Oman, Saudi Arabia, UK, Malaysia, Qatar

export const COUNTRIES_LIST = [
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    phoneCode: '+971',
    currency: 'AED',
    stateLabel: 'Emirate',
    districtLabel: 'Area / Neighborhood',
    postalLabel: 'Makani No. / Area Code',
    postalPlaceholder: '00000 or 10-digit Makani',
    postalRequired: false,
    defaultState: 'Dubai',
    defaultCity: 'Dubai',
    defaultDistrict: 'Downtown Dubai',
    defaultPostal: '00000',
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    phoneCode: '+91',
    currency: 'INR',
    stateLabel: 'State',
    districtLabel: 'District / Locality',
    postalLabel: '6-Digit PIN Code',
    postalPlaceholder: 'e.g. 600017 or 400001',
    postalRequired: true,
    defaultState: 'Tamil Nadu',
    defaultCity: 'Chennai',
    defaultDistrict: 'T. Nagar',
    defaultPostal: '600017',
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    phoneCode: '+1',
    currency: 'USD',
    stateLabel: 'State',
    districtLabel: 'County / Neighborhood',
    postalLabel: '5-Digit ZIP Code',
    postalPlaceholder: 'e.g. 90210 or 10001',
    postalRequired: true,
    defaultState: 'California',
    defaultCity: 'Los Angeles',
    defaultDistrict: 'Beverly Hills',
    defaultPostal: '90210',
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    phoneCode: '+65',
    currency: 'SGD',
    stateLabel: 'Region / District Sector',
    districtLabel: 'Neighborhood / Area',
    postalLabel: '6-Digit Postal Code',
    postalPlaceholder: 'e.g. 238801',
    postalRequired: true,
    defaultState: 'Central Region',
    defaultCity: 'Singapore',
    defaultDistrict: 'Orchard / River Valley',
    defaultPostal: '238801',
  },
  {
    code: 'OM',
    name: 'Oman',
    flag: '🇴🇲',
    phoneCode: '+968',
    currency: 'OMR',
    stateLabel: 'Governorate',
    districtLabel: 'Wilayat / District',
    postalLabel: 'Postal Code',
    postalPlaceholder: 'e.g. 100 or 112',
    postalRequired: false,
    defaultState: 'Muscat',
    defaultCity: 'Muscat',
    defaultDistrict: 'Al Mouj / Wave',
    defaultPostal: '100',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    phoneCode: '+966',
    currency: 'AED',
    stateLabel: 'Province / Region',
    districtLabel: 'District / Area',
    postalLabel: '5-Digit Postal Code',
    postalPlaceholder: 'e.g. 11564',
    postalRequired: false,
    defaultState: 'Riyadh Region',
    defaultCity: 'Riyadh',
    defaultDistrict: 'Olaya',
    defaultPostal: '11564',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    phoneCode: '+44',
    currency: 'EUR',
    stateLabel: 'County / Region',
    districtLabel: 'Borough / Area',
    postalLabel: 'Postcode',
    postalPlaceholder: 'e.g. SW1A 1AA or W1K 7AA',
    postalRequired: true,
    defaultState: 'Greater London',
    defaultCity: 'London',
    defaultDistrict: 'Westminster / Mayfair',
    defaultPostal: 'W1K 7AA',
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    phoneCode: '+60',
    currency: 'MYR',
    stateLabel: 'State / Federal Territory',
    districtLabel: 'District / Suburb',
    postalLabel: '5-Digit Postcode',
    postalPlaceholder: 'e.g. 50088',
    postalRequired: true,
    defaultState: 'Kuala Lumpur',
    defaultCity: 'Kuala Lumpur',
    defaultDistrict: 'KLCC / City Centre',
    defaultPostal: '50088',
  },
  {
    code: 'QA',
    name: 'Qatar',
    flag: '🇶🇦',
    phoneCode: '+974',
    currency: 'AED',
    stateLabel: 'Municipality',
    districtLabel: 'Zone / District',
    postalLabel: 'Zone Code / PIN',
    postalPlaceholder: 'e.g. Zone 66 or 00000',
    postalRequired: false,
    defaultState: 'Doha',
    defaultCity: 'Doha',
    defaultDistrict: 'The Pearl-Qatar',
    defaultPostal: '00000',
  },
];

export const STATES_BY_COUNTRY = {
  'United Arab Emirates': [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
  ],
  'India': [
    'Tamil Nadu',
    'Karnataka',
    'Maharashtra',
    'Delhi (NCT)',
    'Kerala',
    'Telangana',
    'Andhra Pradesh',
    'Gujarat',
    'Uttar Pradesh',
    'West Bengal',
    'Rajasthan',
    'Punjab',
    'Haryana',
    'Madhya Pradesh',
    'Goa',
  ],
  'United States': [
    'California',
    'New York',
    'Texas',
    'Florida',
    'Illinois',
    'Washington',
    'New Jersey',
    'Massachusetts',
    'Georgia',
    'Virginia',
  ],
  'Singapore': [
    'Central Region',
    'East Region',
    'West Region',
    'North Region',
    'North-East Region',
  ],
  'Oman': [
    'Muscat',
    'Dhofar (Salalah)',
    'Al Batinah North',
    'Al Batinah South',
    'Al Dakhiliyah',
    'Al Sharqiyah',
    'Musandam',
  ],
  'Saudi Arabia': [
    'Riyadh Region',
    'Makkah Region (Jeddah)',
    'Eastern Province (Dammam/Khobar)',
    'Madinah Region',
    'Asir Region',
  ],
  'United Kingdom': [
    'Greater London',
    'West Midlands',
    'Greater Manchester',
    'West Yorkshire',
    'Scotland',
    'Wales',
  ],
  'Malaysia': [
    'Kuala Lumpur',
    'Selangor',
    'Penang',
    'Johor',
    'Putrajaya',
    'Melaka',
  ],
  'Qatar': [
    'Doha',
    'Al Rayyan',
    'Al Wakrah',
    'Al Daayen (Lusail)',
    'Umm Salal',
  ],
};

export const DISTRICTS_AND_CITIES_BY_STATE = {
  // UAE
  'Dubai': {
    city: 'Dubai',
    districts: [
      'Downtown Dubai',
      'Palm Jumeirah',
      'Dubai Marina',
      'Business Bay',
      'Jumeirah Beach Residence (JBR)',
      'Jumeirah 1 / 2 / 3',
      'DIFC',
      'Dubai Hills Estate',
      'Arabian Ranches',
      'Al Barsha',
      'City Walk',
      'Deira',
      'Bur Dubai',
      'JLT (Jumeirah Lake Towers)',
      'Mirdif',
      'Bluewaters Island',
      'Umm Suqeim',
      'Al Safa',
    ],
  },
  'Abu Dhabi': {
    city: 'Abu Dhabi',
    districts: [
      'Corniche',
      'Al Reem Island',
      'Saadiyat Island',
      'Yas Island',
      'Al Maryah Island',
      'Al Khalidiya',
      'Al Bateen',
      'Khalifa City',
      'Mohammed Bin Zayed City',
      'Al Mushrif',
    ],
  },
  'Sharjah': {
    city: 'Sharjah',
    districts: [
      'Al Majaz',
      'Al Qasimia',
      'Al Nahda',
      'Muwaileh',
      'Al Khan',
      'Al Taawun',
      'Al Mamzar',
    ],
  },
  'Ajman': {
    city: 'Ajman',
    districts: ['Al Nuaimiya', 'Al Rashidiya', 'Al Jurf', 'Ajman Corniche'],
  },
  'Ras Al Khaimah': {
    city: 'Ras Al Khaimah',
    districts: ['Al Hamra Village', 'Mina Al Arab', 'Al Nakheel', 'Marjan Island'],
  },
  'Fujairah': {
    city: 'Fujairah',
    districts: ['Al Faseel', 'Fujairah City Centre', 'Dibba'],
  },
  'Umm Al Quwain': {
    city: 'Umm Al Quwain',
    districts: ['Al Salamah', 'Old Town', 'Umm Al Thoub'],
  },

  // India
  'Tamil Nadu': {
    city: 'Chennai',
    districts: [
      'T. Nagar (Chennai)',
      'Adyar (Chennai)',
      'Mylapore (Chennai)',
      'Anna Nagar (Chennai)',
      'Velachery (Chennai)',
      'Besant Nagar (Chennai)',
      'Nungambakkam (Chennai)',
      'Alwarpet (Chennai)',
      'Guindy (Chennai)',
      'Coimbatore City',
      'Madurai City',
      'Trichy City',
      'Salem City',
      'Erode City',
    ],
  },
  'Karnataka': {
    city: 'Bengaluru (Bangalore)',
    districts: [
      'Indiranagar (Bengaluru)',
      'Koramangala (Bengaluru)',
      'Whitefield (Bengaluru)',
      'HSR Layout (Bengaluru)',
      'Jayanagar (Bengaluru)',
      'MG Road / CBD (Bengaluru)',
      'Malleshwaram (Bengaluru)',
      'Electronic City (Bengaluru)',
      'Mysuru City',
      'Mangaluru City',
    ],
  },
  'Maharashtra': {
    city: 'Mumbai',
    districts: [
      'South Mumbai (Colaba/Cuffe Parade)',
      'Bandra West (Mumbai)',
      'Juhu (Mumbai)',
      'Andheri West (Mumbai)',
      'Powai (Mumbai)',
      'Worli / Lower Parel (Mumbai)',
      'Pune City',
      'Koregaon Park (Pune)',
      'Navi Mumbai',
      'Thane City',
      'Nagpur City',
    ],
  },
  'Delhi (NCT)': {
    city: 'New Delhi',
    districts: [
      'Connaught Place (Central Delhi)',
      'South Extension / GK (South Delhi)',
      'Vasant Kunj (South Delhi)',
      'Hauz Khas (South Delhi)',
      'Chanakyapuri (Diplomatic Enclave)',
      'Civil Lines (North Delhi)',
      'Dwarka (South West Delhi)',
      'Noida / NCR',
      'Gurugram (Gurgaon)',
    ],
  },
  'Kerala': {
    city: 'Kochi (Cochin)',
    districts: [
      'Marine Drive / Panampilly (Kochi)',
      'Fort Kochi / Mattancherry',
      'Kakkanad / Infopark (Kochi)',
      'Thiruvananthapuram City',
      'Kozhikode City',
      'Thrissur City',
    ],
  },
  'Telangana': {
    city: 'Hyderabad',
    districts: [
      'Banjara Hills (Hyderabad)',
      'Jubilee Hills (Hyderabad)',
      'Gachibowli / Hitec City (Hyderabad)',
      'Madhapur (Hyderabad)',
      'Secunderabad',
    ],
  },
  'Gujarat': {
    city: 'Ahmedabad',
    districts: [
      'Bodakdev / SG Highway (Ahmedabad)',
      'Navrangpura (Ahmedabad)',
      'Surat City',
      'Vadodara City',
    ],
  },
  'West Bengal': {
    city: 'Kolkata',
    districts: [
      'Park Street / Ballygunge (Kolkata)',
      'Salt Lake / Sector V (Kolkata)',
      'New Town (Kolkata)',
      'Alipore (Kolkata)',
    ],
  },

  // USA
  'California': {
    city: 'Los Angeles',
    districts: [
      'Beverly Hills',
      'West Hollywood',
      'Santa Monica',
      'Downtown Los Angeles',
      'Irvine / Orange County',
      'San Francisco (Nob Hill/SOMA)',
      'San Diego (La Jolla)',
      'San Jose / Silicon Valley',
    ],
  },
  'New York': {
    city: 'New York City',
    districts: [
      'Manhattan (Upper East Side)',
      'Manhattan (SoHo / Tribeca)',
      'Manhattan (Midtown)',
      'Brooklyn (Williamsburg / DUMBO)',
      'Brooklyn Heights',
      'Queens (Astoria / LIC)',
    ],
  },
  'Texas': {
    city: 'Austin',
    districts: [
      'Downtown Austin',
      'Houston (River Oaks / Galleria)',
      'Dallas (Uptown / Highland Park)',
      'Fort Worth',
    ],
  },
  'Florida': {
    city: 'Miami',
    districts: [
      'South Beach (Miami Beach)',
      'Brickell / Downtown Miami',
      'Coral Gables',
      'Fort Lauderdale',
      'Orlando Downtown',
    ],
  },

  // Singapore
  'Central Region': {
    city: 'Singapore',
    districts: [
      'Orchard / River Valley',
      'Downtown Core / Marina Bay',
      'Sentosa / Harbourfront',
      'Bukit Timah',
      'Tanglin / Botanic Gardens',
      'Newton / Novena',
    ],
  },
  'East Region': {
    city: 'Singapore',
    districts: ['Marine Parade / Katong', 'East Coast', 'Tampines', 'Bedok'],
  },
  'West Region': {
    city: 'Singapore',
    districts: ['Clementi', 'Jurong East', 'Buona Vista / One-North'],
  },

  // Oman
  'Muscat': {
    city: 'Muscat',
    districts: [
      'Al Mouj / Wave',
      'Shatti Al Qurum',
      'Al Qurum',
      'Al Khuwair',
      'Madinat As Sultan Qaboos',
      'Muttrah',
      'Ruwi',
      'Azaiba',
      'Bawshar',
    ],
  },
  'Dhofar (Salalah)': {
    city: 'Salalah',
    districts: ['Salalah City', 'Hawana Salalah', 'Al Haffa', 'Dahariz'],
  },

  // Saudi Arabia
  'Riyadh Region': {
    city: 'Riyadh',
    districts: [
      'Olaya / King Fahd',
      'Al Malaz',
      'Al Nakheel',
      'Al Yasmin',
      'Diplomatic Quarter',
      'Al Aqiq',
      'Hittin',
    ],
  },
  'Makkah Region (Jeddah)': {
    city: 'Jeddah',
    districts: [
      'Al Rawdah',
      'Al Shatie / Corniche',
      'Al Hamra',
      'Al Andalus',
      'Al Salamah',
    ],
  },
  'Eastern Province (Dammam/Khobar)': {
    city: 'Al Khobar',
    districts: [
      'Al Khobar Corniche',
      'Al Rakah',
      'Dammam City',
      'Dhahran',
    ],
  },

  // UK
  'Greater London': {
    city: 'London',
    districts: [
      'City of Westminster / Mayfair',
      'Kensington & Chelsea',
      'City of London',
      'Camden / Hampstead',
      'Islington',
      'Richmond upon Thames',
      'Canary Wharf / Docklands',
    ],
  },
  'Greater Manchester': {
    city: 'Manchester',
    districts: ['Manchester City Centre', 'Salford Quays', 'Didsbury', 'Altrincham'],
  },

  // Malaysia
  'Kuala Lumpur': {
    city: 'Kuala Lumpur',
    districts: [
      'KLCC / City Centre',
      'Bangsar',
      'Mont Kiara',
      'Bukit Bintang',
      'Damansara Heights',
      'Mid Valley',
    ],
  },
  'Selangor': {
    city: 'Petaling Jaya',
    districts: [
      'Petaling Jaya (PJ)',
      'Subang Jaya',
      'Shah Alam',
      'Cyberjaya',
      'Bandar Utama',
    ],
  },

  // Qatar
  'Doha': {
    city: 'Doha',
    districts: [
      'The Pearl-Qatar',
      'West Bay / Diplomatic Area',
      'Lusail City',
      'Msheireb Downtown',
      'Al Sadd',
      'Corniche',
    ],
  },
};

export function getCountryData(countryName) {
  return (
    COUNTRIES_LIST.find(
      (c) => c.name.toLowerCase() === (countryName || '').toLowerCase()
    ) || COUNTRIES_LIST[0]
  );
}

export function getStatesForCountry(countryName) {
  return STATES_BY_COUNTRY[countryName] || [];
}

export function getDistrictsAndCityForState(stateName) {
  return (
    DISTRICTS_AND_CITIES_BY_STATE[stateName] || {
      city: stateName || '',
      districts: [],
    }
  );
}
