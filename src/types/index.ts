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
  tagline?: string
  status?: string
  imdb_id?: string
  homepage?: string
  // Trailer information
  trailer_url?: string
  trailer_key?: string
  // Admin managed fields
  admin_featured?: boolean
  admin_category?: string
  admin_updated_at?: string
  admin_notes?: string
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
  role: 'user' | 'admin'
  avatar?: string | null
  createdAt: Date
  lastLoginAt?: Date
  preferences?: UserPreferences
  profile?: UserProfile
}

export interface UserProfile {
  bio?: string
  favoriteGenres: number[]
  notifications: UserNotification[]
  movieHistory: MovieHistoryItem[]
  socialStats: {
    totalLikes: number
    totalComments: number
    totalReviews: number
  }
}

export interface UserPreferences {
  favoriteGenres: number[]
  language: string
  includeAdult: boolean
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    newMovies: boolean
    replies: boolean
  }
}

export interface UserNotification {
  id: string
  type: 'like' | 'comment' | 'reply' | 'new_movie' | 'system'
  title: string
  message: string
  movieId?: number
  fromUserId?: string
  fromUserName?: string
  read: boolean
  createdAt: Date
}

export interface MovieHistoryItem {
  movieId: number
  action: 'viewed' | 'liked' | 'reviewed' | 'watchlisted'
  timestamp: Date
  metadata?: {
    rating?: number
    review?: string
    watchTime?: number
  }
}

// Movie Interaction Types
export interface MovieReview {
  id: string
  movieId: number
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  likes: number
  dislikes: number
  isLikedByUser?: boolean
  isDislikedByUser?: boolean
  createdAt: Date
  updatedAt: Date
  replies?: ReviewReply[]
}

export interface ReviewReply {
  id: string
  reviewId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  likes: number
  isLikedByUser?: boolean
  createdAt: Date
}

export interface MovieComment {
  id: string
  movieId: number
  userId: string
  userName: string
  userAvatar?: string
  content: string
  likes: number
  isLikedByUser?: boolean
  createdAt: Date
  replies?: CommentReply[]
}

export interface CommentReply {
  id: string
  commentId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  likes: number
  isLikedByUser?: boolean
  createdAt: Date
}

// Application State Types
export interface AppSettings {
  apiKey: string | null
  baseUrl: string
  imageBaseUrl: string
  language: string
  includeAdult: boolean
  region: string
  theme: 'light' | 'dark' | 'system'
  dataSource: 'live' | 'demo'
}

export interface UserData {
  watchlist: number[]
  favorites: number[]
  ratings: Record<number, number>
  viewHistory: number[]
  reviews: Record<number, MovieReview>
  comments: Record<number, MovieComment[]>
  likes: {
    reviews: string[]
    comments: string[]
  }
}

// Admin Types
export interface AdminStats {
  totalMovies: number
  totalUsers: number
  totalReviews: number
  totalComments: number
  recentActivity: AdminActivity[]
  popularMovies: { movieId: number; views: number; title: string }[]
}

export interface AdminActivity {
  id: string
  type: 'movie_added' | 'movie_updated' | 'movie_deleted' | 'user_registered' | 'review_reported'
  description: string
  userId?: string
  movieId?: number
  timestamp: Date
}

export interface AdminMovieUpdate {
  id: number
  title?: string
  overview?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  genres?: number[]
  runtime?: number
  featured?: boolean
  category?: string
  notes?: string
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
  
  // All Movies
  allMovies: Movie[]
  allMoviesLoading: boolean
  allMoviesError: string | null
  allMoviesPage: number
  allMoviesTotalPages: number
  fetchAllMovies: (page?: number, filters?: MovieFilters) => Promise<void>
  
  // Now Playing Movies
  nowPlayingMovies: Movie[]
  nowPlayingLoading: boolean
  nowPlayingError: string | null
  nowPlayingPage: number
  nowPlayingTotalPages: number
  fetchNowPlayingMovies: (page?: number) => Promise<void>
  
  // Top Rated Movies
  topRatedMovies: Movie[]
  topRatedLoading: boolean
  topRatedError: string | null
  topRatedPage: number
  topRatedTotalPages: number
  fetchTopRatedMovies: (page?: number) => Promise<void>
  
  // Upcoming Movies
  upcomingMovies: Movie[]
  upcomingLoading: boolean
  upcomingError: string | null
  upcomingPage: number
  upcomingTotalPages: number
  fetchUpcomingMovies: (page?: number) => Promise<void>
  
