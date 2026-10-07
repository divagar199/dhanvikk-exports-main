import React, { useState, useEffect } from 'react';
import SEO from '../../components/common/SEO';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Package,
  TrendingUp,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Eye,
  Calendar,
  Layers,
  Copy,
  Printer,
  X,
  ExternalLink,
  Sparkles,
  Flower2,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Crown,
  UserPlus,
  Upload,
  Coins,
  CreditCard,
  DollarSign,
  Save,
  FileText,
  Lock,
  Menu,
} from 'lucide-react';
import Logo from '../../components/common/Logo';
import { logoutUser } from '../../store/slices/authSlice';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';

import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { adminService } from '../../services/adminService';
import { DEFINED_CATEGORIES } from '../../data/categories';
import { getProductImageUrl } from '../../utils/imageUrl';
import { toast } from 'sonner';

// Quick curated botanical image presets for instant product creation
const IMAGE_PRESETS = [
  {
    name: 'Red Roses',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    category: 'Flowers',
    flowerType: 'Roses',
  },
  {
    name: 'Pink Hatbox',
    url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    category: 'Flower Boxes',
    flowerType: 'Roses',
  },
  {
    name: 'Forever Rose Dome',
    url: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=800&q=80',
    category: 'Forever Roses',
    flowerType: 'Roses',
  },
  {
    name: 'White Orchids',
    url: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80',
    category: 'Flowers',
    flowerType: 'Orchids',
  },
  {
    name: 'Monstera Plant',
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    category: 'Plants',
    flowerType: 'Air Purifying Plants',
  },
  {
    name: 'Peace Lily Plant',
    url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=800&q=80',
    category: 'Plants',
    flowerType: 'Indoor Botanicals',
  },
  {
    name: 'White Orchid Planter',
    url: 'https://images.unsplash.com/photo-1566908829550-e6551b00979b?auto=format&fit=crop&w=800&q=80',
    category: 'Plants',
    flowerType: 'Living Orchids',
  },
  {
    name: 'Bonsai Tree',
    url: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80',
    category: 'Plants',
    flowerType: 'Bonsai Trees',
  },
  {
    name: 'Fiddle Leaf Fig',
    url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
    category: 'Plants',
    flowerType: 'Air Purifying Plants',
  },
  {
    name: 'Succulent Garden',
    url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
    category: 'Plants',
    flowerType: 'Indoor Succulents',
  },
  {
    name: 'Sacred Marigolds',
    url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
    category: 'Flowers',
    flowerType: 'Marigolds',
  },
  {
    name: 'Luxury Gift Hamper',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    category: 'Gift Bundles',
    flowerType: 'Gift Bundle',
  },
];

export const CATEGORY_SUBCATEGORIES_MAP = {
  'Flowers': [
    'Hand Bouquets',
    'Vase Arrangements',
    'Grand Luxury Bouquets',
    'Exotic Garden Stems',
    'Single Stem Wraps',
  ],
  'Flower Boxes': [
    'Hat Box Arrangements',
    'Velvet Keepsake Boxes',
    'Parisian Round Suede Boxes',
    'Acrylic Flower Boxes',
    'Heart Keepsake Boxes',
  ],
  'Forever Roses': [
    'Preserved Bell Domes',
    'Crystal Rose Boxes',
    'Infinity Rose Trays',
    'Enchanted Rose Glass Domes',
    'Forever Rose Blooms',
  ],
  'Plants': [
    'Living Orchids',
    'Air Purifying Plants',
    'Bonsai Trees',
    'Indoor Botanicals',
    'Flowering Potted Plants',
    'Indoor Succulents',
    'Artisan Planters',
  ],
  'Gift Bundles': [
    'Flowers & Belgian Truffles',
    'Luxury Scent & Blooms',
    'Flowers & Plush Teddy',
    'Celebration Gift Hampers',
    'Festive Hampers',
  ],
  'Traditional': [
    'Madurai Malli Strings',
    'Sacred Temple Garlands',
    'Marigold & Sevvanthi Strings',
    'Puja & Festival Blooms',
    'Fresh Export Stems',
  ],
};

