import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Film, Tv, Bookmark } from 'lucide-react';
import { useWatchlist } from '../../hooks/useWatchlist';

export const MobileBottomNav: React.FC = () => {
  const { count: watchlistCount } = useWatchlist();

  const items = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Movies', path: '/movies', icon: Film },
    { label: 'Series', path: '/series', icon: Tv },
    {
      label: 'Watchlist',
      path: '/watchlist',
      icon: Bookmark,
      badge: watchlistCount > 0 ? watchlistCount : undefined,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#333333] pb-safe"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors rounded-lg relative ${
                  isActive
                    ? 'text-[#800000] font-semibold'
                    : 'text-[#B3B3B3] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    {item.badge !== undefined && (
                      <span className="absolute -top-1 -right-2.5 flex items-center justify-center min-w-3.5 h-3.5 px-0.5 text-[9px] font-bold text-white bg-[#800000] rounded-lg">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
