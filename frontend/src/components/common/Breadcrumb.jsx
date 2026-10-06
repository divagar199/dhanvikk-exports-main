import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

// Friendly route display names
const ROUTE_LABELS = {
  category: 'Collections',
  product: 'Botanical Details',
  checkout: 'Secure Checkout',
  account: 'My Account',
  login: 'Sign In',
  register: 'Create Account',
  'forgot-password': 'Password Recovery',
  'reset-password': 'Reset Password',
  admin: 'Staff Portal',
  dashboard: 'Atelier Console',
  orders: 'Recent Orders',
  wishlist: 'Saved Bouquets',
  addresses: 'Saved Addresses',
  security: 'Account Security',
  flowers: 'Roses & Luxury Bouquets',
  garlands: 'Royal Traditional Garlands',
  plants: 'Exotic Botanical Plants',
  gifting: 'Signature Curated Gifting',
  wedding: 'Bridal & Wedding Florals',
  temple: 'Temple & Puja Offerings',
  occasions: 'Occasions & Celebrations',
};

/**
 * Universal Breadcrumb component for Dhanvikk Luxury Blooms.
 * Can receive explicit `items` array: [{ label: 'Home', path: '/' }, { label: 'Garlands', path: '/category/garlands' }, { label: 'Jasmine' }]
 * If `items` is not provided, it parses `useLocation()` to build a breadcrumb trail.
 */
export default function Breadcrumb({ items, className = '', showHomeIcon = true }) {
  const location = useLocation();

  // If on root home page and no explicit items passed, do not render redundant breadcrumb
  if (!items && (location.pathname === '/' || location.pathname === '')) {
    return null;
  }

  // Generate breadcrumb items from URL if not explicitly provided
  const breadcrumbItems = items || (() => {
    const pathnames = location.pathname.split('/').filter(Boolean);
    const generated = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathnames.length - 1;

      // Clean up segment name
      const decodedSegment = decodeURIComponent(segment).toLowerCase();
      let label = ROUTE_LABELS[decodedSegment] || segment;

      // Handle product IDs or hashes
      if (pathnames[0] === 'product' && index === 1) {
        label = 'Arrangement Details';
      } else if (pathnames[0] === 'account' && index === 1) {
        label = 'Concierge Key Access';
      } else if (!ROUTE_LABELS[decodedSegment]) {
        // Convert slug or snake_case to Title Case
        label = label
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
      }

      generated.push({
        label,
        path: isLast ? null : currentPath,
      });
    });

    return generated;
  })();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`w-full overflow-x-auto scrollbar-none py-2.5 ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-[#7A7476] font-['Poppins']">
        {breadcrumbItems.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.path || item.label || index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-[#C9BEB7] shrink-0"
                  aria-hidden="true"
                />
              )}

              {item.path ? (
                <Link
                  to={item.path}
                  className="flex items-center gap-1 hover:text-[#C2185B] transition-colors rounded-md py-0.5 px-1 hover:bg-[#FFF0F4]/70 active:scale-98"
                >
                  {isFirst && showHomeIcon && (
                    <Home className="w-3.5 h-3.5 text-[#C2185B]" aria-hidden="true" />
                  )}
                  <span className="font-normal">{item.label}</span>
                </Link>
              ) : (
                <span
                  className="font-semibold text-[#242124] max-w-[240px] sm:max-w-xs md:max-w-md truncate py-0.5 px-1 bg-[#FAF7F2] border border-[#EFE7DE] rounded-md text-[11.5px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
