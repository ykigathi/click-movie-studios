import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useMovies } from '../contexts/MovieContext'
import { useUser } from '../contexts/UserContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Skeleton } from '../components/ui/skeleton'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { TrailerModal } from '../components/TrailerModal'
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  Clock, 
  Calendar, 
  Play, 
  Plus, 
  Check,
  MessageCircle,
  ThumbsUp,
  Send
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    fetchMovieDetails, 
    movieDetails, 
    fetchMovieReviews, 
    fetchMovieComments,
    movieReviews,
    movieComments,
    addReview,
    addComment,
    likeReview,
    likeComment
  } = useMovies()
  const { 
    user, 
    isInWatchlist, 
    addToWatchlist, 
    removeFromWatchlist,
    isInFavorites,
    addToFavorites,
    removeFromFavorites,
    rateMovie,
    getMovieRating
  } = useUser()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newReview, setNewReview] = useState({ title: '', content: '', rating: 5 })
  const [newComment, setNewComment] = useState('')
  const [userRating, setUserRating] = useState<number | null>(null)

  const movieId = parseInt(id || '0')
  const movie = movieDetails[movieId]
  const reviews = movieReviews[movieId] || []
  const comments = movieComments[movieId] || []
  const isInWatchlistStatus = isInWatchlist(movieId)
  const isInFavoritesStatus = isInFavorites(movieId)
  const currentUserRating = getMovieRating(movieId)

  useEffect(() => {
    if (movieId) {
      loadMovieData()
      setUserRating(currentUserRating)
    }
  }, [movieId])

  const loadMovieData = async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        fetchMovieDetails(movieId),
        fetchMovieReviews(movieId),
        fetchMovieComments(movieId)
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movie details')
    } finally {
      setLoading(false)
    }
  }

  const handleWatchlistToggle = () => {
    if (isInWatchlistStatus) {
      removeFromWatchlist(movieId)
      toast.success('Removed from watchlist')
    } else {
      addToWatchlist(movieId)
      toast.success('Added to watchlist')
    }
  }

  const handleFavoritesToggle = () => {
    if (isInFavoritesStatus) {
      removeFromFavorites(movieId)
      toast.success('Removed from favorites')
    } else {
      addToFavorites(movieId)
      toast.success('Added to favorites')
    }
  }

  const handleRatingChange = (rating: number) => {
    rateMovie(movieId, rating)
    setUserRating(rating)
    toast.success(`Rated ${rating} stars`)
  }

  const handleAddReview = async () => {
    if (!user) {
      toast.error('Please sign in to add a review')
      return
    }

    if (!newReview.title.trim() || !newReview.content.trim()) {
      toast.error('Please fill in all review fields')
      return
    }

    try {
      await addReview(movieId, newReview)
      setNewReview({ title: '', content: '', rating: 5 })
      toast.success('Review added successfully')
    } catch (error) {
      toast.error('Failed to add review')
    }
  }

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please sign in to add a comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      await addComment(movieId, newComment)
      setNewComment('')
      toast.success('Comment added successfully')
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="aspect-[2/3] rounded-lg" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Movie Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The requested movie could not be found.'}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: movie.backdrop_path 
            ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`
            : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))'
        }}
      >
        <div className="container mx-auto px-4 py-12">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-6 bg-background/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
            {/* Movie Poster */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="relative group">
                <img
                  src={movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : '/placeholder-movie.jpg'
                  }
                  alt={movie.title}
                  className="w-80 rounded-lg shadow-2xl transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                  <Play className="w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>

            {/* Movie Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <div>
                <h1 className="text-4xl mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-xl text-white/80 italic">{movie.tagline}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-white/60">({movie.vote_count?.toLocaleString()} votes)</span>
                </div>
                
                {movie.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres?.map(genre => (
                  <Badge key={genre.id} variant="secondary" className="bg-white/20 text-white border-white/30">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              <p className="text-lg leading-relaxed text-white/90">
                {movie.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <TrailerModal movieId={movieId} movieTitle={movie.title}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Trailer
                  </Button>
                </TrailerModal>
                
                {user && (
                  <>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handleWatchlistToggle}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      {isInWatchlistStatus ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {isInWatchlistStatus ? 'In Watchlist' : 'Add to Watchlist'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handleFavoritesToggle}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isInFavoritesStatus ? 'fill-red-500 text-red-500' : ''}`} />
                      {isInFavoritesStatus ? 'Favorited' : 'Add to Favorites'}
                    </Button>
                  </>
                )}
              </div>

              {/* User Rating */}
              {user && (
                <div className="space-y-2">
                  <label className="text-sm">Your Rating:</label>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(rating => (
                      <button
                        key={rating}
                        onClick={() => handleRatingChange(rating)}
                        className="transition-colors"
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            (userRating || 0) >= rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-white/40 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Movie Details */}
        <Card>
          <CardHeader>
            <CardTitle>Movie Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Original Title:</span>
                <p>{movie.original_title}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Language:</span>
                <p>{movie.original_language?.toUpperCase()}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status:</span>
                <p>{movie.status}</p>
              </div>
            </div>
            <div className="space-y-3">
              {movie.budget && movie.budget > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Budget:</span>
                  <p>{formatCurrency(movie.budget)}</p>
                </div>
              )}
              {movie.revenue && movie.revenue > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Revenue:</span>
                  <p>{formatCurrency(movie.revenue)}</p>
                </div>
              )}
              {movie.homepage && (
                <div>
                  <span className="text-sm text-muted-foreground">Homepage:</span>
                  <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movie.cast.slice(0, 12).map(member => (
                  <div key={member.id} className="text-center space-y-2">
                    <Avatar className="w-16 h-16 mx-auto">
                      <AvatarImage 
                        src={member.profile_path 
                          ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
                          : undefined
                        } 
                      />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to review this movie!
                  </p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="space-y-3 border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={review.userAvatar} />
                            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.userName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => likeReview(review.id)}
                          className="flex items-center gap-1"
                        >
                          <ThumbsUp className={`w-4 h-4 ${review.isLikedByUser ? 'fill-primary' : ''}`} />
                          {review.likes}
                        </Button>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">{review.title}</h4>
                        <p className="text-muted-foreground">{review.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No comments yet. Start the conversation!
                  </p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 border-b pb-3 last:border-b-0">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => likeComment(comment.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <ThumbsUp className={`w-3 h-3 mr-1 ${comment.isLikedByUser ? 'fill-primary' : ''}`} />
                          {comment.likes}
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                {/* Add Comment */}
                {user && (
                  <div className="pt-4 border-t">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <Button onClick={handleAddComment} size="sm" disabled={!newComment.trim()}>
                          <Send className="w-4 h-4 mr-2" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add Review Sidebar */}
          {user && (
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <Select 
                      value={newReview.rating.toString()} 
                      onValueChange={(value) => setNewReview(prev => ({ ...prev, rating: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} Star{rating !== 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <input
                      type="text"
                      placeholder="Review title..."
                      value={newReview.title}
                      onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Review</label>
                    <Textarea
                      placeholder="Write your review..."
                      value={newReview.content}
                      onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button 
                    onClick={handleAddReview} 
                    className="w-full"
                    disabled={!newReview.title.trim() || !newReview.content.trim()}
                  >
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}