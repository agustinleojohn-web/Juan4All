import React from 'react';
import { HeroBanner } from '../components/hero/HeroBanner';
import { MovieRow } from '../components/carousel/MovieRow';
import {
  useFeatured,
  useTrending,
  useMovies,
  useSeries,
  useTopRated,
  useGenreRow,
} from '../hooks/useCatalog';

export const HomePage: React.FC = () => {
  const { data: featuredItems, isLoading: loadingFeatured } = useFeatured();
  const { data: trendingItems, isLoading: loadingTrending } = useTrending('all');
  const { data: movieData, isLoading: loadingMovies } = useMovies();
  const { data: seriesData, isLoading: loadingSeries } = useSeries();
  const { data: topRatedItems, isLoading: loadingTopRated } = useTopRated();
  const { data: sciFiItems, isLoading: loadingSciFi } = useGenreRow('Sci-Fi');
  const { data: actionItems, isLoading: loadingAction } = useGenreRow('Action');
  const { data: comedyItems, isLoading: loadingComedy } = useGenreRow('Comedy');

  return (
    <div className="w-full">
      {/* Featured Cinematic Hero */}
      {loadingFeatured ? (
        <div className="w-full h-[65vh] bg-[#181818] animate-pulse" />
      ) : (
        featuredItems && <HeroBanner items={featuredItems} />
      )}

      {/* Main Browse Rows with Drag & Touch Support */}
      <div className="max-w-7xl mx-auto relative -mt-8 sm:-mt-12 md:-mt-16 z-20 space-y-2">
        {/* Row 1: Trending Now with Ranking Numbers */}
        <MovieRow
          title="Trending Now"
          items={trendingItems || []}
          viewAllLink="/trending"
          showRanks
          isLoading={loadingTrending}
        />

        {/* Row 2: Popular Movies */}
        <MovieRow
          title="Popular Movies"
          items={movieData?.items || []}
          viewAllLink="/movies"
          isLoading={loadingMovies}
        />

        {/* Row 3: Binge-Worthy TV Series */}
        <MovieRow
          title="Popular TV Series"
          items={seriesData?.items || []}
          viewAllLink="/series"
          isLoading={loadingSeries}
        />

        {/* Row 4: Sci-Fi & Speculative Worlds */}
        <MovieRow
          title="Sci-Fi & Cyberpunk Favorites"
          items={sciFiItems || []}
          viewAllLink="/genres?genre=Sci-Fi"
          isLoading={loadingSciFi}
        />

        {/* Row 5: High-Octane Action */}
        <MovieRow
          title="Action & Thrillers"
          items={actionItems || []}
          viewAllLink="/genres?genre=Action"
          isLoading={loadingAction}
        />

        {/* Row 6: Top Rated by Viewers */}
        <MovieRow
          title="Top Rated Classics"
          items={topRatedItems || []}
          viewAllLink="/trending?sort=rating"
          isLoading={loadingTopRated}
        />

        {/* Row 7: Animation & Comedy */}
        <MovieRow
          title="Animation & Comedy"
          items={comedyItems || []}
          viewAllLink="/genres?genre=Comedy"
          isLoading={loadingComedy}
        />
      </div>
    </div>
  );
};