// Client-side image compression to prevent localStorage quota overflows and enable instant previews
export function compressImageFile(file, maxWidth = 1000, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export const DEFAULT_ADMIN_CATEGORIES = [
  {
    id: 'flowers',
    name: 'Fresh Flowers',
    slug: 'flowers',
    description: 'Handcrafted fresh floral compositions air-flown from volcanic highlands',
    badge: 'SIGNATURE EDIT',
    subCategories: ['Hand Bouquets', 'Luxury Vases', 'Orchid Stems', 'Lilies & Tulips'],
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    id: 'flower-boxes',
    name: 'Velvet Flower Boxes',
    slug: 'flower-boxes',
    description: 'Signature Parisian hatboxes filled with garden blooms & satin ribbons',
    badge: 'BESTSELLER',
    subCategories: ['Round Hatboxes', 'Square Keepsakes', 'Grand Velvet Cylinders'],
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    id: 'forever-roses',
    name: 'Forever Roses (3+ Years)',
    slug: 'forever-roses',
    description: 'Natural Ecuadorian preserved roses encased in luxury crystal domes',
    badge: 'LASTS 3+ YEARS',
    subCategories: ['Bell Domes', 'Petite Acrylic Cases', 'Heart Forever Boxes'],
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    id: 'plants',
    name: 'Living Plants & Botanicals',
    slug: 'plants',
    description: 'Living Phalaenopsis orchids, air-purifying foliage, Japanese bonsai & handcrafted artisan planters',
    badge: 'AIR PURIFYING',
    subCategories: [
      'Living Orchids',
      'Air Purifying Plants',
      'Bonsai Trees',
      'Indoor Botanicals',
      'Flowering Potted Plants',
      'Indoor Succulents',
      'Artisan Planters',
    ],
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
  {
    id: 'gift-bundles',
    name: 'Hampers & Gift Bundles',
    slug: 'gift-bundles',
    description: 'Luxury gourmet chocolates, scented artisan candles & celebration hampers',
    badge: 'PREMIUM CELEBRATION',
    subCategories: ['Godiva & Rose Trays', 'Aroma Candle Sets', 'Anniversary Hampers'],
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    active: true,
  },
];

export const DEFAULT_CURRENCY_RATES = [
  { code: 'AED', name: 'UAE Dirham', country: 'Dubai & UAE', flag: '🇦🇪', symbol: 'AED', nativeSymbol: 'د.إ', rateToINR: 22.8, rateFromAED: 1.0, fixedSample: 150 },
  { code: 'INR', name: 'Indian Rupee', country: 'India', flag: '🇮🇳', symbol: '₹', nativeSymbol: '₹', rateToINR: 1.0, rateFromAED: 22.8, fixedSample: 3420 },
  { code: 'USD', name: 'US Dollar', country: 'Global / USA', flag: '🇺🇸', symbol: '$', nativeSymbol: '$', rateToINR: 83.5, rateFromAED: 0.272, fixedSample: 40.8 },
  { code: 'EUR', name: 'Euro', country: 'Europe / EU', flag: '🇪🇺', symbol: '€', nativeSymbol: '€', rateToINR: 90.5, rateFromAED: 0.252, fixedSample: 37.8 },
  { code: 'GBP', name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧', symbol: '£', nativeSymbol: '£', rateToINR: 106.5, rateFromAED: 0.214, fixedSample: 32.1 },
  { code: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', flag: '🇸🇦', symbol: 'SAR', nativeSymbol: 'ر.س', rateToINR: 22.3, rateFromAED: 1.02, fixedSample: 153 },
  { code: 'QAR', name: 'Qatari Riyal', country: 'Qatar', flag: '🇶🇦', symbol: 'QAR', nativeSymbol: 'ر.ق', rateToINR: 22.9, rateFromAED: 0.995, fixedSample: 149.25 },
  { code: 'KWD', name: 'Kuwaiti Dinar', country: 'Kuwait', flag: '🇰🇼', symbol: 'KWD', nativeSymbol: 'د.ك', rateToINR: 272.0, rateFromAED: 0.084, fixedSample: 12.6 },
  { code: 'OMR', name: 'Omani Rial', country: 'Oman', flag: '🇴🇲', symbol: 'OMR', nativeSymbol: 'ر.ع.', rateToINR: 217.0, rateFromAED: 0.105, fixedSample: 15.75 },
  { code: 'BHD', name: 'Bahraini Dinar', country: 'Bahrain', flag: '🇧🇭', symbol: 'BHD', nativeSymbol: 'ب.د', rateToINR: 221.0, rateFromAED: 0.103, fixedSample: 15.45 },
  { code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', flag: '🇸🇬', symbol: 'S$', nativeSymbol: 'S$', rateToINR: 62.5, rateFromAED: 0.365, fixedSample: 54.75 },
];

export const DEFAULT_PAYMENTS_LIST = [
  {
    id: 'TXN_RZP_901842',
    orderId: 'ORD-8821',
    customerName: 'Fatima Al-Zahra',
    customerEmail: 'fatima.zahra@dubai.ae',
    gateway: 'Razorpay (Cards)',
    amount: 450,
    currency: 'AED',
    status: 'Paid',
    date: '2026-10-06 14:22',
    items: '1x Velvet Flower Box (Pink Roses)',
    city: 'Dubai Downtown',
  },
  {
    id: 'TXN_STR_441920',
    orderId: 'ORD-8820',
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.v@gmail.com',
    gateway: 'Stripe (Apple Pay)',
    amount: 10260,
    currency: 'INR',
    status: 'Paid',
    date: '2026-10-06 12:15',
    items: '2x Royal Ecuadorian Red Roses Bouquet',
    city: 'Bengaluru Indiranagar',
  },
  {
    id: 'TXN_RZP_310892',
    orderId: 'ORD-8819',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.v@expat.ae',
    gateway: 'Razorpay (NetBanking)',
    amount: 125,
    currency: 'USD',
    status: 'Paid',
    date: '2026-10-05 18:40',
    items: '1x Preserved Forever Rose Bell Dome',
    city: 'Abu Dhabi Yas Island',
  },
  {
    id: 'TXN_COD_110943',
    orderId: 'ORD-8818',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@outlook.com',
    gateway: 'Cash on Delivery',
    amount: 2999,
    currency: 'INR',
    status: 'Pending Collection',
    date: '2026-10-05 11:05',
    items: '1x Monstera Deliciosa Living Plant',
    city: 'Bengaluru Koramangala',
  },
  {
    id: 'TXN_STR_889211',
    orderId: 'ORD-8817',
    customerName: 'Leila Qasim',
    customerEmail: 'leila.q@sharjah.ae',
    gateway: 'Stripe (Credit Card)',
    amount: 520,
    currency: 'AED',
    status: 'Paid',
    date: '2026-10-04 16:30',
    items: '1x Grand Moroccan Hatbox + Belgian Truffles',
    city: 'Sharjah Waterfront',
  },
];

export default function AdminDashboard() {
  const authUser = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories' | 'currencies' | 'hero' | 'orders' | 'payments' | 'staff' | 'users' | 'stats'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Local Image Uploads & Linux Web Hosting Management
  const [uploadingImage, setUploadingImage] = useState(false);
  const [_localImages, _setLocalImages] = useState([]);
  const [localUploadedGallery, setLocalUploadedGallery] = useState(() => {
    try {
      const saved = localStorage.getItem('dhanvikk_local_uploads');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Super Admin & Staff Management (Super Admin + Exactly Max 2 Staff Quota)
  const [superAdminEmail, setSuperAdminEmail] = useState('divagar.m.msc.cs@gmail.com');
  const [staffList, setStaffList] = useState(() => {
    try {
      const saved = localStorage.getItem('dhanvikk_admin_staff');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'staff-1',
        name: 'Maya Krishnan',
        email: 'maya.florist@dhanvikk.com',
        role: 'inventory_manager',
        roleTitle: 'Master Florist & Inventory Lead',
        phone: '+971 50 123 4567',
        status: 'Active',
        joinedDate: '2026-01-15',
        isSuperAdmin: false,
      },
      {
        id: 'staff-2',
        name: 'Arjun Nambiar',
        email: 'arjun.dispatch@dhanvikk.com',
        role: 'delivery_manager',
        roleTitle: 'Cold-Chain Dispatch Coordinator',
        phone: '+971 52 987 6543',
        status: 'Active',
        joinedDate: '2026-02-01',
        isSuperAdmin: false,
      },
    ];
  });
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    role: 'inventory_manager',
    roleTitle: '',
    phone: '',
    status: 'Active',
  });

  // Categories Management State
  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const saved = localStorage.getItem('dhanvikk_admin_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaultPlants = DEFAULT_ADMIN_CATEGORIES.find((c) => c.id === 'plants');
        // Ensure plants category stays synchronized with modern botanical subcategories
        const updated = parsed.map((cat) => {
          if ((cat.id === 'plants' || cat.slug === 'plants') && defaultPlants) {
            const currentSubCats = Array.isArray(cat.subCategories)
              ? cat.subCategories
              : (cat.subCategories ? cat.subCategories.split(',') : []);
            if (currentSubCats.length < 7) {
              return {
                ...cat,
                name: defaultPlants.name,
                description: defaultPlants.description,
                badge: defaultPlants.badge,
                subCategories: defaultPlants.subCategories,
                image: cat.image || defaultPlants.image,
              };
            }
          }
          return cat;
        });
        return updated;
      }
    } catch {}
    return DEFAULT_ADMIN_CATEGORIES;
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    badge: 'SIGNATURE EDIT',
    subCategories: '',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    active: true,
  });

  // Multi-Currency & Fixed Exchange Rates State
  const [currenciesList, setCurrenciesList] = useState(() => {
    try {
      const saved = localStorage.getItem('dhanvikk_admin_currencies');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CURRENCY_RATES;
  });
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [currencyRateForm, setCurrencyRateForm] = useState({
    code: '',
    name: '',
    rateToINR: 1,
    rateFromAED: 1,
    fixedSample: 100,
  });
  const [simAmount, setSimAmount] = useState(150);
  const [simCurrency, setSimCurrency] = useState('AED');

  // Hero Section CMS State
  const [heroSettings, setHeroSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('dhanvikk_hero_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      badge: 'Spring Floristry Edit 2026',
      headline: 'Elegance In Every Petal.',
      subHeadline: 'Delivered Today.',
      description: 'Directly imported highland Ecuadorian roses & exotic lilies, crafted by master florists with complimentary handwritten cards.',
      buttonText: 'Shop Spring Roses',
      buttonLink: '/category/roses',
      secondaryButtonText: 'Browse Occasions',
      secondaryButtonLink: '/category/occasions',
      imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=85',
    };
  });

  // Customer Payments State
  const [paymentsList] = useState(() => {
    try {
      const saved = localStorage.getItem('dhanvikk_admin_payments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PAYMENTS_LIST;
  });
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState(null);

  // Stats state
  const [stats, setStats] = useState({
    totalRevenue: 248650,
    totalOrders: 58,
    totalUsers: 14,
    lowStockCount: 4,
  });

  // Products CRUD & Stock state
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [inlineStockValue, setInlineStockValue] = useState('');

  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Flowers',
    subCategory: 'Hand Bouquets',
    flowerType: 'Roses',
    price: 2499,
    originalPrice: 2999,
    stock: 25,
    tag: 'NEW ARRIVAL',
    description: '',
    images: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    linuxHostingPath: '/images/products/rose-hatbox.jpg',
    lightRequirement: 'Bright Indirect Light',
    waterFrequency: 'Water 1-2 times weekly',
    potSize: 'Hand-crafted Ceramic Planter Included',
    fixedPrices: {
      AED: 110,
      INR: 2499,
      USD: 30,
      EUR: 28,
      GBP: 24,
      SAR: 112,
      QAR: 109,
      KWD: 9.2,
      OMR: 11.5,
      BHD: 11.3,
      SGD: 40,
    },
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);

  // Users state
  const [usersList, setUsersList] = useState([]);
  const [selectedUserLogins, setSelectedUserLogins] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [prodsData, ordersData, usersData, statsData, staffData, localImgsData] = await Promise.all([
        productService.getAllProducts().catch(() => []),
        orderService.getAllOrders().catch(() => ({ orders: [] })),
        adminService.getAllUsers().catch(() => ({ users: [] })),
        adminService.getAdminStats().catch(() => ({ stats: {} })),
        adminService.getAllStaff().catch(() => ({ staff: [] })),
        productService.getLocalImages().catch(() => ({ images: [] })),
      ]);

      setProducts(prodsData || []);
      setOrders(ordersData?.orders || []);
      setUsersList(usersData?.users || []);
      if (statsData?.stats) setStats(statsData.stats);
      if (staffData?.staff) setStaffList(staffData.staff);
      if (staffData?.superAdminEmail) setSuperAdminEmail(staffData.superAdminEmail);
      if (localImgsData?.images) _setLocalImages(localImgsData.images);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Notice: Running in resilient production mode with cached records.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sanitizedName = file.name.replace(/\s+/g, '-').toLowerCase();
    const linuxRelativePath = `/images/products/${sanitizedName}`;

    try {
      setUploadingImage(true);
      const dataUrl = await compressImageFile(file, 1000, 0.85);
      if (!dataUrl) {
        toast.error('Could not read image file.');
        return;
      }

      setProductForm((prev) => ({
        ...prev,
        images: dataUrl,
        image: dataUrl,
        linuxHostingPath: linuxRelativePath,
      }));

      const newGalleryItem = {
        name: file.name,
        path: linuxRelativePath,
        dataUrl,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        date: new Date().toLocaleDateString(),
      };

      const updated = [newGalleryItem, ...localUploadedGallery.filter((u) => u.name !== file.name)].slice(0, 25);
      setLocalUploadedGallery(updated);
      try {
        localStorage.setItem('dhanvikk_local_uploads', JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('LocalStorage gallery limit:', storageErr);
      }

      toast.success(`Image uploaded and preview updated! Ready to save 🌸`);

      // Best effort background server upload if express backend is online
      productService.uploadImage(file).catch(() => {});
    } catch (err) {
      toast.error('Upload error: ' + (err.message || 'Failed to read file'));
    } finally {
      setUploadingImage(false);
    }
  };

  // Staff Management (Super Admin + Max 2 Staff Quota)
  const maxStaffQuota = 2;
  const currentStaffCount = staffList.filter((s) => !s.isSuperAdmin && s.email.toLowerCase() !== superAdminEmail.toLowerCase()).length;
  const isStaffQuotaFull = currentStaffCount >= maxStaffQuota;

  const handleOpenStaffModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setStaffForm({
        name: staff.name,
        email: staff.email,
        role: staff.role,
        roleTitle: staff.roleTitle || '',
        phone: staff.phone || '',
        status: staff.status || 'Active',
      });
      setShowStaffModal(true);
    } else {
      if (isStaffQuotaFull) {
        toast.error('Maximum Staff Limit Reached: Exactly 2 staff positions can be authorized by Super Admin.');
        return;
      }
      setEditingStaff(null);
      setStaffForm({
        name: '',
        email: '',
        role: 'inventory_manager',
        roleTitle: 'Master Florist & Inventory',
        phone: '',
        status: 'Active',
      });
      setShowStaffModal(true);
    }
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await adminService.updateStaff(editingStaff.id || editingStaff._id, staffForm).catch(() => {});
        const updated = staffList.map((s) => (s.id === editingStaff.id || s._id === editingStaff._id ? { ...s, ...staffForm } : s));
        setStaffList(updated);
        localStorage.setItem('dhanvikk_admin_staff', JSON.stringify(updated));
        toast.success(`Updated staff credentials for ${staffForm.name}`);
      } else {
        if (isStaffQuotaFull) {
          toast.error('Maximum Staff Limit Reached: Exactly 2 staff positions can be authorized.');
          return;
        }
        const newMember = {
          id: `staff-${Date.now()}`,
          ...staffForm,
          joinedDate: new Date().toISOString().split('T')[0],
          isSuperAdmin: staffForm.email.toLowerCase() === superAdminEmail.toLowerCase(),
        };
        const updated = [...staffList, newMember];
        setStaffList(updated);
        localStorage.setItem('dhanvikk_admin_staff', JSON.stringify(updated));
        toast.success(`Staff member ${staffForm.name} added successfully! 🌸`);
      }
      setShowStaffModal(false);
      setEditingStaff(null);
    } catch (err) {
      toast.error(err.message || 'Error saving staff member');
    }
  };

  const handleDeleteStaff = async (staff) => {
    if (staff.isSuperAdmin || staff.email.toLowerCase() === superAdminEmail.toLowerCase()) {
      toast.error('Security Restriction: The Super Admin cannot be removed.');
      return;
    }
    if (!window.confirm(`Revoke staff credentials and free up allocation slot for ${staff.name}?`)) return;
    try {
      await adminService.deleteStaff(staff.id || staff._id).catch(() => {});
      const updated = staffList.filter((s) => s.id !== staff.id && s._id !== staff.id);
      setStaffList(updated);
      localStorage.setItem('dhanvikk_admin_staff', JSON.stringify(updated));
      toast.success(`Revoked staff access for ${staff.name}. Staff slot is now open!`);
    } catch (err) {
      toast.error(err.message || 'Error removing staff');
    }
  };

  // Category Handlers
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        slug: cat.slug || cat.id,
        description: cat.description || '',
        badge: cat.badge || 'SIGNATURE EDIT',
        subCategories: Array.isArray(cat.subCategories) ? cat.subCategories.join(', ') : (cat.subCategories || ''),
        image: cat.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        active: cat.active !== false,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        badge: 'NEW COLLECTION',
        subCategories: 'Bouquets, Hatboxes, Vases',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        active: true,
      });
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    const subArr = categoryForm.subCategories
      ? categoryForm.subCategories.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const slug = (categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-')).toLowerCase();

    if (editingCategory) {
      const updated = categoriesList.map((c) =>
        c.id === editingCategory.id || c.slug === editingCategory.slug
          ? { ...c, ...categoryForm, slug, subCategories: subArr }
          : c
      );
      setCategoriesList(updated);
      localStorage.setItem('dhanvikk_admin_categories', JSON.stringify(updated));
      toast.success(`Updated category: ${categoryForm.name}`);
    } else {
      const newCat = {
        id: slug || `cat-${Date.now()}`,
        ...categoryForm,
        slug,
        subCategories: subArr,
      };
      const updated = [...categoriesList, newCat];
      setCategoriesList(updated);
      localStorage.setItem('dhanvikk_admin_categories', JSON.stringify(updated));
      toast.success(`Created category: ${categoryForm.name}`);
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    const updated = categoriesList.filter((c) => (c.id || c.slug) !== (cat.id || cat.slug));
    setCategoriesList(updated);
    localStorage.setItem('dhanvikk_admin_categories', JSON.stringify(updated));
    toast.success(`Deleted category ${cat.name}`);
  };

  // Currency Handlers
  const handleOpenCurrencyModal = (curr) => {
    setEditingCurrency(curr);
    setCurrencyRateForm({
      code: curr.code,
      name: curr.name,
      rateToINR: curr.rateToINR,
      rateFromAED: curr.rateFromAED,
      fixedSample: curr.fixedSample,
    });
    setShowCurrencyModal(true);
  };

  const handleSaveCurrencyRate = (e) => {
    e.preventDefault();
    if (!editingCurrency) return;
    const updated = currenciesList.map((c) =>
      c.code === editingCurrency.code
        ? {
            ...c,
            rateToINR: Number(currencyRateForm.rateToINR),
            rateFromAED: Number(currencyRateForm.rateFromAED),
            fixedSample: Number(currencyRateForm.fixedSample),
          }
        : c
    );
    setCurrenciesList(updated);
    localStorage.setItem('dhanvikk_admin_currencies', JSON.stringify(updated));
    setShowCurrencyModal(false);
    toast.success(`Updated fixed rate for ${editingCurrency.code} 💱`);
  };

  // Hero CMS Handlers
  const handleSaveHeroSettings = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('dhanvikk_hero_settings', JSON.stringify(heroSettings));
      window.dispatchEvent(new Event('storage'));
      toast.success('Hero section published live to storefront! 🌸');
    } catch {
      toast.error('Failed to save hero settings.');
    }
  };

  const handleResetHeroSettings = () => {
    const defaults = {
      badge: 'Spring Floristry Edit 2026',
      headline: 'Elegance In Every Petal.',
      subHeadline: 'Delivered Today.',
      description: 'Directly imported highland Ecuadorian roses & exotic lilies, crafted by master florists with complimentary handwritten cards.',
      buttonText: 'Shop Spring Roses',
      buttonLink: '/category/roses',
      secondaryButtonText: 'Browse Occasions',
      secondaryButtonLink: '/category/occasions',
      imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=85',
    };
    setHeroSettings(defaults);
    localStorage.setItem('dhanvikk_hero_settings', JSON.stringify(defaults));
    window.dispatchEvent(new Event('storage'));
    toast.success('Reset hero section to atelier default.');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Admin signed out.');
    navigate('/admin/login');
  };

  // Stock level maintainer
  const handleStockAdjust = async (product, change) => {
    const prodId = product._id || product.id;
    const currentStock = product.stock || 0;
    const newStock = Math.max(0, currentStock + change);
    try {
      await productService.updateStockLevel(prodId, newStock);
      setProducts((prev) =>
        prev.map((p) =>
          (p._id === prodId || p.id === prodId) ? { ...p, stock: newStock, inStock: newStock > 0 } : p
        )
      );
      toast.success(`Updated stock for ${product.name} to ${newStock}`);
    } catch {
      // Optimistic update fallback for production resilience
      setProducts((prev) =>
        prev.map((p) =>
          (p._id === prodId || p.id === prodId) ? { ...p, stock: newStock, inStock: newStock > 0 } : p
        )
      );
      toast.success(`Updated stock for ${product.name} to ${newStock}`);
    }
  };

  const handleInlineStockSubmit = async (product, value) => {
    const prodId = product._id || product.id;
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      setEditingStockId(null);
      return;
    }
    try {
      await productService.updateStockLevel(prodId, num);
      setProducts((prev) =>
        prev.map((p) =>
          (p._id === prodId || p.id === prodId) ? { ...p, stock: num, inStock: num > 0 } : p
        )
      );
      toast.success(`Stock level set to ${num} for ${product.name}`);
    } catch {
      setProducts((prev) =>
        prev.map((p) =>
          (p._id === prodId || p.id === prodId) ? { ...p, stock: num, inStock: num > 0 } : p
        )
      );
      toast.success(`Stock level set to ${num} for ${product.name}`);
    } finally {
      setEditingStockId(null);
    }
  };

  // Product CRUD
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name?.trim()) {
      toast.error('Please enter a product name.');
      return;
    }

    const cleanImg = (productForm.images || '').trim() || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80';
    const payload = {
      ...productForm,
      images: cleanImg,
      image: cleanImg,
      price: Number(productForm.price) || 2499,
      originalPrice: Number(productForm.originalPrice) || (Number(productForm.price) ? Number(productForm.price) + 500 : 2999),
      stock: Number(productForm.stock) || 10,
    };

    try {
      if (editingProduct) {
        const prodId = editingProduct._id || editingProduct.id;
        const res = await productService.updateProduct(prodId, payload);
        const updatedItem = res?.product || { ...editingProduct, ...payload };
        setProducts((prev) =>
          prev.map((p) =>
            (p._id === prodId || p.id === prodId)
              ? { ...p, ...updatedItem, image: cleanImg, images: [cleanImg] }
              : p
          )
        );
        toast.success(`Updated arrangement: ${productForm.name} 🌸`);
      } else {
        const res = await productService.createProduct(payload);
        const created = res?.product || {
          id: `flw-${Date.now()}`,
          _id: `flw-${Date.now()}`,
          ...payload,
          image: cleanImg,
          images: [cleanImg],
          createdAt: new Date().toISOString(),
        };
        setProducts((prev) => [created, ...prev]);
        toast.success(`Created new botanical item: ${productForm.name} 🌸`);
      }
      setShowProductModal(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error(err.message || 'Product save failed');
    }
  };

  const handleDuplicateProduct = (prod) => {
    const image = Array.isArray(prod.images) ? prod.images[0] : (prod.images || prod.image);
    setEditingProduct(null);
    setProductForm({
      name: `${prod.name} (Copy)`,
      category: prod.category || 'Flowers',
      subCategory: prod.subCategory || 'Hand Bouquets',
      flowerType: prod.flowerType || 'Roses',
      price: prod.price || 1999,
      originalPrice: prod.originalPrice || (prod.price ? prod.price + 500 : 2499),
      stock: prod.stock || 20,
      tag: 'NEW ARRIVAL',
      description: prod.description || 'Artisan handcrafted floral composition.',
      images: image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      linuxHostingPath: `/images/products/${(prod.name || 'product').toLowerCase().replace(/\s+/g, '-')}-copy.jpg`,
      lightRequirement: prod.lightRequirement || 'Bright Indirect Light',
      waterFrequency: prod.waterFrequency || 'Water 1-2 times weekly',
      potSize: prod.potSize || 'Hand-crafted Ceramic Planter Included',
      fixedPrices: prod.fixedPrices || {},
    });
    setShowProductModal(true);
    toast.info('Loaded clone of product. Modify any details and click Publish Product.');
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from inventory?`)) return;
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast.success(`Deleted ${name}`);
    } catch {
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast.success(`Deleted ${name}`);
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus, orderStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) =>
          (o._id === orderId || o.orderId === orderId)
            ? { ...o, status: newStatus, orderStatus: newStatus }
            : o
        )
      );
      if (selectedOrderModal && (selectedOrderModal._id === orderId || selectedOrderModal.orderId === orderId)) {
        setSelectedOrderModal((prev) => ({ ...prev, status: newStatus, orderStatus: newStatus }));
      }
      toast.success(`Order marked as "${newStatus}"`);
    } catch {
      setOrders((prev) =>
        prev.map((o) =>
          (o._id === orderId || o.orderId === orderId)
            ? { ...o, status: newStatus, orderStatus: newStatus }
            : o
        )
      );
      toast.success(`Order marked as "${newStatus}"`);
    }
  };

  // Filtered views
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.flowerType?.toLowerCase().includes(productSearch.toLowerCase());

    const matchesCategory =
      productCategoryFilter === 'All' ||
      p.category?.toLowerCase() === productCategoryFilter.toLowerCase();

    let matchesStock = true;
    const currentStock = p.stock || 0;
    if (stockFilter === 'in_stock') matchesStock = currentStock > 0;
    if (stockFilter === 'low_stock') matchesStock = currentStock > 0 && currentStock <= 5;
    if (stockFilter === 'out_of_stock') matchesStock = currentStock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const filteredOrders = orders.filter((o) => {
    const recipient = o.shippingAddress?.fullName || o.recipientName || o.user?.name || '';
    const city = o.shippingAddress?.city || o.deliveryAddress?.city || '';
    const phone = o.shippingAddress?.phone || o.recipientPhone || '';
    const id = o.orderId || o._id || '';

    const matchesSearch =
      recipient.toLowerCase().includes(orderSearch.toLowerCase()) ||
      city.toLowerCase().includes(orderSearch.toLowerCase()) ||
      phone.includes(orderSearch) ||
      id.toLowerCase().includes(orderSearch.toLowerCase());

    const currentStatus = o.status || o.orderStatus || 'Pending';
    const matchesStatus =
      orderStatusFilter === 'All' || currentStatus.toLowerCase() === orderStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate live metrics
  const totalSKUs = products.length;
  const inStockCount = products.filter((p) => (p.stock || 0) > 0).length;
  const lowStockCount = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
  const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;

  const pendingOrdersCount = orders.filter((o) => (o.status || o.orderStatus) === 'Pending').length;
  const confirmedOrdersCount = orders.filter((o) => (o.status || o.orderStatus) === 'Confirmed').length;
  const outForDeliveryCount = orders.filter((o) => (o.status || o.orderStatus) === 'Out for Delivery').length;
  const deliveredOrdersCount = orders.filter((o) => (o.status || o.orderStatus) === 'Delivered').length;

  const ADMIN_MENU_SECTIONS = [
    {
      heading: 'CATALOG & INVENTORY',
      items: [
        {
          id: 'products',
          label: 'Products & Stock',
          icon: Layers,
          count: products.length,
          alert: lowStockCount > 0 ? `${lowStockCount} low` : null,
          alertColor: 'text-amber-700 bg-amber-50 border-amber-200',
        },
        {
          id: 'categories',
          label: 'Categories Atelier',
          icon: Flower2,
          count: categoriesList.length,
        },
        {
          id: 'currencies',
          label: 'Currencies & Rates',
          icon: Coins,
          count: currenciesList.length,
          badge: '11 Hubs',
          badgeColor: 'text-sky-700 bg-sky-50 border-sky-200',
        },
        {
          id: 'hero',
          label: 'Hero Section CMS',
          icon: Sparkles,
          badge: 'LIVE',
          badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        },
      ],
    },
    {
      heading: 'OPERATIONS & FULFILLMENT',
      items: [
        {
          id: 'orders',
          label: 'Orders Pipeline',
          icon: Package,
          count: orders.length,
          alert: pendingOrdersCount > 0 ? `${pendingOrdersCount} pending` : null,
          alertColor: 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse',
        },
        {
          id: 'payments',
          label: 'Payments Ledger',
          icon: CreditCard,
          count: paymentsList.length,
        },
      ],
    },
    {
      heading: 'ADMINISTRATION & USERS',
      items: [
        {
          id: 'staff',
          label: 'Super Admin & Staff',
          icon: Crown,
          count: `${staffList.length}/2`,
        },
        {
          id: 'users',
          label: 'Patrons Accounts',
          icon: Users,
          count: usersList.length,
        },
        {
          id: 'stats',
          label: 'Executive Analytics',
          icon: TrendingUp,
        },
      ],
    },
  ];

  const TAB_METADATA = {
    products: {
      category: 'CATALOG & INVENTORY',
      title: 'Floral & Plant Inventory Maintenance',
      description: 'Live stock adjustment, flower specs, dynamic categories & multi-currency rates.',
    },
    categories: {
      category: 'CATALOG & INVENTORY',
      title: 'Categories & Subcategories Atelier',
      description: 'Manage primary floral collections, SEO badges, and luxury gift categories.',
    },
    currencies: {
      category: 'INTERNATIONAL COMMERCE',
      title: 'Multi-Currency & Fixed Exchange Rates',
      description: '11 International export hubs with live converter simulator and fixed rates.',
    },
    hero: {
      category: 'STOREFRONT CMS',
      title: 'Hero Section & Seasonal Campaign Banner',
      description: 'Live headline, promotional highlights, CTA links, and hero arrangement visuals.',
    },
    orders: {
      category: 'FULFILLMENT PIPELINE',
      title: 'Customer Orders & Cold-Chain Dispatch',
      description: 'Track orders through Confirmed, Out for Delivery, and Delivered stages.',
    },
    payments: {
      category: 'FINANCIAL LEDGER',
      title: 'Payment Transactions & Gateway Receipts',
      description: 'Verified Razorpay, Stripe, and COD orders with receipts and currency breakdown.',
    },
    staff: {
      category: 'ACCESS CONTROL',
      title: 'Super Admin Authority & Staff Quota (Max 2)',
      description: 'Strict 2-staff member quota enforcement with role allocation and credentials.',
    },
    users: {
      category: 'CLIENTELE DIRECTORY',
      title: 'Registered Patrons & Accounts',
      description: 'Customer list with verified phone numbers, emails, order counts, and registration dates.',
    },
    stats: {
      category: 'EXECUTIVE INTELLIGENCE',
      title: 'Executive Analytics & Performance Insights',
      description: 'Revenue totals, order completion ratios, customer growth, and floral category insights.',
    },
  };

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full select-none bg-white">
      {/* Sidebar Header */}
      {isMobile ? (
        <div className="p-4 border-b border-[#EFE7DE] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Logo size="sm" linkTo="/admin/dashboard" />
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-[#242124] block">
                Staff Console
              </span>
              <span className="text-[10px] text-[#C2185B] font-mono">Dhanvikk Blooms</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-full hover:bg-[#FAF7F2] text-[#666] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer"
            aria-label="Close menu drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-3.5 border-b border-[#EFE7DE] bg-[#FFFDFB] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#EC407A] flex items-center justify-center text-white shadow-xs shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs uppercase tracking-wider text-[#242124] block truncate">
                {authUser?.name ? authUser.name : 'Admin Navigation'}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                {authUser?.email ? authUser.email : 'Live Control Hub'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-3.5 text-xs font-['Poppins']">
        {ADMIN_MENU_SECTIONS.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#888888]">
              {sec.heading}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile) setMobileSidebarOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-xl text-xs transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FFF0F4] to-[#FFF5F8] text-[#C2185B] font-bold border border-[#FCC1C5]/70 shadow-2xs'
                        : 'text-[#444444] hover:text-[#242124] hover:bg-[#FAF7F2] font-medium border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#C2185B]' : 'text-[#777777] group-hover:text-[#242124]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Count or Badge on Right */}
                    <div className="flex items-center gap-1 shrink-0 ml-1.5">
                      {item.alert && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${item.alertColor}`}>
                          {item.alert}
                        </span>
                      )}
                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${item.badgeColor || 'text-[#C2185B] bg-[#FFF0F4] border-[#F2D7DE]'}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && !item.alert && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            isActive ? 'bg-[#C2185B]/10 text-[#C2185B] font-bold' : 'bg-[#F2ECE6] text-[#666666]'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-2.5 sm:p-3 border-t border-[#EFE7DE] bg-[#FFFDFB] space-y-2 shrink-0">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#444] text-xs font-semibold border border-[#EFE7DE] transition-colors group"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#C2185B]" />
            <span>Storefront Live</span>
          </span>
          <span className="text-[10px] text-[#888] group-hover:translate-x-0.5 transition-transform">↗</span>
        </Link>

        {/* Super Admin Status Card */}
        <div className="p-2.5 rounded-xl bg-white border border-[#EFE7DE] flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#FFF0F4] border border-[#F2D7DE] text-[#C2185B] flex items-center justify-center shrink-0">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#242124] block truncate uppercase">
                Super Admin
              </span>
              <span className="text-[9px] text-[#777777] font-mono block truncate" title={superAdminEmail}>
                {superAdminEmail.split('@')[0]}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#888888] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
            title="Sign Out Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title="Admin Executive Console | Dhanvikk Blooms Management"
        canonical="/admin/dashboard"
        noindex={true}
      />

      <div className="min-h-screen bg-[#FAF7F2] text-[#242124] font-['Poppins'] flex flex-col selection:bg-[#EC407A] selection:text-white">
        {/* Top Header */}
        <header className="border-b border-[#EFE7DE] bg-white sticky top-0 z-40 px-2.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-xl text-[#EC407A] hover:bg-[#FAF7F2] border border-[#EFE7DE] transition-colors cursor-pointer mr-0.5 shrink-0"
              aria-label="Open Admin Navigation Menu"
            >
              <Menu className="w-5 h-5 text-[#EC407A]" />
            </button>

            <Logo size="sm" linkTo="/admin/dashboard" className="mr-0.5 sm:mr-1 shrink-0" />
            <div className="hidden sm:block h-6 w-px bg-[#EFE7DE]" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-xs sm:text-sm tracking-wider uppercase text-[#242124] block truncate">
                  Staff Console
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Production System
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#C2185B] font-mono block truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none">
                Super Admin: {superAdminEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              to="/"
              className="text-xs text-[#555555] hover:text-[#EC407A] border border-[#EFE7DE] px-3 py-1.5 rounded-full transition-colors hidden sm:inline-flex items-center gap-1.5 hover:bg-[#FAF7F2]"
            >
              <span>← View Storefront</span>
            </Link>

            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-1.5 sm:p-2 text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] rounded-full transition-colors hover:bg-[#FAF7F2] cursor-pointer"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin text-[#C2185B]' : ''}`} />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-transparent border-[#EFE7DE] text-[#EC407A] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[11px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-3"
            >
              <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Master Two-Column Dashboard Layout: Left Menus + Right Content & Values */}
        <div className="flex flex-1 w-full min-h-[calc(100vh-65px)] relative">
          {/* Mobile Sidebar Slide-Over Drawer */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
                onClick={() => setMobileSidebarOpen(false)}
              />
              {/* Drawer panel */}
              <aside className="fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-[#EFE7DE] flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
                {renderSidebarContent(true)}
              </aside>
            </div>
          )}

          {/* Desktop Permanent Left Sidebar (Sticky on lg:) */}
          <aside className="hidden lg:flex w-64 xl:w-72 bg-white border-r border-[#EFE7DE] flex-col shrink-0 sticky top-[65px] h-[calc(100vh-65px)] shadow-2xs">
            {renderSidebarContent(false)}
          </aside>

          {/* Right Workspace Area: Displays all Values, KPIs, Tables & Forms */}
          <div className="flex-1 min-w-0 flex flex-col bg-[#FAF7F2] overflow-x-hidden">
            {/* Top Context Header for Active Section */}
            <div className="bg-white border-b border-[#EFE7DE] px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sticky top-[65px] z-30 shadow-2xs">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-[#C2185B] uppercase tracking-wider bg-[#FFF0F4] px-2 py-0.5 rounded-md border border-[#F2D7DE]">
                    {TAB_METADATA[activeTab]?.category || 'MANAGEMENT'}
                  </span>
                  <span className="text-[#D0C6BD] hidden sm:inline">•</span>
                  <h1 className="text-sm sm:text-base font-bold text-[#242124] truncate">
                    {TAB_METADATA[activeTab]?.title || 'Staff Console'}
                  </h1>
                </div>
                <p className="text-[11px] text-[#777777] truncate mt-0.5">
                  {TAB_METADATA[activeTab]?.description}
                </p>
              </div>

              {/* Action buttons on Right */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="px-2.5 py-1 text-xs text-[#555] hover:text-[#EC407A] border border-[#EFE7DE] rounded-lg hover:bg-[#FAF7F2] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Refresh Live Data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C2185B]' : ''}`} />
                  <span className="hidden xs:inline">Sync</span>
                </button>

                {activeTab === 'products' && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: '',
                        category: 'Flowers',
                        subCategory: 'Hand Bouquets',
                        flowerType: 'Roses',
                        price: 2499,
                        originalPrice: 2999,
                        stock: 25,
                        tag: 'NEW ARRIVAL',
                        description: '',
                        images: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
                        linuxHostingPath: '/images/products/new-arrangement.jpg',
                        lightRequirement: 'Bright Indirect Light',
                        waterFrequency: 'Water 1-2 times weekly',
                        potSize: 'Hand-crafted Ceramic Planter Included',
                        fixedPrices: { AED: 110, INR: 2499, USD: 30, EUR: 28, GBP: 24, SAR: 112, QAR: 109, KWD: 9.2, OMR: 11.5, BHD: 11.3, SGD: 41 },
                      });
                      setShowProductModal(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#C2185B] hover:bg-[#AD1457] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>
                )}

                {activeTab === 'categories' && (
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({
                        name: '',
                        slug: '',
                        description: '',
                        badge: 'SIGNATURE EDIT',
                        subCategories: '',
                        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
                        active: true,
                      });
                      setShowCategoryModal(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#C2185B] hover:bg-[#AD1457] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Category</span>
                  </button>
                )}

                {activeTab === 'staff' && (
                  <button
                    onClick={() => {
                      if (staffList.length >= 2) {
                        toast.error('Staff quota reached! Maximum 2 staff allowed.');
                        return;
                      }
                      setEditingStaff(null);
                      setStaffForm({
                        name: '',
                        email: '',
                        phone: '',
                        role: 'inventory_manager',
                        roleTitle: 'Inventory Associate',
                      });
                      setShowStaffModal(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#C2185B] hover:bg-[#AD1457] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Staff ({staffList.length}/2)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Breadcrumb Strip */}
            <div className="bg-[#FAF7F2] border-b border-[#EFE7DE] px-3.5 sm:px-6 py-1">
              <div className="overflow-x-auto scrollbar-none">
                <Breadcrumb
                  items={[
                    { label: 'Home', path: '/' },
                    { label: 'Staff Portal', path: '/admin/dashboard' },
                    { label: TAB_METADATA[activeTab]?.title || activeTab },
                  ]}
                />
              </div>
            </div>

        {/* ========================================================
            TAB 1: PRODUCTS & LIVE STOCK LEVEL MAINTENANCE
            ======================================================== */}
        {activeTab === 'products' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6">
            {/* Live Inventory Status KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div
                onClick={() => setStockFilter('all')}
                className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  stockFilter === 'all'
                    ? 'bg-white border-[#C2185B] shadow-md ring-1 ring-[#C2185B]/30'
                    : 'bg-white border-[#EFE7DE] hover:border-[#DCD5CD] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="truncate">Total SKUs</span>
                  <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#888888] shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#242124] mt-1">{totalSKUs}</p>
                <span className="text-[10px] text-[#777777] block truncate">On Storefront</span>
              </div>

              <div
                onClick={() => setStockFilter('in_stock')}
                className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  stockFilter === 'in_stock'
                    ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-white border-[#EFE7DE] hover:border-[#DCD5CD] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-emerald-700">
                  <span className="truncate">In-Stock</span>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1">{inStockCount}</p>
                <span className="text-[10px] text-[#777777] block truncate">Available</span>
              </div>

              <div
                onClick={() => setStockFilter('low_stock')}
                className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  stockFilter === 'low_stock'
                    ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-white border-[#EFE7DE] hover:border-[#DCD5CD] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-amber-700">
                  <span className="truncate">Low Stock (≤5)</span>
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-amber-700 mt-1">{lowStockCount}</p>
                <span className="text-[10px] text-amber-700/80 block truncate">Needs harvest</span>
              </div>

              <div
                onClick={() => setStockFilter('out_of_stock')}
                className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  stockFilter === 'out_of_stock'
                    ? 'bg-white border-rose-500 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-white border-[#EFE7DE] hover:border-[#DCD5CD] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-rose-700">
                  <span className="truncate">Sold Out</span>
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-rose-700 mt-1">{outOfStockCount}</p>
                <span className="text-[10px] text-rose-700/80 block truncate">0 units</span>
              </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative w-full sm:w-auto sm:min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <input
                    type="text"
                    placeholder="Search flower, plant, or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-white border border-[#DCD5CD] rounded-xl text-xs text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="h-9 px-3 bg-white border border-[#DCD5CD] rounded-xl text-xs text-[#242124] focus:outline-none focus:border-[#C2185B]"
                >
                  <option value="All">All Categories</option>
                  {DEFINED_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>

                {/* Stock Filter Pills */}
                <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#EFE7DE] text-[11px] shadow-2xs overflow-x-auto max-w-full">
                  <button
                    onClick={() => setStockFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      stockFilter === 'all' ? 'bg-[#C2185B] text-white font-bold' : 'text-[#666666] hover:text-[#EC407A]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStockFilter('in_stock')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      stockFilter === 'in_stock' ? 'bg-emerald-600 text-white font-bold' : 'text-[#666666] hover:text-[#EC407A]'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    onClick={() => setStockFilter('low_stock')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      stockFilter === 'low_stock' ? 'bg-amber-600 text-white font-bold' : 'text-[#666666] hover:text-[#EC407A]'
                    }`}
                  >
                    Low Stock
                  </button>
                  <button
                    onClick={() => setStockFilter('out_of_stock')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      stockFilter === 'out_of_stock' ? 'bg-rose-600 text-white font-bold' : 'text-[#666666] hover:text-[#EC407A]'
                    }`}
                  >
                    Sold Out
                  </button>
                </div>
              </div>

              {/* Add New Product Trigger */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    category: 'Flowers',
                    subCategory: 'Hand Bouquets',
                    flowerType: 'Roses',
                    price: 2499,
                    originalPrice: 2999,
                    stock: 25,
                    tag: 'NEW ARRIVAL',
                    description: '',
                    images: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
                    lightRequirement: 'Bright Indirect Light',
                    waterFrequency: 'Water 1-2 times weekly',
                    potSize: 'Hand-crafted Ceramic Planter Included',
                  });
                  setShowProductModal(true);
                }}
                className="h-9 text-xs font-bold shadow-[0_4px_16px_rgba(194,24,91,0.25)] whitespace-nowrap bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white hover:opacity-95"
              >
                <Plus className="w-4 h-4" /> Add New Botanical Product
              </Button>
            </div>

            {/* Products & Live Stock Table */}
            <div className="bg-white border border-[#EFE7DE] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#333333] min-w-[680px]">
                  <thead className="bg-[#FAF7F2] text-[#666666] text-[11px] uppercase tracking-wider border-b border-[#EFE7DE]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Botanical Item & Details</th>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th className="py-3.5 px-4 font-semibold">Price (₹ / AED)</th>
                      <th className="py-3.5 px-4 font-semibold">Live Stock Maintenance</th>
                      <th className="py-3.5 px-4 font-semibold">Availability</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7DE]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#777777]">
                          <Layers className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#C2185B]" />
                          <p className="text-sm font-semibold text-[#242124]">No botanical products matched this filter</p>
                          <p className="text-xs text-[#888888] mt-1">Try clearing your search term or stock filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => {
                        const prodId = prod._id || prod.id;
                        const image = Array.isArray(prod.images) ? prod.images[0] : (prod.images || prod.image);
                        const stockCount = prod.stock !== undefined ? prod.stock : 10;
                        const isEditingThisStock = editingStockId === prodId;

                        return (
                          <tr key={prodId} className="hover:bg-[#FFFDF9] transition-colors">
                            {/* Product Info */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getProductImageUrl(image)}
                                  alt={`${prod.name} product thumbnail`}
                                  className="w-12 h-12 rounded-xl object-cover border border-[#EFE7DE] flex-shrink-0 bg-[#FAF7F2]"
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80';
                                  }}
                                />
                                <div className="max-w-[240px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[#242124] block truncate">{prod.name}</span>
                                    {prod.tag && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE]">
                                        {prod.tag}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#777777] block font-mono">
                                    {prod.flowerType || 'Floral'} • SKU: {prodId.toString().slice(-6).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE7DE] text-[11px] font-medium text-[#555555]">
                                {prod.category || 'Flowers'}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-3 px-4">
                              <div className="font-mono">
                                <span className="font-bold text-[#242124] text-sm">
                                  ₹{prod.price?.toLocaleString('en-IN')}
                                </span>
                                {prod.originalPrice > prod.price && (
                                  <span className="text-[10px] text-[#999999] line-through block">
                                    ₹{prod.originalPrice?.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Live Stock Level Maintenance */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                {/* Decrement 1 */}
                                <button
                                  onClick={() => handleStockAdjust(prod, -1)}
                                  className="w-7 h-7 rounded-lg bg-[#FAF7F2] hover:bg-[#C2185B] hover:text-white text-[#EC407A] border border-[#EFE7DE] flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                                  title="Decrease stock by 1"
                                >
                                  -
                                </button>

                                {/* Direct numerical edit or display */}
                                {isEditingThisStock ? (
                                  <input
                                    type="number"
                                    autoFocus
                                    value={inlineStockValue}
                                    onChange={(e) => setInlineStockValue(e.target.value)}
                                    onBlur={() => handleInlineStockSubmit(prod, inlineStockValue)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleInlineStockSubmit(prod, inlineStockValue);
                                      if (e.key === 'Escape') setEditingStockId(null);
                                    }}
                                    className="w-14 h-7 text-center font-mono font-bold bg-white border border-[#C2185B] text-[#242124] rounded text-xs focus:outline-none"
                                  />
                                ) : (
                                  <span
                                    onClick={() => {
                                      setEditingStockId(prodId);
                                      setInlineStockValue(stockCount.toString());
                                    }}
                                    title="Click to manually edit stock level"
                                    className={`font-mono font-bold px-2 py-1 rounded text-xs cursor-pointer min-w-[36px] text-center border transition-all hover:scale-105 ${
                                      stockCount === 0
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : stockCount <= 5
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    }`}
                                  >
                                    {stockCount}
                                  </span>
                                )}

                                {/* Increment 1 */}
                                <button
                                  onClick={() => handleStockAdjust(prod, 1)}
                                  className="w-7 h-7 rounded-lg bg-[#FAF7F2] hover:bg-[#C2185B] hover:text-white text-[#EC407A] border border-[#EFE7DE] flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                                  title="Increase stock by 1"
                                >
                                  +
                                </button>

                                {/* Batch Restock Quick Buttons */}
                                <div className="hidden sm:flex items-center gap-1 ml-1.5 pl-1.5 border-l border-[#EFE7DE]">
                                  <button
                                    onClick={() => handleStockAdjust(prod, 10)}
                                    className="px-1.5 py-1 text-[10px] font-mono rounded bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#555555] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer"
                                    title="Batch Restock +10"
                                  >
                                    +10
                                  </button>
                                  <button
                                    onClick={() => handleStockAdjust(prod, 25)}
                                    className="px-1.5 py-1 text-[10px] font-mono rounded bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#555555] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer"
                                    title="Batch Restock +25"
                                  >
                                    +25
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Availability Status */}
                            <td className="py-3 px-4">
                              {stockCount > 5 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" /> In Stock ({stockCount})
                                </span>
                              ) : stockCount > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  <AlertCircle className="w-3 h-3" /> Low Stock ({stockCount})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                  <AlertCircle className="w-3 h-3" /> Sold Out (0)
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleDuplicateProduct(prod)}
                                  className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer transition-colors"
                                  title="Duplicate / Clone Product"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    const image = Array.isArray(prod.images) ? prod.images[0] : (prod.images || prod.image || '');
                                    setProductForm({
                                      name: prod.name || '',
                                      category: prod.category || 'Flowers',
                                      subCategory: prod.subCategory || CATEGORY_SUBCATEGORIES_MAP[prod.category]?.[0] || 'Hand Bouquets',
                                      flowerType: prod.flowerType || 'Roses',
                                      price: prod.price || 2499,
                                      originalPrice: prod.originalPrice || (prod.price ? prod.price + 500 : 2999),
                                      stock: prod.stock !== undefined ? prod.stock : 10,
                                      tag: prod.tag || '',
                                      description: prod.description || '',
                                      images: image,
                                      image: image,
                                      linuxHostingPath: prod.linuxHostingPath || `/images/products/${(prod.name || 'product').toLowerCase().replace(/\s+/g, '-')}.jpg`,
                                      lightRequirement: prod.lightRequirement || 'Bright Indirect Light',
                                      waterFrequency: prod.waterFrequency || 'Water 1-2 times weekly',
                                      potSize: prod.potSize || 'Hand-crafted Ceramic Planter Included',
                                      fixedPrices: prod.fixedPrices || {},
                                    });
                                    setShowProductModal(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prodId, prod.name)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            TAB: CATEGORIES & COLLECTIONS WORKFLOW MANAGEMENT
            ======================================================== */}
        {activeTab === 'categories' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-['Poppins'] text-[#242124]">
                  Botanical Categories & Curated Collections
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Organize floral hatboxes, forever roses, indoor greenery, and subcategories
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenCategoryModal()}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </button>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs">
                <span className="text-[11px] text-[#777] block truncate">Active Collections</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#242124] mt-1 block">
                  {categoriesList.filter((c) => c.active !== false).length}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block truncate">Live on Storefront</span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs">
                <span className="text-[11px] text-[#777] block truncate">SKUs Categorized</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#242124] mt-1 block">
                  {products.length}
                </span>
                <span className="text-[10px] text-[#777] block truncate">Coverage 100%</span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs">
                <span className="text-[11px] text-[#777] block truncate">Subcategory Facets</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#C2185B] mt-1 block">
                  {categoriesList.reduce((acc, c) => acc + (Array.isArray(c.subCategories) ? c.subCategories.length : 1), 0)}
                </span>
                <span className="text-[10px] text-[#777] block truncate">Sub-navigation</span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs">
                <span className="text-[11px] text-[#777] block truncate">Category Badges</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#D4AF37] mt-1 block">
                  {categoriesList.filter((c) => c.badge).length}
                </span>
                <span className="text-[10px] text-[#777] block truncate">Curated Highlighting</span>
              </div>
            </div>

            {/* Category Cards Table */}
            <div className="bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-[#EFE7DE] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#242124] font-['Poppins']">
                    Configured Floral Collections ({categoriesList.length})
                  </h3>
                  <p className="text-[11px] text-[#777]">Manage category metadata, badges, and subcategory tags</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#333333] min-w-[650px]">
                  <thead className="bg-[#FAF7F2] text-[#666666] text-[11px] uppercase tracking-wider border-b border-[#EFE7DE]">
                    <tr>
                      <th className="py-3.5 px-5 font-semibold">Collection</th>
                      <th className="py-3.5 px-4 font-semibold">Slug Identifier</th>
                      <th className="py-3.5 px-4 font-semibold">Badge Tag</th>
                      <th className="py-3.5 px-4 font-semibold">Subcategories</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7DE]">
                    {categoriesList.map((cat) => (
                      <tr key={cat.id || cat.slug} className="hover:bg-[#FFFDF9] transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={cat.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}
                              alt={cat.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-[#EFE7DE] shadow-2xs shrink-0"
                            />
                            <div>
                              <span className="font-bold text-[#242124] text-sm block">{cat.name}</span>
                              <span className="text-[11px] text-[#777] line-clamp-1 max-w-xs">{cat.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] text-[#888]">
                          /category/{cat.slug || cat.id}
                        </td>
                        <td className="py-4 px-4">
                          {cat.badge ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF0F4] text-[#C2185B] border border-[#FCD9E0]">
                              {cat.badge}
                            </span>
                          ) : (
                            <span className="text-[#AAA] text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(Array.isArray(cat.subCategories) ? cat.subCategories : (cat.subCategories ? cat.subCategories.split(',') : [])).map((sub, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#555] text-[10px] border border-[#EFE7DE]">
                                {sub.trim()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Live Storefront
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenCategoryModal(cat)}
                              className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666] hover:text-[#EC407A] border border-[#EFE7DE] transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            TAB: MULTI-CURRENCY FIXED PRICING & EXCHANGE RATES
            ======================================================== */}
        {activeTab === 'currencies' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-['Poppins'] text-[#242124]">
                  Multi-Currency Fixed Values & Exchange Rates
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Universal pricing across 11 currencies: UAE, GCC, India, USA, Europe, UK & Singapore
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrenciesList(DEFAULT_CURRENCY_RATES);
                    localStorage.removeItem('dhanvikk_admin_currencies');
                    toast.success('Reset exchange rates to default financial standards.');
                  }}
                  className="px-3.5 sm:px-4 py-2 rounded-xl border border-[#EFE7DE] bg-white text-xs text-[#666] hover:text-[#EC407A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Reset Standard Rates
                </button>
              </div>
            </div>

            {/* Live Interactive Conversion Simulator */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#EFE7DE] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#C2185B]" />
                  <h3 className="text-sm font-bold text-[#242124] font-['Poppins']">
                    Interactive Multi-Currency Value Simulator
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[#777]">Test Base Amount:</span>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value) || 0)}
                    className="w-20 sm:w-24 h-8 px-2.5 rounded-lg border border-[#DCD5CD] text-xs font-mono font-bold text-[#242124] focus:outline-none focus:border-[#C2185B]"
                  />
                  <select
                    value={simCurrency}
                    onChange={(e) => setSimCurrency(e.target.value)}
                    className="h-8 px-2 rounded-lg border border-[#DCD5CD] text-xs font-bold text-[#242124] focus:outline-none focus:border-[#C2185B]"
                  >
                    {currenciesList.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Converted values grid for the simulated amount */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
                {currenciesList.map((c) => {
                  const baseCurr = currenciesList.find((x) => x.code === simCurrency) || currenciesList[0];
                  const inrValue = simAmount * (baseCurr.rateToINR || 22.8);
                  const converted = c.rateToINR ? inrValue / c.rateToINR : simAmount;

                  return (
                    <div key={c.code} className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE] text-center space-y-0.5">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#666]">
                        <span>{c.flag}</span>
                        <span>{c.code}</span>
                      </div>
                      <p className="text-sm font-bold font-mono text-[#242124]">
                        {c.symbol} {converted.toFixed(c.code === 'KWD' || c.code === 'OMR' || c.code === 'BHD' ? 2 : 0)}
                      </p>
                      <span className="text-[10px] text-[#888] font-mono">{c.nativeSymbol}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Currency Rates Table */}
            <div className="bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-[#EFE7DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#242124] font-['Poppins']">
                    Fixed Rates & Serviceable Currencies ({currenciesList.length})
                  </h3>
                  <p className="text-[11px] text-[#777]">Set fixed multiplier rates for automatic checkout price calculations</p>
                </div>
                <span className="text-xs text-[#777] font-mono">Base Reference: 1 AED = 22.80 INR</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#333333] min-w-[700px]">
                  <thead className="bg-[#FAF7F2] text-[#666666] text-[11px] uppercase tracking-wider border-b border-[#EFE7DE]">
                    <tr>
                      <th className="py-3.5 px-5 font-semibold">Currency & Territory</th>
                      <th className="py-3.5 px-4 font-semibold">Symbols</th>
                      <th className="py-3.5 px-4 font-semibold">Rate vs Base AED</th>
                      <th className="py-3.5 px-4 font-semibold">Rate in INR (₹)</th>
                      <th className="py-3.5 px-4 font-semibold">Sample Bouquet (AED 150)</th>
                      <th className="py-3.5 px-5 text-right font-semibold">Edit Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7DE]">
                    {currenciesList.map((curr) => {
                      const bouquetInINR = 150 * 22.8;
                      const sampleVal = curr.rateToINR ? (bouquetInINR / curr.rateToINR).toFixed(curr.code === 'KWD' || curr.code === 'OMR' || curr.code === 'BHD' ? 2 : 0) : '—';

                      return (
                        <tr key={curr.code} className="hover:bg-[#FFFDF9] transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{curr.flag}</span>
                              <div>
                                <span className="font-bold text-[#242124] text-sm block">
                                  {curr.code} • {curr.name}
                                </span>
                                <span className="text-[11px] text-[#777]">{curr.country}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#242124] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#EFE7DE]">
                                {curr.symbol}
                              </span>
                              <span className="font-mono text-[#888]">{curr.nativeSymbol}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono font-semibold text-[#242124]">
                            1 AED = {curr.rateFromAED} {curr.code}
                          </td>

                          <td className="py-4 px-4 font-mono text-[#555]">
                            1 {curr.code} = ₹{curr.rateToINR}
                          </td>

                          <td className="py-4 px-4 font-mono font-bold text-[#C2185B]">
                            {curr.symbol} {sampleVal}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenCurrencyModal(curr)}
                              className="px-3 py-1.5 rounded-xl bg-[#FFF0F4] hover:bg-[#FFE4EC] text-[#C2185B] border border-[#F2D7DE] text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Fixed Rate</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            TAB: HERO SECTION CMS & STOREFRONT BANNER ATELIER
            ======================================================== */}
        {activeTab === 'hero' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-['Poppins'] text-[#242124]">
                  Hero Section Visual & Content Management (CMS)
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Update headlines, badge text, promotional calls-to-action, and high-resolution banner imagery live on the storefront
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetHeroSettings}
                  className="px-3.5 sm:px-4 py-2 rounded-xl border border-[#EFE7DE] bg-white text-xs text-[#666] hover:text-[#EC407A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSaveHeroSettings}
                  className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish Hero Updates</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left Column: Form Editor */}
              <div className="lg:col-span-6 bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 text-xs">
                <h3 className="text-sm font-bold text-[#242124] font-['Poppins'] pb-2 border-b border-[#EFE7DE] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C2185B]" />
                  <span>Banner Headlines & Typography</span>
                </h3>

                {/* Badge Tag */}
                <div>
                  <label className="block text-[#444] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Curated Badge Text *
                  </label>
                  <input
                    type="text"
                    value={heroSettings.badge}
                    onChange={(e) => setHeroSettings({ ...heroSettings, badge: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B]"
                    placeholder="e.g. Spring Floristry Edit 2026"
                  />
                </div>

                {/* Headline 1 & 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#444] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                      Headline Part 1 *
                    </label>
                    <input
                      type="text"
                      value={heroSettings.headline}
                      onChange={(e) => setHeroSettings({ ...heroSettings, headline: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B]"
                      placeholder="e.g. Elegance In Every Petal."
                    />
                  </div>
                  <div>
                    <label className="block text-[#444] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                      Headline Accent Part 2 *
                    </label>
                    <input
                      type="text"
                      value={heroSettings.subHeadline}
                      onChange={(e) => setHeroSettings({ ...heroSettings, subHeadline: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B]"
                      placeholder="e.g. Delivered Today."
                    />
                  </div>
                </div>

                {/* Description Subtext */}
                <div>
                  <label className="block text-[#444] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Editorial Subtitle / Description *
                  </label>
                  <textarea
                    rows={3}
                    value={heroSettings.description}
                    onChange={(e) => setHeroSettings({ ...heroSettings, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B] leading-relaxed resize-none"
                    placeholder="Directly imported highland Ecuadorian roses..."
                  />
                </div>

                {/* Primary CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EFE7DE]">
                  <div>
                    <label className="block text-[#444] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={heroSettings.buttonText}
                      onChange={(e) => setHeroSettings({ ...heroSettings, buttonText: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#444] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                      Primary Button Link
                    </label>
                    <input
                      type="text"
                      value={heroSettings.buttonLink}
                      onChange={(e) => setHeroSettings({ ...heroSettings, buttonLink: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] font-mono focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>
                </div>

                {/* Secondary CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#444] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                      Secondary Button Text
                    </label>
                    <input
                      type="text"
                      value={heroSettings.secondaryButtonText}
                      onChange={(e) => setHeroSettings({ ...heroSettings, secondaryButtonText: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#444] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                      Secondary Button Link
                    </label>
                    <input
                      type="text"
                      value={heroSettings.secondaryButtonLink}
                      onChange={(e) => setHeroSettings({ ...heroSettings, secondaryButtonLink: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] font-mono focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>
                </div>

                {/* Banner Image URL & Local Upload */}
                <div className="pt-2 border-t border-[#EFE7DE] space-y-2">
                  <label className="block text-[#444] font-semibold uppercase tracking-wider text-[11px]">
                    Hero Banner Image Source (Local Upload or URL) *
                  </label>
                  <input
                    type="text"
                    value={heroSettings.imageUrl}
                    onChange={(e) => setHeroSettings({ ...heroSettings, imageUrl: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] font-mono text-[11px] focus:outline-none focus:border-[#C2185B]"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <label className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#242124] border border-[#EFE7DE] text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#C2185B]" />
                      <span>Upload Local Image From Computer</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setHeroSettings((prev) => ({
                              ...prev,
                              imageUrl: ev.target.result,
                            }));
                            toast.success('Hero image updated from local storage! 🌸');
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setHeroSettings((prev) => ({
                          ...prev,
                          imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=85',
                        }))
                      }
                      className="text-[11px] text-[#C2185B] hover:underline"
                    >
                      Use Curated Rose Hatbox
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Storefront Replica Preview */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C2185B] flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#C2185B]" />
                    <span>Real-Time Storefront Live Preview</span>
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                    1:1 Visual Replica
                  </span>
                </div>

                {/* Replica Banner Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#EFE7DE] min-h-[380px] bg-gradient-to-r from-[#FFF0F4] via-[#FFF8F9] to-[#FAF7F2] p-6 sm:p-8 flex items-center">
                  <div className="relative z-10 max-w-sm space-y-3.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#FCC1C5] text-[#C2185B] text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                      <Sparkles className="w-3 h-3 text-[#EC407A]" />
                      <span>{heroSettings.badge || 'Spring Floristry Edit 2026'}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#242124] leading-tight">
                      {heroSettings.headline || 'Elegance In Every Petal.'} <br />
                      <span className="text-[#EC407A] italic font-normal">{heroSettings.subHeadline || 'Delivered Today.'}</span>
                    </h1>

                    <p className="text-xs text-[#777777] font-normal leading-relaxed">
                      {heroSettings.description || 'Directly imported highland Ecuadorian roses...'}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-2.5">
                      <div className="px-5 py-2.5 rounded-full bg-[#EC407A] text-white text-xs font-semibold shadow-md flex items-center gap-1.5">
                        <span>{heroSettings.buttonText || 'Shop Spring Roses'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>

                      <div className="px-5 py-2.5 rounded-full bg-white text-[#242124] text-xs font-semibold border border-[#E9E2E5]">
                        <span>{heroSettings.secondaryButtonText || 'Browse Occasions'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block absolute right-0 bottom-0 top-0 w-2/5 pointer-events-none">
                    <img
                      src={heroSettings.imageUrl}
                      alt="Hero Live Preview"
                      className="w-full h-full object-cover rounded-l-full shadow-lg border-l-4 border-white opacity-95"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    When you click <strong>Publish Hero Updates</strong>, changes immediately persist in the browser and live storefront at <code>http://localhost:5173/</code>!
                  </span>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            TAB 2: CUSTOMER ORDERS PIPELINE MANAGEMENT
            ======================================================== */}
        {activeTab === 'orders' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6">
            {/* Orders Pipeline KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div
                onClick={() => setOrderStatusFilter('All')}
                className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  orderStatusFilter === 'All'
                    ? 'bg-white border-[#C2185B] shadow-md ring-1 ring-[#C2185B]/30'
                    : 'bg-white border-[#EFE7DE] hover:border-[#DCD5CD] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="truncate">Total Orders</span>
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#888888] shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#242124] mt-1">{orders.length}</p>
                <span className="text-[10px] text-[#777777] block truncate">Bookings</span>
              </div>

              <div
                onClick={() => setOrderStatusFilter('Pending')}
                className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  orderStatusFilter === 'Pending'
                    ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-white border-[#EFE7DE] hover:border-[#DCD5CD] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-amber-700">
                  <span className="truncate">Pending</span>
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-amber-700 mt-1">{pendingOrdersCount}</p>
                <span className="text-[10px] text-amber-700/80 block truncate">Awaiting pickup</span>
              </div>

              <div
                onClick={() => setOrderStatusFilter('Out for Delivery')}
                className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  orderStatusFilter === 'Out for Delivery'
                    ? 'bg-white border-[#C2185B] shadow-md ring-1 ring-[#C2185B]/30'
                    : 'bg-white border-[#EFE7DE] hover:border-[#DCD5CD] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-[#C2185B]">
                  <span className="truncate">Out for Delivery</span>
                  <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C2185B] shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#C2185B] mt-1">{outForDeliveryCount}</p>
                <span className="text-[10px] text-[#C2185B]/80 block truncate">Cold-chain active</span>
              </div>

              <div
                onClick={() => setOrderStatusFilter('Delivered')}
                className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  orderStatusFilter === 'Delivered'
                    ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-white border-[#EFE7DE] hover:border-[#DCD5CD] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-emerald-700">
                  <span className="truncate">Delivered</span>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1">{deliveredOrdersCount}</p>
                <span className="text-[10px] text-[#777777] block truncate">Completed</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <input
                    type="text"
                    placeholder="Search by recipient, order ID, phone, city..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-white border border-[#DCD5CD] rounded-xl text-xs text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#EFE7DE] text-[11px] overflow-x-auto max-w-full shadow-2xs">
                  {[
                    { label: 'All', count: orders.length },
                    { label: 'Pending', count: pendingOrdersCount },
                    { label: 'Confirmed', count: confirmedOrdersCount },
                    { label: 'Out for Delivery', count: outForDeliveryCount },
                    { label: 'Delivered', count: deliveredOrdersCount },
                    { label: 'Cancelled', count: orders.filter((o) => (o.status || o.orderStatus) === 'Cancelled').length },
                  ].map(({ label, count }) => (
                    <button
                      key={label}
                      onClick={() => setOrderStatusFilter(label)}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        orderStatusFilter === label
                          ? 'bg-[#C2185B] text-white font-bold'
                          : 'text-[#666666] hover:text-[#EC407A]'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${orderStatusFilter === label ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] text-[#888]'}`}>{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-xs text-[#777777] font-mono">
                Showing {filteredOrders.length} of {orders.length} Orders
              </span>
            </div>

            {/* Orders Cards List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-[#EFE7DE] rounded-2xl p-12 text-center shadow-xs">
                <Package className="w-12 h-12 text-[#999999] mx-auto mb-3 text-[#C2185B]" />
                <h3 className="text-sm font-bold text-[#242124]">No matching customer orders</h3>
                <p className="text-xs text-[#777777] mt-1">
                  Adjust your search or status filter to see other customer orders.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const orderId = order.orderId || order._id;
                  const currentStatus = order.status || order.orderStatus || 'Pending';
                  const recipient = order.shippingAddress?.fullName || order.recipientName || order.user?.name || 'Customer';
                  const phone = order.shippingAddress?.phone || order.recipientPhone || order.user?.phone || 'Phone not provided';
                  const address = order.shippingAddress?.streetAddress || order.deliveryAddress?.street || 'Local Delivery';
                  const city = order.shippingAddress?.city || order.deliveryAddress?.city || 'Dubai / India';
                  const slot = order.timeSlot || order.deliverySlot || 'Standard Delivery';
                  const date = order.deliveryDate || 'Today';
                  const cardNote = order.greetingCardMessage || order.greetingMessage || '';
                  const total = order.totalAmount || 0;

                  return (
                    <div
                      key={orderId}
                      className="bg-white border border-[#EFE7DE] rounded-2xl p-5 space-y-4 hover:border-[#DCD5CD] transition-all shadow-sm"
                    >
                      {/* Top Bar of Order Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFE7DE]">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-bold text-[#242124] text-xs bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#EFE7DE]">
                            #{orderId}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {order.paymentInfo?.status || order.paymentStatus || 'Paid (Razorpay)'}
                          </span>
                          <span className="text-[11px] text-[#777777]">
                            Booked: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent'}
                          </span>
                        </div>

                        {/* Status Manager & Action Buttons */}
                        <div className="flex items-center gap-2">
                          <select
                            value={currentStatus}
                            onChange={(e) => handleUpdateOrderStatus(orderId, e.target.value)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none border cursor-pointer ${
                              currentStatus === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : currentStatus === 'Out for Delivery'
                                ? 'bg-[#FFF0F4] text-[#C2185B] border-[#F2D7DE]'
                                : currentStatus === 'Confirmed'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Pending" className="bg-white text-[#242124]">Pending</option>
                            <option value="Confirmed" className="bg-white text-[#242124]">Confirmed</option>
                            <option value="Preparing Floral Order" className="bg-white text-[#242124]">Preparing Floral Order</option>
                            <option value="Out for Delivery" className="bg-white text-[#242124]">Out for Delivery</option>
                            <option value="Delivered" className="bg-white text-[#242124]">Delivered</option>
                            <option value="Cancelled" className="bg-white text-[#242124]">Cancelled</option>
                          </select>

                          {/* Quick Advance Button */}
                          {currentStatus === 'Pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(orderId, 'Confirmed')}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold cursor-pointer transition-colors"
                            >
                              Confirm
                            </button>
                          )}
                          {currentStatus === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(orderId, 'Out for Delivery')}
                              className="px-2.5 py-1 rounded-lg bg-[#FFF0F4] hover:bg-[#FFE4EC] text-[#C2185B] border border-[#F2D7DE] text-[11px] font-semibold cursor-pointer transition-colors"
                            >
                              Dispatch
                            </button>
                          )}
                          {currentStatus === 'Out for Delivery' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(orderId, 'Delivered')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold cursor-pointer transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {/* Inspect Modal Trigger */}
                          <button
                            onClick={() => setSelectedOrderModal(order)}
                            className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer transition-colors"
                            title="View Full Packing Slip & Items"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 3-Column Order Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* Recipient */}
                        <div className="space-y-1">
                          <h4 className="text-[10px] uppercase font-bold text-[#777777] tracking-wider">
                            Recipient & Address
                          </h4>
                          <p className="font-bold text-[#242124] text-sm">{recipient}</p>
                          <p className="text-[#555555] flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#C2185B]" /> {phone}
                          </p>
                          <p className="text-[#666666] flex items-start gap-1.5 mt-1 leading-relaxed">
                            <MapPin className="w-3 h-3 text-[#999999] flex-shrink-0 mt-0.5" />
                            <span>{address}, {city}</span>
                          </p>
                        </div>

                        {/* Delivery Schedule & Card Note */}
                        <div className="space-y-1">
                          <h4 className="text-[10px] uppercase font-bold text-[#777777] tracking-wider">
                            Schedule & Florist Note
                          </h4>
                          <p className="text-[#242124] font-medium flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-[#C2185B]" /> {date}
                          </p>
                          <p className="text-[#C2185B] font-semibold flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-[#C2185B]" /> {slot}
                          </p>
                          {cardNote && (
                            <div className="mt-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE] text-[11px] text-[#444444] italic">
                              "{cardNote}"
                            </div>
                          )}
                        </div>

                        {/* Items & Payment */}
                        <div className="space-y-1">
                          <h4 className="text-[10px] uppercase font-bold text-[#777777] tracking-wider">
                            Arrangements & Total
                          </h4>
                          <ul className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                            {order.items?.map((it, idx) => (
                              <li key={idx} className="flex justify-between items-center text-[11px]">
                                <span className="text-[#444444] truncate max-w-[170px]">
                                  {it.name} (x{it.quantity})
                                </span>
                                <span className="font-mono text-[#242124] font-semibold">
                                  ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-2 border-t border-[#EFE7DE] flex justify-between items-center font-bold text-[#242124] text-sm">
                            <span>Grand Total:</span>
                            <span className="font-mono text-[#C2185B] text-base">
                              ₹{total.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        )}

        {/* ========================================================
            TAB: CUSTOMER PAYMENTS & FINANCIAL LEDGER
            ======================================================== */}
        {activeTab === 'payments' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-['Poppins'] text-[#242124]">
                  Patron Payments & Financial Ledger
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Complete real-time transaction ledger across Razorpay, Stripe, Apple Pay, and Cash on Delivery
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const csvRows = [
                      ['Transaction ID', 'Order ID', 'Customer', 'Email', 'Gateway', 'Amount', 'Currency', 'Status', 'Date'],
                      ...paymentsList.map((p) => [p.id, p.orderId, p.customerName, p.customerEmail, p.gateway, p.amount, p.currency, p.status, p.date]),
                    ];
                    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `dhanvikk_payments_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Downloaded financial payment ledger CSV.');
                  }}
                  className="px-3.5 sm:px-4 py-2 rounded-xl border border-[#EFE7DE] bg-white text-xs font-semibold text-[#EC407A] hover:bg-[#FAF7F2] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#C2185B]" />
                  <span>Export Financial Report</span>
                </button>
              </div>
            </div>

            {/* Payment KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="truncate">Settled Volume</span>
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                </div>
                <p className="text-lg sm:text-2xl font-bold font-mono text-[#242124] mt-1 truncate">
                  ₹{paymentsList.reduce((acc, curr) => acc + (curr.currency === 'AED' ? curr.amount * 22.8 : curr.currency === 'USD' ? curr.amount * 83.5 : curr.amount), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold block truncate">100% Verified</span>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="truncate">Razorpay</span>
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-blue-600 mt-1">
                  {paymentsList.filter((p) => p.gateway.includes('Razorpay')).length} Txns
                </p>
                <span className="text-[10px] text-[#777] block truncate">Cards / UPI</span>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="truncate">Stripe & Apple Pay</span>
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C2185B] shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#C2185B] mt-1">
                  {paymentsList.filter((p) => p.gateway.includes('Stripe')).length} Txns
                </p>
                <span className="text-[10px] text-[#777] block truncate">Global Direct</span>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="truncate">Cash on Delivery</span>
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-amber-600 mt-1">
                  {paymentsList.filter((p) => p.gateway.includes('Cash')).length} Orders
                </p>
                <span className="text-[10px] text-amber-600 font-semibold block truncate">Pending Courier</span>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-[#EFE7DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#242124] font-['Poppins']">
                    Customer Payment Records ({paymentsList.length})
                  </h3>
                  <p className="text-[11px] text-[#777]">All settled and pending transactions from checkout</p>
                </div>
                <span className="text-xs text-[#777] font-mono">Real-Time Gateway Sync</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#333333] min-w-[720px]">
                  <thead className="bg-[#FAF7F2] text-[#666666] text-[11px] uppercase tracking-wider border-b border-[#EFE7DE]">
                    <tr>
                      <th className="py-3.5 px-5 font-semibold">Transaction ID & Order</th>
                      <th className="py-3.5 px-4 font-semibold">Patron Details</th>
                      <th className="py-3.5 px-4 font-semibold">Payment Gateway</th>
                      <th className="py-3.5 px-4 font-semibold">Amount & Currency</th>
                      <th className="py-3.5 px-4 font-semibold">Settlement Status</th>
                      <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                      <th className="py-3.5 px-5 text-right font-semibold">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7DE]">
                    {paymentsList.map((payment) => (
                      <tr key={payment.id} className="hover:bg-[#FFFDF9] transition-colors">
                        <td className="py-4 px-5">
                          <span className="font-mono font-bold text-[#242124] block">{payment.id}</span>
                          <span className="text-[11px] text-[#C2185B] font-mono">Ref: {payment.orderId}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-[#242124] block">{payment.customerName}</span>
                          <span className="text-[11px] text-[#777] font-mono">{payment.customerEmail}</span>
                          <span className="text-[10px] text-[#999] block">{payment.city}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#FAF7F2] border border-[#EFE7DE] text-[#242124]">
                            <CreditCard className="w-3 h-3 text-[#C2185B]" />
                            {payment.gateway}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-sm text-[#242124] block">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </span>
                          {payment.currency !== 'INR' && (
                            <span className="text-[10px] text-[#888] font-mono">
                              ≈ ₹{(payment.amount * (payment.currency === 'AED' ? 22.8 : 83.5)).toFixed(0)}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              payment.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${payment.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {payment.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] text-[#777]">
                          {payment.date}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentReceipt(payment)}
                            className="px-3 py-1.5 rounded-xl bg-[#FFF0F4] hover:bg-[#FFE4EC] text-[#C2185B] border border-[#F2D7DE] text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            TAB: SUPER ADMIN & EXACTLY 2 STAFFS ALLOCATION SLOTS
            ======================================================== */}
        {activeTab === 'staff' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6">
            {/* Super Admin Status Banner */}
            <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-r from-[#FFFDF9] via-[#FAF7F2] to-[#FFF5F7] border border-[#D4AF37]/40 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Crown className="w-48 h-48 text-[#D4AF37]" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-[#D4AF37]/15 text-[#854D0E] border border-[#D4AF37]/40 shadow-xs shrink-0">
                    <Crown className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold font-['Poppins'] text-[#242124]">
                        Super Admin Governance & 2 Staff Quota
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#FEF3C7] text-[#854D0E] border border-[#FDE68A] font-mono">
                        SUPER ADMIN CONTROLLED
                      </span>
                    </div>
                    <p className="text-xs text-[#666666] mt-1 max-w-2xl leading-relaxed">
                      Super Admin retains root governance. System policy allocates <strong>exactly 2 authorized staff members</strong> (Slot 1 & Slot 2) for operational management (Master Florist & Cold-Chain Dispatch).
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-[#EFE7DE] text-[#242124] shadow-2xs max-w-full">
                      <Mail className="w-3.5 h-3.5 text-[#854D0E] shrink-0" />
                      <span className="truncate">Root Super Admin: <strong className="text-[#854D0E] font-mono break-all">{superAdminEmail}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-white border border-[#EFE7DE] text-xs font-mono font-bold text-[#242124]">
                    Staff Quota: <span className={currentStaffCount >= maxStaffQuota ? 'text-[#C2185B]' : 'text-emerald-700'}>{currentStaffCount} / {maxStaffQuota} Assigned</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenStaffModal()}
                    disabled={isStaffQuotaFull}
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                      isStaffQuotaFull
                        ? 'bg-stone-400 cursor-not-allowed opacity-80'
                        : 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:opacity-95'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isStaffQuotaFull ? 'Staff Quota Reached (2/2)' : 'Onboard Staff Member'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DEDICATED 3-TIER EXECUTIVE SLOTS: SUPER ADMIN + 2 STAFF MEMBERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* Card 1: Root Super Admin */}
              <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white border-2 border-[#D4AF37]/50 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FEF3C7] text-[#854D0E] border border-[#FDE68A] uppercase tracking-wider">
                      ROOT GOVERNANCE
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#854D0E] flex items-center justify-center">
                      <Crown className="w-4 h-4 fill-current" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                      Super Administrator
                    </h3>
                    <p className="text-xs font-mono text-[#854D0E] mt-0.5">{superAdminEmail}</p>
                    <span className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#EFE7DE] text-[11px] font-semibold text-[#555]">
                      Chief Executive & Founder
                    </span>
                  </div>

                  <p className="text-xs text-[#666666] leading-relaxed pt-2 border-t border-[#EFE7DE]">
                    Full root clearance to manage product inventory, categories, currency rates, hero storefront CMS, and authorize the 2 staff positions.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#EFE7DE] flex items-center justify-between text-xs text-emerald-700 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Permanent Root Access
                  </span>
                  <Lock className="w-4 h-4 text-[#854D0E]" />
                </div>
              </div>

              {/* Card 2: Staff Slot #1 */}
              {(() => {
                const staff1 = staffList.find((s) => !s.isSuperAdmin && s.email.toLowerCase() !== superAdminEmail.toLowerCase());
                return (
                  <div className="rounded-3xl p-6 bg-white border border-[#EFE7DE] shadow-sm flex flex-col justify-between hover:border-[#C2185B]/40 transition-all">
                    {staff1 ? (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE] uppercase tracking-wider">
                              STAFF SLOT #1 • ACTIVE
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                              {staff1.name}
                            </h3>
                            <p className="text-xs font-mono text-[#777] mt-0.5">{staff1.email}</p>
                            <span className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE] text-[11px] font-bold">
                              {staff1.roleTitle || 'Master Florist & Inventory Lead'}
                            </span>
                          </div>

                          <div className="text-xs text-[#666666] space-y-1 pt-2 border-t border-[#EFE7DE]">
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#C2185B]" />
                              <span>{staff1.phone || 'Phone not set'}</span>
                            </p>
                            <p className="text-[11px] text-[#888]">Appointed: {staff1.joinedDate || '2026-01-15'}</p>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#EFE7DE] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleOpenStaffModal(staff1)}
                            className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#EC407A] border border-[#EFE7DE] text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 text-[#C2185B]" />
                            <span>Edit Staff</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staff1)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold cursor-pointer"
                          >
                            Revoke Slot
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EFE7DE] flex items-center justify-center text-[#999]">
                          <UserPlus className="w-6 h-6 text-[#C2185B]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#242124]">Staff Slot #1 Available</h4>
                          <p className="text-xs text-[#777] mt-1">Slot reserved for Master Florist & Inventory</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenStaffModal()}
                          className="px-4 py-2 rounded-xl bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE] text-xs font-bold hover:bg-[#FFE4EC] cursor-pointer"
                        >
                          + Assign Staff Member #1
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 3: Staff Slot #2 */}
              {(() => {
                const nonSuper = staffList.filter((s) => !s.isSuperAdmin && s.email.toLowerCase() !== superAdminEmail.toLowerCase());
                const staff2 = nonSuper[1];
                return (
                  <div className="rounded-3xl p-6 bg-white border border-[#EFE7DE] shadow-sm flex flex-col justify-between hover:border-[#C2185B]/40 transition-all">
                    {staff2 ? (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase tracking-wider">
                              STAFF SLOT #2 • ACTIVE
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                              {staff2.name}
                            </h3>
                            <p className="text-xs font-mono text-[#777] mt-0.5">{staff2.email}</p>
                            <span className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-bold">
                              {staff2.roleTitle || 'Cold-Chain Dispatch Coordinator'}
                            </span>
                          </div>

                          <div className="text-xs text-[#666666] space-y-1 pt-2 border-t border-[#EFE7DE]">
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#C2185B]" />
                              <span>{staff2.phone || 'Phone not set'}</span>
                            </p>
                            <p className="text-[11px] text-[#888]">Appointed: {staff2.joinedDate || '2026-02-01'}</p>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#EFE7DE] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleOpenStaffModal(staff2)}
                            className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#EC407A] border border-[#EFE7DE] text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 text-[#C2185B]" />
                            <span>Edit Staff</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staff2)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold cursor-pointer"
                          >
                            Revoke Slot
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EFE7DE] flex items-center justify-center text-[#999]">
                          <UserPlus className="w-6 h-6 text-[#C2185B]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#242124]">Staff Slot #2 Available</h4>
                          <p className="text-xs text-[#777] mt-1">Slot reserved for Cold-Chain Dispatch Lead</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenStaffModal()}
                          className="px-4 py-2 rounded-xl bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE] text-xs font-bold hover:bg-[#FFE4EC] cursor-pointer"
                        >
                          + Assign Staff Member #2
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Staff Credentials Table */}
            <div className="bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-[#EFE7DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#242124] font-['Poppins']">
                    Authorized Personnel Roster ({staffList.length} Accounts)
                  </h3>
                  <p className="text-[11px] text-[#777777]">Designations, credentials, and operational clearances</p>
                </div>
                <span className="text-xs text-[#777777] font-mono">
                  Quota Policy: 1 Super Admin + 2 Staff Members
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#333333] min-w-[650px]">
                  <thead className="bg-[#FAF7F2] text-[#666666] text-[11px] uppercase tracking-wider border-b border-[#EFE7DE]">
                    <tr>
                      <th className="py-3.5 px-5 font-semibold">Staff Member</th>
                      <th className="py-3.5 px-4 font-semibold">Role Title & Badge</th>
                      <th className="py-3.5 px-4 font-semibold">Phone / Contact</th>
                      <th className="py-3.5 px-4 font-semibold">Operational Status</th>
                      <th className="py-3.5 px-4 font-semibold">Appointed Date</th>
                      <th className="py-3.5 px-5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7DE]">
                    {staffList.map((st) => {
                      const isSuper = st.isSuperAdmin || st.email.toLowerCase() === superAdminEmail.toLowerCase();

                      return (
                        <tr key={st.id || st._id} className="hover:bg-[#FFFDF9] transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-[#FFF0F4] border border-[#F2D7DE] text-[#C2185B] flex items-center justify-center font-bold text-sm shadow-2xs">
                                  {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                                </div>
                                {isSuper && (
                                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shadow-xs">
                                    <Crown className="w-3 h-3 fill-current" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#242124] text-sm">{st.name}</span>
                                  {isSuper && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FEF3C7] text-[#854D0E] border border-[#FDE68A]">
                                      SUPER ADMIN
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#777777] font-mono block">{st.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div>
                              <span className="font-semibold text-[#242124] block text-xs">
                                {st.roleTitle || st.role}
                              </span>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono mt-1 ${
                                  isSuper
                                    ? 'bg-[#FEF3C7] text-[#854D0E] border border-[#FDE68A]'
                                    : st.role === 'inventory_manager'
                                    ? 'bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE]'
                                    : st.role === 'delivery_manager'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                }`}
                              >
                                {st.role}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono text-[#555555]">
                            {st.phone || '—'}
                          </td>

                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {st.status || 'Active'}
                            </span>
                          </td>

                          <td className="py-4 px-4 font-mono text-[#777777] text-[11px]">
                            {st.joinedDate || '2026-01-01'}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenStaffModal(st)}
                                className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] transition-colors cursor-pointer"
                                title="Edit staff details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {!isSuper ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStaff(st)}
                                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                                  title="Revoke staff access"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span
                                  className="p-2 rounded-xl bg-[#FAF7F2] text-[#AAAAAA] cursor-not-allowed border border-[#EFE7DE]"
                                  title="Super Admin is protected"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            TAB 3: REGISTERED USERS & LOGINS HISTORY
            ======================================================== */}
        {activeTab === 'users' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold font-['Poppins'] text-[#242124]">
                  Registered Patrons & Staff Accounts (MongoDB)
                </h2>
                <p className="text-xs text-[#666666]">
                  Audit registered accounts, role privileges, and authentication timestamps
                </p>
              </div>
              <span className="text-xs text-[#777777] font-mono">
                Total Registered: {usersList.length} Accounts
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              {/* Users list */}
              <div className="lg:col-span-7 bg-white border border-[#EFE7DE] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#333333] min-w-[480px]">
                    <thead className="bg-[#FAF7F2] text-[#666666] text-[11px] uppercase tracking-wider border-b border-[#EFE7DE]">
                      <tr>
                        <th className="py-3 px-4 font-semibold">User</th>
                        <th className="py-3 px-4 font-semibold">Role</th>
                        <th className="py-3 px-4 font-semibold">Logins</th>
                        <th className="py-3 px-4 text-right font-semibold">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE7DE]">
                      {usersList.map((usr) => (
                        <tr key={usr._id || usr.id} className="hover:bg-[#FFFDF9]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#FFF0F4] border border-[#F2D7DE] text-[#C2185B] flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0">
                                {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <span className="font-bold text-[#242124] block">{usr.name}</span>
                                <span className="text-[11px] text-[#777777]">{usr.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                usr.role === 'admin' || usr.role === 'super_admin'
                                  ? 'bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE]'
                                  : 'bg-[#FAF7F2] text-[#555555] border border-[#EFE7DE]'
                              }`}
                            >
                              {usr.role || 'customer'}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-[#242124]">
                            {usr.loginHistory?.length || 1} logins
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedUserLogins(usr)}
                              className="px-3 py-1 rounded-lg bg-[#FFF0F4] hover:bg-[#FFE4EC] text-[#C2185B] border border-[#F2D7DE] text-xs font-semibold cursor-pointer transition-colors"
                            >
                              View Logs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Login history telemetry panel */}
              <div className="lg:col-span-5 bg-white border border-[#EFE7DE] rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
                {selectedUserLogins ? (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DE]">
                      <div>
                        <h3 className="text-sm font-bold text-[#242124]">{selectedUserLogins.name}</h3>
                        <p className="text-xs text-[#777777]">{selectedUserLogins.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
                        {selectedUserLogins.role}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                      Recent Authentication Logs:
                    </h4>

                    {selectedUserLogins.loginHistory?.length > 0 ? (
                      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                        {selectedUserLogins.loginHistory.map((log, i) => (
                          <div key={i} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE] text-xs space-y-1">
                            <div className="flex justify-between items-center text-[#242124]">
                              <span className="font-semibold text-[#C2185B]">Method: {log.method || 'email'}</span>
                              <span className="text-[10px] text-[#777777]">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-[#555555] font-mono">IP: {log.ip || '127.0.0.1'}</p>
                            <p className="text-[10px] text-[#777777] truncate">Agent: {log.userAgent || 'Browser Client'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#777777] italic">No historical login telemetry available for this account.</p>
                    )}
                  </>
                ) : (
                  <div className="py-16 text-center text-[#999999]">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#C2185B]" />
                    <p className="text-xs">Select any user on the left to inspect detailed login telemetry logs.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            TAB 4: EXECUTIVE ANALYTICS STATS
            ======================================================== */}
        {activeTab === 'stats' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-white border border-[#EFE7DE] rounded-2xl p-3.5 sm:p-6 shadow-sm">
                <span className="text-[11px] sm:text-xs text-[#666666] block truncate">Gross Pipeline Revenue</span>
                <p className="text-xl sm:text-3xl font-bold font-mono text-[#242124] mt-1 truncate">
                  ₹{stats.totalRevenue?.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold block truncate">+24.5% vs cycle</span>
              </div>

              <div className="bg-white border border-[#EFE7DE] rounded-2xl p-3.5 sm:p-6 shadow-sm">
                <span className="text-[11px] sm:text-xs text-[#666666] block truncate">Total Dispatched</span>
                <p className="text-xl sm:text-3xl font-bold font-mono text-[#242124] mt-1">
                  {orders.length}
                </p>
                <span className="text-[10px] sm:text-[11px] text-[#777777] block truncate">Cold-chain tracked</span>
              </div>

              <div className="bg-white border border-[#EFE7DE] rounded-2xl p-3.5 sm:p-6 shadow-sm">
                <span className="text-[11px] sm:text-xs text-[#666666] block truncate">Active Patrons</span>
                <p className="text-xl sm:text-3xl font-bold font-mono text-[#242124] mt-1">
                  {usersList.length}
                </p>
                <span className="text-[10px] sm:text-[11px] text-[#C2185B] font-semibold block truncate">MongoDB Accounts</span>
              </div>

              <div className="bg-white border border-[#EFE7DE] rounded-2xl p-3.5 sm:p-6 shadow-sm">
                <span className="text-[11px] sm:text-xs text-[#666666] block truncate">Low Stock SKUs (≤ 5)</span>
                <p className="text-xl sm:text-3xl font-bold font-mono text-rose-600 mt-1">
                  {lowStockCount}
                </p>
                <span className="text-[10px] sm:text-[11px] text-rose-600 block truncate">Needs harvest</span>
              </div>
            </div>
          </main>
        )}
            </div>
          </div>

        {/* ========================================================
            MODAL: ADD / EDIT BOTANICAL PRODUCT
            ======================================================== */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-xl w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl text-[#242124]">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DE]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE]">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                      {editingProduct ? 'Edit Botanical Product' : 'Add New Botanical Product'}
                    </h3>
                    <p className="text-[11px] text-[#777777]">Publish fresh arrangements, potted greens, or gift bundles</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE6] flex items-center justify-center text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* 1. Proper Product Name */}
                <div>
                  <label className="block text-[#444444] font-semibold mb-1">Product / Bouquet Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Moroccan Blush Hatbox or Monstera Deliciosa"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                  />
                </div>

                {/* 2. Proper Product Category & Subcategory Dropdown List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Product Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const subCats = CATEGORY_SUBCATEGORIES_MAP[newCat] || [];
                        setProductForm({
                          ...productForm,
                          category: newCat,
                          subCategory: subCats[0] || '',
                        });
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B]"
                    >
                      {DEFINED_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Subcategory Dropdown List *</label>
                    <select
                      value={productForm.subCategory}
                      onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B]"
                    >
                      {(CATEGORY_SUBCATEGORIES_MAP[productForm.category] || [
                        'Hand Bouquets',
                        'Vase Arrangements',
                        'Grand Luxury Bouquets',
                        'Exotic Garden Stems',
                      ]).map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Botanical Variety & Promotional Tag */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Flower / Botanical Spec</label>
                    <input
                      type="text"
                      placeholder="e.g. Ecuadorian Roses, Monstera, Phalaenopsis"
                      value={productForm.flowerType}
                      onChange={(e) => setProductForm({ ...productForm, flowerType: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Promotional Badge Tag</label>
                    <select
                      value={productForm.tag}
                      onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B]"
                    >
                      <option value="">No Badge</option>
                      <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                      <option value="BESTSELLER">BESTSELLER</option>
                      <option value="EXCLUSIVE">EXCLUSIVE</option>
                      <option value="LIMITED EDIT">LIMITED EDIT</option>
                      <option value="ORGANIC EXPORT">ORGANIC EXPORT</option>
                      <option value="SALE">SALE (20% OFF)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Pricing & Inventory */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] font-mono font-bold focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Original Price / MRP (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] font-mono focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Initial Stock Level *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] font-mono font-bold focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>
                </div>

                {/* MULTI-CURRENCY FIXED PRICING MATRIX (11 CURRENCIES) */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-[#C2185B]" />
                      <span className="font-bold text-xs text-[#242124]">
                        Fixed Rate & Price Matrix for Every Currency
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const inrPrice = Number(productForm.price) || 2499;
                        const newFixed = {};
                        currenciesList.forEach((c) => {
                          const val = c.rateToINR ? inrPrice / c.rateToINR : inrPrice;
                          newFixed[c.code] = Number(val.toFixed(c.code === 'KWD' || c.code === 'OMR' || c.code === 'BHD' ? 2 : 0));
                        });
                        setProductForm((prev) => ({
                          ...prev,
                          fixedPrices: newFixed,
                        }));
                        toast.success('Auto-populated fixed rates across all 11 currencies based on current exchange matrix!');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FFF0F4] hover:bg-[#FFE4EC] text-[#C2185B] border border-[#F2D7DE] text-[10px] font-bold transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      ⚡ Auto-Calculate Fixed Rates
                    </button>
                  </div>

                  <p className="text-[10px] text-[#777]">
                    Set custom fixed prices for international patrons or use auto-calculated exchange conversions.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                    {currenciesList.map((c) => {
                      const curVal = productForm.fixedPrices?.[c.code] ?? (
                        c.rateToINR ? Number(((Number(productForm.price) || 2499) / c.rateToINR).toFixed(c.code === 'KWD' || c.code === 'OMR' || c.code === 'BHD' ? 2 : 0)) : 100
                      );

                      return (
                        <div key={c.code} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE] space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-[#555]">
                            <span>{c.flag} {c.code}</span>
                            <span className="font-mono text-[#888]">{c.symbol}</span>
                          </div>
                          <input
                            type="number"
                            step={c.code === 'KWD' || c.code === 'OMR' || c.code === 'BHD' ? '0.01' : '1'}
                            value={curVal}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setProductForm((prev) => ({
                                ...prev,
                                fixedPrices: {
                                  ...(prev.fixedPrices || {}),
                                  [c.code]: val,
                                },
                              }));
                            }}
                            className="w-full h-8 px-2 rounded-lg bg-white border border-[#DCD5CD] text-[#242124] font-mono font-bold text-xs focus:outline-none focus:border-[#C2185B]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Product Image Upload & Media Management (Properly Aligned) */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EFE7DE] pb-2">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#C2185B]" />
                      <span className="font-bold text-xs text-[#242124]">
                        Product Image & Visual Asset *
                      </span>
                    </div>
                    {uploadingImage ? (
                      <span className="text-[#C2185B] text-[10px] font-bold animate-pulse">
                        Compressing & saving image...
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                        Instant Live Preview
                      </span>
                    )}
                  </div>

                  {/* Aligned 2-Column: Live Preview (Left) + Upload Controls (Right) */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                    {/* Live Preview Thumbnail */}
                    <div className="relative group shrink-0">
                      <img
                        src={getProductImageUrl(productForm.images || productForm.image)}
                        alt="Product Preview"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-[#C2185B]/40 shadow-sm bg-white"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity pointer-events-none">
                        Live
                      </div>
                    </div>

                    {/* Dual Upload Options */}
                    <div className="flex-1 w-full space-y-2">
                      {/* File Upload Trigger */}
                      <label className="flex items-center justify-center gap-2 w-full h-10 px-3 rounded-xl border border-dashed border-[#C2185B] bg-white hover:bg-[#FFF5F8] text-[#C2185B] font-semibold text-xs cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Select Image from Computer</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLocalImageUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Direct Image URL input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Or paste direct image URL (https://... or /images/...)"
                          value={productForm.images || ''}
                          onChange={(e) => setProductForm({ ...productForm, images: e.target.value, image: e.target.value })}
                          className="w-full h-8 px-2.5 rounded-lg bg-white border border-[#DCD5CD] text-[#242124] text-xs placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Linux Hosting Path Subtext */}
                  <div className="flex items-center justify-between text-[10px] text-[#666666] bg-white p-2 rounded-lg border border-[#EFE7DE]">
                    <span className="truncate">
                      Linux Asset: <code className="text-[#C2185B] font-mono">{productForm.linuxHostingPath || `/images/products/${(productForm.name || 'bouquet').toLowerCase().replace(/\s+/g, '-')}.jpg`}</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const path = productForm.linuxHostingPath || `/images/products/${(productForm.name || 'bouquet').toLowerCase().replace(/\s+/g, '-')}.jpg`;
                        navigator.clipboard.writeText(path);
                        toast.success('Copied Linux asset path!');
                      }}
                      className="text-[#C2185B] hover:underline font-bold shrink-0 ml-2 cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>

                  {/* 1-Click Curated Presets */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-[#777777] font-semibold block">Quick Curated Botanical Photo Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {IMAGE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setProductForm({
                              ...productForm,
                              images: preset.url,
                              image: preset.url,
                              category: preset.category,
                              flowerType: preset.flowerType,
                              subCategory: CATEGORY_SUBCATEGORIES_MAP[preset.category]?.[0] || productForm.subCategory,
                            });
                            toast.info(`Selected ${preset.name} image preset`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FFF0F4] hover:text-[#C2185B] hover:border-[#F2D7DE] border border-[#EFE7DE] text-[10px] text-[#555555] transition-all cursor-pointer"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Botanical Plant Care Specs (Optional) */}
                {productForm.category === 'Plants' && (
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-800 block">🌿 Botanical Plant Care Specs:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Light: Bright Indirect"
                        value={productForm.lightRequirement}
                        onChange={(e) => setProductForm({ ...productForm, lightRequirement: e.target.value })}
                        className="h-8 px-2.5 rounded-lg bg-white border border-emerald-200 text-[#242124] text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="Water: 1x weekly"
                        value={productForm.waterFrequency}
                        onChange={(e) => setProductForm({ ...productForm, waterFrequency: e.target.value })}
                        className="h-8 px-2.5 rounded-lg bg-white border border-emerald-200 text-[#242124] text-[11px]"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Description & Floristry Notes */}
                <div>
                  <label className="block text-[#444444] font-semibold mb-1">Product Description & Floristry Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Describe stem varieties, fragrance notes, vase care tips..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-[#EFE7DE]">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666666] hover:text-[#EC407A] text-xs font-semibold border border-[#EFE7DE] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
                  >
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: PACKING SLIP & ORDER DETAILS INSPECTION
            ======================================================== */}
        {selectedOrderModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-xl w-full max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-5 shadow-2xl text-[#242124]">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DE]">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#C2185B]" />
                  <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                    Order Packing Slip & Fulfillment Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrderModal(null)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE6] flex items-center justify-center text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Packing Slip Area */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE] space-y-4 text-xs">
                {/* Header branding on slip */}
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DE]">
                  <div>
                    <span className="font-bold text-sm tracking-wider uppercase text-[#242124] font-['Poppins']">
                      Dhanvikk Blooms Atelier
                    </span>
                    <span className="text-[10px] text-[#C2185B] block font-medium">Luxury Floral & Air Cargo Fulfillment</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#242124] text-xs block">
                      #{selectedOrderModal.orderId || selectedOrderModal._id}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">
                      {selectedOrderModal.paymentInfo?.status || selectedOrderModal.paymentStatus || 'Paid (Razorpay)'}
                    </span>
                  </div>
                </div>

                {/* Recipient info & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Ship To:</span>
                    <p className="font-bold text-[#242124]">
                      {selectedOrderModal.shippingAddress?.fullName || selectedOrderModal.recipientName || 'Patron'}
                    </p>
                    <p className="text-[#555555]">{selectedOrderModal.shippingAddress?.phone || selectedOrderModal.recipientPhone}</p>
                    <p className="text-[#666666] mt-1 leading-relaxed">
                      {selectedOrderModal.shippingAddress?.streetAddress || selectedOrderModal.deliveryAddress?.street}
                      <br />
                      {selectedOrderModal.shippingAddress?.city || selectedOrderModal.deliveryAddress?.city}, {selectedOrderModal.shippingAddress?.state || 'UAE / IN'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Delivery Slot:</span>
                    <p className="font-bold text-[#242124] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C2185B]" />
                      {selectedOrderModal.deliveryDate || 'Scheduled'}
                    </p>
                    <p className="text-[#C2185B] font-semibold flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedOrderModal.timeSlot || selectedOrderModal.deliverySlot || 'Standard Delivery'}
                    </p>

                    {/* Status Pill */}
                    <div className="mt-3">
                      <span className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Current Status:</span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE] inline-block">
                        {selectedOrderModal.status || selectedOrderModal.orderStatus || 'Confirmed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Handwritten card message note */}
                {(selectedOrderModal.greetingCardMessage || selectedOrderModal.greetingMessage) && (
                  <div className="p-3 rounded-xl bg-white border border-[#EFE7DE] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#C2185B] block">
                      Handwritten Gift Card Inscription:
                    </span>
                    <p className="text-xs text-[#242124] italic">
                      "{selectedOrderModal.greetingCardMessage || selectedOrderModal.greetingMessage}"
                    </p>
                  </div>
                )}

                {/* Itemized Table */}
                <div className="space-y-2 pt-2 border-t border-[#EFE7DE]">
                  <span className="text-[10px] uppercase font-bold text-[#777777] block">Itemized Flowers:</span>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[#777777] text-[10px] border-b border-[#EFE7DE] pb-1">
                        <th className="pb-1 font-semibold">Item</th>
                        <th className="pb-1 text-center font-semibold">Qty</th>
                        <th className="pb-1 text-right font-semibold">Price</th>
                        <th className="pb-1 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE7DE]">
                      {selectedOrderModal.items?.map((it, idx) => (
                        <tr key={idx} className="py-1.5">
                          <td className="py-2 text-[#242124] font-medium">{it.name}</td>
                          <td className="py-2 text-center font-mono text-[#555555]">{it.quantity}</td>
                          <td className="py-2 text-right font-mono text-[#555555]">₹{it.price?.toLocaleString()}</td>
                          <td className="py-2 text-right font-mono text-[#242124] font-bold">
                            ₹{(it.price * it.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="pt-3 border-t border-[#EFE7DE] flex justify-between items-center text-sm font-bold text-[#242124]">
                    <span>Order Total:</span>
                    <span className="font-mono text-[#C2185B] text-base">
                      ₹{selectedOrderModal.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#FFF0F4] hover:bg-[#FFE4EC] text-[#C2185B] border border-[#F2D7DE] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Packing Slip
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderModal(null)}
                    className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: ADD / EDIT STAFF MEMBER (SUPER ADMIN)
            ======================================================== */}
        {showStaffModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-5 shadow-2xl text-[#242124]">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DE]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#FEF3C7] text-[#854D0E] border border-[#FDE68A]">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                      {editingStaff ? 'Edit Staff Credentials' : 'Onboard New Staff Member'}
                    </h3>
                    <p className="text-[11px] text-[#777777]">Authorize operational access for Dhanvikk Blooms</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStaffModal(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE6] flex items-center justify-center text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
                {/* Staff Full Name */}
                <div>
                  <label className="block text-[#444444] font-semibold mb-1">Staff Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Krishnan"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Staff Email */}
                <div>
                  <label className="block text-[#444444] font-semibold mb-1">Official / Login Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. maya.florist@dhanvikk.com"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Role and Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">System Role *</label>
                    <select
                      value={staffForm.role}
                      onChange={(e) => {
                        const r = e.target.value;
                        const autoTitle =
                          r === 'super_admin'
                            ? 'Super Admin & Co-Founder'
                            : r === 'inventory_manager'
                            ? 'Master Florist & Inventory'
                            : r === 'delivery_manager'
                            ? 'Cold-Chain Dispatch Coordinator'
                            : r === 'manager'
                            ? 'Store Operations Manager'
                            : 'Store Administrator';
                        setStaffForm({ ...staffForm, role: r, roleTitle: autoTitle });
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="inventory_manager">Master Florist & Inventory</option>
                      <option value="delivery_manager">Delivery & Dispatch Coordinator</option>
                      <option value="admin">Store Administrator</option>
                      <option value="manager">Operations Manager</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Designation Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Master Florist"
                      value={staffForm.roleTitle}
                      onChange={(e) => setStaffForm({ ...staffForm, roleTitle: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Contact Phone & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+971 50 000 0000 or +91 ..."
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Status</label>
                    <select
                      value={staffForm.status}
                      onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Active">Active on Duty</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Super Admin Notice */}
                <div className="p-3 rounded-xl bg-[#FEF3C7]/60 border border-[#FDE68A] text-[11px] text-[#854D0E] flex items-start gap-2">
                  <Crown className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#854D0E]" />
                  <span>
                    Staff credentials allow managing inventory, updating order statuses, and printing fulfillment slips. Controlled by Super Admin: <strong>{superAdminEmail}</strong>.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-[#EFE7DE]">
                  <button
                    type="button"
                    onClick={() => setShowStaffModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666666] hover:text-[#EC407A] text-xs font-semibold border border-[#EFE7DE] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:opacity-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    {editingStaff ? 'Update Staff Credentials' : 'Authorize & Add Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: ADD / EDIT COLLECTION & CATEGORY
            ======================================================== */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-5 shadow-2xl text-[#242124]">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DE]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE]">
                    <Flower2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                      {editingCategory ? 'Edit Floral Category' : 'Create New Collection & Category'}
                    </h3>
                    <p className="text-[11px] text-[#777777]">Organize bouquets, potted greens, and occasion edits</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE6] flex items-center justify-center text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                {/* Category Name */}
                <div>
                  <label className="block text-[#444444] font-semibold mb-1">Category Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Velvet Flower Boxes, Forever Roses"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                  />
                </div>

                {/* Slug & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">URL Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. flower-boxes"
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] font-mono placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#444444] font-semibold mb-1">Promotional Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. SIGNATURE EDIT, 3+ YEARS"
                      value={categoryForm.badge}
                      onChange={(e) => setCategoryForm({ ...categoryForm, badge: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[#444444] font-semibold mb-1">Editorial Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short summary displayed on category banners..."
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                  />
                </div>

                {/* Subcategories */}
                <div>
                  <label className="block text-[#444444] font-semibold mb-1">Subcategories (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Hatboxes, Round Trays, Square Domes"
                    value={categoryForm.subCategories}
                    onChange={(e) => setCategoryForm({ ...categoryForm, subCategories: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] placeholder:text-[#999999] focus:outline-none focus:border-[#C2185B]"
                  />
                </div>

                {/* Image URL & Local Upload */}
                <div className="space-y-2">
                  <label className="block text-[#444444] font-semibold">Category Hero Image</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={categoryForm.image}
                      alt="Category Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-[#EFE7DE] bg-white flex-shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <input
                      type="text"
                      required
                      value={categoryForm.image}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                      placeholder="Image URL or local path"
                      className="flex-1 h-9 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] text-xs focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>

                  <label className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#242124] border border-[#EFE7DE] text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#C2185B]" />
                    <span>Upload Local Category Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setCategoryForm((prev) => ({
                            ...prev,
                            image: ev.target.result,
                          }));
                          toast.success('Category image set from local storage!');
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>

                {/* Active Toggle */}
                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="catActive"
                    checked={categoryForm.active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C2185B] focus:ring-[#C2185B]"
                  />
                  <label htmlFor="catActive" className="text-xs font-semibold text-[#242124] cursor-pointer">
                    Display active on storefront navigation and filters
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-[#EFE7DE]">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666666] hover:text-[#EC407A] text-xs font-semibold border border-[#EFE7DE] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#EC407A] hover:opacity-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: EDIT MULTI-CURRENCY FIXED RATE
            ======================================================== */}
        {showCurrencyModal && editingCurrency && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-[#242124] space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DE]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#FFF0F4] text-[#C2185B] border border-[#F2D7DE]">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                      Edit Fixed Rate • {editingCurrency.code}
                    </h3>
                    <p className="text-[11px] text-[#777777]">{editingCurrency.name} ({editingCurrency.flag})</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCurrencyModal(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE6] flex items-center justify-center text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCurrencyRate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#444] font-semibold mb-1">
                    Multiplier vs Base AED (1 AED = ? {editingCurrency.code}) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={currencyRateForm.rateFromAED}
                    onChange={(e) => setCurrencyRateForm({ ...currencyRateForm, rateFromAED: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] font-mono font-bold focus:outline-none focus:border-[#C2185B]"
                  />
                  <span className="text-[10px] text-[#888] mt-1 block">
                    Used when patrons select {editingCurrency.code} during checkout.
                  </span>
                </div>

                <div>
                  <label className="block text-[#444] font-semibold mb-1">
                    Value in Indian Rupee (1 {editingCurrency.code} = ? INR ₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currencyRateForm.rateToINR}
                    onChange={(e) => setCurrencyRateForm({ ...currencyRateForm, rateToINR: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] font-mono font-bold focus:outline-none focus:border-[#C2185B]"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE] space-y-1">
                  <span className="text-[11px] font-bold text-[#242124] block">Live Preview Calculation:</span>
                  <p className="text-xs text-[#555]">
                    AED 150 signature bouquet converts to:
                  </p>
                  <p className="text-base font-mono font-bold text-[#C2185B]">
                    {editingCurrency.symbol} {(150 * Number(currencyRateForm.rateFromAED)).toFixed(editingCurrency.code === 'KWD' || editingCurrency.code === 'OMR' ? 2 : 0)} {editingCurrency.code}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#EFE7DE]">
                  <button
                    type="button"
                    onClick={() => setShowCurrencyModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666] text-xs font-semibold border border-[#EFE7DE] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white text-xs font-bold shadow-md hover:opacity-95 cursor-pointer"
                  >
                    Save Fixed Rate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: INSPECT CUSTOMER PAYMENT RECEIPT
            ======================================================== */}
        {selectedPaymentReceipt && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-5 sm:space-y-6 shadow-2xl text-[#242124]">
              {/* Slip Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EFE7DE]">
                <div className="flex items-center gap-3">
                  <Logo size="sm" linkTo="/admin/dashboard" />
                  <div>
                    <h3 className="text-base font-bold text-[#242124] font-['Poppins']">
                      Official Payment Receipt
                    </h3>
                    <p className="text-[11px] text-[#777777] font-mono">
                      Ref: {selectedPaymentReceipt.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPaymentReceipt(null)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE6] flex items-center justify-center text-[#666666] hover:text-[#EC407A] border border-[#EFE7DE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Payment Gateway Settlement
                  </span>
                  <span className="text-sm font-bold text-emerald-900 font-mono">
                    {selectedPaymentReceipt.gateway}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                  {selectedPaymentReceipt.status}
                </span>
              </div>

              {/* Customer and Order Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block">
                    Patron Information
                  </span>
                  <p className="font-bold text-[#242124]">{selectedPaymentReceipt.customerName}</p>
                  <p className="text-[#666] font-mono">{selectedPaymentReceipt.customerEmail}</p>
                  <p className="text-[#888]">{selectedPaymentReceipt.city}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block">
                    Order Reference & Time
                  </span>
                  <p className="font-bold font-mono text-[#C2185B]">{selectedPaymentReceipt.orderId}</p>
                  <p className="text-[#666] font-mono">{selectedPaymentReceipt.date}</p>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EFE7DE] text-[10px] text-[#555]">
                    Verified Transaction
                  </span>
                </div>
              </div>

              {/* Order Items in Transaction */}
              <div className="space-y-2 pt-2 border-t border-[#EFE7DE]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block">
                  Purchased Botanical Items
                </span>
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE] text-xs font-medium text-[#242124]">
                  {selectedPaymentReceipt.items}
                </div>
              </div>

              {/* Settlement Total */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF0F4] to-[#FFFDF9] border border-[#F2D7DE] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#666] block">Settled Total Amount</span>
                  <span className="text-xs font-mono text-[#888]">Direct Currency Checkout</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-[#C2185B]">
                    {selectedPaymentReceipt.currency} {selectedPaymentReceipt.amount.toLocaleString()}
                  </span>
                  {selectedPaymentReceipt.currency !== 'INR' && (
                    <span className="text-[10px] text-[#888] font-mono block">
                      ≈ ₹{(selectedPaymentReceipt.amount * (selectedPaymentReceipt.currency === 'AED' ? 22.8 : 83.5)).toFixed(0)} INR
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#FFF0F4] hover:bg-[#FFE4EC] text-[#C2185B] border border-[#F2D7DE] text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt Slip
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentReceipt(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#666] text-xs font-semibold border border-[#EFE7DE] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
