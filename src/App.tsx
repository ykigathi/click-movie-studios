import React, { useState } from 'react'
import { SettingsProvider } from './contexts/SettingsContext'
import { UserProvider } from './contexts/UserContext'
import { MovieProvider } from './contexts/MovieContext'
import { Navigation } from './components/Navigation'
import { MovieList } from './components/MovieList'
import { MovieDetail } from './components/MovieDetail'
import { SearchMovies } from './components/SearchMovies'
import { Watchlist } from './components/Watchlist'
import { Settings } from './components/Settings'
import { Movie, AppView } from './types'
import { Toaster } from './components/ui/sonner'

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('movies')
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie)
    setCurrentView('detail')
  }

  const handleBackToMovies = () => {
    setSelectedMovie(null)
    setCurrentView('movies')
  }

  const handleTabChange = (tab: 'movies' | 'search' | 'watchlist' | 'settings') => {
    setCurrentView(tab)
    setSelectedMovie(null)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'movies':
        return <MovieList onMovieSelect={handleMovieSelect} />
      case 'search':
        return <SearchMovies onMovieSelect={handleMovieSelect} />
      case 'watchlist':
        return <Watchlist onMovieSelect={handleMovieSelect} />
      case 'settings':
        return <Settings onBack={() => setCurrentView('movies')} />
      case 'detail':
        return selectedMovie ? (
          <MovieDetail 
            movieId={selectedMovie.id} 
            onBack={handleBackToMovies} 
          />
        ) : (
          <MovieList onMovieSelect={handleMovieSelect} />
        )
      default:
        return <MovieList onMovieSelect={handleMovieSelect} />
    }
  }

  const getActiveTab = (): 'movies' | 'search' | 'watchlist' => {
    if (currentView === 'detail') return 'movies'
    if (currentView === 'settings') return 'movies'
    return currentView as 'movies' | 'search' | 'watchlist'
  }

  return (
    <SettingsProvider>
      <UserProvider>
        <MovieProvider>
          <div className="min-h-screen bg-background">
            <Navigation 
              activeTab={getActiveTab()}
              onTabChange={handleTabChange}
            />
            <main>
              {renderCurrentView()}
            </main>
            <Toaster />
          </div>
        </MovieProvider>
      </UserProvider>
    </SettingsProvider>
  )
}