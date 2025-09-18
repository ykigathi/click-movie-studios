import React from 'react'
import { Movie, MovieCardProps } from '../types'
import { Card, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Star, Calendar, Play } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { TrailerModal } from './TrailerModal'
import { useSettings } from '../contexts/SettingsContext'
import { useUser } from '../contexts/UserContext'
import { MovieApiService, MockApiService } from '../services/api'

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, variant = 'default' }) => {
  const { settings, isConfigured } = useSettings()
  const { user } = useUser()
  
  const getImageUrl = (path: string | null) => {
    if (isConfigured && settings.apiKey) {
      const apiService = new MovieApiService({
        baseUrl: settings.baseUrl,
        apiKey: settings.apiKey,
        language: settings.language,
        includeAdult: settings.includeAdult,
        region: settings.region
      })
      return apiService.getImageUrl(path)
    } else {
      const mockService = new MockApiService()
      return mockService.getImageUrl(path)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onClick()
  }

  if (variant === 'compact') {
    return (
      <Card className="cursor-pointer transition-transform hover:scale-102 hover:shadow-lg" onClick={handleCardClick}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-36 flex-shrink-0 overflow-hidden rounded-lg">
              <ImageWithFallback
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="line-clamp-2 leading-tight">{movie.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{movie.vote_average.toFixed(1)}</span>
                <Calendar className="w-3 h-3 ml-2" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{movie.overview}</p>
              <div className="flex items-center gap-2 pt-2">
                <TrailerModal movieId={movie.id} movieTitle={movie.title}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    Trailer
                  </Button>
                </TrailerModal>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg group" onClick={handleCardClick}>
      <CardContent className="p-0">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
          </div>
          {/* Overlay with trailer button that appears on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <TrailerModal movieId={movie.id} movieTitle={movie.title}>
              <Button variant="secondary" size="lg" className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Trailer
              </Button>
            </TrailerModal>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start gap-2">
        <h3 className="line-clamp-2 leading-tight">{movie.title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{new Date(movie.release_date).getFullYear()}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{movie.overview}</p>
        {movie.genres && (
          <div className="flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map(genre => (
              <Badge key={genre.id} variant="secondary" className="text-xs">
                {genre.name}
              </Badge>
            ))}
          </div>
        )}
        {/* Bottom action bar */}
        <div className="flex items-center justify-between w-full pt-2">
          <TrailerModal movieId={movie.id} movieTitle={movie.title}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
              <Play className="w-3 h-3" />
              Trailer
            </Button>
          </TrailerModal>
        </div>
      </CardFooter>
    </Card>
  )
}