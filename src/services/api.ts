import { 
  Movie, 
  MoviesResponse, 
  MovieDetailsResponse, 
  Genre, 
  ApiConfig, 
  ApiError,
  ImageSize,
  BackdropSize
} from '../types'
import { DEFAULT_SETTINGS, API_ENDPOINTS } from '../config/settings'

class MovieApiService {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
  }

  updateConfig(newConfig: Partial<ApiConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  private validatePage(page: number): number {
    // Ensure page is a valid integer between 1 and 500 (TMDB API limit)
    const validPage = Math.max(1, Math.min(500, Math.floor(Math.abs(page || 1))))
    return validPage
  }

  private async fetchFromApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.config.apiKey) {
      throw new Error('API key is required. Please configure your TMDB API key in settings.')
    }

    const url = new URL(`${this.config.baseUrl}${endpoint}`)
    url.searchParams.append('language', this.config.language)
    
    if (!this.config.includeAdult) {
      url.searchParams.append('include_adult', 'false')
    }

    if (this.config.region) {
      url.searchParams.append('region', this.config.region)
    }

    // Add custom parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`
        }))
        throw new Error(errorData.status_message || errorData.message || 'API request failed')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  getImageUrl(path: string | null, size: ImageSize = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg'
    return `${this.config.imageBaseUrl || 'https://image.tmdb.org/t/p'}/${size}${path}`
  }

  getBackdropUrl(path: string | null, size: BackdropSize = 'w1280'): string {
    if (!path) return '/placeholder-backdrop.jpg'
    return `${this.config.imageBaseUrl || 'https://image.tmdb.org/t/p'}/${size}${path}`
  }

  async getPopularMovies(page = 1): Promise<MoviesResponse> {
    const validPage = this.validatePage(page)
    return this.fetchFromApi<MoviesResponse>(API_ENDPOINTS.POPULAR, {
      page: validPage.toString()
    })
  }

  async getNowPlayingMovies(page = 1): Promise<MoviesResponse> {
    const validPage = this.validatePage(page)
    return this.fetchFromApi<MoviesResponse>('/movie/now_playing', {
      page: validPage.toString()
    })
  }

  async getTopRatedMovies(page = 1): Promise<MoviesResponse> {
    const validPage = this.validatePage(page)
    return this.fetchFromApi<MoviesResponse>('/movie/top_rated', {
      page: validPage.toString()
    })
  }

  async getUpcomingMovies(page = 1): Promise<MoviesResponse> {
    const validPage = this.validatePage(page)
    return this.fetchFromApi<MoviesResponse>('/movie/upcoming', {
      page: validPage.toString()
    })
  }

  async discoverMovies(page = 1, filters?: any): Promise<MoviesResponse> {
    const validPage = this.validatePage(page)
    const params: Record<string, string> = {
      page: validPage.toString()
    }

    if (filters) {
      if (filters.genres && filters.genres.length > 0) {
        params.with_genres = filters.genres.join(',')
      }
      if (filters.year) {
        params.year = filters.year.toString()
      }
      if (filters.sortBy) {
        params.sort_by = filters.sortBy
      }
      if (filters.rating) {
        params['vote_average.gte'] = filters.rating.toString()
      }
    }

    return this.fetchFromApi<MoviesResponse>('/discover/movie', params)
  }

  async getMovieVideos(id: number): Promise<{ results: Array<{ key: string; type: string; site: string; name: string }> }> {
    return this.fetchFromApi<{ results: Array<{ key: string; type: string; site: string; name: string }> }>(`/movie/${id}/videos`)
  }

  async searchMovies(query: string, page = 1, filters?: any): Promise<MoviesResponse> {
    if (!query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      }
    }

    const validPage = this.validatePage(page)
    const params: Record<string, string> = {
      query: query.trim(),
      page: validPage.toString()
    }

    if (filters?.year) {
      params.year = filters.year.toString()
    }

    return this.fetchFromApi<MoviesResponse>('/search/movie', params)
  }

  async getMovieDetails(id: number): Promise<MovieDetailsResponse> {
    return this.fetchFromApi<MovieDetailsResponse>(`/movie/${id}`, {
      append_to_response: 'credits,videos,images'
    })
  }

  async getGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchFromApi<{ genres: Genre[] }>('/genre/movie/list')
  }
}

