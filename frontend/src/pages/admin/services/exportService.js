import api from '../../../services/api';
import { db } from '../../../config/firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

const LOCAL_ENQUIRIES_KEY = 'dhanvikk_export_enquiries';
const LOCAL_SHIPMENTS_KEY = 'dhanvikk_export_shipments';
const LOCAL_CUSTOMERS_KEY = 'dhanvikk_export_customers';
const LOCAL_SETTINGS_KEY = 'dhanvikk_export_settings';

// Realistic sample seed data for international export business
const DEFAULT_ENQUIRIES = [
  {
    id: 'ENQ-2026-081',
    buyerName: 'Sheikh Hamdan Al Maktoum',
    companyName: 'Royal Gulf Floral Distribution LLC',
    email: 'procurement@royalgulf.ae',
    phone: '+971 4 398 7200',
    country: 'United Arab Emirates',
    destinationPort: 'Dubai Cargo Terminal (DXB)',
    productInterest: 'Dutch Velvet Roses (60-80cm Stems)',
    targetVolume: '25,000 stems weekly',
    preferredIncoterm: 'CIF',
    message: 'We require weekly scheduled charter shipments of Grade A+ long stem Dutch Velvet Red & Ivory roses under strict cold-chain (3°C) for luxury hotel partners in Dubai & Abu Dhabi.',
    status: 'Quoted',
    quoteAmountUSD: 42500,
    assignedToName: 'Divagar M (Super Admin)',
    internalNotes: ['Confirmed 4°C refrigerated container availability via Emirates SkyCargo.', 'Offered $1.70 per stem CIF DXB.'],
    timeline: [
      { action: 'Inquiry received via global export portal', timestamp: '2026-10-28T08:30:00Z', author: 'System' },
      { action: 'Assigned to Divagar M', timestamp: '2026-10-28T09:15:00Z', author: 'Divagar M' },
      { action: 'Formal CIF DXB quotation submitted ($42,500)', timestamp: '2026-10-29T14:20:00Z', author: 'Divagar M' },
    ],
    createdAt: '2026-10-28T08:30:00Z',
  },
  {
    id: 'ENQ-2026-082',
    buyerName: 'Dr. Klaus Becker',
    companyName: 'Bavaria Blumen Import GmbH',
    email: 'klaus.becker@bavaria-blumen.de',
    phone: '+49 89 2180 0',
    country: 'Germany',
    destinationPort: 'Frankfurt Airport (FRA)',
    productInterest: 'Highland Living Orchids & Preserved Forever Domes',
    targetVolume: '1,200 potted boxes',
    preferredIncoterm: 'FOB',
    message: 'Seeking certified GlobalGAP exotic potted Phalaenopsis orchids for German luxury garden boutique chains. Require phytosanitary certificate and barcoded master export boxes.',
    status: 'New',
    quoteAmountUSD: 18900,
    assignedToName: 'Maya Krishnan',
    internalNotes: ['Pending Phytosanitary export protocol verification for EU imports.'],
    timeline: [
      { action: 'Inquiry logged', timestamp: '2026-10-29T11:00:00Z', author: 'System' },
    ],
    createdAt: '2026-10-29T11:00:00Z',
  },
  {
    id: 'ENQ-2026-083',
    buyerName: 'Fahad Al-Otaibi',
    companyName: 'Riyadh Grand Floriculture Co.',
    email: 'fahad@riyadhflorals.sa',
    phone: '+966 11 478 9000',
    country: 'Saudi Arabia',
    destinationPort: 'King Khalid Airport (RUH)',
    productInterest: 'Parisian Suede Hatboxes & Wedding Stems',
    targetVolume: '8,000 arrangements monthly',
    preferredIncoterm: 'CIF',
    message: 'High-volume contract inquiry for Saudi National Day & Riyadh Season gala events. Need expedited customs clearance documents and temperature dataloggers in each crate.',
    status: 'Contacted',
    quoteAmountUSD: 68000,
    assignedToName: 'Arjun Nambiar',
    internalNotes: ['Sample box dispatched via DHL Express with USB cold-chain temperature logger.'],
    timeline: [
      { action: 'Inquiry received', timestamp: '2026-10-27T16:40:00Z', author: 'System' },
      { action: 'Introductory phone call completed; samples arranged', timestamp: '2026-10-28T10:00:00Z', author: 'Arjun Nambiar' },
    ],
    createdAt: '2026-10-27T16:40:00Z',
  },
];

