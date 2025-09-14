import { Hono } from "hono"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
// import { createClient } from "npm:@supabase/supabase-js@2.39.3"
import { createClient } from '@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS middleware
app.use('*', cors({
  origin: ['*'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.use('*', logger(console.log))

// Mock movie data for demonstration
const MOCK_POPULAR_MOVIES = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    overview: "Two imprisoned mates bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdrop_path: "/9cqNxx0GxF0bflNmkEBl9hlnxoB.jpg",
    vote_average: 9.3,
    release_date: "1994-09-23",
    genre_ids: [18, 80],
    genres: [{ id: 18, name: "Drama" }, { id: 80, name: "Crime" }]
  },
  {
    id: 2,
    title: "The Godfather",
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    vote_average: 9.2,
    release_date: "1972-03-14",
    genre_ids: [18, 80],
    genres: [{ id: 18, name: "Drama" }, { id: 80, name: "Crime" }]
  },
  {
    id: 3,
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
    vote_average: 9.0,
    release_date: "2008-07-16",
    genre_ids: [28, 80, 18],
    genres: [{ id: 28, name: "Action" }, { id: 80, name: "Crime" }, { id: 18, name: "Drama" }]
  },
  {
    id: 4,
    title: "Pulp Fiction",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop_path: "/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
    vote_average: 8.9,
    release_date: "1994-09-10",
    genre_ids: [80, 18],
    genres: [{ id: 80, name: "Crime" }, { id: 18, name: "Drama" }]
  },
  {
    id: 5,
    title: "Forrest Gump",
    overview: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate and other historical events unfold from the perspective of an Alabama man.",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop_path: "/7c9UiPHNbNGzRPNLKwk7LrKAzR.jpg",
    vote_average: 8.8,
    release_date: "1994-06-23",
    genre_ids: [35, 18, 10749],
    genres: [{ id: 35, name: "Comedy" }, { id: 18, name: "Drama" }, { id: 10749, name: "Romance" }]
  },
  {
    id: 6,
    title: "Inception",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    vote_average: 8.7,
    release_date: "2010-07-15",
    genre_ids: [28, 878, 53],
    genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }, { id: 53, name: "Thriller" }]
  }
]

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
  // Deno.env.get('SUPABASE_URL')!,
  // Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Get popular movies
app.get('/make-server-3c992561/movies/popular', async (c) => {
  try {
    const page = c.req.query('page') || '1'
    const pageNum = parseInt(page)
    const perPage = 6
    const startIndex = (pageNum - 1) * perPage
    const endIndex = startIndex + perPage
    
    const movies = MOCK_POPULAR_MOVIES.slice(startIndex, endIndex)
    
    return c.json({
      page: pageNum,
      results: movies,
      total_pages: Math.ceil(MOCK_POPULAR_MOVIES.length / perPage),
      total_results: MOCK_POPULAR_MOVIES.length
    })
  } catch (error) {
    console.log('Error fetching popular movies:', error)
    return c.json({ error: 'Failed to fetch popular movies' }, 500)
  }
})

// Get movie details
app.get('/make-server-3c992561/movies/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const movie = MOCK_POPULAR_MOVIES.find(m => m.id === id)
    
    if (!movie) {
      return c.json({ error: 'Movie not found' }, 404)
    }
    
    // Add additional details for the detail view
    const detailedMovie = {
      ...movie,
      runtime: 142,
      budget: 25000000,
      revenue: 173000000,
      cast: [
        { id: 1, name: "Morgan Freeman", character: "Ellis Boyd 'Red' Redding" },
        { id: 2, name: "Tim Robbins", character: "Andy Dufresne" },
        { id: 3, name: "Bob Gunton", character: "Warden Samuel Norton" }
      ],
      crew: [
        { id: 1, name: "Frank Darabont", job: "Director" },
        { id: 2, name: "Frank Darabont", job: "Screenplay" },
        { id: 3, name: "Stephen King", job: "Novel" }
      ]
    }
    
    return c.json(detailedMovie)
  } catch (error) {
    console.log('Error fetching movie details:', error)
    return c.json({ error: 'Failed to fetch movie details' }, 500)
  }
})

// Search movies
app.get('/make-server-3c992561/search/movie', async (c) => {
  try {
    const query = c.req.query('query')?.toLowerCase() || ''
    const page = c.req.query('page') || '1'
    
    if (!query) {
      return c.json({
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      })
    }
    
    const filteredMovies = MOCK_POPULAR_MOVIES.filter(movie => 
      movie.title.toLowerCase().includes(query) || 
      movie.overview.toLowerCase().includes(query)
    )
    
    return c.json({
      page: parseInt(page),
      results: filteredMovies,
      total_pages: 1,
      total_results: filteredMovies.length
    })
  } catch (error) {
    console.log('Error searching movies:', error)
    return c.json({ error: 'Failed to search movies' }, 500)
  }
})

// User signup
app.post('/make-server-3c992561/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })
    
    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: 'Failed to create user account' }, 400)
    }
    
    return c.json({ user: data.user })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Failed to process signup request' }, 500)
  }
})

// Get user watchlist
app.get('/make-server-3c992561/user/watchlist', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const watchlist = await kv.get(`watchlist:${user.id}`) || []
    return c.json({ watchlist })
  } catch (error) {
    console.log('Error fetching watchlist:', error)
    return c.json({ error: 'Failed to fetch watchlist' }, 500)
  }
})

// Add to watchlist
app.post('/make-server-3c992561/user/watchlist', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { movieId } = await c.req.json()
    const watchlist = await kv.get(`watchlist:${user.id}`) || []
    
    if (!watchlist.includes(movieId)) {
      watchlist.push(movieId)
      await kv.set(`watchlist:${user.id}`, watchlist)
    }
    
    return c.json({ success: true, watchlist })
  } catch (error) {
    console.log('Error adding to watchlist:', error)
    return c.json({ error: 'Failed to add to watchlist' }, 500)
  }
})

// Remove from watchlist
app.delete('/make-server-3c992561/user/watchlist/:movieId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const movieId = parseInt(c.req.param('movieId'))
    const watchlist = await kv.get(`watchlist:${user.id}`) || []
    const updatedWatchlist = watchlist.filter((id: number) => id !== movieId)
    
    await kv.set(`watchlist:${user.id}`, updatedWatchlist)
    
    return c.json({ success: true, watchlist: updatedWatchlist })
  } catch (error) {
    console.log('Error removing from watchlist:', error)
    return c.json({ error: 'Failed to remove from watchlist' }, 500)
  }
})

Deno.serve(app.fetch)