  // Newest Movies
  newestMovies: Movie[]
  newestLoading: boolean
  fetchNewestMovies: () => Promise<void>
  
  // Featured Movies (Admin managed)
  featuredMovies: Movie[]
  featuredLoading: boolean
  fetchFeaturedMovies: () => Promise<void>
  
  // Search
  searchResults: Movie[]
  searchLoading: boolean
  searchError: string | null
  searchQuery: string
  searchPage: number
  searchTotalPages: number
  searchMovies: (query: string, page?: number, filters?: MovieFilters) => Promise<void>
  clearSearch: () => void
  
  // Movie Details
  movieDetails: Record<number, MovieDetailsResponse>
  fetchMovieDetails: (id: number) => Promise<MovieDetailsResponse | null>
  
  // Movie Trailers
  getMovieTrailer: (id: number) => Promise<string | null>
  
  // Reviews and Comments
  movieReviews: Record<number, MovieReview[]>
  movieComments: Record<number, MovieComment[]>
  fetchMovieReviews: (movieId: number) => Promise<void>
  fetchMovieComments: (movieId: number) => Promise<void>
  addReview: (movieId: number, review: Omit<MovieReview, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt' | 'likes' | 'dislikes'>) => Promise<void>
  addComment: (movieId: number, content: string) => Promise<void>
  likeReview: (reviewId: string) => Promise<void>
  likeComment: (commentId: string) => Promise<void>
  
  // Genres and Categories
  genres: Genre[]
  categories: string[]
  fetchGenres: () => Promise<void>
  fetchCategories: () => Promise<void>
  
  // Admin functions (Only available for admin users)
  adminAddMovie: (movie: Partial<Movie>) => Promise<void>
  adminUpdateMovie: (id: number, updates: AdminMovieUpdate) => Promise<void>
  adminDeleteMovie: (id: number) => Promise<void>
  adminGetStats: () => Promise<AdminStats>
  adminSetTrailerUrl: (movieId: number, trailerUrl: string) => Promise<void>
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
  
  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  
  // User data methods
  addToWatchlist: (movieId: number) => void
  removeFromWatchlist: (movieId: number) => void
  isInWatchlist: (movieId: number) => boolean
  
  addToFavorites: (movieId: number) => void
  removeFromFavorites: (movieId: number) => void
  isInFavorites: (movieId: number) => boolean
  
  rateMovie: (movieId: number, rating: number) => void
  getMovieRating: (movieId: number) => number | null
  
  addToViewHistory: (movieId: number, metadata?: any) => void
  getNotifications: () => UserNotification[]
  markNotificationAsRead: (notificationId: string) => void
  clearAllNotifications: () => void
}

export interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  isConfigured: boolean
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setDataSource: (dataSource: 'live' | 'demo') => void
  isLiveMode: boolean
  isDemoMode: boolean
}

// Movie Filters
export interface MovieFilters {
  genres?: number[]
  year?: number
  rating?: number
  sortBy?: SortBy
  category?: string
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
  variant?: 'default' | 'compact' | 'featured'
}

export interface MovieListProps {
  onMovieSelect: (movie: Movie) => void
}

export interface MovieDetailProps {
  movieId: number
  onBack?: () => void
}

export interface SearchMoviesProps {
  onMovieSelect: (movie: Movie) => void
}

export interface WatchlistProps {
  onMovieSelect: (movie: Movie) => void
}

export interface NavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

// Route Types
export type AppRoute = 
  | '/'
  | '/movies'
  | '/search'
  | '/watchlist'
  | '/movie/:id'
  | '/login'
  | '/register'
  | '/profile'
  | '/admin'
  | '/admin/movies'
  | '/admin/users'
  | '/admin/settings'
  | '/settings'

// Utility Types
export type SortBy = 
  | 'popularity.desc' 
  | 'popularity.asc' 
  | 'release_date.desc' 
  | 'release_date.asc' 
  | 'vote_average.desc' 
  | 'vote_average.asc'
  | 'title.asc'
  | 'title.desc'

export type ImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original'

export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original'

// Storage Types
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

// Test Types
export interface TestConfig {
  apiBaseUrl: string
  testApiKey: string
  testTimeout: number
  mockData: boolean
}

export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  renderTime: number
  memoryUsage: number
  networkRequests: number
}

// Animation Types
export interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
}

export interface CardAnimationProps {
  hover?: AnimationConfig
  entrance?: AnimationConfig
  exit?: AnimationConfig
}