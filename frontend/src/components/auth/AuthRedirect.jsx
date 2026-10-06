import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthRedirect({
  prompt = 'New to Dhanvikk Blooms?',
  actionText = 'Create an account',
  to = '/register',
  className = '',
}) {
  return (
    <div className={`text-center text-[13px] sm:text-[14px] text-[#777777] ${className}`}>
      <span>{prompt} </span>
      <Link
        to={to}
        className="font-semibold text-[#EC407A] hover:text-[#C2185B] transition-colors inline-flex items-center gap-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC407A] rounded px-1"
      >
        <span className="relative">
          {actionText}
          <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-[#C2185B] transition-all duration-200 group-hover:w-full"></span>
        </span>
      </Link>
    </div>
  );
}
