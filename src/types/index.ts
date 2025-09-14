// Core Movie Types
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date: string
  genre_ids: number[]
  genres?: Genre[]
  runtime?: number
  budget?: number
  revenue?: number
  cast?: CastMember[]
  crew?: CrewMember[]
  adult?: boolean
  original_language?: string
  original_title?: string
  popularity?: number
  video?: boolean
  vote_count?: number
}

export interface Genre {
  id: number
  name: string
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path?: string | null
  order?: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department?: string
  profile_path?: string | null
}

// API Response Types
export interface MoviesResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface MovieDetailsResponse extends Movie {
  belongs_to_collection?: any
  budget: number
  homepage?: string
  imdb_id?: string
  production_companies?: ProductionCompany[]
  production_countries?: ProductionCountry[]
  revenue: number
  runtime: number
  spoken_languages?: SpokenLanguage[]
  status?: string
  tagline?: string
}

export interface ProductionCompany {
  id: number
  logo_path?: string | null
  name: string
  origin_country: string
}

export interface ProductionCountry {
  iso_3166_1: string
  name: string
}

export interface SpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  preferences?: UserPreferences
}

export interface UserPreferences {
  favoriteGenres: number[]
  language: string
  includeAdult: boolean
}

// Application State Types
export interface AppSettings {
  apiKey: string | null
  baseUrl: string
  imageBaseUrl: string
  language: string
  includeAdult: boolean
  region: string
}

export interface UserData {
  watchlist: number[]
  favorites: number[]
  ratings: Record<number, number>
  viewHistory: number[]
}

// Context Types
export interface MovieContextType {
  // Popular Movies
  popularMovies: Movie[]
  popularLoading: boolean
  popularError: string | null
  popularPage: number
  popularTotalPages: number
  fetchPopularMovies: (page?: number) => Promise<void>
  
  // Search
  searchResults: Movie[]
  searchLoading: boolean
  searchError: string | null
  searchQuery: string
  searchMovies: (query: string) => Promise<void>
  clearSearch: () => void
  
  // Movie Details
  movieDetails: Record<number, MovieDetailsResponse>
  fetchMovieDetails: (id: number) => Promise<MovieDetailsResponse | null>
  
  // Genres
  genres: Genre[]
  fetchGenres: () => Promise<void>
}

export interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  userData: UserData
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  
  // User data methods
  addToWatchlist: (movieId: number) => void
  removeFromWatchlist: (movieId: number) => void
  isInWatchlist: (movieId: number) => boolean
  
  addToFavorites: (movieId: number) => void
  removeFromFavorites: (movieId: number) => void
  isInFavorites: (movieId: number) => boolean
  
  rateMovie: (movieId: number, rating: number) => void
  getMovieRating: (movieId: number) => number | null
  
  addToViewHistory: (movieId: number) => void
}

export interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  isConfigured: boolean
}

// API Configuration
export interface ApiConfig {
  baseUrl: string
  apiKey: string
  language: string
  includeAdult: boolean
  region: string
}

// Error Types
export interface ApiError {
  message: string
  status_code?: number
  status_message?: string
}

// Component Props Types
export interface MovieCardProps {
  movie: Movie
  onClick: () => void
  showAddToWatchlist?: boolean
  showRemoveFromWatchlist?: boolean
}

export interface MovieListProps {
  onMovieSelect: (movie: Movie) => void
}

export interface MovieDetailProps {
  movieId: number
  onBack: () => void
}

export interface SearchMoviesProps {
  onMovieSelect: (movie: Movie) => void
}

export interface WatchlistProps {
  onMovieSelect: (movie: Movie) => void
}

export interface NavigationProps {
  activeTab: 'movies' | 'search' | 'watchlist'
  onTabChange: (tab: 'movies' | 'search' | 'watchlist') => void
}

// Utility Types
export type AppView = 'movies' | 'search' | 'watchlist' | 'detail' | 'settings'

export type SortBy = 'popularity.desc' | 'popularity.asc' | 'release_date.desc' | 'release_date.asc' | 'vote_average.desc' | 'vote_average.asc'

export type ImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original'

export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original'