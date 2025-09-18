import React, { createContext, useContext, useEffect, useState } from 'react'
import { AppSettings, SettingsContextType } from '../types'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../config/settings'
import { themeManager } from '../utils/theme'

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as AppSettings
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings })
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error)
      setSettings(DEFAULT_SETTINGS)
    }
  }, [])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings))
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
    }
  }

  const isConfigured = Boolean(settings.apiKey)

  const toggleTheme = () => {
    themeManager.toggleTheme()
    // Update settings to reflect theme change
    const newTheme = themeManager.getTheme()
    updateSettings({ theme: newTheme })
  }

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    themeManager.setTheme(theme)
    updateSettings({ theme })
  }

  const value: SettingsContextType = {
    settings,
    updateSettings,
    isConfigured,
    toggleTheme,
    setTheme
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}