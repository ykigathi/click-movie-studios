import { StorageAdapter } from '../types'

// Local Storage Adapter
export class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error getting item from localStorage:`, error)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item in localStorage:`, error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from localStorage:`, error)
      throw error
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear()
    } catch (error) {
      console.error(`Error clearing localStorage:`, error)
      throw error
    }
  }
}

// CSV Storage Adapter for user preferences
export class CSVStorageAdapter {
  private storageKey = 'movieapp_csv_data'

  async saveUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const existingData = await this.getAllData()
      const csvRow = this.objectToCSV(userId, preferences)
      
      // Update or add new row
      const existingIndex = existingData.findIndex(row => row.startsWith(userId))
      if (existingIndex >= 0) {
        existingData[existingIndex] = csvRow
      } else {
        existingData.push(csvRow)
      }
      
      const csvContent = existingData.join('\n')
      localStorage.setItem(this.storageKey, csvContent)
    } catch (error) {
      console.error('Error saving user preferences to CSV:', error)
      throw error
    }
  }

  async getUserPreferences(userId: string): Promise<any | null> {
    try {
      const allData = await this.getAllData()
      const userRow = allData.find(row => row.startsWith(userId))
      
      if (!userRow) return null
      
      return this.csvToObject(userRow)
    } catch (error) {
      console.error('Error getting user preferences from CSV:', error)
      return null
    }
  }

  private async getAllData(): Promise<string[]> {
    const csvContent = localStorage.getItem(this.storageKey) || ''
    return csvContent.split('\n').filter(row => row.trim() !== '')
  }

  private objectToCSV(userId: string, preferences: any): string {
    const values = [
      userId,
      JSON.stringify(preferences.favoriteGenres || []),
      preferences.language || 'en-US',
      preferences.includeAdult ? '1' : '0',
      preferences.theme || 'system',
      new Date().toISOString()
    ]
    return values.join(',')
  }

  private csvToObject(csvRow: string): any {
    const [userId, favoriteGenres, language, includeAdult, theme, updatedAt] = csvRow.split(',')
    
    return {
      userId,
      favoriteGenres: JSON.parse(favoriteGenres || '[]'),
      language,
      includeAdult: includeAdult === '1',
      theme,
      updatedAt: new Date(updatedAt)
    }
  }
}

// Simple SQLite-like interface using IndexedDB
export class IndexedDBAdapter implements StorageAdapter {
  private dbName = 'MovieAppDB'
  private version = 1
  private db: IDBDatabase | null = null

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('movies')) {
          db.createObjectStore('movies', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('reviews')) {
          db.createObjectStore('reviews', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
      }
    })
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.initDB()
      const transaction = db.transaction(['settings'], 'readonly')
      const store = transaction.objectStore('settings')
      
      return new Promise((resolve, reject) => {
        const request = store.get(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result || null)
      })
    } catch (error) {
      console.error('Error getting item from IndexedDB:', error)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.initDB()
      const transaction = db.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')
      
      return new Promise((resolve, reject) => {
        const request = store.put(value, key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.error('Error setting item in IndexedDB:', error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.initDB()
      const transaction = db.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')
      
      return new Promise((resolve, reject) => {
        const request = store.delete(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.error('Error removing item from IndexedDB:', error)
      throw error
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.initDB()
      const transaction = db.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')
      
      return new Promise((resolve, reject) => {
        const request = store.clear()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.error('Error clearing IndexedDB:', error)
      throw error
    }
  }

  // Movie-specific methods
  async saveMovie(movie: any): Promise<void> {
    const db = await this.initDB()
    const transaction = db.transaction(['movies'], 'readwrite')
    const store = transaction.objectStore('movies')
    
    return new Promise((resolve, reject) => {
      const request = store.put(movie)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getMovie(id: number): Promise<any | null> {
    const db = await this.initDB()
    const transaction = db.transaction(['movies'], 'readonly')
    const store = transaction.objectStore('movies')
    
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async getAllMovies(): Promise<any[]> {
    const db = await this.initDB()
    const transaction = db.transaction(['movies'], 'readonly')
    const store = transaction.objectStore('movies')
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}

// Export storage instances
export const localStorage = new LocalStorageAdapter()
export const csvStorage = new CSVStorageAdapter()
export const indexedDB = new IndexedDBAdapter()