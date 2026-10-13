import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bookmark, History, X } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useWatchlist } from '../../hooks/useWatchlist';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { count: watchlistCount } = useWatchlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle closing search and clearing search state
  const handleCloseSearch = () => {
    setSearchQuery('');
    setShowSearchInput(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      handleCloseSearch();
    }
  };

  // Close search when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSearchInput) {
        handleCloseSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearchInput]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'TV Series', path: '/series' },
    { label: 'Trending', path: '/trending' },
    { label: 'Genres', path: '/genres' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0A0A0A]/95 backdrop-blur-md shadow-lg  py-3'
          : 'bg-gradient-to-b from-[#0A0A0A]/90 via-[#0A0A0A]/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Desktop Navigation (hidden on mobile if search expanded) */}
        <div className={`flex items-center gap-8 ${showSearchInput ? 'hidden sm:flex' : 'flex'}`}>
          <BrandLogo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-[#800000] rounded-lg px-2 py-1 font-sans ${
                    isActive
                      ? 'text-white font-semibold border-b-2 border-[#800000]'
                      : 'text-[#B3B3B3] hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Search, History, Watchlist Shortcuts */}
        <div className={`flex items-center gap-2 sm:gap-3 ${showSearchInput ? 'w-full sm:w-auto justify-end' : ''}`}>
          {/* Expanded Search Bar */}
          {showSearchInput ? (
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center w-full sm:w-72 bg-[#181818] border border-[#333333] focus-within:border-[#800000] rounded-lg px-2 py-1 transition-all"
            >
              <Search className="w-4 h-4 text-[#808080] shrink-0 mr-2" />
              <input
                type="text"
                autoFocus
                placeholder="Search movies, TV series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent text-white placeholder-[#808080] focus:outline-none"
              />
              {/* Explicit, high-visibility Close Button that clears query and closes search */}
              <button
                type="button"
                onClick={handleCloseSearch}
                className="p-1 text-[#808080] hover:text-white hover:bg-[#222222] rounded-md transition-colors shrink-0 ml-1"
                aria-label="Close search"
                title="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (location.pathname === '/search') {
                  // Already on search page
                } else {
                  setShowSearchInput(true);
                }
              }}
              className="p-2 text-[#B3B3B3] hover:text-white hover:bg-[#181818] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#800000]"
              aria-label="Open search"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* History Shortcut */}
          <Link
            to="/history"
            className="hidden sm:flex p-2 text-[#B3B3B3] hover:text-white hover:bg-[#181818] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#800000]"
            title="Watch History"
            aria-label="Watch History"
          >
            <History className="w-5 h-5" />
          </Link>

          {/* Watchlist Shortcut */}
          <Link
            to="/watchlist"
            className="relative p-2 text-[#B3B3B3] hover:text-white hover:bg-[#181818] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#800000]"
            title="My Saved Watchlist"
            aria-label={`Watchlist with ${watchlistCount} items`}
          >
            <Bookmark className="w-5 h-5" />
            {watchlistCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-[#800000] rounded-lg">
                {watchlistCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
