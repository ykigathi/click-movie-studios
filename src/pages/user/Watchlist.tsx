import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useUser } from '../../contexts/UserContext'
import { useMovies } from '../../contexts/MovieContext'
import { MovieCard } from '../../components/MovieCard'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Skeleton } from '../../components/ui/skeleton'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { 
  Heart, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Calendar,
  X,
  Trash2,
  Eye
} from 'lucide-react'
import { Movie, SortBy } from '../../types'
import { toast } from 'sonner@2.0.3'

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'favorites' | 'rated' | 'recent'

export const Watchlist: React.FC = () => {
  const navigate = useNavigate()
  const { 
    user, 
    userData, 
    isInWatchlist, 
    removeFromWatchlist, 
    isInFavorites,
    addToFavorites,
    removeFromFavorites,
    getMovieRating
  } = useUser()
  const { fetchMovieDetails, movieDetails, genres } = useMovies()

  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('popularity.desc')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])

  useEffect(() => {
    if (user) {
      loadWatchlistMovies()
    }
  }, [user, userData.watchlist])

  const loadWatchlistMovies = async () => {
    setLoading(true)
    try {
      const moviePromises = userData.watchlist.map(movieId => fetchMovieDetails(movieId))
      await Promise.all(moviePromises)
      
      const watchlistMovies = userData.watchlist
        .map(movieId => movieDetails[movieId])
        .filter(movie => movie) as Movie[]
      
      setMovies(watchlistMovies)
    } catch (error) {
      console.error('Failed to load watchlist movies:', error)
      toast.error('Failed to load watchlist')
    } finally {
      setLoading(false)
    }
  }

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`)
  }

  const handleRemoveFromWatchlist = (movieId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    removeFromWatchlist(movieId)
    setMovies(prev => prev.filter(movie => movie.id !== movieId))
    toast.success('Removed from watchlist')
  }

  const handleToggleFavorites = (movieId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (isInFavorites(movieId)) {
      removeFromFavorites(movieId)
      toast.success('Removed from favorites')
    } else {
      addToFavorites(movieId)
      toast.success('Added to favorites')
    }
  }

  const clearWatchlist = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
      userData.watchlist.forEach(movieId => removeFromWatchlist(movieId))
      setMovies([])
      toast.success('Watchlist cleared')
    }
  }

  // Filter and sort movies
  const filteredAndSortedMovies = React.useMemo(() => {
    let filtered = [...movies]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.overview.toLowerCase().includes(query) ||
        movie.genres?.some(genre => genre.name.toLowerCase().includes(query))
      )
    }

    // Apply type filter
    switch (filterType) {
      case 'favorites':
        filtered = filtered.filter(movie => isInFavorites(movie.id))
        break
      case 'rated':
        filtered = filtered.filter(movie => getMovieRating(movie.id) !== null)
        break
      case 'recent':
        // Sort by when added to watchlist (mock implementation)
        filtered = filtered.slice(0, 10)
        break
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title.asc':
          return a.title.localeCompare(b.title)
        case 'title.desc':
          return b.title.localeCompare(a.title)
        case 'release_date.desc':
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        case 'release_date.asc':
          return new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
        case 'vote_average.desc':
          return b.vote_average - a.vote_average
        case 'vote_average.asc':
          return a.vote_average - b.vote_average
        case 'popularity.desc':
        default:
          return (b.popularity || 0) - (a.popularity || 0)
      }
    })

    return filtered
  }, [movies, searchQuery, filterType, sortBy, isInFavorites, getMovieRating])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to view your watchlist.</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: userData.watchlist.length,
    favorites: userData.watchlist.filter(movieId => isInFavorites(movieId)).length,
    rated: userData.watchlist.filter(movieId => getMovieRating(movieId) !== null).length,
    avgRating: userData.watchlist.reduce((sum, movieId) => {
      const rating = getMovieRating(movieId)
      return rating ? sum + rating : sum
    }, 0) / userData.watchlist.filter(movieId => getMovieRating(movieId) !== null).length || 0
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              My Watchlist
            </h1>
            <p className="text-muted-foreground">
              Movies you want to watch later ({stats.total} movies)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {stats.total > 0 && (
              <Button variant="outline" size="sm" onClick={clearWatchlist}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Movies</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-red-500">{stats.favorites}</div>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.rated}</div>
              <p className="text-sm text-muted-foreground">Rated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-500">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
              </div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search watchlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Filter Type */}
              <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Movies</SelectItem>
                  <SelectItem value="favorites">❤️ Favorites Only</SelectItem>
                  <SelectItem value="rated">⭐ Rated Movies</SelectItem>
                  <SelectItem value="recent">🕒 Recently Added</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity.desc">Most Popular</SelectItem>
                  <SelectItem value="popularity.asc">Least Popular</SelectItem>
                  <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
                  <SelectItem value="vote_average.asc">Lowest Rated</SelectItem>
                  <SelectItem value="release_date.desc">Newest First</SelectItem>
                  <SelectItem value="release_date.asc">Oldest First</SelectItem>
                  <SelectItem value="title.asc">A-Z</SelectItem>
                  <SelectItem value="title.desc">Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {filterType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Filter: {filterType}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setFilterType('all')}
                  />
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedMovies.length} of {stats.total} movies
            </div>
          </CardContent>
        </Card>

        {/* Movies Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedMovies.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              {stats.total === 0 ? (
                <>
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl mb-2">Your Watchlist is Empty</h2>
                  <p className="text-muted-foreground mb-4">
                    Start adding movies you want to watch later!
                  </p>
                  <Button onClick={() => navigate('/movies')}>
                    Browse Movies
                  </Button>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl mb-2">No Movies Found</h2>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setFilterType('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            : "space-y-4"
          }>
            {filteredAndSortedMovies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="group relative"
              >
                <MovieCard
                  movie={movie}
                  onClick={() => handleMovieClick(movie.id)}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                  showRemoveFromWatchlist
                />
                
                {/* Action Buttons Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => handleRemoveFromWatchlist(movie.id, e)}
                    className="h-8 w-8 p-0 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={isInFavorites(movie.id) ? "default" : "secondary"}
                    size="sm"
                    onClick={(e) => handleToggleFavorites(movie.id, e)}
                    className="h-8 w-8 p-0 shadow-lg"
                  >
                    <Heart className={`w-4 h-4 ${isInFavorites(movie.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Rating Badge */}
                {getMovieRating(movie.id) && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-black/70 text-white border-0">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {getMovieRating(movie.id)}
                    </Badge>
                  </div>
                )}

                {/* Favorite Badge */}
                {isInFavorites(movie.id) && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-red-500 text-white border-0">
                      <Heart className="w-3 h-3 fill-current" />
                    </Badge>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {stats.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setFilterType('favorites')}>
                  <Heart className="w-4 h-4 mr-2" />
                  View Favorites ({stats.favorites})
                </Button>
                <Button variant="outline" onClick={() => setFilterType('rated')}>
                  <Star className="w-4 h-4 mr-2" />
                  View Rated ({stats.rated})
                </Button>
                <Button variant="outline" onClick={() => setSortBy('vote_average.desc')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Sort by Rating
                </Button>
                <Button variant="outline" onClick={() => navigate('/movies')}>
                  <Eye className="w-4 h-4 mr-2" />
                  Browse More Movies
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}