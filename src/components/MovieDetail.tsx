import React, { useState, useEffect } from 'react'
import { MovieDetailsResponse, MovieDetailProps } from '../types'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'
import { Alert, AlertDescription } from './ui/alert'
import { useUser } from '../contexts/UserContext'
import { useMovies } from '../contexts/MovieContext'
import { useSettings } from '../contexts/SettingsContext'
import { MovieApiService, MockApiService } from '../services/api'
import { ArrowLeft, Star, Calendar, Clock, DollarSign, Heart, HeartOff, Loader2 } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'

export const MovieDetail: React.FC<MovieDetailProps> = ({ movieId, onBack }) => {
  const { user, isInWatchlist, addToWatchlist, removeFromWatchlist, addToViewHistory } = useUser()
  const { fetchMovieDetails } = useMovies()
  const { settings, isConfigured } = useSettings()
  
  const [movie, setMovie] = useState<MovieDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [watchlistLoading, setWatchlistLoading] = useState(false)

  const isMovieInWatchlist = movie ? isInWatchlist(movie.id) : false

  const loadMovieDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const movieData = await fetchMovieDetails(movieId)
      if (movieData) {
        setMovie(movieData)
        // Add to view history
        if (user) {
          addToViewHistory(movieId)
        }
      } else {
        setError('Movie not found.')
      }
    } catch (err) {
      setError('Failed to load movie details. Please try again.')
      console.error('Error fetching movie details:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleWatchlist = () => {
    if (!user || !movie) return

    setWatchlistLoading(true)
    try {
      if (isMovieInWatchlist) {
        removeFromWatchlist(movie.id)
      } else {
        addToWatchlist(movie.id)
      }
    } catch (err) {
      console.error('Error updating watchlist:', err)
    } finally {
      setWatchlistLoading(false)
    }
  }

  useEffect(() => {
    loadMovieDetails()
  }, [movieId])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Movies
        </Button>
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading || !movie) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Movies
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getImageUrl = (path: string | null, size = 'w500') => {
    if (isConfigured && settings.apiKey) {
      const apiService = new MovieApiService({
        baseUrl: settings.baseUrl,
        apiKey: settings.apiKey,
        language: settings.language,
        includeAdult: settings.includeAdult,
        region: settings.region
      })
      return size === 'w1280' ? apiService.getBackdropUrl(path) : apiService.getImageUrl(path)
    } else {
      const mockService = new MockApiService()
      return size === 'w1280' ? mockService.getBackdropUrl(path) : mockService.getImageUrl(path)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button onClick={onBack} variant="ghost" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Movies
      </Button>

      {/* Hero section with backdrop */}
      <div 
        className="relative min-h-[400px] rounded-lg overflow-hidden mb-8"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${getImageUrl(movie.backdrop_path, 'w1280')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 p-8 flex items-end">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="md:col-span-1">
              <ImageWithFallback
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="w-full max-w-sm rounded-lg shadow-2xl"
              />
            </div>
            <div className="md:col-span-2 text-white space-y-4">
              <div>
                <h1 className="text-white mb-2">{movie.title}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{movie.vote_average.toFixed(1)}/10</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                  {movie.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {movie.genres && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-lg leading-relaxed">{movie.overview}</p>

              {user && (
                <Button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  variant={isInWatchlist ? "destructive" : "default"}
                  className="flex items-center gap-2"
                >
                  {watchlistLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isInWatchlist ? (
                    <HeartOff className="w-4 h-4" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                  {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Box Office */}
        {(movie.budget || movie.revenue) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Box Office
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {movie.budget && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span>{formatCurrency(movie.budget)}</span>
                </div>
              )}
              {movie.revenue && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span>{formatCurrency(movie.revenue)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {movie.cast.slice(0, 5).map((actor, index) => (
                  <div key={actor.id} className="flex justify-between">
                    <span>{actor.name}</span>
                    <span className="text-muted-foreground">{actor.character}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crew */}
        {movie.crew && movie.crew.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Crew</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {movie.crew.slice(0, 5).map((person, index) => (
                  <div key={`${person.id}-${index}`} className="flex justify-between">
                    <span>{person.name}</span>
                    <span className="text-muted-foreground">{person.job}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}