import { AppSettings } from '../types'

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: null,
  baseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p',
  language: 'en-US',
  includeAdult: false,
  region: 'US'
}

export const STORAGE_KEYS = {
  SETTINGS: 'movieapp_settings',
  USER: 'movieapp_user',
  USER_DATA: 'movieapp_user_data',
  MOVIE_CACHE: 'movieapp_movie_cache'
} as const

export const API_ENDPOINTS = {
  POPULAR: '/movie/popular',
  SEARCH: '/search/movie',
  MOVIE_DETAILS: '/movie',
  GENRES: '/genre/movie/list',
  CREDITS: '/movie/{id}/credits'
} as const

export const CACHE_DURATION = {
  POPULAR_MOVIES: 1000 * 60 * 15, // 15 minutes
  MOVIE_DETAILS: 1000 * 60 * 60, // 1 hour
  GENRES: 1000 * 60 * 60 * 24, // 24 hours
  SEARCH: 1000 * 60 * 5 // 5 minutes
} as const

export const APP_CONFIG = {
  APP_NAME: 'MovieApp',
  VERSION: '1.0.0',
  MAX_WATCHLIST_ITEMS: 100,
  MAX_SEARCH_RESULTS: 20,
  ITEMS_PER_PAGE: 20,
  DEBOUNCE_DELAY: 500
} as const