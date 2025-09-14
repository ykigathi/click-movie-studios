import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Movie, MovieDetailsResponse, Genre, MovieContextType } from '../types'
import { MovieApiService, MockApiService } from '../services/api'
import { useSettings } from './SettingsContext'
import { CACHE_DURATION, STORAGE_KEYS } from '../config/settings'

const MovieContext = createContext<MovieContextType | undefined>(undefined)

export const useMovies = () => {
  const context = useContext(MovieContext)
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider')
  }
  return context
}

interface CacheItem<T> {
  data: T
  timestamp: number
}

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, isConfigured } = useSettings()
  
  // API Services
  const [apiService, setApiService] = useState<MovieApiService | MockApiService>(() => 
    new MockApiService()
  )

  // Popular Movies State
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [popularLoading, setPopularLoading] = useState(false)
  const [popularError, setPopularError] = useState<string | null>(null)
  const [popularPage, setPopularPage] = useState(1)
  const [popularTotalPages, setPopularTotalPages] = useState(1)

  // Search State
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Movie Details State
  const [movieDetails, setMovieDetails] = useState<Record<number, MovieDetailsResponse>>({})

  // Genres State
  const [genres, setGenres] = useState<Genre[]>([])

  // Cache utilities
  const getCachedData = <T,>(key: string, maxAge: number): T | null => {
    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        const { data, timestamp }: CacheItem<T> = JSON.parse(cached)
        if (Date.now() - timestamp < maxAge) {
          return data
        }
      }
    } catch (error) {
      console.error('Cache read error:', error)
    }
    return null
  }

  const setCachedData = <T,>(key: string, data: T) => {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(key, JSON.stringify(cacheItem))
    } catch (error) {
      console.error('Cache write error:', error)
    }
  }

  // Update API service when settings change
  useEffect(() => {
    if (isConfigured && settings.apiKey) {
      const newApiService = new MovieApiService({
        baseUrl: settings.baseUrl,
        apiKey: settings.apiKey,
        language: settings.language,
        includeAdult: settings.includeAdult,
        region: settings.region
      })
      setApiService(newApiService)
    } else {
      setApiService(new MockApiService())
    }
  }, [settings, isConfigured])

  // Fetch Popular Movies
  const fetchPopularMovies = useCallback(async (page = 1) => {
    setPopularLoading(true)
    setPopularError(null)

    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_popular_${page}`
      const cached = getCachedData<any>(cacheKey, CACHE_DURATION.POPULAR_MOVIES)
      
      if (cached) {
        setPopularMovies(cached.results)
        setPopularPage(cached.page)
        setPopularTotalPages(cached.total_pages)
        setPopularLoading(false)
        return
      }

      const response = await apiService.getPopularMovies(page)
      
      setPopularMovies(response.results)
      setPopularPage(response.page)
      setPopularTotalPages(response.total_pages)
      
      setCachedData(cacheKey, response)
    } catch (error) {
      setPopularError(error instanceof Error ? error.message : 'Failed to fetch popular movies')
      console.error('Error fetching popular movies:', error)
    } finally {
      setPopularLoading(false)
    }
  }, [apiService])

  // Search Movies
  const searchMovies = useCallback(async (query: string) => {
    setSearchQuery(query)
    setSearchLoading(true)
    setSearchError(null)

    if (!query.trim()) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_search_${query.toLowerCase()}`
      const cached = getCachedData<any>(cacheKey, CACHE_DURATION.SEARCH)
      
      if (cached) {
        setSearchResults(cached.results)
        setSearchLoading(false)
        return
      }

      const response = await apiService.searchMovies(query)
      
      setSearchResults(response.results)
      setCachedData(cacheKey, response)
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Failed to search movies')
      console.error('Error searching movies:', error)
    } finally {
      setSearchLoading(false)
    }
  }, [apiService])

  // Clear Search
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setSearchError(null)
  }, [])

  // Fetch Movie Details
  const fetchMovieDetails = useCallback(async (id: number): Promise<MovieDetailsResponse | null> => {
    if (movieDetails[id]) {
      return movieDetails[id]
    }

    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_details_${id}`
      const cached = getCachedData<MovieDetailsResponse>(cacheKey, CACHE_DURATION.MOVIE_DETAILS)
      
      if (cached) {
        setMovieDetails(prev => ({ ...prev, [id]: cached }))
        return cached
      }

      const details = await apiService.getMovieDetails(id)
      
      setMovieDetails(prev => ({ ...prev, [id]: details }))
      setCachedData(cacheKey, details)
      
      return details
    } catch (error) {
      console.error('Error fetching movie details:', error)
      return null
    }
  }, [movieDetails, apiService])

  // Fetch Genres
  const fetchGenres = useCallback(async () => {
    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_genres`
      const cached = getCachedData<Genre[]>(cacheKey, CACHE_DURATION.GENRES)
      
      if (cached) {
        setGenres(cached)
        return
      }

      const response = await apiService.getGenres()
      
      setGenres(response.genres)
      setCachedData(cacheKey, response.genres)
    } catch (error) {
      console.error('Error fetching genres:', error)
    }
  }, [apiService])

  // Load initial data
  useEffect(() => {
    fetchGenres()
    fetchPopularMovies(1)
  }, [fetchGenres, fetchPopularMovies])

  const value: MovieContextType = {
    // Popular Movies
    popularMovies,
    popularLoading,
    popularError,
    popularPage,
    popularTotalPages,
    fetchPopularMovies,
    
    // Search
    searchResults,
    searchLoading,
    searchError,
    searchQuery,
    searchMovies,
    clearSearch,
    
    // Movie Details
    movieDetails,
    fetchMovieDetails,
    
    // Genres
    genres,
    fetchGenres
  }

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  )
}