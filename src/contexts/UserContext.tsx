import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, UserData, UserContextType } from '../types'
import { STORAGE_KEYS } from '../config/settings'

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
  viewHistory: []
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
    
    // Simple validation for demo
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
      createdAt: new Date(),
      preferences: {
        favoriteGenres: [],
        language: 'en-US',
        includeAdult: false
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
      createdAt: new Date(),
      preferences: {
        favoriteGenres: [],
        language: 'en-US',
        includeAdult: false
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

  const addToViewHistory = (movieId: number) => {
    setUserData(prev => {
      const newHistory = [movieId, ...prev.viewHistory.filter(id => id !== movieId)]
      return {
        ...prev,
        viewHistory: newHistory.slice(0, 50) // Keep only last 50 items
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
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    rateMovie,
    getMovieRating,
    addToViewHistory
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}