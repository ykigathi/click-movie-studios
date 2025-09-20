import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useMovies } from '../contexts/MovieContext'
import { useSettings } from '../contexts/SettingsContext'
import { MovieCard } from '../components/MovieCard'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel'
import { Film, TrendingUp, Calendar, Star, ChevronRight } from 'lucide-react'

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const { isConfigured } = useSettings()
  const {
    featuredMovies,
    featuredLoading,
    newestMovies,
    newestLoading,
    popularMovies,
    popularLoading,
    fetchFeaturedMovies,
    fetchNewestMovies,
    fetchPopularMovies
  } = useMovies()

  useEffect(() => {
    fetchFeaturedMovies()
    fetchNewestMovies()
    fetchPopularMovies(1)
  }, [])

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background/95 to-muted/30 py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-4"
              >
                <Film className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                MovieApp
              </h1>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Discover, explore, and track your favorite movies. Get personalized recommendations 
              and join a community of movie enthusiasts.
            </motion.p>
            
            {!isConfigured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Badge variant="secondary" className="mb-4">
                  Demo Mode - Using sample data
                </Badge>
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" onClick={() => navigate('/movies')} className="group">
                Explore Movies
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/search')}>
                Search Movies
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Featured Movies Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-primary" />
              <h2 className="text-2xl">Featured Movies</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate('/movies')}>
              View All
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : featuredMovies.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredMovies.map((movie) => (
                  <CarouselItem key={movie.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MovieCard
                        movie={movie}
                        onClick={() => handleMovieClick(movie.id)}
                        variant="featured"
                      />
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <p className="text-muted-foreground">No featured movies available</p>
              </CardContent>
            </Card>
          )}
        </motion.section>

        {/* Newest Movies Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-2xl">Latest Releases</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate('/movies')}>
              View All
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {newestLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : newestMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {newestMovies.slice(0, 5).map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                >
                  <MovieCard
                    movie={movie}
                    onClick={() => handleMovieClick(movie.id)}
                    variant="compact"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <p className="text-muted-foreground">No new movies available</p>
              </CardContent>
            </Card>
          )}
        </motion.section>

        {/* Popular Movies Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl">Trending Now</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate('/movies')}>
              View All
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {popularLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : popularMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {popularMovies.slice(0, 5).map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                >
                  <MovieCard
                    movie={movie}
                    onClick={() => handleMovieClick(movie.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <p className="text-muted-foreground">No popular movies available</p>
              </CardContent>
            </Card>
          )}
        </motion.section>

        {/* Quick Stats */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="text-center p-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-3xl text-primary">
                {popularMovies.length > 0 ? '1000+' : '6'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Movies Available</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-3xl text-primary">50+</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User Reviews</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-3xl text-primary">24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Always Updated</p>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}