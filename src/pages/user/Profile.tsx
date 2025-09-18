import React, { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { useUser } from '../../contexts/UserContext'
import { useMovies } from '../../contexts/MovieContext'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Switch } from '../../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { 
  User, 
  Settings, 
  Bell, 
  Heart, 
  MessageCircle, 
  Star, 
  Eye, 
  Upload,
  Check,
  X,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

export const Profile: React.FC = () => {
  const { 
    user, 
    userData,
    updateProfile, 
    uploadAvatar, 
    updatePreferences,
    getNotifications,
    markNotificationAsRead,
    clearAllNotifications
  } = useUser()
  const { genres } = useMovies()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    favoriteGenres: user?.profile?.favoriteGenres || []
  })

  const [preferencesForm, setPreferencesForm] = useState({
    theme: user?.preferences?.theme || 'system',
    language: user?.preferences?.language || 'en-US',
    includeAdult: user?.preferences?.includeAdult || false,
    notifications: {
      email: user?.preferences?.notifications?.email || true,
      push: user?.preferences?.notifications?.push || true,
      newMovies: user?.preferences?.notifications?.newMovies || true,
      replies: user?.preferences?.notifications?.replies || true
    }
  })

  const notifications = getNotifications()
  const unreadCount = notifications.filter(n => !n.read).length
  const stats = user?.profile?.socialStats || { totalLikes: 0, totalComments: 0, totalReviews: 0 }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      await uploadAvatar(file)
      toast.success('Avatar updated successfully')
    } catch (error) {
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        bio: profileForm.bio,
        favoriteGenres: profileForm.favoriteGenres,
        notifications: notifications,
        movieHistory: userData.viewHistory.map(movieId => ({
          movieId,
          action: 'viewed' as const,
          timestamp: new Date()
        })),
        socialStats: stats
      })
      
      // Update user name separately if it changed
      if (profileForm.name !== user?.name) {
        // This would typically update the user's basic info
        toast.success('Profile updated successfully')
      } else {
        toast.success('Profile updated successfully')
      }
      
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleSavePreferences = async () => {
    try {
      await updatePreferences(preferencesForm)
      toast.success('Preferences updated successfully')
    } catch (error) {
      toast.error('Failed to update preferences')
    }
  }

  const handleGenreToggle = (genreId: number) => {
    setProfileForm(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genreId)
        ? prev.favoriteGenres.filter(id => id !== genreId)
        : [...prev.favoriteGenres, genreId]
    }))
  }

  const handleNotificationAction = (notificationId: string, action: 'read' | 'delete') => {
    if (action === 'read') {
      markNotificationAsRead(notificationId)
      toast.success('Notification marked as read')
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-green-500" />
      case 'new_movie':
        return <Star className="w-4 h-4 text-yellow-500" />
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
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
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl">{user.name}</h1>
                      {user.role === 'admin' && (
                        <Badge variant="secondary">Admin</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {formatDate(user.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                    {isEditing && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setProfileForm({
                            name: user.name,
                            bio: user.profile?.bio || '',
                            favoriteGenres: user.profile?.favoriteGenres || []
                          })
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>
                ) : (
                  user.profile?.bio && (
                    <p className="text-muted-foreground">{user.profile.bio}</p>
                  )
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-red-500">{stats.totalLikes}</div>
                    <div className="text-sm text-muted-foreground">Likes Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-500">{stats.totalComments}</div>
                    <div className="text-sm text-muted-foreground">Comments Made</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-yellow-500">{stats.totalReviews}</div>
                    <div className="text-sm text-muted-foreground">Reviews Written</div>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 pt-6 border-t">
                <Button onClick={handleSaveProfile} className="w-full">
                  Save Profile Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 px-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.profile?.movieHistory && user.profile.movieHistory.length > 0 ? (
                    <div className="space-y-3">
                      {user.profile.movieHistory.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div>
                            <p className="text-sm font-medium">Movie ID: {item.movieId}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.action} • {formatDate(item.timestamp)}
                            </p>
                          </div>
                          <Badge variant="outline">{item.action}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Favorite Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Select your favorite movie genres:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {genres.map(genre => (
                          <Badge
                            key={genre.id}
                            variant={profileForm.favoriteGenres.includes(genre.id) ? 'default' : 'outline'}
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => handleGenreToggle(genre.id)}
                          >
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.profile?.favoriteGenres && user.profile.favoriteGenres.length > 0 ? (
                        user.profile.favoriteGenres.map(genreId => {
                          const genre = genres.find(g => g.id === genreId)
                          return genre ? (
                            <Badge key={genre.id} variant="secondary">
                              {genre.name}
                            </Badge>
                          ) : null
                        })
                      ) : (
                        <p className="text-muted-foreground">No favorite genres selected</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications ({notifications.length})
                  </CardTitle>
                  {notifications.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.read ? 'bg-muted/50' : 'bg-background border-primary/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{notification.title}</h4>
                              {!notification.read && (
                                <Badge variant="destructive" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNotificationAction(notification.id, 'read')}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Theme */}
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select 
                      value={preferencesForm.theme} 
                      onValueChange={(value) => setPreferencesForm(prev => ({ ...prev, theme: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={preferencesForm.language} 
                      onValueChange={(value) => setPreferencesForm(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Content Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Content Preferences</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include Adult Content</Label>
                      <p className="text-sm text-muted-foreground">
                        Show movies with adult content in search results
                      </p>
                    </div>
                    <Switch
                      checked={preferencesForm.includeAdult}
                      onCheckedChange={(checked) => 
                        setPreferencesForm(prev => ({ ...prev, includeAdult: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Notification Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={preferencesForm.notifications.email}
                        onCheckedChange={(checked) => 
                          setPreferencesForm(prev => ({ 
                            ...prev, 
                            notifications: { ...prev.notifications, email: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        checked={preferencesForm.notifications.push}
                        onCheckedChange={(checked) => 
                          setPreferencesForm(prev => ({ 
                            ...prev, 
                            notifications: { ...prev.notifications, push: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>New Movies</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when new movies are added
                        </p>
                      </div>
                      <Switch
                        checked={preferencesForm.notifications.newMovies}
                        onCheckedChange={(checked) => 
                          setPreferencesForm(prev => ({ 
                            ...prev, 
                            notifications: { ...prev.notifications, newMovies: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Replies & Mentions</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone replies to your comments
                        </p>
                      </div>
                      <Switch
                        checked={preferencesForm.notifications.replies}
                        onCheckedChange={(checked) => 
                          setPreferencesForm(prev => ({ 
                            ...prev, 
                            notifications: { ...prev.notifications, replies: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button onClick={handleSavePreferences} className="w-full">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-2xl text-red-500">
                    {stats.totalLikes}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">Total Likes Received</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-2xl text-blue-500">
                    {stats.totalComments}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">Comments Made</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-2xl text-yellow-500">
                    {stats.totalReviews}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">Reviews Written</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-xl font-semibold">{userData.watchlist.length}</div>
                      <div className="text-sm text-muted-foreground">Watchlist</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{userData.favorites.length}</div>
                      <div className="text-sm text-muted-foreground">Favorites</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{Object.keys(userData.ratings).length}</div>
                      <div className="text-sm text-muted-foreground">Rated Movies</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{userData.viewHistory.length}</div>
                      <div className="text-sm text-muted-foreground">Movies Watched</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}