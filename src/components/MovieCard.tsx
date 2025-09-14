import React from 'react'
import { Movie, MovieCardProps } from '../types'
import { Card, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { Star, Calendar } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { useSettings } from '../contexts/SettingsContext'
import { MovieApiService, MockApiService } from '../services/api'

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const { settings, isConfigured } = useSettings()
  
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

  return (
    <Card className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg" onClick={onClick}>
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
      </CardFooter>
    </Card>
  )
}