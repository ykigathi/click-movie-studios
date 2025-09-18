import React, { useState } from 'react'
import { motion } from 'motion/react'
import { useSettings } from '../contexts/SettingsContext'
import { useUser } from '../contexts/UserContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Switch } from '../components/ui/switch'
import { Separator } from '../components/ui/separator'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Settings as SettingsIcon, 
  Key, 
  Globe, 
  Shield, 
  Palette, 
  Database,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { themeManager } from '../utils/theme'

export const Settings: React.FC = () => {
  const { settings, updateSettings, isConfigured, toggleTheme, setTheme } = useSettings()
  const { user } = useUser()
  
  const [apiSettings, setApiSettings] = useState({
    apiKey: settings.apiKey || '',
    baseUrl: settings.baseUrl,
    imageBaseUrl: settings.imageBaseUrl,
    language: settings.language,
    region: settings.region,
    includeAdult: settings.includeAdult
  })
  
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSaveApiSettings = async () => {
    try {
      await updateSettings(apiSettings)
      toast.success('API settings saved successfully')
      
      // Test the connection
      if (apiSettings.apiKey) {
        testApiConnection()
      }
    } catch (error) {
      toast.error('Failed to save API settings')
    }
  }

  const testApiConnection = async () => {
    if (!apiSettings.apiKey) {
      toast.error('Please enter an API key')
      return
    }

    setTestingConnection(true)
    setConnectionStatus('idle')

    try {
      const response = await fetch(
        `${apiSettings.baseUrl}/movie/popular?api_key=${apiSettings.apiKey}&language=${apiSettings.language}&page=1`
      )
      
      if (response.ok) {
        setConnectionStatus('success')
        toast.success('API connection successful!')
      } else {
        setConnectionStatus('error')
        toast.error('API connection failed. Please check your API key.')
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Failed to connect to API')
    } finally {
      setTestingConnection(false)
    }
  }

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultSettings = {
        apiKey: null,
        baseUrl: 'https://api.themoviedb.org/3',
        imageBaseUrl: 'https://image.tmdb.org/t/p',
        language: 'en-US',
        region: 'US',
        includeAdult: false,
        theme: 'system' as const
      }
      
      setApiSettings(defaultSettings)
      updateSettings(defaultSettings)
      setConnectionStatus('idle')
      toast.success('Settings reset to defaults')
    }
  }

  const currentTheme = themeManager.getTheme()
  const effectiveTheme = themeManager.getCurrentEffectiveTheme()

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl flex items-center gap-3">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Configure your MovieApp experience
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Setup Required
              </Badge>
            )}
          </div>
        </div>

        {!isConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please configure your TMDB API key to access real movie data. 
              Without it, the app will use demo data only.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* API Settings */}
          <TabsContent value="api">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    TMDB API Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="Enter your TMDB API key"
                        value={apiSettings.apiKey}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="pr-20"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="h-6 w-6 p-0"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        {connectionStatus === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {connectionStatus === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get your free API key from{' '}
                      <a 
                        href="https://www.themoviedb.org/settings/api" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        TMDB
                      </a>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseUrl">API Base URL</Label>
                      <Input
                        id="baseUrl"
                        value={apiSettings.baseUrl}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                        placeholder="https://api.themoviedb.org/3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageBaseUrl">Image Base URL</Label>
                      <Input
                        id="imageBaseUrl"
                        value={apiSettings.imageBaseUrl}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, imageBaseUrl: e.target.value }))}
                        placeholder="https://image.tmdb.org/t/p"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSaveApiSettings}>
                      Save API Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={testApiConnection}
                      disabled={!apiSettings.apiKey || testingConnection}
                    >
                      {testingConnection ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Source
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Data Source</p>
                        <p className="text-sm text-muted-foreground">
                          {isConfigured ? 'Live TMDB API data' : 'Demo/Mock data'}
                        </p>
                      </div>
                      <Badge variant={isConfigured ? 'default' : 'secondary'}>
                        {isConfigured ? 'Live' : 'Demo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Configure your API key above to switch from demo data to live TMDB data.
                      All features work with both data sources.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Theme & Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose your preferred theme or let the system decide
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={currentTheme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                      className="h-20 flex-col gap-2"
                    >
                      <Sun className="w-6 h-6" />
                      Light
                    </Button>
                    <Button
                      variant={currentTheme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                      className="h-20 flex-col gap-2"
                    >
                      <Moon className="w-6 h-6" />
                      Dark
                    </Button>
                    <Button
                      variant={currentTheme === 'system' ? 'default' : 'outline'}
                      onClick={() => setTheme('system')}
                      className="h-20 flex-col gap-2"
                    >
                      <Monitor className="w-6 h-6" />
                      System
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Current effective theme: <Badge variant="outline">{effectiveTheme}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Quick Theme Toggle</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Quickly cycle through themes
                    </p>
                  </div>
                  <Button variant="outline" onClick={toggleTheme}>
                    <Palette className="w-4 h-4 mr-2" />
                    Toggle Theme
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language & Region
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select 
                        value={apiSettings.language} 
                        onValueChange={(value) => setApiSettings(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                          <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                          <SelectItem value="it-IT">Italian</SelectItem>
                          <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                          <SelectItem value="ja-JP">Japanese</SelectItem>
                          <SelectItem value="ko-KR">Korean</SelectItem>
                          <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select 
                        value={apiSettings.region} 
                        onValueChange={(value) => setApiSettings(prev => ({ ...prev, region: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="ES">Spain</SelectItem>
                          <SelectItem value="IT">Italy</SelectItem>
                          <SelectItem value="JP">Japan</SelectItem>
                          <SelectItem value="KR">South Korea</SelectItem>
                          <SelectItem value="BR">Brazil</SelectItem>
                          <SelectItem value="MX">Mexico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include Adult Content</Label>
                      <p className="text-sm text-muted-foreground">
                        Show movies with adult content in results
                      </p>
                    </div>
                    <Switch
                      checked={apiSettings.includeAdult}
                      onCheckedChange={(checked) => 
                        setApiSettings(prev => ({ ...prev, includeAdult: checked }))
                      }
                    />
                  </div>

                  <Button onClick={handleSaveApiSettings}>
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Data Storage</h3>
                      <p className="text-sm text-muted-foreground">
                        Your data is stored locally in your browser. We don't collect or send any personal information to external servers.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-medium">Stored Locally:</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>User preferences</li>
                          <li>Watchlist & favorites</li>
                          <li>Movie ratings</li>
                          <li>Theme settings</li>
                          <li>API configuration</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Never Stored:</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Personal information</li>
                          <li>Browsing history</li>
                          <li>Third-party data</li>
                          <li>Analytics data</li>
                          <li>Tracking cookies</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Data Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your local data and preferences
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={resetToDefaults}>
                        Reset to Defaults
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (window.confirm('This will clear all your local data including watchlist, favorites, and settings. This action cannot be undone.')) {
                            localStorage.clear()
                            window.location.reload()
                          }
                        }}
                      >
                        Clear All Data
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">External APIs</h3>
                      <p className="text-sm text-muted-foreground">
                        This app uses The Movie Database (TMDB) API to fetch movie data
                      </p>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        <strong>TMDB API:</strong> Used to fetch movie information, images, and metadata. 
                        Please review TMDB's{' '}
                        <a 
                          href="https://www.themoviedb.org/privacy-policy" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          privacy policy
                        </a>{' '}
                        for details on their data handling.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-500">
                            {user.userData?.watchlist?.length || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Watchlist Items</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-500">
                            {user.userData?.favorites?.length || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Favorites</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-500">
                            {Object.keys(user.userData?.ratings || {}).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Ratings</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-500">
                            {user.userData?.viewHistory?.length || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">View History</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}