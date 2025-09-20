import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useUser } from '../../contexts/UserContext'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Shield, 
  User, 
  Mail, 
  Calendar,
  Activity,
  Settings,
  Ban,
  CheckCircle,
  AlertCircle,
  Crown,
  Heart,
  Star,
  MessageCircle,
  Eye
} from 'lucide-react'
import { User as UserType } from '../../types'
import { toast } from 'sonner@2.0.3'

// Mock user data for demonstration
const mockUsers: UserType[] = [
  {
    id: '1',
    email: 'admin@movieapp.com',
    name: 'Admin User',
    role: 'admin',
    avatar: null,
    createdAt: new Date('2023-01-15'),
    lastLoginAt: new Date('2024-01-15'),
    profile: {
      bio: 'System administrator',
      favoriteGenres: [28, 12, 16],
      notifications: [],
      movieHistory: [],
      socialStats: {
        totalLikes: 45,
        totalComments: 23,
        totalReviews: 12
      }
    }
  },
  {
    id: '2',
    email: 'demo@movieapp.com',
    name: 'Demo User',
    role: 'user',
    avatar: null,
    createdAt: new Date('2023-06-20'),
    lastLoginAt: new Date('2024-01-14'),
    profile: {
      bio: 'Movie enthusiast and critic',
      favoriteGenres: [18, 35, 80],
      notifications: [],
      movieHistory: [],
      socialStats: {
        totalLikes: 128,
        totalComments: 89,
        totalReviews: 34
      }
    }
  },
  {
    id: '3',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'user',
    avatar: null,
    createdAt: new Date('2023-09-10'),
    lastLoginAt: new Date('2024-01-13'),
    profile: {
      bio: 'Love action and sci-fi movies',
      favoriteGenres: [28, 878, 53],
      notifications: [],
      movieHistory: [],
      socialStats: {
        totalLikes: 67,
        totalComments: 45,
        totalReviews: 18
      }
    }
  },
  {
    id: '4',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'user',
    avatar: null,
    createdAt: new Date('2023-11-25'),
    lastLoginAt: new Date('2024-01-12'),
    profile: {
      bio: 'Romance and drama are my favorites',
      favoriteGenres: [10749, 18, 10402],
      notifications: [],
      movieHistory: [],
      socialStats: {
        totalLikes: 92,
        totalComments: 76,
        totalReviews: 28
      }
    }
  }
]

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useUser()
  
  const [users, setUsers] = useState<UserType[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast.error('You cannot delete your own account')
      return
    }

    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUsers(prev => prev.filter(u => u.id !== userId))
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    if (userId === currentUser?.id && newRole === 'user') {
      toast.error('You cannot remove your own admin privileges')
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ))
      
      toast.success(`User role updated to ${newRole}`)
    } catch (error) {
      toast.error('Failed to update user role')
    } finally {
      setLoading(false)
    }
  }

  const getUserStatusColor = (user: UserType) => {
    if (!user.lastLoginAt) return 'text-gray-500'
    
    const daysSinceLogin = Math.floor((Date.now() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLogin === 0) return 'text-green-500'
    if (daysSinceLogin <= 7) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getUserStatusText = (user: UserType) => {
    if (!user.lastLoginAt) return 'Never logged in'
    
    const daysSinceLogin = Math.floor((Date.now() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLogin === 0) return 'Active today'
    if (daysSinceLogin === 1) return 'Active yesterday'
    if (daysSinceLogin <= 7) return `Active ${daysSinceLogin} days ago`
    return `Inactive for ${daysSinceLogin} days`
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to manage users.</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    activeToday: users.filter(u => {
      if (!u.lastLoginAt) return false
      const daysSinceLogin = Math.floor((Date.now() - u.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceLogin === 0
    }).length,
    newThisWeek: users.filter(u => {
      const daysSinceJoined = Math.floor((Date.now() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceJoined <= 7
    }).length
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
              <Users className="w-8 h-8 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-purple-500">{stats.admins}</div>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-500">{stats.activeToday}</div>
              <p className="text-sm text-muted-foreground">Active Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.newThisWeek}</div>
              <p className="text-sm text-muted-foreground">New This Week</p>
            </CardContent>
          </Card>
        </div>

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
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={(value: 'all' | 'admin' | 'user') => setRoleFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="user">Regular Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        {user.role === 'admin' && (
                          <Badge className="bg-purple-500 text-white">
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {user.id === currentUser.id && (
                          <Badge variant="outline">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {formatDate(user.createdAt)}
                        </span>
                        <span className={`flex items-center gap-1 ${getUserStatusColor(user)}`}>
                          <Activity className="w-3 h-3" />
                          {getUserStatusText(user)}
                        </span>
                      </div>
                    </div>

                    {/* User Stats */}
                    <div className="hidden md:flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-red-500">
                          <Heart className="w-3 h-3" />
                          {user.profile?.socialStats?.totalLikes || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-blue-500">
                          <MessageCircle className="w-3 h-3" />
                          {user.profile?.socialStats?.totalComments || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Comments</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-3 h-3" />
                          {user.profile?.socialStats?.totalReviews || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Reviews</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {user.id !== currentUser.id && (
                        <>
                          <Select
                            value={user.role}
                            onValueChange={(value: 'admin' | 'user') => handleRoleChange(user.id, value)}
                          >
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={selectedUser !== null} onOpenChange={(open) => {
          if (!open) setSelectedUser(null)
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View detailed user information, activity statistics, and manage account settings.
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedUser.avatar || undefined} />
                    <AvatarFallback className="text-lg">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                      {selectedUser.role === 'admin' && (
                        <Badge className="bg-purple-500 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Joined {formatDate(selectedUser.createdAt)}</span>
                      <span className={getUserStatusColor(selectedUser)}>
                        {getUserStatusText(selectedUser)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedUser.profile?.bio && (
                  <div>
                    <Label className="text-base">Bio</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedUser.profile.bio}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div>
                  <Label className="text-base">Activity Stats</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-red-500">
                        {selectedUser.profile?.socialStats?.totalLikes || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Likes Received</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-blue-500">
                        {selectedUser.profile?.socialStats?.totalComments || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Comments Made</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-yellow-500">
                        {selectedUser.profile?.socialStats?.totalReviews || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Reviews Written</div>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                {selectedUser.id !== currentUser.id && (
                  <div>
                    <Label className="text-base">Account Actions</Label>
                    <div className="flex gap-2 mt-2">
                      <Select
                        value={selectedUser.role}
                        onValueChange={(value: 'admin' | 'user') => {
                          handleRoleChange(selectedUser.id, value)
                          setSelectedUser(prev => prev ? { ...prev, role: value } : null)
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleDeleteUser(selectedUser.id, selectedUser.name)
                          setSelectedUser(null)
                        }}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}