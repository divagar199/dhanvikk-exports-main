import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://dhanvikkexports.com';
const DEFAULT_TITLE = 'Dhanvikk Blooms | Luxury Flowers, Bouquets & Gifting Atelier';
const DEFAULT_DESCRIPTION =
  'Dhanvikk Blooms is a premier haute couture florist and botanical export atelier. Handcrafted luxury roses, velvet Parisian hatboxes, preserved forever roses, and fresh temple jasmine garlands with same-day delivery.';
const DEFAULT_IMAGE = `${BASE_URL}/dhanvikk-brand-logo.png`;

/**
 * Universal SEO, AEO & GEO Metadata Manager
 * Injects Open Graph, Twitter Cards, Semantic Microdata, Geo-Location & Schema.org JSON-LD
 */
export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  ogImageAlt = 'Dhanvikk Blooms Haute Couture Floristry',
  noindex = false,
  breadcrumbs = null,
  faq = null,
  jsonLd = null,
  geo = null,
}) {
  const fullTitle = title.includes('Dhanvikk') ? title : `${title} | Dhanvikk Blooms`;
  const canonicalUrl = canonical
    ? canonical.startsWith('http')
      ? canonical
      : `${BASE_URL}${canonical}`
    : `${BASE_URL}/`;

  const resolvedOgImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  // Build BreadcrumbList Schema if breadcrumbs array provided
  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: crumb.name || crumb.label,
            item: crumb.url
              ? crumb.url.startsWith('http')
                ? crumb.url
                : `${BASE_URL}${crumb.url}`
              : `${BASE_URL}${crumb.path || '/'}`,
          })),
        }
      : null;

  // Build FAQPage Schema if faq array provided (Crucial for AEO!)
  const faqSchema =
    faq && faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }
      : null;

  // Collect all Schema.org structured scripts
  const schemaList = [];
  if (breadcrumbSchema) schemaList.push(breadcrumbSchema);
  if (faqSchema) schemaList.push(faqSchema);
  if (jsonLd) {
    if (Array.isArray(jsonLd)) {
      schemaList.push(...jsonLd);
    } else {
      schemaList.push(jsonLd);
    }
  }

  const defaultKeywords =
    'luxury flowers, florist Bangalore, flower delivery Bengaluru, preserved forever roses, velvet flower boxes, Madurai jasmine export, fresh flower export UAE, Dhanvikk Blooms, same day flower delivery';
  const resolvedKeywords = keywords
    ? Array.isArray(keywords)
      ? keywords.join(', ')
      : keywords
    : defaultKeywords;

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={resolvedKeywords} />
      <link rel="canonical" href={canonicalUrl} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* GEO & Local Florist Metadata */}
      <meta name="geo.region" content={geo?.region || 'IN-KA'} />
      <meta name="geo.placename" content={geo?.placename || 'Bengaluru, Karnataka, India'} />
      <meta name="geo.position" content={geo?.position || '12.9467;77.6006'} />
      <meta name="ICBM" content={geo?.icbm || '12.9467, 77.6006'} />

      {/* Open Graph Protocol */}
      <meta property="og:site_name" content="Dhanvikk Blooms" />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@dhanvikkblooms" />
      <meta name="twitter:creator" content="@dhanvikkblooms" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {/* Injected Schemas for AEO / GEO */}
      {schemaList.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