const DEFAULT_SHIPMENTS = [
  {
    id: 'EXP-SHP-904',
    orderNumber: 'DHN-EXP-2026-001',
    buyerCompany: 'Royal Gulf Floral Distribution LLC',
    buyerName: 'Sheikh Hamdan Al Maktoum',
    destinationPort: 'Dubai Cargo Terminal (DXB)',
    incoterm: 'CIF',
    carrierName: 'Emirates SkyCargo EK-501',
    awbOrBlNumber: '176-9281-4402',
    totalAmountUSD: 42500,
    paymentStatus: 'Advance Received',
    shippingStatus: 'In Transit',
    departureDate: '2026-10-30T06:00:00Z',
    estimatedArrival: '2026-10-30T16:30:00Z',
    temperatureTelemetry: {
      targetTemp: '3.5°C',
      currentTemp: '3.6°C',
      humidity: '87%',
      lastPing: '2026-10-30T12:45:00Z',
    },
    itemsSummary: '25,000x Dutch Velvet Long Stem Roses (Grade A+)',
    milestones: [
      { title: 'Packed & Hydrated', status: 'completed', time: '2026-10-29 18:00' },
      { title: 'Phytosanitary Clearance', status: 'completed', time: '2026-10-29 22:30' },
      { title: 'Customs Air Cargo Cleared', status: 'completed', time: '2026-10-30 04:15' },
      { title: 'Departed Port of Loading (BLR)', status: 'completed', time: '2026-10-30 06:00' },
      { title: 'Arrived Port of Discharge (DXB)', status: 'in_progress', time: 'Est. 16:30' },
      { title: 'Doorstep Cold-Chain Drop-off', status: 'pending', time: 'Est. 19:00' },
    ],
  },
  {
    id: 'EXP-SHP-903',
    orderNumber: 'DHN-EXP-2026-002',
    buyerCompany: 'SingaBloom International Pte Ltd',
    buyerName: 'Mei Ling Tan',
    destinationPort: 'Singapore Changi Cargo (SIN)',
    incoterm: 'FOB',
    carrierName: 'Singapore Airlines Cargo SQ-402',
    awbOrBlNumber: '618-1092-8811',
    totalAmountUSD: 16800,
    paymentStatus: 'Paid',
    shippingStatus: 'Delivered',
    departureDate: '2026-10-26T02:00:00Z',
    estimatedArrival: '2026-10-26T09:40:00Z',
    temperatureTelemetry: {
      targetTemp: '4.0°C',
      currentTemp: '3.9°C',
      humidity: '85%',
      lastPing: '2026-10-26T10:00:00Z',
    },
    itemsSummary: '450x Velvet Keepsake Hatboxes + Living Orchids',
    milestones: [
      { title: 'Packed & Hydrated', status: 'completed', time: '2026-10-25 14:00' },
      { title: 'Phytosanitary Clearance', status: 'completed', time: '2026-10-25 19:00' },
      { title: 'Customs Air Cargo Cleared', status: 'completed', time: '2026-10-25 23:40' },
      { title: 'Departed Port of Loading', status: 'completed', time: '2026-10-26 02:00' },
      { title: 'Arrived Port of Discharge (SIN)', status: 'completed', time: '2026-10-26 09:40' },
      { title: 'Doorstep Cold-Chain Drop-off', status: 'completed', time: '2026-10-26 12:30' },
    ],
  },
];

const DEFAULT_SETTINGS = {
  companyName: 'Dhanvikk Exports & Floriculture Private Limited',
  iecCode: 'IEC-072026-BLM-991',
  gstin: '33AAACD1234F1Z5',
  apedaRegNo: 'APEDA/FLOR/2026/0419',
  headquarters: 'Signature Botanical Tower, Central Floristry District, Hosur - 635109, Tamil Nadu, India',
  exportPort: 'Kempegowda International Airport (BLR) & Chennai Air Cargo (MAA)',
  contactEmail: 'export@dhanvikk.com',
  directorEmail: 'divagar.m.msc.cs@gmail.com',
  phone: '+91 98765 43210',
  swiftCode: 'HDFCINBBXXX',
  bankName: 'HDFC Bank - International Commercial Trade Branch',
  bankAccountNumber: '50200088991122',
  bankBranch: 'Bengaluru Industrial & Export Hub',
};

export const exportService = {
  // ─── Enquiries CRM ────────────────────────────────────────────────────────
  async getAllEnquiries() {
    try {
      const saved = localStorage.getItem(LOCAL_ENQUIRIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(LOCAL_ENQUIRIES_KEY, JSON.stringify(DEFAULT_ENQUIRIES));
    return DEFAULT_ENQUIRIES;
  },

  async updateEnquiryStatus(id, newStatus, note, authorName = 'Operations Lead') {
    const list = await this.getAllEnquiries();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const timelineEntry = {
      action: `Status changed to ${newStatus}${note ? `: "${note}"` : ''}`,
      timestamp: new Date().toISOString(),
      author: authorName,
    };

    list[idx] = {
      ...list[idx],
      status: newStatus,
      timeline: [timelineEntry, ...(list[idx].timeline || [])],
      updatedAt: new Date().toISOString(),
    };

    if (note) {
      list[idx].internalNotes = [note, ...(list[idx].internalNotes || [])];
    }

    localStorage.setItem(LOCAL_ENQUIRIES_KEY, JSON.stringify(list));
    return list[idx];
  },

  async createEnquiry(enquiryData) {
    const list = await this.getAllEnquiries();
    const newEnquiry = {
      id: `ENQ-${Date.now().toString().slice(-4)}`,
      status: 'New',
      timeline: [
        { action: 'Inquiry submitted via Export Portal', timestamp: new Date().toISOString(), author: 'System' },
      ],
      createdAt: new Date().toISOString(),
      internalNotes: [],
      ...enquiryData,
    };
    const updated = [newEnquiry, ...list];
    localStorage.setItem(LOCAL_ENQUIRIES_KEY, JSON.stringify(updated));
    return newEnquiry;
  },

  // ─── Shipments & International Logistics ─────────────────────────────────
  async getAllShipments() {
    try {
      const saved = localStorage.getItem(LOCAL_SHIPMENTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(LOCAL_SHIPMENTS_KEY, JSON.stringify(DEFAULT_SHIPMENTS));
    return DEFAULT_SHIPMENTS;
  },

  async updateShipmentStatus(id, newStatus) {
    const list = await this.getAllShipments();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      shippingStatus: newStatus,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_SHIPMENTS_KEY, JSON.stringify(list));
    return list[idx];
  },

  // ─── Export Settings ─────────────────────────────────────────────────────
  async getExportSettings() {
    try {
      const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  },

  async updateExportSettings(newSettings) {
    const merged = { ...DEFAULT_SETTINGS, ...newSettings };
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  },
};

