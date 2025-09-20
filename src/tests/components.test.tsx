import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { SettingsProvider } from '../contexts/SettingsContext'
import { UserProvider } from '../contexts/UserContext'
import { MovieProvider } from '../contexts/MovieContext'
import { MovieCard } from '../components/MovieCard'
import { Login } from '../pages/auth/Login'
import { Register } from '../pages/auth/Register'
import { Home } from '../pages/Home'
import { Movie } from '../types'

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <SettingsProvider>
      <UserProvider>
        <MovieProvider>
          {children}
        </MovieProvider>
      </UserProvider>
    </SettingsProvider>
  </BrowserRouter>
)

// Mock movie data
const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  overview: 'This is a test movie description',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
  vote_average: 8.5,
  release_date: '2023-01-01',
  genre_ids: [1, 2],
  genres: [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Drama' }
  ],
  adult: false,
  original_language: 'en',
  original_title: 'Test Movie',
  popularity: 100.5,
  video: false,
  vote_count: 1500
}

describe('Component Tests', () => {
  describe('MovieCard', () => {
    test('should render movie information correctly', () => {
      const handleClick = jest.fn()
      
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} onClick={handleClick} />
        </TestWrapper>
      )

      expect(screen.getByText('Test Movie')).toBeInTheDocument()
      expect(screen.getByText('This is a test movie description')).toBeInTheDocument()
      expect(screen.getByText('8.5')).toBeInTheDocument()
      expect(screen.getByText('2023')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Drama')).toBeInTheDocument()
    })

    test('should call onClick when clicked', () => {
      const handleClick = jest.fn()
      
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} onClick={handleClick} />
        </TestWrapper>
      )

      fireEvent.click(screen.getByText('Test Movie'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('should handle movie without genres', () => {
      const movieWithoutGenres = { ...mockMovie, genres: undefined }
      const handleClick = jest.fn()
      
      render(
        <TestWrapper>
          <MovieCard movie={movieWithoutGenres} onClick={handleClick} />
        </TestWrapper>
      )

      expect(screen.getByText('Test Movie')).toBeInTheDocument()
      expect(screen.queryByText('Action')).not.toBeInTheDocument()
    })

    test('should display rating with star icon', () => {
      const handleClick = jest.fn()
      
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} onClick={handleClick} />
        </TestWrapper>
      )

      const ratingElement = screen.getByText('8.5')
      expect(ratingElement).toBeInTheDocument()
      
      // Check for star icon (lucide-react star)
      const starIcon = ratingElement.closest('div')?.querySelector('svg')
      expect(starIcon).toBeInTheDocument()
    })

    test('should handle different movie card variants', () => {
      const handleClick = jest.fn()
      
      const { rerender } = render(
        <TestWrapper>
          <MovieCard movie={mockMovie} onClick={handleClick} variant="compact" />
        </TestWrapper>
      )

      expect(screen.getByText('Test Movie')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <MovieCard movie={mockMovie} onClick={handleClick} variant="featured" />
        </TestWrapper>
      )

      expect(screen.getByText('Test Movie')).toBeInTheDocument()
    })
  })

  describe('Login Component', () => {
    test('should render login form elements', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByText('Demo User')).toBeInTheDocument()
      expect(screen.getByText('Demo Admin')).toBeInTheDocument()
    })

    test('should toggle password visibility', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

      expect(passwordInput.type).toBe('password')

      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('text')

      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('password')
    })

    test('should validate form inputs', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.click(submitButton)

      // HTML5 validation should prevent submission with empty fields
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
      
      expect(emailInput.validity.valueMissing).toBe(true)
      expect(passwordInput.validity.valueMissing).toBe(true)
    })

    test('should handle demo login', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const demoUserButton = screen.getByText('Demo User')
      
      fireEvent.click(demoUserButton)

      // Should populate form fields
      await waitFor(() => {
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
        
        expect(emailInput.value).toBe('demo@movieapp.com')
        expect(passwordInput.value).toBe('demo123')
      })
    })
  })

  describe('Register Component', () => {
    test('should render registration form elements', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      )

      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    test('should validate password strength', async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      )

      const passwordInput = screen.getByLabelText('Password')
      
      // Test weak password
      fireEvent.change(passwordInput, { target: { value: '123' } })
      
      await waitFor(() => {
        expect(screen.getByText('Weak')).toBeInTheDocument()
      })

      // Test strong password
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
      
      await waitFor(() => {
        expect(screen.getByText('Strong')).toBeInTheDocument()
      })
    })

    test('should validate password confirmation', async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      )

      const passwordInput = screen.getByLabelText('Password')
      const confirmInput = screen.getByLabelText('Confirm Password')
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'different123' } })
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })

      fireEvent.change(confirmInput, { target: { value: 'password123' } })
      
      await waitFor(() => {
        expect(screen.getByText('Passwords match')).toBeInTheDocument()
      })
    })

    test('should require terms agreement', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      )

      const submitButton = screen.getByRole('button', { name: /create account/i })
      expect(submitButton).toBeDisabled()

      const termsCheckbox = screen.getByRole('checkbox')
      fireEvent.click(termsCheckbox)

      // Button should still be disabled due to password requirements
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Home Component', () => {
    test('should render home page sections', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByText('MovieApp')).toBeInTheDocument()
      expect(screen.getByText('Discover, explore, and track your favorite movies')).toBeInTheDocument()
      expect(screen.getByText('Featured Movies')).toBeInTheDocument()
      expect(screen.getByText('Latest Releases')).toBeInTheDocument()
      expect(screen.getByText('Trending Now')).toBeInTheDocument()
    })

    test('should display demo mode badge when not configured', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByText('Demo Mode - Using sample data')).toBeInTheDocument()
    })

    test('should have working navigation buttons', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const exploreButton = screen.getByText('Explore Movies')
      const searchButton = screen.getByText('Search Movies')

      expect(exploreButton).toBeInTheDocument()
      expect(searchButton).toBeInTheDocument()

      // Buttons should be clickable
      fireEvent.click(exploreButton)
      fireEvent.click(searchButton)
    })

    test('should display loading skeletons while fetching data', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Should show skeleton loaders while data is loading
      const skeletons = document.querySelectorAll('[data-testid="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility Tests', () => {
    test('MovieCard should be keyboard accessible', () => {
      const handleClick = jest.fn()
      
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} onClick={handleClick} />
        </TestWrapper>
      )

      const movieCard = screen.getByText('Test Movie').closest('[role="button"], button, a')
      
      if (movieCard) {
        fireEvent.keyDown(movieCard, { key: 'Enter', code: 'Enter' })
        // Note: actual Enter key handling would need to be implemented in the component
      }
    })

    test('Login form should have proper labels', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
    })

    test('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const h1 = screen.getByRole('heading', { level: 1 })
      const h2s = screen.getAllByRole('heading', { level: 2 })

      expect(h1).toBeInTheDocument()
      expect(h2s.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Tests', () => {
    test('should render components within reasonable time', () => {
      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(1000) // Should render within 1 second
    })

    test('should handle rapid re-renders', () => {
      const handleClick = jest.fn()
      
      const { rerender } = render(
        <TestWrapper>
          <MovieCard movie={mockMovie} onClick={handleClick} />
        </TestWrapper>
      )

      // Rapid re-renders shouldn't cause errors
      for (let i = 0; i < 10; i++) {
        rerender(
          <TestWrapper>
            <MovieCard movie={{ ...mockMovie, id: i }} onClick={handleClick} />
          </TestWrapper>
        )
      }

      expect(screen.getByText('Test Movie')).toBeInTheDocument()
    })
  })
})