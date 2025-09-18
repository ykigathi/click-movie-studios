// Application configuration settings
const APP_CONFIG = {
  // API Configuration
  TMDB_API_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  
  // Default settings
  DEFAULT_LANGUAGE: 'en-US',
  DEFAULT_REGION: 'US',
  DEFAULT_INCLUDE_ADULT: false,
  
  // UI Configuration
  MOVIES_PER_PAGE: 20,
  FEATURED_MOVIES_COUNT: 8,
  DEBOUNCE_DELAY: 300,
  
  // Cache settings
  CACHE_DURATION: {
    POPULAR_MOVIES: 5 * 60 * 1000, // 5 minutes
    SEARCH: 2 * 60 * 1000, // 2 minutes
    MOVIE_DETAILS: 10 * 60 * 1000, // 10 minutes
    GENRES: 60 * 60 * 1000, // 1 hour
    USER_DATA: 30 * 60 * 1000 // 30 minutes
  },
  
  // Storage keys
  STORAGE_KEYS: {
    SETTINGS: 'movieapp_settings',
    USER: 'movieapp_user',
    USER_DATA: 'movieapp_user_data',
    THEME: 'movieapp_theme',
    RECENT_SEARCHES: 'movieapp_recent_searches',
    MOVIE_CACHE: 'movieapp_movie_cache'
  },
  
  // Image sizes
  IMAGE_SIZES: {
    POSTER: {
      SMALL: 'w185',
      MEDIUM: 'w342',
      LARGE: 'w500',
      ORIGINAL: 'original'
    },
    BACKDROP: {
      SMALL: 'w300',
      MEDIUM: 'w780',
      LARGE: 'w1280',
      ORIGINAL: 'original'
    },
    PROFILE: {
      SMALL: 'w45',
      MEDIUM: 'w185',
      LARGE: 'h632',
      ORIGINAL: 'original'
    }
  },
  
  // Animation settings
  ANIMATION: {
    DURATION_FAST: 0.15,
    DURATION_NORMAL: 0.3,
    DURATION_SLOW: 0.5,
    EASING: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  },
  
  // Validation rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    MAX_REVIEW_LENGTH: 2000,
    MAX_COMMENT_LENGTH: 500,
    MAX_BIO_LENGTH: 300,
    MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
  },
  
  // Demo credentials
  DEMO_CREDENTIALS: {
    USER: {
      email: 'demo@movieapp.com',
      password: 'demo123',
      name: 'Demo User'
    },
    ADMIN: {
      email: 'admin@movieapp.com',
      password: 'admin123',
      name: 'Admin User'
    }
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_REVIEWS: true,
    ENABLE_COMMENTS: true,
    ENABLE_RATINGS: true,
    ENABLE_WATCHLIST: true,
    ENABLE_FAVORITES: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: true,
    ENABLE_ADMIN_PANEL: true
  },
  
  // Error messages
  ERRORS: {
    NETWORK: 'Network error. Please check your connection.',
    API_KEY_MISSING: 'API key is required. Please configure it in settings.',
    API_KEY_INVALID: 'Invalid API key. Please check your TMDB API key.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.'
  },
  
  // Success messages
  SUCCESS: {
    MOVIE_ADDED: 'Movie added successfully',
    MOVIE_UPDATED: 'Movie updated successfully',
    MOVIE_DELETED: 'Movie deleted successfully',
    REVIEW_ADDED: 'Review added successfully',
    COMMENT_ADDED: 'Comment added successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
    PROFILE_UPDATED: 'Profile updated successfully'
  }
}

// Environment-specific configuration
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    isDevelopment,
    isProduction,
    enableDebugLogs: isDevelopment,
    enableAnalytics: isProduction,
    apiTimeout: isDevelopment ? 10000 : 5000, // 10s in dev, 5s in prod
    maxRetries: isDevelopment ? 1 : 3
  }
}

// Browser compatibility checks
export const checkBrowserSupport = () => {
  const support = {
    localStorage: typeof(Storage) !== 'undefined',
    indexedDB: typeof(indexedDB) !== 'undefined',
    webWorkers: typeof(Worker) !== 'undefined',
    notifications: 'Notification' in window,
    geolocation: 'geolocation' in navigator,
    mediaQueries: window.matchMedia !== undefined,
    intersectionObserver: typeof(IntersectionObserver) !== 'undefined'
  }
  
  return support
}

// Performance monitoring configuration
export const PERFORMANCE_CONFIG = {
  METRICS: {
    PAGE_LOAD: 'page_load_time',
    API_RESPONSE: 'api_response_time',
    RENDER_TIME: 'component_render_time',
    MEMORY_USAGE: 'memory_usage',
    NETWORK_REQUESTS: 'network_request_count'
  },
  THRESHOLDS: {
    PAGE_LOAD_WARNING: 3000, // 3 seconds
    PAGE_LOAD_ERROR: 5000, // 5 seconds
    API_RESPONSE_WARNING: 1000, // 1 second
    API_RESPONSE_ERROR: 3000, // 3 seconds
    MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
    MEMORY_ERROR: 100 * 1024 * 1024 // 100MB
  }
}

// Named exports for easy importing
export const CACHE_DURATION = APP_CONFIG.CACHE_DURATION
export const STORAGE_KEYS = APP_CONFIG.STORAGE_KEYS
export const TMDB_API_BASE_URL = APP_CONFIG.TMDB_API_BASE_URL
export const TMDB_IMAGE_BASE_URL = APP_CONFIG.TMDB_IMAGE_BASE_URL
export const DEFAULT_LANGUAGE = APP_CONFIG.DEFAULT_LANGUAGE
export const DEFAULT_REGION = APP_CONFIG.DEFAULT_REGION
export const DEFAULT_INCLUDE_ADULT = APP_CONFIG.DEFAULT_INCLUDE_ADULT
export const MOVIES_PER_PAGE = APP_CONFIG.MOVIES_PER_PAGE
export const DEBOUNCE_DELAY = APP_CONFIG.DEBOUNCE_DELAY
export const IMAGE_SIZES = APP_CONFIG.IMAGE_SIZES
export const DEMO_CREDENTIALS = APP_CONFIG.DEMO_CREDENTIALS
export const FEATURES = APP_CONFIG.FEATURES
export const ERRORS = APP_CONFIG.ERRORS
export const SUCCESS = APP_CONFIG.SUCCESS

// Default settings object
export const DEFAULT_SETTINGS = {
  apiKey: null as string | null,
  baseUrl: APP_CONFIG.TMDB_API_BASE_URL,
  imageBaseUrl: APP_CONFIG.TMDB_IMAGE_BASE_URL,
  language: APP_CONFIG.DEFAULT_LANGUAGE,
  includeAdult: APP_CONFIG.DEFAULT_INCLUDE_ADULT,
  region: APP_CONFIG.DEFAULT_REGION,
  theme: 'system' as const
}

// API Endpoints
export const API_ENDPOINTS = {
  POPULAR: '/movie/popular',
  SEARCH: '/search/movie',
  MOVIE_DETAILS: '/movie',
  GENRES: '/genre/movie/list',
  NOW_PLAYING: '/movie/now_playing',
  TOP_RATED: '/movie/top_rated',
  UPCOMING: '/movie/upcoming'
}

// Export the main config as both named and default
export { APP_CONFIG }
export default APP_CONFIG