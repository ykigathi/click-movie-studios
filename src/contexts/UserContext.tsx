// UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, UserData, UserContextType, UserProfile, UserPreferences, UserNotification } from '../types'
import { STORAGE_KEYS, DEMO_CREDENTIALS } from '../config/settings'
import { supabase } from '../utils/supabase/client'

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

// Helper function to convert Supabase user to our User type
const mapSupabaseUserToUser = (supabaseUser: any, userData?: UserData): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    role: supabaseUser.user_metadata?.role || 'user',
    avatar: supabaseUser.user_metadata?.avatar,
    createdAt: new Date(supabaseUser.created_at),
    lastLoginAt: new Date(),
    preferences: {
      favoriteGenres: supabaseUser.user_metadata?.preferences?.favoriteGenres || [],
      language: supabaseUser.user_metadata?.preferences?.language || 'en-US',
      includeAdult: supabaseUser.user_metadata?.preferences?.includeAdult || false,
      theme: supabaseUser.user_metadata?.preferences?.theme || 'system',
      notifications: {
        email: supabaseUser.user_metadata?.preferences?.notifications?.email || true,
        push: supabaseUser.user_metadata?.preferences?.notifications?.push || true,
        newMovies: supabaseUser.user_metadata?.preferences?.notifications?.newMovies || true,
        replies: supabaseUser.user_metadata?.preferences?.notifications?.replies || true
      }
    },
    profile: {
      bio: supabaseUser.user_metadata?.profile?.bio || '',
      favoriteGenres: supabaseUser.user_metadata?.profile?.favoriteGenres || [],
      notifications: supabaseUser.user_metadata?.profile?.notifications || [],
      movieHistory: supabaseUser.user_metadata?.profile?.movieHistory || [],
      socialStats: {
        totalLikes: supabaseUser.user_metadata?.profile?.socialStats?.totalLikes || 0,
        totalComments: supabaseUser.user_metadata?.profile?.socialStats?.totalComments || 0,
        totalReviews: supabaseUser.user_metadata?.profile?.socialStats?.totalReviews || 0
      }
    }
  }
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData>(DEFAULT_USER_DATA)
  const [loading, setLoading] = useState(true)
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null)

  // Load user data from localStorage and Supabase session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, try to get the current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        if (session?.user) {
          setSupabaseSession(session)
          const mappedUser = mapSupabaseUserToUser(session.user)
          setUser(mappedUser)
          
          // Load user data from localStorage
          const savedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA)
          if (savedUserData) {
            const parsedUserData = JSON.parse(savedUserData) as UserData
            setUserData({ ...DEFAULT_USER_DATA, ...parsedUserData })
          }
        } else {
          // Fallback to localStorage for demo users
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
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setSupabaseSession(session)
        const mappedUser = mapSupabaseUserToUser(session.user)
        setUser(mappedUser)
        
        // Load user data for this user
        const userSpecificData = localStorage.getItem(`${STORAGE_KEYS.USER_DATA}_${session.user.id}`)
        if (userSpecificData) {
          const parsedUserData = JSON.parse(userSpecificData) as UserData
          setUserData({ ...DEFAULT_USER_DATA, ...parsedUserData })
        }
      } else if (event === 'SIGNED_OUT') {
        setSupabaseSession(null)
        setUser(null)
        setUserData(DEFAULT_USER_DATA)
      } else if (event === 'USER_UPDATED' && session?.user) {
        const mappedUser = mapSupabaseUserToUser(session.user)
        setUser(mappedUser)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (!loading && user) {
      try {
        const storageKey = supabaseSession?.user?.id 
          ? `${STORAGE_KEYS.USER_DATA}_${supabaseSession.user.id}`
          : STORAGE_KEYS.USER_DATA
        
        localStorage.setItem(storageKey, JSON.stringify(userData))
        
        // Also save user info for demo users
        if (!supabaseSession) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        }
      } catch (error) {
        console.error('Failed to save user data to localStorage:', error)
      }
    }
  }, [user, userData, loading, supabaseSession])

  const signIn = async (email: string, password: string) => {
    // Check demo credentials first (they still work without Supabase)
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
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
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

    // For non-demo users, use Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Authentication failed')
    }

    const mappedUser = mapSupabaseUserToUser(data.user)
    setUser(mappedUser)
    setSupabaseSession(data.session)
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name?.trim() || email.split('@')[0],
          role: 'user',
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
            bio: '',
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
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Registration failed')
    }

    const mappedUser = mapSupabaseUserToUser(data.user)
    setUser(mappedUser)
    setSupabaseSession(data.session)
  }

  const signOut = async () => {
    if (supabaseSession) {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
    }
    
    setUser(null)
    setUserData(DEFAULT_USER_DATA)
    setSupabaseSession(null)
  }

  // Update user profile in Supabase
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !supabaseSession) return

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          profile: {
            ...user.profile,
            ...updates
          }
        }
      })

      if (error) throw error

      // Update local state
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...updates
        }
      }
      setUser(updatedUser)

    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user || !supabaseSession) {
      throw new Error('User not authenticated')
    }

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user metadata with avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar: publicUrl }
      })

      if (updateError) throw updateError

      // Update local state
      setUser({ ...user, avatar: publicUrl })
      return publicUrl

    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user || !supabaseSession) return

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          preferences: {
            ...user.preferences,
            ...preferences
          }
        }
      })

      if (error) throw error

      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          ...preferences
        }
      }
      setUser(updatedUser)

    } catch (error) {
      console.error('Error updating preferences:', error)
      throw error
    }
  }

  // All the existing user data methods remain the same
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
        viewHistory: newHistory.slice(0, 50)
      }
    })
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