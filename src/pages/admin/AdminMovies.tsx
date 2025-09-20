import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useMovies } from '../../contexts/MovieContext'
import { useUser } from '../../contexts/UserContext'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Switch } from '../../components/ui/switch'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { 
  Film, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Search, 
  Filter,
  Save,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  Calendar,
  Eye,
  Heart
} from 'lucide-react'
import { Movie, AdminMovieUpdate, Genre } from '../../types'
import { toast } from 'sonner@2.0.3'

export const AdminMovies: React.FC = () => {
  const { 
    popularMovies, 
    allMovies,
    featuredMovies,
    genres,
    categories,
    fetchPopularMovies,
    fetchAllMovies,
    fetchFeaturedMovies,
    fetchGenres,
    fetchCategories,
    adminAddMovie,
    adminUpdateMovie,
    adminDeleteMovie
  } = useMovies()
  const { user } = useUser()

  const [activeTab, setActiveTab] = useState('manage')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [addingMovie, setAddingMovie] = useState(false)
  const [loading, setLoading] = useState(false)

  const [movieForm, setMovieForm] = useState<Partial<Movie>>({
    title: '',
    overview: '',
    poster_path: '',
    backdrop_path: '',
    release_date: '',
    genres: [],
    runtime: 0,
    vote_average: 0,
    adult: false
  })

  const [adminNotes, setAdminNotes] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [movieCategory, setMovieCategory] = useState('none')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchPopularMovies(1),
        fetchAllMovies(1),
        fetchFeaturedMovies(),
        fetchGenres(),
        fetchCategories()
      ])
    } catch (error) {
      console.error('Failed to load admin data:', error)
      toast.error('Failed to load movie data')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setMovieForm({
      title: '',
      overview: '',
      poster_path: '',
      backdrop_path: '',
      release_date: '',
      genres: [],
      runtime: 0,
      vote_average: 0,
      adult: false
    })
    setAdminNotes('')
    setIsFeatured(false)
    setMovieCategory('none')
    setEditingMovie(null)
    setAddingMovie(false)
  }

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie)
    setMovieForm(movie)
    setIsFeatured(movie.admin_featured || false)
    setMovieCategory(movie.admin_category || 'none')
    setAdminNotes(movie.admin_notes || '')
  }

  const handleSaveMovie = async () => {
    if (!movieForm.title || !movieForm.overview) {
      toast.error('Title and overview are required')
      return
    }

    setLoading(true)
    try {
      const movieData = {
        ...movieForm,
        admin_featured: isFeatured,
        admin_category: movieCategory === 'none' ? undefined : movieCategory,
        admin_notes: adminNotes,
        admin_updated_at: new Date().toISOString()
      }

      if (editingMovie) {
        await adminUpdateMovie(editingMovie.id, movieData as AdminMovieUpdate)
        toast.success('Movie updated successfully')
      } else {
        await adminAddMovie(movieData as Partial<Movie>)
        toast.success('Movie added successfully')
      }

      resetForm()
      loadData()
    } catch (error) {
      toast.error(editingMovie ? 'Failed to update movie' : 'Failed to add movie')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMovie = async (movieId: number, movieTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${movieTitle}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      await adminDeleteMovie(movieId)
      toast.success('Movie deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete movie')
    } finally {
      setLoading(false)
    }
  }

  const handleGenreToggle = (genreId: number) => {
    const currentGenres = movieForm.genres || []
    const genreExists = currentGenres.find(g => g.id === genreId)
    
    if (genreExists) {
      setMovieForm(prev => ({
        ...prev,
        genres: currentGenres.filter(g => g.id !== genreId)
      }))
    } else {
      const genre = genres.find(g => g.id === genreId)
      if (genre) {
        setMovieForm(prev => ({
          ...prev,
          genres: [...currentGenres, genre]
        }))
      }
    }
  }

  const filteredMovies = allMovies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movie.overview.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           movie.admin_category === selectedCategory ||
                           (selectedCategory === 'featured' && movie.admin_featured)
    
    return matchesSearch && matchesCategory
  })

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to manage movies.</p>
        </div>
      </div>
    )
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
              <Film className="w-8 h-8 text-primary" />
              Movie Management
            </h1>
            <p className="text-muted-foreground">
              Add, edit, and manage movies in your collection
            </p>
          </div>
          
          <Button onClick={() => setAddingMovie(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Movie
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-500">{allMovies.length}</div>
              <p className="text-sm text-muted-foreground">Total Movies</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-500">{featuredMovies.length}</div>
              <p className="text-sm text-muted-foreground">Featured Movies</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-500">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-purple-500">{genres.length}</div>
              <p className="text-sm text-muted-foreground">Genres</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manage">Manage Movies</TabsTrigger>
            <TabsTrigger value="featured">Featured Movies</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Manage Movies Tab */}
          <TabsContent value="manage" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search movies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Movies</SelectItem>
                      <SelectItem value="featured">Featured Only</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredMovies.length} of {allMovies.length} movies
                </div>
              </CardContent>
            </Card>

            {/* Movies List */}
            <Card>
              <CardHeader>
                <CardTitle>Movies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMovies.length === 0 ? (
                    <div className="text-center py-8">
                      <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No movies found</p>
                    </div>
                  ) : (
                    filteredMovies.map(movie => (
                      <div key={movie.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <img
                          src={movie.poster_path 
                            ? `https://image.tmdb.org/t/p/w154${movie.poster_path}`
                            : '/placeholder-movie.jpg'
                          }
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {movie.title}
                                {movie.admin_featured && (
                                  <Badge className="bg-yellow-500 text-white">
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    Featured
                                  </Badge>
                                )}
                                {movie.admin_category && (
                                  <Badge variant="secondary">
                                    {movie.admin_category}
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(movie.release_date).getFullYear()} • 
                                {movie.runtime ? ` ${movie.runtime}min • ` : ' '}
                                ⭐ {movie.vote_average.toFixed(1)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditMovie(movie)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteMovie(movie.id, movie.title)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {movie.overview}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {movie.genres?.slice(0, 3).map(genre => (
                              <Badge key={genre.id} variant="outline" className="text-xs">
                                {genre.name}
                              </Badge>
                            ))}
                          </div>
                          {movie.admin_notes && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Admin Notes:</strong> {movie.admin_notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Featured Movies Tab */}
          <TabsContent value="featured" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Featured Movies ({featuredMovies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featuredMovies.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No featured movies</p>
                      <p className="text-sm text-muted-foreground">
                        Edit movies and mark them as featured to display them here
                      </p>
                    </div>
                  ) : (
                    featuredMovies.map(movie => (
                      <div key={movie.id} className="space-y-2">
                        <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-muted">
                          <img
                            src={movie.poster_path 
                              ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                              : '/placeholder-movie.jpg'
                            }
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-yellow-500 text-white">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Featured
                            </Badge>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1"
                              onClick={() => handleEditMovie(movie)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium truncate">{movie.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(movie.release_date).getFullYear()} • ⭐ {movie.vote_average.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Movie Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.length === 0 ? (
                      <p className="text-muted-foreground">No categories defined</p>
                    ) : (
                      categories.map(category => (
                        <div key={category} className="flex items-center justify-between p-2 border rounded">
                          <span>{category}</span>
                          <Badge variant="outline">
                            {allMovies.filter(m => m.admin_category === category).length} movies
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Movie Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {genres.map(genre => (
                      <div key={genre.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{genre.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {allMovies.filter(m => m.genres?.some(g => g.id === genre.id)).length}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Movie Dialog */}
        <Dialog open={addingMovie || editingMovie !== null} onOpenChange={(open) => {
          if (!open) resetForm()
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMovie ? 'Edit Movie' : 'Add New Movie'}
              </DialogTitle>
              <DialogDescription>
                {editingMovie 
                  ? 'Update movie information and settings. All changes will be saved immediately.'
                  : 'Add a new movie to your collection. Fill in the required fields and configure display settings.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={movieForm.title || ''}
                    onChange={(e) => setMovieForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Movie title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release_date">Release Date</Label>
                  <Input
                    id="release_date"
                    type="date"
                    value={movieForm.release_date || ''}
                    onChange={(e) => setMovieForm(prev => ({ ...prev, release_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview">Overview *</Label>
                <Textarea
                  id="overview"
                  value={movieForm.overview || ''}
                  onChange={(e) => setMovieForm(prev => ({ ...prev, overview: e.target.value }))}
                  placeholder="Movie description"
                  className="min-h-[100px]"
                />
              </div>

              {/* Image URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poster_path">Poster URL</Label>
                  <Input
                    id="poster_path"
                    value={movieForm.poster_path || ''}
                    onChange={(e) => setMovieForm(prev => ({ ...prev, poster_path: e.target.value }))}
                    placeholder="/path/to/poster.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backdrop_path">Backdrop URL</Label>
                  <Input
                    id="backdrop_path"
                    value={movieForm.backdrop_path || ''}
                    onChange={(e) => setMovieForm(prev => ({ ...prev, backdrop_path: e.target.value }))}
                    placeholder="/path/to/backdrop.jpg"
                  />
                </div>
              </div>

              {/* Movie Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="runtime">Runtime (minutes)</Label>
                  <Input
                    id="runtime"
                    type="number"
                    value={movieForm.runtime || ''}
                    onChange={(e) => setMovieForm(prev => ({ ...prev, runtime: parseInt(e.target.value) || 0 }))}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vote_average">Rating (0-10)</Label>
                  <Input
                    id="vote_average"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={movieForm.vote_average || ''}
                    onChange={(e) => setMovieForm(prev => ({ ...prev, vote_average: parseFloat(e.target.value) || 0 }))}
                    placeholder="7.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adult Content</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={movieForm.adult || false}
                      onCheckedChange={(checked) => setMovieForm(prev => ({ ...prev, adult: checked }))}
                    />
                    <span className="text-sm">{movieForm.adult ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-2">
                <Label>Genres</Label>
                <div className="flex flex-wrap gap-2">
                  {genres.map(genre => (
                    <Badge
                      key={genre.id}
                      variant={movieForm.genres?.some(g => g.id === genre.id) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => handleGenreToggle(genre.id)}
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Admin Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Admin Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Featured Movie</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isFeatured}
                        onCheckedChange={setIsFeatured}
                      />
                      <span className="text-sm">Display in featured section</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={movieCategory} onValueChange={setMovieCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_notes">Admin Notes</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes about this movie"
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMovie} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingMovie ? 'Update Movie' : 'Add Movie'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}