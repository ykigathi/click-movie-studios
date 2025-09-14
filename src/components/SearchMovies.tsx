import React, { useState, useEffect, useCallback } from 'react'
import { SearchMoviesProps } from '../types'
import { MovieCard } from './MovieCard'
import { Input } from './ui/input'
import { Skeleton } from './ui/skeleton'
import { Alert, AlertDescription } from './ui/alert'
import { Search, X } from 'lucide-react'
import { Button } from './ui/button'
import { useMovies } from '../contexts/MovieContext'
import { APP_CONFIG } from '../config/settings'

// Debounce hook for search input
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

export const SearchMovies: React.FC<SearchMoviesProps> = ({ onMovieSelect }) => {
  const { 
    searchResults, 
    searchLoading, 
    searchError, 
    searchQuery, 
    searchMovies, 
    clearSearch 
  } = useMovies()
  
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const debouncedQuery = useDebounce(query, APP_CONFIG.DEBOUNCE_DELAY)

  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchMovies(debouncedQuery)
      setHasSearched(true)
    } else {
      clearSearch()
      setHasSearched(false)
    }
  }, [debouncedQuery, searchMovies, clearSearch])

  const handleClearSearch = () => {
    setQuery('')
    clearSearch()
    setHasSearched(false)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search for movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
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
      </div>

      {searchError && (
        <Alert className="mb-6">
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}

      {!hasSearched && !query && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-muted-foreground mb-2">Search for Movies</h2>
          <p className="text-muted-foreground">
            Enter a movie title or keyword to start searching
          </p>
        </div>
      )}

      {searchLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {hasSearched && !searchLoading && searchResults.length === 0 && query && (
        <div className="text-center py-12">
          <h2 className="text-muted-foreground mb-2">No Results Found</h2>
          <p className="text-muted-foreground">
            Try searching with different keywords or check your spelling
          </p>
        </div>
      )}

      {!searchLoading && searchResults.length > 0 && (
        <>
          <div className="mb-6">
            <h2>Search Results for "{searchQuery}"</h2>
            <p className="text-muted-foreground">
              Found {searchResults.length} movie{searchResults.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {searchResults.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => onMovieSelect(movie)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}