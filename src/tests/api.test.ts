import { MovieApiService, MockApiService } from '../services/api'
import { ApiConfig, MoviesResponse, MovieDetailsResponse } from '../types'

describe('API Services', () => {
  let mockApiService: MockApiService
  let realApiService: MovieApiService

  const mockConfig: ApiConfig = {
    baseUrl: 'https://api.themoviedb.org/3',
    apiKey: 'test-api-key',
    language: 'en-US',
    includeAdult: false,
    region: 'US'
  }

  beforeEach(() => {
    mockApiService = new MockApiService()
    realApiService = new MovieApiService(mockConfig)
    
    // Reset fetch mock
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('MockApiService', () => {
    test('should return popular movies with correct structure', async () => {
      const result = await mockApiService.getPopularMovies(1)
      
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('results')
      expect(result).toHaveProperty('total_pages')
      expect(result).toHaveProperty('total_results')
      expect(Array.isArray(result.results)).toBe(true)
      
      if (result.results.length > 0) {
        const movie = result.results[0]
        expect(movie).toHaveProperty('id')
        expect(movie).toHaveProperty('title')
        expect(movie).toHaveProperty('overview')
        expect(movie).toHaveProperty('poster_path')
        expect(movie).toHaveProperty('vote_average')
        expect(movie).toHaveProperty('release_date')
      }
    })

    test('should search movies correctly', async () => {
      const searchTerm = 'shawshank'
      const result = await mockApiService.searchMovies(searchTerm)
      
      expect(result).toHaveProperty('results')
      expect(Array.isArray(result.results)).toBe(true)
      
      // Should find movies that match the search term
      const foundMovie = result.results.find(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      expect(foundMovie).toBeDefined()
    })

    test('should return empty results for empty search', async () => {
      const result = await mockApiService.searchMovies('')
      
      expect(result.results).toHaveLength(0)
      expect(result.total_results).toBe(0)
    })

    test('should return movie details with extended information', async () => {
      const movieId = 1
      const result = await mockApiService.getMovieDetails(movieId)
      
      expect(result).toHaveProperty('id', movieId)
      expect(result).toHaveProperty('runtime')
      expect(result).toHaveProperty('budget')
      expect(result).toHaveProperty('revenue')
      expect(result).toHaveProperty('cast')
      expect(result).toHaveProperty('crew')
      expect(Array.isArray(result.cast)).toBe(true)
      expect(Array.isArray(result.crew)).toBe(true)
    })

    test('should throw error for non-existent movie', async () => {
      const nonExistentId = 99999
      
      await expect(mockApiService.getMovieDetails(nonExistentId))
        .rejects.toThrow('Movie not found')
    })

    test('should return genres list', async () => {
      const result = await mockApiService.getGenres()
      
      expect(result).toHaveProperty('genres')
      expect(Array.isArray(result.genres)).toBe(true)
      
      if (result.genres.length > 0) {
        const genre = result.genres[0]
        expect(genre).toHaveProperty('id')
        expect(genre).toHaveProperty('name')
      }
    })

    test('should generate correct image URLs', () => {
      const posterPath = '/test-poster.jpg'
      const backdropPath = '/test-backdrop.jpg'
      
      const posterUrl = mockApiService.getImageUrl(posterPath, 'w500')
      const backdropUrl = mockApiService.getBackdropUrl(backdropPath, 'w1280')
      
      expect(posterUrl).toContain(posterPath)
      expect(posterUrl).toContain('w500')
      expect(backdropUrl).toContain(backdropPath)
      expect(backdropUrl).toContain('w1280')
    })

    test('should handle null image paths', () => {
      const posterUrl = mockApiService.getImageUrl(null)
      const backdropUrl = mockApiService.getBackdropUrl(null)
      
      expect(posterUrl).toBe('/placeholder-movie.jpg')
      expect(backdropUrl).toBe('/placeholder-backdrop.jpg')
    })
  })

  describe('MovieApiService', () => {
    test('should construct correct API URLs', async () => {
      const mockResponse: MoviesResponse = {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await realApiService.getPopularMovies(1)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.themoviedb.org/3/movie/popular')
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api_key=test-api-key')
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('language=en-US')
      )
    })

    test('should handle API errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          status_message: 'Invalid API key'
        })
      })

      await expect(realApiService.getPopularMovies())
        .rejects.toThrow('Invalid API key')
    })

    test('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(realApiService.getPopularMovies())
        .rejects.toThrow('Network error')
    })

    test('should update config correctly', async () => {
      const newConfig = { apiKey: 'new-api-key' }
      realApiService.updateConfig(newConfig)

      const mockResponse: MoviesResponse = {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await realApiService.getPopularMovies()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api_key=new-api-key')
      )
    })

    test('should throw error when API key is missing', async () => {
      const serviceWithoutKey = new MovieApiService({
        ...mockConfig,
        apiKey: ''
      })

      await expect(serviceWithoutKey.getPopularMovies())
        .rejects.toThrow('API key is required')
    })

    test('should include adult content based on config', async () => {
      const mockResponse: MoviesResponse = {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await realApiService.getPopularMovies()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('include_adult=false')
      )
    })

    test('should handle search with encoding', async () => {
      const searchTerm = 'action & adventure'
      const mockResponse: MoviesResponse = {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await realApiService.searchMovies(searchTerm)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(searchTerm))
      )
    })
  })

  describe('Performance Tests', () => {
    test('should complete API calls within reasonable time', async () => {
      const startTime = performance.now()
      await mockApiService.getPopularMovies()
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(2000) // Should complete within 2 seconds
    })

    test('should handle concurrent requests', async () => {
      const promises = [
        mockApiService.getPopularMovies(1),
        mockApiService.getPopularMovies(2),
        mockApiService.searchMovies('test'),
        mockApiService.getGenres()
      ]

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(4)
      results.forEach(result => {
        expect(result).toBeDefined()
      })
    })
  })

  describe('Caching Behavior', () => {
    test('should return consistent results for same requests', async () => {
      const result1 = await mockApiService.getPopularMovies(1)
      const result2 = await mockApiService.getPopularMovies(1)
      
      expect(result1).toEqual(result2)
    })

    test('should handle pagination correctly', async () => {
      const page1 = await mockApiService.getPopularMovies(1)
      const page2 = await mockApiService.getPopularMovies(2)
      
      expect(page1.page).toBe(1)
      expect(page2.page).toBe(2)
      
      // Pages should have different results (if available)
      if (page1.results.length > 0 && page2.results.length > 0) {
        expect(page1.results[0].id).not.toBe(page2.results[0].id)
      }
    })
  })
})