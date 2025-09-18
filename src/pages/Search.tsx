import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useMovies } from '../contexts/MovieContext'
import { MovieCard } from '../components/MovieCard'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Search as SearchIcon, X, Filter, Grid, List, Clock } from 'lucide-react'
import { MovieFilters, SortBy } from '../types'
import { DEBOUNCE_DELAY } from '../config/settings'

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const Search: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    searchResults,
    searchLoading,
    searchError,
    searchQuery,
    searchMovies,
    clearSearch,
    genres,
    categories
  } = useMovies()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<MovieFilters>({
    genres: [],
    sortBy: 'popularity.desc'
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('movieapp_recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load recent searches:', error)
      }
    }
  }, [])

  // Handle search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch(debouncedQuery)
      setHasSearched(true)
      
      // Update URL
      setSearchParams({ q: debouncedQuery })
      
      // Add to recent searches
      addToRecentSearches(debouncedQuery)
    } else {
      clearSearch()
      setHasSearched(false)
      setSearchParams({})
    }
  }, [debouncedQuery])

  const handleSearch = async (searchTerm: string) => {
    await searchMovies(searchTerm, filters)
  }

  const addToRecentSearches = (searchTerm: string) => {
    const trimmed = searchTerm.trim().toLowerCase()
    if (!trimmed || recentSearches.includes(trimmed)) return

    const updatedSearches = [trimmed, ...recentSearches.slice(0, 4)]
    setRecentSearches(updatedSearches)
    localStorage.setItem('movieapp_recent_searches', JSON.stringify(updatedSearches))
  }

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('movieapp_recent_searches')
  }

  const handleClearSearch = () => {
    setQuery('')
    clearSearch()
    setHasSearched(false)
    setSearchParams({})
  }

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`)
  }

  const handleGenreFilter = (genreId: number) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres?.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...(prev.genres || []), genreId]
    }))
  }

  const handleSortChange = (sortBy: SortBy) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }

  // Re-search when filters change
  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchMovies(debouncedQuery, filters)
    }
  }, [filters, debouncedQuery])

  const renderSearchResults = () => {
    if (searchError) {
      return (
        <Alert>
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )
    }

    if (searchLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )
    }

    if (hasSearched && searchResults.length === 0 && query) {
      return (
        <Card className="p-8 text-center">
          <CardContent>
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              No movies found for "{query}". Try searching with different keywords or check your spelling.
            </p>
            <Button variant="outline" onClick={handleClearSearch}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (searchResults.length > 0) {
      return (
        <>
          <div className="mb-6">
            <h2 className="text-xl mb-2">Search Results for "{searchQuery}"</h2>
            <p className="text-muted-foreground">
              Found {searchResults.length} movie{searchResults.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            : "space-y-4"
          }>
            {searchResults.map((movie, index) => (
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
        </>
      )
    }

    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl">Search Movies</h1>
          <p className="text-muted-foreground">
            Find your favorite movies by title, genre, or keyword
          </p>
        </div>

        {/* Search Input */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for movies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 text-lg h-12"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        {!hasSearched && recentSearches.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5" />
                  Recent Searches
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRecentSearchClick(search)}
                    className="capitalize"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {hasSearched && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters & View
                </CardTitle>
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
                  <label className="text-sm">Filter by Genre</label>
                  <div className="flex flex-wrap gap-2">
                    {genres.slice(0, 12).map(genre => (
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
              
              {categories.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!hasSearched && !query && (
          <Card className="p-12 text-center">
            <CardContent>
              <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl mb-2">Start Searching</h2>
              <p className="text-muted-foreground">
                Enter a movie title, actor name, or keyword to discover movies
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {renderSearchResults()}
      </motion.div>
    </div>
  )
}