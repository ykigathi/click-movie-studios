import React from 'react'
import { MovieListProps } from '../types'
import { MovieCard } from './MovieCard'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { Alert, AlertDescription } from './ui/alert'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useMovies } from '../contexts/MovieContext'

export const MovieList: React.FC<MovieListProps> = ({ onMovieSelect }) => {
  const { 
    popularMovies, 
    popularLoading, 
    popularError, 
    popularPage, 
    popularTotalPages, 
    fetchPopularMovies 
  } = useMovies()

  const handlePreviousPage = () => {
    if (popularPage > 1) {
      fetchPopularMovies(popularPage - 1)
    }
  }

  const handleNextPage = () => {
    if (popularPage < popularTotalPages) {
      fetchPopularMovies(popularPage + 1)
    }
  }

  if (popularError) {
    return (
      <Alert className="m-6">
        <AlertDescription>{popularError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1>Popular Movies</h1>
        {popularTotalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={popularPage <= 1 || popularLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {popularPage} of {popularTotalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={popularPage >= popularTotalPages || popularLoading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {popularLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {popularMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => onMovieSelect(movie)}
            />
          ))}
        </div>
      )}

      {popularLoading && popularMovies.length > 0 && (
        <div className="flex justify-center mt-6">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
    </div>
  )
}