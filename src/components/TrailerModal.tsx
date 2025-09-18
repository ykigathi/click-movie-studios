import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Play, X, ExternalLink, Maximize, Minimize } from 'lucide-react'
import { useMovies } from '../contexts/MovieContext'

interface TrailerModalProps {
  movieId: number
  movieTitle: string
  children?: React.ReactNode
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ 
  movieId, 
  movieTitle, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const { getMovieTrailer } = useMovies()

  const fetchTrailer = async () => {
    setLoading(true)
    try {
      const url = await getMovieTrailer(movieId)
      setTrailerUrl(url)
    } catch (error) {
      console.error('Error fetching trailer:', error)
      setTrailerUrl(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && !trailerUrl) {
      fetchTrailer()
    }
  }, [isOpen])

  const getYouTubeEmbedUrl = (url: string) => {
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = match && match[2].length === 11 ? match[2] : null
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    }
    return null
  }

  const openInNewTab = () => {
    if (trailerUrl) {
      window.open(trailerUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Watch Trailer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={`${
        isMaximized 
          ? 'max-w-[98vw] w-[98vw] h-[98vh]' 
          : 'max-w-4xl w-[90vw] h-[90vh]'
      } p-0 transition-all duration-300`}>
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              {movieTitle} - Trailer
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleMaximize}
                className="flex items-center gap-2"
              >
                {isMaximized ? (
                  <>
                    <Minimize className="w-4 h-4" />
                    Minimize
                  </>
                ) : (
                  <>
                    <Maximize className="w-4 h-4" />
                    Maximize
                  </>
                )}
              </Button>
              {trailerUrl && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openInNewTab}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in YouTube
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-6 pt-0">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
              <div className="text-white">Loading trailer...</div>
            </div>
          ) : trailerUrl ? (
            <div className="w-full h-full relative">
              {getYouTubeEmbedUrl(trailerUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(trailerUrl)!}
                  title={`${movieTitle} Trailer`}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-lg text-white gap-4">
                  <p>Unable to embed trailer</p>
                  <Button 
                    onClick={openInNewTab}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch on YouTube
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <p className="text-gray-600 mb-2">No trailer available</p>
                <p className="text-sm text-gray-500">
                  Trailer for "{movieTitle}" is not available at the moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}