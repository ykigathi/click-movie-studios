import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, UserData, UserContextType, UserProfile, UserPreferences, UserNotification } from '../types'
import { STORAGE_KEYS, DEMO_CREDENTIALS } from '../config/settings'

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

const DEFAULT_USER_DATA: UserData = {
  watchlist: [],
  favorites: [],
  ratings: {},
  viewHistory: [],
  reviews: {},
  comments: {},
  likes: {
    reviews: [],
    comments: []
  }
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData>(DEFAULT_USER_DATA)
  const [loading, setLoading] = useState(true)

  // Load user data from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
      const savedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA)
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as User
        setUser(parsedUser)
      }
      
      if (savedUserData) {
        const parsedUserData = JSON.parse(savedUserData) as UserData
        setUserData({ ...DEFAULT_USER_DATA, ...parsedUserData })
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        if (user) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
        } else {
          localStorage.removeItem(STORAGE_KEYS.USER)
          localStorage.removeItem(STORAGE_KEYS.USER_DATA)
        }
      } catch (error) {
        console.error('Failed to save user data to localStorage:', error)
      }
    }
  }, [user, userData, loading])

  const signIn = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check demo credentials first
    if (email === DEMO_CREDENTIALS.USER.email && password === DEMO_CREDENTIALS.USER.password) {
      const demoUser: User = {
        id: 'demo-user',
        email: DEMO_CREDENTIALS.USER.email,
        name: DEMO_CREDENTIALS.USER.name,
        role: 'user',
        createdAt: new Date('2023-06-20'),
        lastLoginAt: new Date(),
        preferences: {
          favoriteGenres: [18, 35, 80],
          language: 'en-US',
          includeAdult: false,
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            newMovies: true,
            replies: true
          }
        },
        profile: {
          bio: 'Movie enthusiast and critic',
          favoriteGenres: [18, 35, 80],
          notifications: [
            {
              id: '1',
              type: 'like',
              title: 'Someone liked your review',
              message: 'Your review of "The Shawshank Redemption" received a like from MovieBuff2023',
              movieId: 1,
              fromUserId: 'user2',
              fromUserName: 'MovieBuff2023',
              read: false,
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
              id: '2',
              type: 'comment',
              title: 'New comment on your review',
              message: 'CinemaLover commented on your review of "The Godfather"',
              movieId: 2,
              fromUserId: 'user3',
              fromUserName: 'CinemaLover',
              read: false,
              createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
            },
            {
              id: '3',
              type: 'reply',
              title: 'Reply to your comment',
              message: 'FilmCritic replied to your comment on "The Dark Knight"',
              movieId: 3,
              fromUserId: 'user4',
              fromUserName: 'FilmCritic',
              read: true,
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
              id: '4',
              type: 'new_movie',
              title: 'New movie added',
              message: 'A new movie "Dune: Part Two" has been added to the collection',
              movieId: 7,
              read: true,
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            }
          ],
          movieHistory: [],
          socialStats: {
            totalLikes: 128,
            totalComments: 89,
            totalReviews: 34
          }
        }
      }
      setUser(demoUser)
      return
    }

    if (email === DEMO_CREDENTIALS.ADMIN.email && password === DEMO_CREDENTIALS.ADMIN.password) {
      const adminUser: User = {
        id: 'demo-admin',
        email: DEMO_CREDENTIALS.ADMIN.email,
        name: DEMO_CREDENTIALS.ADMIN.name,
        role: 'admin',
        createdAt: new Date('2023-01-15'),
        lastLoginAt: new Date(),
        preferences: {
          favoriteGenres: [28, 12, 16],
          language: 'en-US',
          includeAdult: false,
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            newMovies: true,
            replies: true
          }
        },
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
      }
      setUser(adminUser)
      return
    }
    
    // Simple validation for other credentials
    if (!email || !password) {
      throw new Error('Email and password are required')
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      role: 'user',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {
        favoriteGenres: [],
        language: 'en-US',
        includeAdult: false,
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          newMovies: true,
          replies: true
        }
      },
      profile: {
        favoriteGenres: [],
        notifications: [],
        movieHistory: [],
        socialStats: {
          totalLikes: 0,
          totalComments: 0,
          totalReviews: 0
        }
      }
    }

    setUser(newUser)
  }

  const signUp = async (email: string, password: string, name: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    // Simple validation for demo
    if (!email || !password || !name) {
      throw new Error('All fields are required')
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: name.trim(),
      role: 'user',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {
        favoriteGenres: [],
        language: 'en-US',
        includeAdult: false,
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          newMovies: true,
          replies: true
        }
      },
      profile: {
        favoriteGenres: [],
        notifications: [],
        movieHistory: [],
        socialStats: {
          totalLikes: 0,
          totalComments: 0,
          totalReviews: 0
        }
      }
    }

    setUser(newUser)
  }

  const signOut = async () => {
    setUser(null)
    setUserData(DEFAULT_USER_DATA)
  }

  const addToWatchlist = (movieId: number) => {
    setUserData(prev => ({
      ...prev,
      watchlist: prev.watchlist.includes(movieId) 
        ? prev.watchlist 
        : [...prev.watchlist, movieId]
    }))
  }

  const removeFromWatchlist = (movieId: number) => {
    setUserData(prev => ({
      ...prev,
      watchlist: prev.watchlist.filter(id => id !== movieId)
    }))
  }

  const isInWatchlist = (movieId: number) => {
    return userData.watchlist.includes(movieId)
  }

  const addToFavorites = (movieId: number) => {
    setUserData(prev => ({
      ...prev,
      favorites: prev.favorites.includes(movieId) 
        ? prev.favorites 
        : [...prev.favorites, movieId]
    }))
  }

  const removeFromFavorites = (movieId: number) => {
    setUserData(prev => ({
      ...prev,
      favorites: prev.favorites.filter(id => id !== movieId)
    }))
  }

  const isInFavorites = (movieId: number) => {
    return userData.favorites.includes(movieId)
  }

  const rateMovie = (movieId: number, rating: number) => {
    setUserData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [movieId]: rating
      }
    }))
  }

  const getMovieRating = (movieId: number) => {
    return userData.ratings[movieId] || null
  }

  const addToViewHistory = (movieId: number, metadata?: any) => {
    setUserData(prev => {
      const newHistory = [movieId, ...prev.viewHistory.filter(id => id !== movieId)]
      return {
        ...prev,
        viewHistory: newHistory.slice(0, 50) // Keep only last 50 items
      }
    })
  }

  // Profile methods
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return

    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        ...updates
      }
    }
    setUser(updatedUser)
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    // Mock implementation - in real app this would upload to a service
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        if (user) {
          setUser({...user, avatar: dataUrl})
        }
        resolve(dataUrl)
      }
      reader.readAsDataURL(file)
    })
  }

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) return

    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    }
    setUser(updatedUser)
  }

  // Notification methods
  const getNotifications = (): UserNotification[] => {
    return user?.profile?.notifications || []
  }

  const markNotificationAsRead = (notificationId: string) => {
    if (!user || !user.profile) return

    const updatedNotifications = user.profile.notifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    )

    setUser({
      ...user,
      profile: {
        ...user.profile,
        notifications: updatedNotifications
      }
    })
  }

  const clearAllNotifications = () => {
    if (!user || !user.profile) return

    setUser({
      ...user,
      profile: {
        ...user.profile,
        notifications: []
      }
    })
  }

  const value: UserContextType = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    userData,
    signIn,
    signUp,
    signOut,
    updateProfile,
    uploadAvatar,
    updatePreferences,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    rateMovie,
    getMovieRating,
    addToViewHistory,
    getNotifications,
    markNotificationAsRead,
    clearAllNotifications
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}