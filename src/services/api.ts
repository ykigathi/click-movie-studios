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

  private async fetchFromApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.config.apiKey) {
      throw new Error('API key is required. Please configure your TMDB API key in settings.')
    }

    const url = new URL(`${this.config.baseUrl}${endpoint}`)
    url.searchParams.append('api_key', this.config.apiKey)
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
      const response = await fetch(url.toString())
      
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

  async getPopularMovies(page = 1): Promise<MoviesResponse> {
    return this.fetchFromApi<MoviesResponse>(API_ENDPOINTS.POPULAR, {
      page: page.toString()
    })
  }

  async searchMovies(query: string, page = 1): Promise<MoviesResponse> {
    if (!query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      }
    }

    return this.fetchFromApi<MoviesResponse>(API_ENDPOINTS.SEARCH, {
      query: encodeURIComponent(query),
      page: page.toString()
    })
  }

  async getMovieDetails(id: number): Promise<MovieDetailsResponse> {
    const [details, credits] = await Promise.all([
      this.fetchFromApi<MovieDetailsResponse>(`${API_ENDPOINTS.MOVIE_DETAILS}/${id}`),
      this.fetchFromApi<any>(`${API_ENDPOINTS.MOVIE_DETAILS}/${id}/credits`)
    ])

    return {
      ...details,
      cast: credits.cast?.slice(0, 10) || [],
      crew: credits.crew?.slice(0, 10) || []
    }
  }

  async getGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchFromApi<{ genres: Genre[] }>(API_ENDPOINTS.GENRES)
  }

  getImageUrl(path: string | null, size: ImageSize = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg'
    return `${DEFAULT_SETTINGS.imageBaseUrl}/${size}${path}`
  }

  getBackdropUrl(path: string | null, size: BackdropSize = 'w1280'): string {
    if (!path) return '/placeholder-backdrop.jpg'
    return `${DEFAULT_SETTINGS.imageBaseUrl}/${size}${path}`
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
  }
]

class MockApiService {
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
    
    const perPage = 6
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const movies = MOCK_MOVIES.slice(startIndex, endIndex)
    
    return {
      page,
      results: movies,
      total_pages: Math.ceil(MOCK_MOVIES.length / perPage),
      total_results: MOCK_MOVIES.length
    }
  }

  async searchMovies(query: string, page = 1): Promise<MoviesResponse> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    if (!query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      }
    }

    const filteredMovies = MOCK_MOVIES.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) || 
      movie.overview.toLowerCase().includes(query.toLowerCase())
    )

    return {
      page,
      results: filteredMovies,
      total_pages: 1,
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