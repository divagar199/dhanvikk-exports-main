import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, Flower2 } from 'lucide-react';

export default function SubNav() {
  const [activeMenu, setActiveMenu] = useState(null);
  const timeoutRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const menuItems = [
    {
      title: 'FLOWERS',
      slug: 'flowers',
      sections: [
        {
          heading: 'BY FLOWER TYPE',
          links: [
            { name: 'Ecuadorian Roses', href: '/category/roses' },
            { name: 'Casablanca Lilies', href: '/category/lilies' },
            { name: 'Dutch Tulips', href: '/category/tulips' },
            { name: 'Blush Peonies', href: '/category/peonies' },
            { name: 'Exotic Orchids', href: '/category/orchids' },
            { name: 'Golden Sunflowers', href: '/category/sunflowers' },
          ],
        },
        {
          heading: 'BY FLORAL STYLE',
          links: [
            { name: 'Handcrafted Bouquets', href: '/category/hand-bouquets' },
            { name: 'Luxury Flower Boxes', href: '/category/flower-boxes' },
            { name: 'Grand Arrangements', href: '/category/luxury' },
            { name: 'Forever Preserved Roses', href: '/category/forever-roses' },
          ],
        },
      ],
      featured: {
        badge: 'HAUTE FLORISTRY',
        title: 'Serenity Blush Roses',
        desc: 'Directly sourced Ecuadorian garden roses in frosted Parisian paper.',
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=500&q=80',
        href: '/category/roses',
        cta: 'Explore Roses',
      },
    },
    {
      title: 'OCCASION',
      slug: 'occasions',
      sections: [
        {
          heading: 'CELEBRATIONS',
          links: [
            { name: 'Birthday Flowers', href: '/category/birthday' },
            { name: 'Anniversary Bouquets', href: '/category/anniversary' },
            { name: 'Love & Romance', href: '/category/romance' },
            { name: 'Congratulations & Wins', href: '/category/congratulations' },
          ],
        },
        {
          heading: 'THOUGHTFUL CARE',
          links: [
            { name: 'Sympathy & Condolences', href: '/category/sympathy' },
            { name: 'Get Well Soon', href: '/category/get-well' },
            { name: 'Housewarming Gifts', href: '/category/housewarming' },
            { name: 'Thank You Flowers', href: '/category/thank-you' },
          ],
        },
      ],
      featured: {
        badge: 'SIGNATURE EDIT',
        title: 'Anniversary Grandeur',
        desc: 'Fifty deep velvety Ecuadorian red roses with gold-dusted palm leaves.',
        image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=500&q=80',
        href: '/category/anniversary',
        cta: 'View Occasions',
      },
    },
    {
      title: 'GIFT BUNDLES',
      slug: 'gift-bundles',
      sections: [
        {
          heading: 'GIFT GUIDE BY RECIPIENT',
          links: [
            { name: 'Gift Guide For Her', href: '/category/for-her' },
            { name: 'Gift Guide For Him', href: '/category/for-him' },
            { name: 'Gift Guide Mom', href: '/category/for-mom' },
            { name: 'Gift Guide Dad', href: '/category/for-dad' },
            { name: 'Best Friends Forever (BFFs)', href: '/category/bffs' },
          ],
        },
        {
          heading: 'LUXURY HAMPERS',
          links: [
            { name: 'Artisanal Chocolates & Roses', href: '/category/gift-bundles' },
            { name: 'Scented Candle Keepsakes', href: '/category/gift-bundles' },
            { name: 'Celebration Hampers', href: '/category/luxury' },
          ],
        },
      ],
      featured: {
        badge: 'CURATED GIFTING',
        title: 'Belgian Pralines & Roses',
        desc: 'Handcrafted confectioneries paired with fresh botanical stems.',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=500&q=80',
        href: '/category/gift-bundles',
        cta: 'Shop Bundles',
      },
    },
    {
      title: 'FLOWER BOXES',
      slug: 'flower-boxes',
      sections: [
        {
          heading: 'SIGNATURE BOX RANGE',
          links: [
            { name: 'Velvet Round Hatboxes', href: '/category/flower-boxes' },
            { name: 'Romantic Heart Shaped Boxes', href: '/category/flower-boxes' },
            { name: 'Square Keepsake Chests', href: '/category/flower-boxes' },
            { name: 'Acrylic Rose Drawers', href: '/category/flower-boxes' },
          ],
        },
        {
          heading: 'CURATED STYLES',
          links: [
            { name: 'Blush Velvet Edition', href: '/category/flower-boxes' },
            { name: 'Imperial Noir Box', href: '/category/flower-boxes' },
            { name: 'Pastel Gardenia Box', href: '/category/flower-boxes' },
          ],
        },
      ],
      featured: {
        badge: 'PARISIAN STYLE',
        title: 'Velvet Bloom Chest',
        desc: 'Dutch pink peonies and lisianthus arranged in velvet keepsake boxes.',
        image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=500&q=80',
        href: '/category/flower-boxes',
        cta: 'Browse Boxes',
      },
    },
    {
      title: 'PLANTS',
      slug: 'plants',
      sections: [
        {
          heading: 'INDOOR BOTANICALS',
          links: [
            { name: 'Phalaenopsis Living Orchids', href: '/category/orchids' },
            { name: 'Ceramic Artisan Planters', href: '/category/plants' },
            { name: 'Miniature Bonsai Gardens', href: '/category/plants' },
            { name: 'Air Purifying Greenery', href: '/category/plants' },
          ],
        },
        {
          heading: 'PLANT CARE & VASES',
          links: [
            { name: 'Botanical Plant Food', href: '/category/plants' },
            { name: 'Terracotta & Ceramic Pots', href: '/category/plants' },
          ],
        },
      ],
      featured: {
        badge: 'LIVING BOTANICALS',
        title: 'Cascading White Orchids',
        desc: 'Two-stem pure white orchids potted in artisanal ceramic planter.',
        image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=500&q=80',
        href: '/category/plants',
        cta: 'Shop Plants',
      },
    },
    {
      title: 'FOREVER ROSES',
      slug: 'forever-roses',
      sections: [
        {
          heading: 'PRESERVED PETALS',
          links: [
            { name: 'Enchanted Glass Bell Domes', href: '/category/forever-roses' },
            { name: 'Lasts 3+ Years (Zero Water)', href: '/category/forever-roses' },
            { name: 'Rose Gold Metallic Finish', href: '/category/forever-roses' },
            { name: 'Mini Forever Keepsakes', href: '/category/forever-roses' },
          ],
        },
        {
          heading: 'COLOR VARIETIES',
          links: [
            { name: 'Royal Crimson Red', href: '/category/forever-roses' },
            { name: 'Midnight Sapphire Blue', href: '/category/forever-roses' },
            { name: 'Golden Champagne', href: '/category/forever-roses' },
          ],
        },
      ],
      featured: {
        badge: '3+ YEARS LIFESPAN',
        title: 'Enchanted Beauty Dome',
        desc: '100% natural Ecuadorian preserved rose sealed in hand-blown glass.',
        image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=500&q=80',
        href: '/category/forever-roses',
        cta: 'Explore Domes',
      },
    },
  ];

  const handleMouseEnter = (title) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(title);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180); // gentle delay to allow moving into dropdown smoothly
  };

  const activeMenuItem = menuItems.find((item) => item.title === activeMenu);

  return (
    <nav 
      ref={navRef}
      onMouseLeave={handleMouseLeave}
      className="relative bg-white border-b border-[#F7F2ED] z-30 select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ul className="flex items-center justify-center gap-5 sm:gap-8 lg:gap-10 text-[12px] sm:text-[13px] font-semibold text-[#242124] tracking-wider py-3 overflow-x-auto lg:overflow-visible scrollbar-none">
          {menuItems.map((item) => {
            const isOpen = activeMenu === item.title;

            return (
              <li
                key={item.title}
                onMouseEnter={() => handleMouseEnter(item.title)}
                className="py-1 group cursor-pointer whitespace-nowrap"
              >
                <Link
                  to={`/category/${item.slug}`}
                  onClick={() => setActiveMenu(null)}
                  className={`flex items-center gap-1.5 py-1.5 transition-colors ${
                    isOpen ? 'text-[#EC407A]' : 'text-[#242124] hover:text-[#EC407A]'
                  }`}
                >
                  <span className="font-semibold">{item.title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#EC407A]' : 'text-[#777777] group-hover:text-[#EC407A]'
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Centered Mega Menu Dropdown anchored to full navigation bar */}
        {activeMenuItem && (
          <div
            onMouseEnter={() => handleMouseEnter(activeMenuItem.title)}
            onMouseLeave={handleMouseLeave}
            className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[780px] lg:w-[860px] max-w-[96vw] z-50 animate-in fade-in slide-in-from-top-1 duration-150 pointer-events-auto"
            style={{
              filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.14))',
            }}
          >
            {/* Invisible bridge over the top gap to maintain hover */}
            <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F7F2ED] grid grid-cols-12 gap-6 text-left shadow-2xl">
              {/* Left: Category Sub-Links (7 Cols) */}
              <div className="col-span-12 sm:col-span-7 grid grid-cols-2 gap-6">
                {activeMenuItem.sections.map((sec) => (
                  <div key={sec.heading} className="space-y-3">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-[#EC407A] flex items-center gap-1.5 border-b border-[#FFF3F6] pb-1.5">
                      <Flower2 className="w-3 h-3" />
                      <span>{sec.heading}</span>
                    </p>
                    <ul className="space-y-2 text-xs text-[#444444]">
                      {sec.links.map((link) => (
                        <li key={link.name}>
                          <Link
                            to={link.href}
                            onClick={() => setActiveMenu(null)}
                            className="hover:text-[#EC407A] hover:translate-x-1 transition-all inline-block py-0.5 font-medium"
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Right: Featured Showcase Card (5 Cols) */}
              {activeMenuItem.featured && (
                <div className="col-span-12 sm:col-span-5 bg-gradient-to-br from-[#FFF3F6] via-[#FFF8F9] to-[#FAF7F2] rounded-2xl p-5 flex flex-col justify-between overflow-hidden relative border border-[#FCC1C5]/50">
                  <div>
                    <div className="relative rounded-xl overflow-hidden mb-3 aspect-[16/10] bg-white shadow-xs">
                      <img
                        src={activeMenuItem.featured.image}
                        alt={`${activeMenuItem.featured.title} - Dhanvikk Luxury Floristry Featured Collection`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#242124]/85 text-white text-[9px] font-bold tracking-wider uppercase">
                        {activeMenuItem.featured.badge}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#242124] leading-snug">
                      {activeMenuItem.featured.title}
                    </h4>
                    <p className="text-xs text-[#777777] mt-1 leading-relaxed line-clamp-2">
                      {activeMenuItem.featured.desc}
                    </p>
                  </div>

                  <Link
                    to={activeMenuItem.featured.href}
                    onClick={() => setActiveMenu(null)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#EC407A] hover:text-[#C2185B] transition-colors group/cta"
                  >
                    <span>{activeMenuItem.featured.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
