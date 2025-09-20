import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { 
  Movie, 
  MovieDetailsResponse, 
  Genre, 
  MovieContextType, 
  MovieFilters,
  MovieReview,
  MovieComment,
  AdminStats,
  AdminMovieUpdate
} from '../types'
import { MovieApiService, MockApiService } from '../services/api'
import { useSettings } from './SettingsContext'
import { useUser } from './UserContext'
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
  const { settings, isConfigured, isLiveMode, isDemoMode } = useSettings()
  const { user } = useUser()
  
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

  // All Movies State
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [allMoviesLoading, setAllMoviesLoading] = useState(false)
  const [allMoviesError, setAllMoviesError] = useState<string | null>(null)
  const [allMoviesPage, setAllMoviesPage] = useState(1)
  const [allMoviesTotalPages, setAllMoviesTotalPages] = useState(1)

  // Now Playing Movies State
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([])
  const [nowPlayingLoading, setNowPlayingLoading] = useState(false)
  const [nowPlayingError, setNowPlayingError] = useState<string | null>(null)
  const [nowPlayingPage, setNowPlayingPage] = useState(1)
  const [nowPlayingTotalPages, setNowPlayingTotalPages] = useState(1)

  // Top Rated Movies State
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([])
  const [topRatedLoading, setTopRatedLoading] = useState(false)
  const [topRatedError, setTopRatedError] = useState<string | null>(null)
  const [topRatedPage, setTopRatedPage] = useState(1)
  const [topRatedTotalPages, setTopRatedTotalPages] = useState(1)

  // Upcoming Movies State
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([])
  const [upcomingLoading, setUpcomingLoading] = useState(false)
  const [upcomingError, setUpcomingError] = useState<string | null>(null)
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [upcomingTotalPages, setUpcomingTotalPages] = useState(1)

  // Newest Movies State
  const [newestMovies, setNewestMovies] = useState<Movie[]>([])
  const [newestLoading, setNewestLoading] = useState(false)

  // Featured Movies State
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(false)

  // Search State
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchPage, setSearchPage] = useState(1)
  const [searchTotalPages, setSearchTotalPages] = useState(1)

  // Movie Details State
  const [movieDetails, setMovieDetails] = useState<Record<number, MovieDetailsResponse>>({})

  // Reviews and Comments State
  const [movieReviews, setMovieReviews] = useState<Record<number, MovieReview[]>>({})
  const [movieComments, setMovieComments] = useState<Record<number, MovieComment[]>>({})

  // Genres and Categories State
  const [genres, setGenres] = useState<Genre[]>([])
  const [categories, setCategories] = useState<string[]>(['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'])

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
    // Use the new dataSource setting to determine which service to use
    if (isLiveMode && settings.apiKey) {
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
  }, [settings, isLiveMode, isDemoMode])

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

  // Fetch All Movies with proper filtering
  const fetchAllMovies = useCallback(async (page = 1, filters?: MovieFilters) => {
    setAllMoviesLoading(true)
    setAllMoviesError(null)

    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_all_${page}_${JSON.stringify(filters)}`
      const cached = getCachedData<any>(cacheKey, CACHE_DURATION.POPULAR_MOVIES)
      
      if (cached) {
        setAllMovies(cached.results)
        setAllMoviesPage(cached.page)
        setAllMoviesTotalPages(cached.total_pages)
        setAllMoviesLoading(false)
        return
      }

      // Use discover endpoint for filtering if available, otherwise use popular
      let response
      if ('discoverMovies' in apiService && filters && (filters.genres?.length || filters.year || filters.rating || filters.sortBy)) {
        response = await (apiService as any).discoverMovies(page, filters)
      } else {
        response = await apiService.getPopularMovies(page)
      }
      
      setAllMovies(response.results)
      setAllMoviesPage(response.page)
      setAllMoviesTotalPages(response.total_pages)
      
      setCachedData(cacheKey, response)
    } catch (error) {
      setAllMoviesError(error instanceof Error ? error.message : 'Failed to fetch movies')
      console.error('Error fetching all movies:', error)
    } finally {
      setAllMoviesLoading(false)
    }
  }, [apiService])

  // Fetch Now Playing Movies
  const fetchNowPlayingMovies = useCallback(async (page = 1) => {
    setNowPlayingLoading(true)
    setNowPlayingError(null)

    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_now_playing_${page}`
      const cached = getCachedData<any>(cacheKey, CACHE_DURATION.POPULAR_MOVIES)
      
      if (cached) {
        setNowPlayingMovies(cached.results)
        setNowPlayingPage(cached.page)
        setNowPlayingTotalPages(cached.total_pages)
        setNowPlayingLoading(false)
        return
      }

      const response = 'getNowPlayingMovies' in apiService 
        ? await (apiService as any).getNowPlayingMovies(page)
        : await apiService.getPopularMovies(page)
      
      setNowPlayingMovies(response.results)
      setNowPlayingPage(response.page)
      setNowPlayingTotalPages(response.total_pages)
      
      setCachedData(cacheKey, response)
    } catch (error) {
      setNowPlayingError(error instanceof Error ? error.message : 'Failed to fetch now playing movies')
      console.error('Error fetching now playing movies:', error)
    } finally {
      setNowPlayingLoading(false)
    }
  }, [apiService])

  // Fetch Top Rated Movies
  const fetchTopRatedMovies = useCallback(async (page = 1) => {
    setTopRatedLoading(true)
    setTopRatedError(null)

    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_top_rated_${page}`
      const cached = getCachedData<any>(cacheKey, CACHE_DURATION.POPULAR_MOVIES)
      
      if (cached) {
        setTopRatedMovies(cached.results)
        setTopRatedPage(cached.page)
        setTopRatedTotalPages(cached.total_pages)
        setTopRatedLoading(false)
        return
      }

      const response = 'getTopRatedMovies' in apiService 
        ? await (apiService as any).getTopRatedMovies(page)
        : await apiService.getPopularMovies(page)
      
      setTopRatedMovies(response.results)
      setTopRatedPage(response.page)
      setTopRatedTotalPages(response.total_pages)
      
      setCachedData(cacheKey, response)
    } catch (error) {
      setTopRatedError(error instanceof Error ? error.message : 'Failed to fetch top rated movies')
      console.error('Error fetching top rated movies:', error)
    } finally {
      setTopRatedLoading(false)
    }
  }, [apiService])

  // Fetch Upcoming Movies
  const fetchUpcomingMovies = useCallback(async (page = 1) => {
    setUpcomingLoading(true)
    setUpcomingError(null)

    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_upcoming_${page}`
      const cached = getCachedData<any>(cacheKey, CACHE_DURATION.POPULAR_MOVIES)
      
      if (cached) {
        setUpcomingMovies(cached.results)
        setUpcomingPage(cached.page)
        setUpcomingTotalPages(cached.total_pages)
        setUpcomingLoading(false)
        return
      }

      const response = 'getUpcomingMovies' in apiService 
        ? await (apiService as any).getUpcomingMovies(page)
        : await apiService.getPopularMovies(page)
      
      setUpcomingMovies(response.results)
      setUpcomingPage(response.page)
      setUpcomingTotalPages(response.total_pages)
      
      setCachedData(cacheKey, response)
    } catch (error) {
      setUpcomingError(error instanceof Error ? error.message : 'Failed to fetch upcoming movies')
      console.error('Error fetching upcoming movies:', error)
    } finally {
      setUpcomingLoading(false)
    }
  }, [apiService])

  // Fetch Newest Movies
  const fetchNewestMovies = useCallback(async () => {
    setNewestLoading(true)

    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_newest`
      const cached = getCachedData<Movie[]>(cacheKey, CACHE_DURATION.POPULAR_MOVIES)
      
      if (cached) {
        setNewestMovies(cached)
        setNewestLoading(false)
        return
      }

      // For newest, get current releases
      const response = await apiService.getPopularMovies(1)
      const newest = response.results.slice(0, 8)
      
      setNewestMovies(newest)
      setCachedData(cacheKey, newest)
    } catch (error) {
      console.error('Error fetching newest movies:', error)
    } finally {
      setNewestLoading(false)
    }
  }, [apiService])

  // Fetch Featured Movies
  const fetchFeaturedMovies = useCallback(async () => {
    setFeaturedLoading(true)

    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_featured`
      const cached = getCachedData<Movie[]>(cacheKey, CACHE_DURATION.POPULAR_MOVIES)
      
      if (cached) {
        setFeaturedMovies(cached)
        setFeaturedLoading(false)
        return
      }

      // For featured, get top rated movies and mark as featured
      const response = await apiService.getPopularMovies(1)
      const featured = response.results.slice(0, 6).map(movie => ({
        ...movie,
        admin_featured: true
      }))
      
      setFeaturedMovies(featured)
      setCachedData(cacheKey, featured)
    } catch (error) {
      console.error('Error fetching featured movies:', error)
    } finally {
      setFeaturedLoading(false)
    }
  }, [apiService])

  // Search Movies with pagination
  const searchMovies = useCallback(async (query: string, page = 1, filters?: MovieFilters) => {
    setSearchQuery(query)
    setSearchLoading(true)
    setSearchError(null)

    if (!query.trim()) {
      setSearchResults([])
      setSearchPage(1)
      setSearchTotalPages(1)
      setSearchLoading(false)
      return
    }

    try {
      const cacheKey = `${STORAGE_KEYS.MOVIE_CACHE}_search_${query.toLowerCase()}_${page}_${JSON.stringify(filters)}`
      const cached = getCachedData<any>(cacheKey, CACHE_DURATION.SEARCH)
      
      if (cached) {
        setSearchResults(cached.results)
        setSearchPage(cached.page)
        setSearchTotalPages(cached.total_pages)
        setSearchLoading(false)
        return
      }

      const response = 'searchMovies' in apiService && apiService.searchMovies.length >= 3
        ? await (apiService as any).searchMovies(query, page, filters)
        : await apiService.searchMovies(query, page)
      
      setSearchResults(response.results)
      setSearchPage(response.page)
      setSearchTotalPages(response.total_pages)
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
    setSearchPage(1)
    setSearchTotalPages(1)
  }, [])

  // Get Movie Trailer
  const getMovieTrailer = useCallback(async (id: number): Promise<string | null> => {
    try {
      if ('getMovieVideos' in apiService) {
        const videos = await (apiService as any).getMovieVideos(id)
        const trailer = videos.results.find((video: any) => 
          video.type === 'Trailer' && video.site === 'YouTube'
        )
        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
      }
      
      // Fallback for mock service - return a placeholder trailer
      return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    } catch (error) {
      console.error('Error fetching movie trailer:', error)
      return null
    }
  }, [apiService])

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

  // Fetch Movie Reviews
  const fetchMovieReviews = useCallback(async (movieId: number) => {
    if (movieReviews[movieId]) {
      return
    }

    try {
      // Mock reviews data
      const mockReviews: MovieReview[] = [
        {
          id: '1',
          movieId,
          userId: 'user1',
          userName: 'John Doe',
          rating: 8,
          title: 'Great movie!',
          content: 'Really enjoyed this film. Great story and acting.',
          likes: 15,
          dislikes: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      setMovieReviews(prev => ({ ...prev, [movieId]: mockReviews }))
    } catch (error) {
      console.error('Error fetching movie reviews:', error)
    }
  }, [movieReviews])

  // Fetch Movie Comments
  const fetchMovieComments = useCallback(async (movieId: number) => {
    if (movieComments[movieId]) {
      return
    }

    try {
      // Mock comments data
      const mockComments: MovieComment[] = [
        {
          id: '1',
          movieId,
          userId: 'user1',
          userName: 'Jane Smith',
          content: 'This movie was amazing!',
          likes: 5,
          createdAt: new Date()
        }
      ]
      
      setMovieComments(prev => ({ ...prev, [movieId]: mockComments }))
    } catch (error) {
      console.error('Error fetching movie comments:', error)
    }
  }, [movieComments])

  // Add Review
  const addReview = useCallback(async (movieId: number, review: Omit<MovieReview, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt' | 'likes' | 'dislikes'>) => {
    if (!user) return

    const newReview: MovieReview = {
      ...review,
      id: Date.now().toString(),
      movieId,
      userId: user.id,
      userName: user.name,
      likes: 0,
      dislikes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setMovieReviews(prev => ({
      ...prev,
      [movieId]: [...(prev[movieId] || []), newReview]
    }))
  }, [user])

  // Add Comment
  const addComment = useCallback(async (movieId: number, content: string) => {
    if (!user) return

    const newComment: MovieComment = {
      id: Date.now().toString(),
      movieId,
      userId: user.id,
      userName: user.name,
      content,
      likes: 0,
      createdAt: new Date()
    }

    setMovieComments(prev => ({
      ...prev,
      [movieId]: [...(prev[movieId] || []), newComment]
    }))
  }, [user])

  // Like Review
  const likeReview = useCallback(async (reviewId: string) => {
    // Implementation for liking reviews
    console.log('Like review:', reviewId)
  }, [])

  // Like Comment
  const likeComment = useCallback(async (commentId: string) => {
    // Implementation for liking comments
    console.log('Like comment:', commentId)
  }, [])

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

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    // Categories are static for now
    setCategories(['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'])
  }, [])

  // Admin Functions
  const adminAddMovie = useCallback(async (movie: Partial<Movie>) => {
    // Mock implementation
    console.log('Admin add movie:', movie)
  }, [])

  const adminUpdateMovie = useCallback(async (id: number, updates: AdminMovieUpdate) => {
    // Mock implementation
    console.log('Admin update movie:', id, updates)
  }, [])

  const adminDeleteMovie = useCallback(async (id: number) => {
    // Mock implementation
    console.log('Admin delete movie:', id)
  }, [])

  const adminGetStats = useCallback(async (): Promise<AdminStats> => {
    // Mock implementation
    return {
      totalMovies: 1543,
      totalUsers: 2847,
      totalReviews: 956,
      totalComments: 1832,
      recentActivity: [],
      popularMovies: []
    }
  }, [])

  const adminSetTrailerUrl = useCallback(async (movieId: number, trailerUrl: string) => {
    // Mock implementation for admin trailer management
    console.log('Admin set trailer URL:', movieId, trailerUrl)
    // In real implementation, this would update the movie's trailer URL in the database
  }, [])

  // Load initial data
  useEffect(() => {
    fetchGenres()
    fetchCategories()
    fetchPopularMovies(1)
    fetchNewestMovies()
    fetchFeaturedMovies()
    fetchNowPlayingMovies(1)
    fetchTopRatedMovies(1)
    fetchUpcomingMovies(1)
  }, [fetchGenres, fetchCategories, fetchPopularMovies, fetchNewestMovies, fetchFeaturedMovies, fetchNowPlayingMovies, fetchTopRatedMovies, fetchUpcomingMovies])

  const value: MovieContextType = {
    // Popular Movies
    popularMovies,
    popularLoading,
    popularError,
    popularPage,
    popularTotalPages,
    fetchPopularMovies,
    
    // All Movies
    allMovies,
    allMoviesLoading,
    allMoviesError,
    allMoviesPage,
    allMoviesTotalPages,
    fetchAllMovies,
    
    // Now Playing Movies
    nowPlayingMovies,
    nowPlayingLoading,
    nowPlayingError,
    nowPlayingPage,
    nowPlayingTotalPages,
    fetchNowPlayingMovies,
    
    // Top Rated Movies
    topRatedMovies,
    topRatedLoading,
    topRatedError,
    topRatedPage,
    topRatedTotalPages,
    fetchTopRatedMovies,
    
    // Upcoming Movies
    upcomingMovies,
    upcomingLoading,
    upcomingError,
    upcomingPage,
    upcomingTotalPages,
    fetchUpcomingMovies,
    
    // Newest Movies
    newestMovies,
    newestLoading,
    fetchNewestMovies,
    
    // Featured Movies
    featuredMovies,
    featuredLoading,
    fetchFeaturedMovies,
    
    // Search
    searchResults,
    searchLoading,
    searchError,
    searchQuery,
    searchPage,
    searchTotalPages,
    searchMovies,
    clearSearch,
    
    // Movie Details
    movieDetails,
    fetchMovieDetails,
    
    // Movie Trailers
    getMovieTrailer,
    
    // Reviews and Comments
    movieReviews,
    movieComments,
    fetchMovieReviews,
    fetchMovieComments,
    addReview,
    addComment,
    likeReview,
    likeComment,
    
    // Genres and Categories
    genres,
    categories,
    fetchGenres,
    fetchCategories,
    
    // Admin functions
    adminAddMovie,
    adminUpdateMovie,
    adminDeleteMovie,
    adminGetStats,
    adminSetTrailerUrl
  }

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  )
}