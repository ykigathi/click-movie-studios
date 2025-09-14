import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { movieApi, Movie } from '../utils/api'
import { MovieCard } from './MovieCard'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { Alert, AlertDescription } from './ui/alert'
import { Heart, Film } from 'lucide-react'

interface WatchlistProps {
  onMovieSelect: (movie: Movie) => void
}

export const Watchlist: React.FC<WatchlistProps> = ({ onMovieSelect }) => {
  const { user, session } = useAuth()
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWatchlistMovies = async () => {
    if (!user || !session?.access_token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Get user's watchlist
      const { watchlist } = await movieApi.getUserWatchlist(session.access_token)
      
      // Fetch movie details for each movie in the watchlist
      const moviePromises = watchlist.map(movieId => 
        movieApi.getMovieDetails(movieId).catch(err => {
          console.error(`Failed to fetch movie ${movieId}:`, err)
          return null
        })
      )
      
      const movies = await Promise.all(moviePromises)
      const validMovies = movies.filter((movie): movie is Movie => movie !== null)
      
      setWatchlistMovies(validMovies)
    } catch (err) {
      setError('Failed to load your watchlist. Please try again.')
      console.error('Error fetching watchlist:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWatchlistMovies()
  }, [user, session])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="mb-2">Sign In to Access Your Watchlist</h2>
          <p className="text-muted-foreground mb-6">
            Create an account to save your favorite movies and get personalized recommendations.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6">My Watchlist</h1>
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6">My Watchlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (watchlistMovies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="mb-2">Your Watchlist is Empty</h2>
          <p className="text-muted-foreground mb-6">
            Start adding movies to your watchlist by browsing popular movies or searching for your favorites.
          </p>
          <Button onClick={() => window.location.reload()}>
            Browse Movies
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            My Watchlist
          </h1>
          <p className="text-muted-foreground">
            {watchlistMovies.length} movie{watchlistMovies.length !== 1 ? 's' : ''} in your watchlist
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {watchlistMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={() => onMovieSelect(movie)}
          />
        ))}
      </div>
    </div>
  )
}