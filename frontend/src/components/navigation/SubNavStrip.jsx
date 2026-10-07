import React from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Flame, Clock, Award, Gift, Heart, Crown } from 'lucide-react';

export default function SubNavStrip({ activeFilter, onSelectFilter }) {
  const quickPills = [
    { label: 'ALL BLOOMS', icon: Flower2, query: 'all' },
    { label: 'BEST SELLERS', icon: Flame, query: 'bestseller' },
    { label: 'SAME DAY DELIVERY', icon: Clock, query: 'sameday' },
    { label: 'BIRTHDAY', icon: Gift, query: 'birthday' },
    { label: 'ANNIVERSARY', icon: Heart, query: 'anniversary' },
    { label: 'LUXURY ARRANGEMENTS', icon: Award, query: 'luxury' },
    { label: 'FOREVER ROSES', icon: Crown, query: 'forever-roses' },
    { label: 'FLOWER BOXES', icon: Gift, query: 'boxes' },
  ];

  return (
    <div className="bg-[#FAF7F2] border-b border-[#F7F2ED] py-2.5 px-4 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center justify-start lg:justify-center gap-2 sm:gap-3 flex-nowrap">
        {quickPills.map((pill) => {
          const Icon = pill.icon;
          const isActive = activeFilter === pill.query;

          return (
            <button
              key={pill.label}
              onClick={() => onSelectFilter && onSelectFilter(pill.query)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider whitespace-nowrap inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#EC407A] text-white shadow-xs'
                  : 'bg-white text-[#EC407A] border border-[#E9E2E5] hover:border-[#FCC1C5] hover:bg-[#FFF3F6] hover:text-[#C2185B]'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-[#EC407A]'}`} />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
