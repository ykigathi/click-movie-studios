export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: 'light' | 'dark' | 'system' = 'system'

  private constructor() {
    this.initializeTheme()
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  private initializeTheme() {
    // Get saved theme or default to system
    const savedTheme = localStorage.getItem('movieapp_theme') as 'light' | 'dark' | 'system'
    this.currentTheme = savedTheme || 'system'
    
    this.applyTheme(this.currentTheme)
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.currentTheme === 'system') {
        this.updateDOM(e.matches ? 'dark' : 'light')
      }
    })
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.currentTheme = theme
    localStorage.setItem('movieapp_theme', theme)
    this.applyTheme(theme)
  }

  getTheme(): 'light' | 'dark' | 'system' {
    return this.currentTheme
  }

  toggleTheme() {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(this.currentTheme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    this.setTheme(nextTheme)
  }

  private applyTheme(theme: 'light' | 'dark' | 'system') {
    let effectiveTheme: 'light' | 'dark'

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      effectiveTheme = theme
    }

    this.updateDOM(effectiveTheme)
  }

  private updateDOM(theme: 'light' | 'dark') {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#030213' : '#ffffff')
    }
  }

  getCurrentEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return this.currentTheme
  }
}

export const themeManager = ThemeManager.getInstance()