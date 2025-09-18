import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useMovies } from '../contexts/MovieContext'
import { MovieCard } from '../components/MovieCard'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { ChevronLeft, ChevronRight, Filter, Grid, List, Star, TrendingUp, Calendar } from 'lucide-react'
import { MovieFilters, SortBy } from '../types'

export const Movies: React.FC = () => {
  const navigate = useNavigate()
  const {
    popularMovies,
    popularLoading,
    popularError,
    popularPage,
    popularTotalPages,
    fetchPopularMovies,
    allMovies,
    allMoviesLoading,
    allMoviesError,
    allMoviesPage,
    allMoviesTotalPages,
    fetchAllMovies,
    nowPlayingMovies,
    nowPlayingLoading,
    nowPlayingError,
    nowPlayingPage,
    nowPlayingTotalPages,
    fetchNowPlayingMovies,
    topRatedMovies,
    topRatedLoading,
    topRatedError,
    topRatedPage,
    topRatedTotalPages,
    fetchTopRatedMovies,
    upcomingMovies,
    upcomingLoading,
    upcomingError,
    upcomingPage,
    upcomingTotalPages,
    fetchUpcomingMovies,
    newestMovies,
    newestLoading,
    fetchNewestMovies,
    genres
  } = useMovies()

  const [activeTab, setActiveTab] = useState<'popular' | 'all' | 'newest' | 'nowPlaying' | 'topRated' | 'upcoming'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<MovieFilters>({
    genres: [],
    sortBy: 'popularity.desc'
  })
  const [filtersApplied, setFiltersApplied] = useState(false)

  useEffect(() => {
    if (activeTab === 'popular') {
      fetchPopularMovies(1)
    } else if (activeTab === 'all') {
      fetchAllMovies(1, filtersApplied ? filters : undefined)
    } else if (activeTab === 'newest') {
      fetchNewestMovies()
    } else if (activeTab === 'nowPlaying') {
      fetchNowPlayingMovies(1)
    } else if (activeTab === 'topRated') {
      fetchTopRatedMovies(1)
    } else if (activeTab === 'upcoming') {
      fetchUpcomingMovies(1)
    }
  }, [activeTab, filters, filtersApplied])

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'popular' | 'all' | 'newest')
  }

  const handlePageChange = (page: number) => {
    if (activeTab === 'popular') {
      fetchPopularMovies(page)
    } else if (activeTab === 'all') {
      fetchAllMovies(page, filters)
    }
  }

  const handleSortChange = (sortBy: SortBy) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }

  const handleGenreFilter = (genreId: number) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres?.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...(prev.genres || []), genreId]
    }))
  }

  const renderPagination = (currentPage: number, totalPages: number) => {
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    )
  }

  const renderMoviesGrid = (movies: any[], loading: boolean, error: string | null) => {
    if (error) {
      return (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )
    }

    if (movies.length === 0) {
      return (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground">No movies found</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        : "space-y-4"
      }>
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            whileHover={{ scale: viewMode === 'grid' ? 1.05 : 1.02 }}
          >
            <MovieCard
              movie={movie}
              onClick={() => handleMovieClick(movie.id)}
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl">Movies</h1>
            <p className="text-muted-foreground">
              Discover and explore movies from our collection
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Sorting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm">Sort by</label>
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity.desc">Most Popular</SelectItem>
                    <SelectItem value="popularity.asc">Least Popular</SelectItem>
                    <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
                    <SelectItem value="vote_average.asc">Lowest Rated</SelectItem>
                    <SelectItem value="release_date.desc">Newest First</SelectItem>
                    <SelectItem value="release_date.asc">Oldest First</SelectItem>
                    <SelectItem value="title.asc">A-Z</SelectItem>
                    <SelectItem value="title.desc">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {genres.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {genres.slice(0, 10).map(genre => (
                    <Badge
                      key={genre.id}
                      variant={filters.genres?.includes(genre.id) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => handleGenreFilter(genre.id)}
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              All Movies
            </TabsTrigger>
            <TabsTrigger value="newest" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Latest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="popular" className="mt-6">
            {renderMoviesGrid(popularMovies, popularLoading, popularError)}
            {renderPagination(popularPage, popularTotalPages)}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {renderMoviesGrid(allMovies, allMoviesLoading, allMoviesError)}
            {renderPagination(allMoviesPage, allMoviesTotalPages)}
          </TabsContent>

          <TabsContent value="newest" className="mt-6">
            {renderMoviesGrid(newestMovies, newestLoading, null)}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}