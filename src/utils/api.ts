import { projectId, publicAnonKey } from './supabase/info'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3c992561`

export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string
  backdrop_path: string
  vote_average: number
  release_date: string
  genre_ids: number[]
  genres?: { id: number; name: string }[]
  runtime?: number
  budget?: number
  revenue?: number
  cast?: { id: number; name: string; character: string }[]
  crew?: { id: number; name: string; job: string }[]
}

export interface MoviesResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export const movieApi = {
  async getPopularMovies(page = 1): Promise<MoviesResponse> {
    const response = await fetch(`${API_BASE}/movies/popular?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch popular movies')
    }
    
    return response.json()
  },

  async getMovieDetails(id: number): Promise<Movie> {
    const response = await fetch(`${API_BASE}/movies/${id}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch movie details')
    }
    
    return response.json()
  },

  async searchMovies(query: string, page = 1): Promise<MoviesResponse> {
    const response = await fetch(`${API_BASE}/search/movie?query=${encodeURIComponent(query)}&page=${page}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to search movies')
    }
    
    return response.json()
  },

  async getUserWatchlist(accessToken: string): Promise<{ watchlist: number[] }> {
    const response = await fetch(`${API_BASE}/user/watchlist`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch watchlist')
    }
    
    return response.json()
  },

  async addToWatchlist(movieId: number, accessToken: string): Promise<{ success: boolean; watchlist: number[] }> {
    const response = await fetch(`${API_BASE}/user/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ movieId })
    })
    
    if (!response.ok) {
      throw new Error('Failed to add to watchlist')
    }
    
    return response.json()
  },

  async removeFromWatchlist(movieId: number, accessToken: string): Promise<{ success: boolean; watchlist: number[] }> {
    const response = await fetch(`${API_BASE}/user/watchlist/${movieId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to remove from watchlist')
    }
    
    return response.json()
  },

  async signup(email: string, password: string, name: string): Promise<{ user: any }> {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to signup')
    }
    
    return response.json()
  }
}

export const getImageUrl = (path: string, size = 'w500') => {
  if (!path) return '/placeholder-movie.jpg'
  return `https://image.tmdb.org/t/p/${size}${path}`
}