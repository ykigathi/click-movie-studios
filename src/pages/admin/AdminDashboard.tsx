import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useMovies } from '../../contexts/MovieContext'
import { useUser } from '../../contexts/UserContext'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { 
  Shield, 
  Users, 
  Film, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Activity,
  Plus,
  Settings,
  BarChart3,
  Calendar,
  Eye,
  Heart
} from 'lucide-react'
import { AdminStats } from '../../types'

// Mock data for charts
const mockActivityData = [
  { name: 'Mon', users: 65, movies: 5, reviews: 12 },
  { name: 'Tue', users: 59, movies: 3, reviews: 8 },
  { name: 'Wed', users: 80, movies: 7, reviews: 15 },
  { name: 'Thu', users: 81, movies: 4, reviews: 11 },
  { name: 'Fri', users: 95, movies: 6, reviews: 18 },
  { name: 'Sat', users: 120, movies: 8, reviews: 22 },
  { name: 'Sun', users: 110, movies: 5, reviews: 16 }
]

const mockGenreData = [
  { name: 'Action', count: 45 },
  { name: 'Drama', count: 38 },
  { name: 'Comedy', count: 32 },
  { name: 'Thriller', count: 28 },
  { name: 'Horror', count: 22 },
  { name: 'Romance', count: 20 }
]

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { adminGetStats, popularMovies, featuredMovies } = useMovies()
  const { user } = useUser()
  
  const [stats, setStats] = useState<AdminStats>({
    totalMovies: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalComments: 0,
    recentActivity: [],
    popularMovies: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const adminStats = await adminGetStats()
      setStats(adminStats)
    } catch (error) {
      console.error('Failed to load admin stats:', error)
      // Use mock data as fallback
      setStats({
        totalMovies: 1543,
        totalUsers: 2847,
        totalReviews: 956,
        totalComments: 1832,
        recentActivity: [
          {
            id: '1',
            type: 'user_registered',
            description: 'New user registered',
            timestamp: new Date(Date.now() - 1000 * 60 * 15)
          },
          {
            id: '2',
            type: 'movie_added',
            description: 'Movie "The Shawshank Redemption" was added',
            movieId: 278,
            timestamp: new Date(Date.now() - 1000 * 60 * 30)
          },
          {
            id: '3',
            type: 'review_reported',
            description: 'Review reported for inappropriate content',
            timestamp: new Date(Date.now() - 1000 * 60 * 45)
          }
        ],
        popularMovies: [
          { movieId: 278, views: 1234, title: 'The Shawshank Redemption' },
          { movieId: 238, views: 1089, title: 'The Godfather' },
          { movieId: 424, views: 987, title: 'Schindler\'s List' }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'movie_added':
        return <Film className="w-4 h-4 text-blue-500" />
      case 'movie_updated':
        return <Settings className="w-4 h-4 text-yellow-500" />
      case 'movie_deleted':
        return <Film className="w-4 h-4 text-red-500" />
      case 'user_registered':
        return <Users className="w-4 h-4 text-green-500" />
      case 'review_reported':
        return <MessageSquare className="w-4 h-4 text-orange-500" />
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
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
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}. Here's what's happening with your MovieApp.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin/movies')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Movie
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.totalMovies.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.totalReviews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{stats.totalComments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="movies" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="reviews" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Popular Genres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockGenreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Content Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  stats.recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Most Popular Movies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.popularMovies.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No data available</p>
                ) : (
                  stats.popularMovies.map((movie, index) => (
                    <div key={movie.movieId} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{movie.title}</p>
                          <p className="text-xs text-muted-foreground">ID: {movie.movieId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{movie.views.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Movies Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Featured Movies
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/movies')}>
                Manage Featured
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredMovies.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No featured movies</p>
                  <Button variant="outline" className="mt-2" onClick={() => navigate('/admin/movies')}>
                    Add Featured Movies
                  </Button>
                </div>
              ) : (
                featuredMovies.slice(0, 4).map(movie => (
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
                    </div>
                    <div>
                      <h3 className="text-sm font-medium truncate">{movie.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(movie.release_date).getFullYear()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => navigate('/admin/movies')} className="h-20 flex-col gap-2">
                <Film className="w-6 h-6" />
                Manage Movies
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/users')} className="h-20 flex-col gap-2">
                <Users className="w-6 h-6" />
                Manage Users
              </Button>
              <Button variant="outline" onClick={() => navigate('/settings')} className="h-20 flex-col gap-2">
                <Settings className="w-6 h-6" />
                System Settings
              </Button>
              <Button variant="outline" onClick={loadDashboardData} className="h-20 flex-col gap-2">
                <Activity className="w-6 h-6" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}