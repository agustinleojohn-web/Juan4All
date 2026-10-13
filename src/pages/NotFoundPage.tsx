import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, Search } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6">
        <BrandLogo size="lg" />
      </div>

      <div className="p-8 max-w-md w-full bg-[#181818] border border-[#333333] rounded-lg shadow-2xl">
        <span className="text-6xl font-black text-[#800000] tracking-tighter">404</span>
        <h1 className="text-xl font-bold text-white mt-2 mb-2">Lost in the Catalog?</h1>
        <p className="text-xs sm:text-sm text-[#B3B3B3] leading-relaxed mb-6">
          The title, scene, or page you were looking for doesn&apos;t exist or has moved to another frequency.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/search"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#222222] hover:bg-[#333333] text-white text-xs font-semibold rounded-lg border border-[#333333] transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