// Mock data for development/fallback
const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    overview: "Two imprisoned mates bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdrop_path: "/9cqNxx0GxF0bflNmkEBl9hlnxoB.jpg",
    vote_average: 9.3,
    release_date: "1994-09-23",
    genre_ids: [18, 80],
    genres: [{ id: 18, name: "Drama" }, { id: 80, name: "Crime" }],
    adult: false,
    original_language: "en",
    original_title: "The Shawshank Redemption",
    popularity: 123.456,
    video: false,
    vote_count: 26000
  },
  {
    id: 2,
    title: "The Godfather",
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    vote_average: 9.2,
    release_date: "1972-03-14",
    genre_ids: [18, 80],
    genres: [{ id: 18, name: "Drama" }, { id: 80, name: "Crime" }],
    adult: false,
    original_language: "en",
    original_title: "The Godfather",
    popularity: 111.123,
    video: false,
    vote_count: 19000
  },
  {
    id: 3,
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
    vote_average: 9.0,
    release_date: "2008-07-16",
    genre_ids: [28, 80, 18],
    genres: [{ id: 28, name: "Action" }, { id: 80, name: "Crime" }, { id: 18, name: "Drama" }],
    adult: false,
    original_language: "en",
    original_title: "The Dark Knight",
    popularity: 98.765,
    video: false,
    vote_count: 32000
  },
  {
    id: 4,
    title: "Pulp Fiction",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop_path: "/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
    vote_average: 8.9,
    release_date: "1994-09-10",
    genre_ids: [80, 18],
    genres: [{ id: 80, name: "Crime" }, { id: 18, name: "Drama" }],
    adult: false,
    original_language: "en",
    original_title: "Pulp Fiction",
    popularity: 87.654,
    video: false,
    vote_count: 27000
  },
  {
    id: 5,
    title: "Forrest Gump",
    overview: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate and other historical events unfold from the perspective of an Alabama man.",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop_path: "/7c9UiPHNbNGzRPNLKwk7LrKAzR.jpg",
    vote_average: 8.8,
    release_date: "1994-06-23",
    genre_ids: [35, 18, 10749],
    genres: [{ id: 35, name: "Comedy" }, { id: 18, name: "Drama" }, { id: 10749, name: "Romance" }],
    adult: false,
    original_language: "en",
    original_title: "Forrest Gump",
    popularity: 76.543,
    video: false,
    vote_count: 25000
  },
  {
    id: 6,
    title: "Inception",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    vote_average: 8.7,
    release_date: "2010-07-15",
    genre_ids: [28, 878, 53],
    genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }, { id: 53, name: "Thriller" }],
    adult: false,
    original_language: "en",
    original_title: "Inception",
    popularity: 65.432,
    video: false,
    vote_count: 30000
  },
  {
    id: 7,
    title: "Interstellar",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    vote_average: 8.6,
    release_date: "2014-11-07",
    genre_ids: [12, 18, 878],
    genres: [{ id: 12, name: "Adventure" }, { id: 18, name: "Drama" }, { id: 878, name: "Science Fiction" }],
    adult: false,
    original_language: "en",
    original_title: "Interstellar",
    popularity: 54.321,
    video: false,
    vote_count: 28000
  },
  {
    id: 8,
    title: "The Matrix",
    overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop_path: "/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
    vote_average: 8.7,
    release_date: "1999-03-30",
    genre_ids: [28, 878],
    genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }],
    adult: false,
    original_language: "en",
    original_title: "The Matrix",
    popularity: 43.210,
    video: false,
    vote_count: 24000
  }
]

class MockApiService {
  private validatePage(page: number): number {
    // Ensure page is a valid integer between 1 and 500 (TMDB API limit)
    const validPage = Math.max(1, Math.min(500, Math.floor(Math.abs(page || 1))))
    return validPage
  }

  getImageUrl(path: string | null, size: ImageSize = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg'
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  getBackdropUrl(path: string | null, size: BackdropSize = 'w1280'): string {
    if (!path) return '/placeholder-backdrop.jpg'
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  async getPopularMovies(page = 1): Promise<MoviesResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const validPage = this.validatePage(page)
    const perPage = 20
    const startIndex = (validPage - 1) * perPage
    const endIndex = startIndex + perPage
    const movies = MOCK_MOVIES.slice(startIndex, endIndex)
    
    return {
      page: validPage,
      results: movies,
      total_pages: Math.ceil(MOCK_MOVIES.length / perPage),
      total_results: MOCK_MOVIES.length
    }
  }

  async getNowPlayingMovies(page = 1): Promise<MoviesResponse> {
    return this.getPopularMovies(page)
  }

  async getTopRatedMovies(page = 1): Promise<MoviesResponse> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const validPage = this.validatePage(page)
    const sortedMovies = [...MOCK_MOVIES].sort((a, b) => b.vote_average - a.vote_average)
    const perPage = 20
    const startIndex = (validPage - 1) * perPage
    const endIndex = startIndex + perPage
    const movies = sortedMovies.slice(startIndex, endIndex)
    
    return {
      page: validPage,
      results: movies,
      total_pages: Math.ceil(MOCK_MOVIES.length / perPage),
      total_results: MOCK_MOVIES.length
    }
  }

  async getUpcomingMovies(page = 1): Promise<MoviesResponse> {
    return this.getPopularMovies(page)
  }

  async discoverMovies(page = 1, filters?: any): Promise<MoviesResponse> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const validPage = this.validatePage(page)
    let filteredMovies = [...MOCK_MOVIES]
    
