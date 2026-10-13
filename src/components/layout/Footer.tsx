import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-[#333333] pt-12 pb-16 px-4 sm:px-8 md:px-12 mt-16 text-[#B3B3B3]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div>
            <BrandLogo size="md" showTagline />
            <p className="text-xs text-[#808080] max-w-sm mt-3 leading-relaxed">
              Discover and enjoy curated movies, trending TV series, and cinematic favorites across authorized streaming sources.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 text-xs">
            <div>
              <h4 className="font-bebas text-base text-white tracking-wider uppercase mb-3">Browse</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/movies" className="hover:text-white transition-colors">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link to="/series" className="hover:text-white transition-colors">
                    TV Series
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bebas text-base text-white tracking-wider uppercase mb-3">Discover</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/trending" className="hover:text-white transition-colors">
                    Trending Now
                  </Link>
                </li>
                <li>
                  <Link to="/genres" className="hover:text-white transition-colors">
                    Browse Genres
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="hover:text-white transition-colors">
                    Search Catalog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bebas text-base text-white tracking-wider uppercase mb-3">My Library</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/watchlist" className="hover:text-white transition-colors">
                    Saved Watchlist
                  </Link>
                </li>
                <li>
                  <Link to="/history" className="hover:text-white transition-colors">
                    Watch History
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bebas text-base text-white tracking-wider uppercase mb-3">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://chillax-mocha.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5 text-white/90 font-medium group"
                    title="Download torrent movies on Chillax"
                  >
                    <span>Download torrent movies</span>
                    <ExternalLink className="w-3 h-3 text-[#E50914] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#808080]">
          <p className="max-w-2xl leading-relaxed">
            Juan4All is an independent movie &amp; TV discovery and streaming showcase. All metadata and media are streamed through verified, authorized, and open licensing providers.
          </p>
          <p className="whitespace-nowrap">
            &copy; {new Date().getFullYear()} Juan4All. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
