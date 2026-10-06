import React from 'react';
import { Link } from 'react-router-dom';
import brandLogo from '../../assets/dhanvikk-brand-logo.png';

export default function Logo({ size = 'md', className = '', linkTo = '/' }) {
  // Size mapping for the official brand logo
  const sizeClasses = {
    xs: 'h-7 sm:h-8',
    sm: 'h-9 sm:h-10',
    md: 'h-11 sm:h-13',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  };

  const content = (
    <div className={`inline-flex items-center justify-center group select-none ${className}`}>
      <img
        src={brandLogo}
        alt="Dhanvikk Blooms Luxury Florist Atelier Brand Logo"
        className={`${sizeClasses[size] || sizeClasses.md} w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-105`}
        loading="lazy"
        decoding="async"
        width="180"
        height="50"
      />
    </div>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC407A] rounded-lg inline-flex items-center"
        aria-label="Dhanvikk Blooms Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