    if (filters) {
      if (filters.genres && filters.genres.length > 0) {
        filteredMovies = filteredMovies.filter(movie => 
          filters.genres.some((genreId: number) => movie.genre_ids.includes(genreId))
        )
      }
      
      if (filters.year) {
        filteredMovies = filteredMovies.filter(movie => 
          new Date(movie.release_date).getFullYear() === filters.year
        )
      }
      
      if (filters.rating) {
        filteredMovies = filteredMovies.filter(movie => 
          movie.vote_average >= filters.rating
        )
      }
      
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'popularity.desc':
            filteredMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            break
          case 'popularity.asc':
            filteredMovies.sort((a, b) => (a.popularity || 0) - (b.popularity || 0))
            break
          case 'vote_average.desc':
            filteredMovies.sort((a, b) => b.vote_average - a.vote_average)
            break
          case 'vote_average.asc':
            filteredMovies.sort((a, b) => a.vote_average - b.vote_average)
            break
          case 'release_date.desc':
            filteredMovies.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
            break
          case 'release_date.asc':
            filteredMovies.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
            break
          case 'title.asc':
            filteredMovies.sort((a, b) => a.title.localeCompare(b.title))
            break
          case 'title.desc':
            filteredMovies.sort((a, b) => b.title.localeCompare(a.title))
            break
        }
      }
    }
    
    const perPage = 20
    const startIndex = (validPage - 1) * perPage
    const endIndex = startIndex + perPage
    const movies = filteredMovies.slice(startIndex, endIndex)
    
    return {
      page: validPage,
      results: movies,
      total_pages: Math.ceil(filteredMovies.length / perPage),
      total_results: filteredMovies.length
    }
  }

  async getMovieVideos(id: number): Promise<{ results: Array<{ key: string; type: string; site: string; name: string }> }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock trailer data
    return {
      results: [
        {
          key: 'dQw4w9WgXcQ', // Rick Roll as placeholder
          type: 'Trailer',
          site: 'YouTube',
          name: 'Official Trailer'
        }
      ]
    }
  }

  async searchMovies(query: string, page = 1, filters?: any): Promise<MoviesResponse> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    if (!query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      }
    }

    const validPage = this.validatePage(page)
    
    let filteredMovies = MOCK_MOVIES.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) || 
      movie.overview.toLowerCase().includes(query.toLowerCase())
    )

    if (filters?.year) {
      filteredMovies = filteredMovies.filter(movie => 
        new Date(movie.release_date).getFullYear() === filters.year
      )
    }

    const perPage = 20
    const startIndex = (validPage - 1) * perPage
    const endIndex = startIndex + perPage
    const movies = filteredMovies.slice(startIndex, endIndex)

    return {
      page: validPage,
      results: movies,
      total_pages: Math.ceil(filteredMovies.length / perPage),
      total_results: filteredMovies.length
    }
  }

  async getMovieDetails(id: number): Promise<MovieDetailsResponse> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const movie = MOCK_MOVIES.find(m => m.id === id)
    if (!movie) {
      throw new Error('Movie not found')
    }

    return {
      ...movie,
      runtime: 142,
      budget: 25000000,
      revenue: 173000000,
      cast: [
        { id: 1, name: "Morgan Freeman", character: "Ellis Boyd 'Red' Redding" },
        { id: 2, name: "Tim Robbins", character: "Andy Dufresne" },
        { id: 3, name: "Bob Gunton", character: "Warden Samuel Norton" }
      ],
      crew: [
        { id: 1, name: "Frank Darabont", job: "Director" },
        { id: 2, name: "Frank Darabont", job: "Screenplay" },
        { id: 3, name: "Stephen King", job: "Novel" }
      ],
      belongs_to_collection: null,
      homepage: "",
      imdb_id: "tt0111161",
      production_companies: [],
      production_countries: [],
      spoken_languages: [],
      status: "Released",
      tagline: "Fear can hold you prisoner. Hope can set you free."
    }
  }

  async getGenres(): Promise<{ genres: Genre[] }> {
    return {
      genres: [
        { id: 28, name: "Action" },
        { id: 12, name: "Adventure" },
        { id: 16, name: "Animation" },
        { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" },
        { id: 99, name: "Documentary" },
        { id: 18, name: "Drama" },
        { id: 10751, name: "Family" },
        { id: 14, name: "Fantasy" },
        { id: 36, name: "History" },
        { id: 27, name: "Horror" },
        { id: 10402, name: "Music" },
        { id: 9648, name: "Mystery" },
        { id: 10749, name: "Romance" },
        { id: 878, name: "Science Fiction" },
        { id: 10770, name: "TV Movie" },
        { id: 53, name: "Thriller" },
        { id: 10752, name: "War" },
        { id: 37, name: "Western" }
      ]
    }
  }
}

// Export both services
export { MovieApiService, MockApiService }