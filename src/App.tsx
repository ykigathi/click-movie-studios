import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SettingsProvider } from './contexts/SettingsContext'
import { UserProvider } from './contexts/UserContext'
import { MovieProvider } from './contexts/MovieContext'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Movies } from './pages/Movies'
import { Search } from './pages/Search'
import { MovieDetailPage } from './pages/MovieDetailPage'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { Profile } from './pages/user/Profile'
import { Watchlist } from './pages/user/Watchlist'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminMovies } from './pages/admin/AdminMovies'
import { AdminUsers } from './pages/admin/AdminUsers'
import { Settings } from './pages/Settings'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { Toaster } from './components/ui/sonner'
import { themeManager } from './utils/theme'

export default function App() {
  useEffect(() => {
    // Initialize theme on app start - themeManager is already an instance
    // No need to call getInstance() since it's already initialized in the module
  }, [])

  return (
    <SettingsProvider>
      <UserProvider>
        <MovieProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="movies" element={<Movies />} />
                  <Route path="search" element={<Search />} />
                  <Route path="movie/:id" element={<MovieDetailPage />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User Routes */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="profile" element={<Profile />} />
                  <Route path="watchlist" element={<Watchlist />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="movies" element={<AdminMovies />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>

                {/* Catch all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </MovieProvider>
      </UserProvider>
    </SettingsProvider>
  )
}