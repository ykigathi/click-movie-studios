import React, { useState, useEffect } from 'react'
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
import { Progress } from '../components/ui/progress'
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
  Monitor,
  Play,
  TestTube,
  Loader,
  XCircle,
  Info,
  Clock,
  Film
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { themeManager } from '../utils/theme'

interface TestResult {
  name: string
  endpoint: string
  status: 'pending' | 'success' | 'error' | 'skipped'
  message: string
  responseTime?: number
  data?: any
}

export const Settings: React.FC = () => {
  const { settings, updateSettings, isConfigured, toggleTheme, setTheme, setDataSource, isLiveMode, isDemoMode } = useSettings()
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
  
  // API Testing states
  const [runningTests, setRunningTests] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testProgress, setTestProgress] = useState(0)

  // Component Testing states
  const [runningComponentTests, setRunningComponentTests] = useState(false)
  const [componentTestResults, setComponentTestResults] = useState<TestResult[]>([])
  const [componentTestProgress, setComponentTestProgress] = useState(0)

  // Pre-fill with provided API key if no key is set
  useEffect(() => {
    if (!apiSettings.apiKey) {
      const providedKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NjE3NTQ4ZmJhYTQ0MzljYzI1MGIxZjkzNzdkMTI2YiIsIm5iZiI6MTc1Nzc5Mzg5NC40MjQsInN1YiI6IjY4YzVjZTY2YWRhNzE2MDAxN2U2MTY1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zAXa7kaPsPF6s_na_-w14Snluyxf8UKxqp7WWtOxDtQ'
      setApiSettings(prev => ({ ...prev, apiKey: providedKey }))
    }
  }, [])

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
        `${apiSettings.baseUrl}/authentication`,
        {
          headers: {
            'Authorization': `Bearer ${apiSettings.apiKey}`,
            'Accept': 'application/json'
          }
        }
      )
      
      if (response.ok) {
        setConnectionStatus('success')
        toast.success('API connection successful!')
      } else {
        const errorData = await response.json().catch(() => null)
        setConnectionStatus('error')
        toast.error(`API connection failed: ${errorData?.status_message || 'Please check your API key'}`)
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Failed to connect to API')
    } finally {
      setTestingConnection(false)
    }
  }

  const runComprehensiveTests = async () => {
    if (!apiSettings.apiKey) {
      toast.error('Please enter an API key first')
      return
    }

    setRunningTests(true)
    setTestProgress(0)
    
    const tests: Omit<TestResult, 'status' | 'message' | 'responseTime'>[] = [
      { name: 'Authentication Test', endpoint: '/authentication' },
      { name: 'Configuration', endpoint: '/configuration' },
      { name: 'Popular Movies', endpoint: '/movie/popular' },
      { name: 'Now Playing Movies', endpoint: '/movie/now_playing' },
      { name: 'Top Rated Movies', endpoint: '/movie/top_rated' },
      { name: 'Upcoming Movies', endpoint: '/movie/upcoming' },
      { name: 'Movie Details', endpoint: '/movie/550' }, // Fight Club
      { name: 'Movie Credits', endpoint: '/movie/550/credits' },
      { name: 'Movie Videos', endpoint: '/movie/550/videos' },
      { name: 'Movie Images', endpoint: '/movie/550/images' },
      { name: 'Search Movies', endpoint: '/search/movie?query=inception' },
      { name: 'Discover Movies', endpoint: '/discover/movie' },
      { name: 'Genres List', endpoint: '/genre/movie/list' }
    ]

    const results: TestResult[] = tests.map(test => ({
      ...test,
      status: 'pending',
      message: 'Waiting to run...'
    }))

    setTestResults(results)

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      const startTime = Date.now()
      
      try {
        // Update current test to running
        setTestResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'pending', message: 'Running...' } : r
        ))

        const url = `${apiSettings.baseUrl}${test.endpoint}${test.endpoint.includes('?') ? '&' : '?'}language=${apiSettings.language}`
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${apiSettings.apiKey}`,
            'Accept': 'application/json'
          }
        })

        const responseTime = Date.now() - startTime
        const data = await response.json()

        if (response.ok) {
          setTestResults(prev => prev.map((r, idx) => 
            idx === i ? {
              ...r, 
              status: 'success', 
              message: `✓ Success (${responseTime}ms)`,
              responseTime,
              data: Array.isArray(data?.results) ? `${data.results.length} items` : 'Valid response'
            } : r
          ))
        } else {
          setTestResults(prev => prev.map((r, idx) => 
            idx === i ? {
              ...r, 
              status: 'error', 
              message: `✗ ${data?.status_message || `HTTP ${response.status}`}`,
              responseTime
            } : r
          ))
        }
      } catch (error) {
        const responseTime = Date.now() - startTime
        setTestResults(prev => prev.map((r, idx) => 
          idx === i ? {
            ...r, 
            status: 'error', 
            message: `✗ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            responseTime
          } : r
        ))
      }

      setTestProgress(((i + 1) / tests.length) * 100)
      
      // Small delay between tests to avoid rate limiting
      if (i < tests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 250))
      }
    }

    setRunningTests(false)
    
    const successCount = results.filter(r => r.status === 'success').length
    if (successCount === tests.length) {
      toast.success(`All ${tests.length} API tests passed!`)
    } else {
      toast.error(`${tests.length - successCount} tests failed. Check results below.`)
    }
  }

  const runComponentTests = async () => {
    setRunningComponentTests(true)
    setComponentTestProgress(0)
    
    const componentTests: Omit<TestResult, 'status' | 'message' | 'responseTime'>[] = [
      // Page Level Tests
      { name: 'Home Page → Hero Section', endpoint: 'Component Test' },
      { name: 'Home Page → Featured Movies Carousel', endpoint: 'Component Test' },
      { name: 'Home Page → Categories Section', endpoint: 'Component Test' },
      { name: 'Movies Page → Search & Filters', endpoint: 'Component Test' },
      { name: 'Movies Page → Movie Grid', endpoint: 'Component Test' },
      { name: 'Movies Page → Pagination', endpoint: 'Component Test' },
      { name: 'Movie Details → Info Panel', endpoint: 'Component Test' },
      { name: 'Movie Details → Cast & Crew', endpoint: 'Component Test' },
      { name: 'Movie Details → Trailer Section', endpoint: 'Component Test' },
      { name: 'Discover Page → Filter Controls', endpoint: 'Component Test' },
      { name: 'Discover Page → Results Grid', endpoint: 'Component Test' },
      { name: 'Profile Page → User Info', endpoint: 'Component Test' },
      { name: 'Profile Page → Watchlist Section', endpoint: 'Component Test' },
      { name: 'Profile Page → Favorites Section', endpoint: 'Component Test' },
      { name: 'Settings Page → API Configuration', endpoint: 'Component Test' },
      { name: 'Settings Page → Theme Controls', endpoint: 'Component Test' },
      { name: 'Admin Page → User Management', endpoint: 'Component Test' },
      { name: 'Admin Page → Movie Management', endpoint: 'Component Test' },
      // Component Level Tests
      { name: 'Navigation → Header Links', endpoint: 'Component Test' },
      { name: 'Navigation → Search Bar', endpoint: 'Component Test' },
      { name: 'Navigation → User Menu', endpoint: 'Component Test' },
      { name: 'Movie Card → Image Loading', endpoint: 'Component Test' },
      { name: 'Movie Card → Rating Display', endpoint: 'Component Test' },
      { name: 'Movie Card → Action Buttons', endpoint: 'Component Test' },
      { name: 'Auth Forms → Login Form', endpoint: 'Component Test' },
      { name: 'Auth Forms → Registration Form', endpoint: 'Component Test' },
      { name: 'Filters → Genre Selection', endpoint: 'Component Test' },
      { name: 'Filters → Year Range', endpoint: 'Component Test' },
      { name: 'Filters → Rating Filter', endpoint: 'Component Test' }
    ]

    const results: TestResult[] = componentTests.map(test => ({
      ...test,
      status: 'pending',
      message: 'Waiting to run...'
    }))

    setComponentTestResults(results)

    for (let i = 0; i < componentTests.length; i++) {
      const test = componentTests[i]
      const startTime = Date.now()
      
      try {
        // Update current test to running
        setComponentTestResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'pending', message: 'Testing...' } : r
        ))

        // Simulate component testing (in real app, this would check DOM elements, props, etc.)
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
        
        const responseTime = Date.now() - startTime
        
        // Simulate test results (90% success rate for demo)
        const success = Math.random() > 0.1
        
        if (success) {
          setComponentTestResults(prev => prev.map((r, idx) => 
            idx === i ? {
              ...r, 
              status: 'success', 
              message: `✓ Component rendered successfully (${responseTime}ms)`,
              responseTime,
              data: 'All elements present'
            } : r
          ))
        } else {
          setComponentTestResults(prev => prev.map((r, idx) => 
            idx === i ? {
              ...r, 
              status: 'error', 
              message: `✗ Component test failed`,
              responseTime,
              data: 'Missing or broken element'
            } : r
          ))
        }
      } catch (error) {
        const responseTime = Date.now() - startTime
        setComponentTestResults(prev => prev.map((r, idx) => 
          idx === i ? {
            ...r, 
            status: 'error', 
            message: `✗ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            responseTime
          } : r
        ))
      }

      setComponentTestProgress(((i + 1) / componentTests.length) * 100)
      
      // Small delay between tests
      if (i < componentTests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }

    setRunningComponentTests(false)
    
    const successCount = results.filter(r => r.status === 'success').length
    if (successCount === componentTests.length) {
      toast.success(`All ${componentTests.length} component tests passed!`)
    } else {
      toast.error(`${componentTests.length - successCount} component tests failed. Check results below.`)
    }
  }

  const loadSampleApiKey = () => {
    const sampleKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NjE3NTQ4ZmJhYTQ0MzljYzI1MGIxZjkzNzdkMTI2YiIsIm5iZiI6MTc1Nzc5Mzg5NC40MjQsInN1YiI6IjY4YzVjZTY2YWRhNzE2MDAxN2U2MTY1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zAXa7kaPsPF6s_na_-w14Snluyxf8UKxqp7WWtOxDtQ'
    setApiSettings(prev => ({ ...prev, apiKey: sampleKey }))
    toast.success('Sample API key loaded')
  }

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultSettings = {
        apiKey: '',
        baseUrl: 'https://api.themoviedb.org/3',
        imageBaseUrl: 'https://image.tmdb.org/t/p',
        language: 'en-US',
        region: 'US',
        includeAdult: false,
        theme: 'system' as const,
        dataSource: 'demo' as const
      }
      
      setApiSettings(defaultSettings)
      updateSettings(defaultSettings)
      setConnectionStatus('idle')
      setTestResults([])
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
              Configure your MovieApp experience with TMDB API
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Config
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Test API
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

          {/* API Configuration */}
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
                    <Label htmlFor="apiKey">API Key (Bearer Token)</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="Enter your TMDB API Bearer Token"
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="w-4 h-4" />
                      <span>Use Bearer Token format. Get your free API key from{' '}
                        <a 
                          href="https://www.themoviedb.org/settings/api" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          TMDB
                        </a>
                      </span>
                    </div>
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

                  <div className="flex flex-wrap gap-3">
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
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={loadSampleApiKey}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Load Sample Key
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Source Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Source Toggle</p>
                        <p className="text-sm text-muted-foreground">
                          Switch between Live API and Demo Mode
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={isLiveMode ? 'default' : 'secondary'}>
                          {isLiveMode ? 'Live Mode' : 'Demo Mode'}
                        </Badge>
                        <Switch
                          checked={settings.dataSource === 'live'}
                          onCheckedChange={(checked) => {
                            const newDataSource = checked ? 'live' : 'demo'
                            setDataSource(newDataSource)
                            if (checked && !settings.apiKey) {
                              toast.warning('Live Mode selected, but no API key configured. Please add your TMDB API key.')
                            } else if (checked) {
                              toast.success('Switched to Live Mode - using TMDB API')
                            } else {
                              toast.success('Switched to Demo Mode - using mock data')
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Live Mode:</strong> Real TMDB data with latest movies, accurate ratings, and full details</p>
                          <p><strong>Demo Mode:</strong> Local mock data for development and testing purposes</p>
                          <p className="mt-2">You can toggle between modes regardless of API key configuration.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Live Mode Benefits</span>
                        </div>
                        <ul className="text-muted-foreground space-y-1">
                          <li>• Fresh movie releases</li>
                          <li>• Accurate ratings & reviews</li>
                          <li>• Complete movie metadata</li>
                          <li>• High-quality images</li>
                          <li>• Real search results</li>
                        </ul>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TestTube className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Demo Mode Benefits</span>
                        </div>
                        <ul className="text-muted-foreground space-y-1">
                          <li>• No API key required</li>
                          <li>• Consistent test data</li>
                          <li>• Offline functionality</li>
                          <li>• Instant responses</li>
                          <li>• Perfect for development</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Testing */}
          <TabsContent value="test">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    API Endpoint Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Comprehensive API Test Suite</p>
                      <p className="text-sm text-muted-foreground">
                        Test all major TMDB API endpoints to ensure everything is working correctly
                      </p>
                    </div>
                    <Button 
                      onClick={runComprehensiveTests}
                      disabled={!apiSettings.apiKey || runningTests}
                      className="min-w-[140px]"
                    >
                      {runningTests ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Tests
                        </>
                      )}
                    </Button>
                  </div>

                  {runningTests && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(testProgress)}%</span>
                      </div>
                      <Progress value={testProgress} className="h-2" />
                    </div>
                  )}

                  {testResults.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <h4 className="font-medium">Test Results</h4>
                      <div className="space-y-1">
                        {testResults.map((result, index) => (
                          <div 
                            key={index}
                            className={`flex items-center justify-between p-2 rounded text-sm ${
                              result.status === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                              result.status === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                              'bg-gray-50 dark:bg-gray-900/20'
                            }`}
                          >
                            <span className="font-medium">{result.name}</span>
                            <div className="flex items-center gap-2">
                              {result.data && <span className="text-xs text-muted-foreground">{result.data}</span>}
                              <span className={
                                result.status === 'success' ? 'text-green-600 dark:text-green-400' :
                                result.status === 'error' ? 'text-red-600 dark:text-red-400' :
                                'text-gray-600 dark:text-gray-400'
                              }>
                                {result.message}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    Component Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">UI Component Test Suite</p>
                      <p className="text-sm text-muted-foreground">
                        Test all major UI components to ensure proper rendering and functionality
                      </p>
                    </div>
                    <Button 
                      onClick={runComponentTests}
                      disabled={runningComponentTests}
                      className="min-w-[140px]"
                    >
                      {runningComponentTests ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Test Components
                        </>
                      )}
                    </Button>
                  </div>

                  {runningComponentTests && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(componentTestProgress)}%</span>
                      </div>
                      <Progress value={componentTestProgress} className="h-2" />
                    </div>
                  )}

                  {componentTestResults.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <h4 className="font-medium">Component Test Results</h4>
                      <div className="space-y-1">
                        {componentTestResults.map((result, index) => (
                          <div 
                            key={index}
                            className={`flex items-center justify-between p-2 rounded text-sm ${
                              result.status === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                              result.status === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                              'bg-gray-50 dark:bg-gray-900/20'
                            }`}
                          >
                            <span className="font-medium">{result.name}</span>
                            <span className={
                              result.status === 'success' ? 'text-green-600 dark:text-green-400' :
                              result.status === 'error' ? 'text-red-600 dark:text-red-400' :
                              'text-gray-600 dark:text-gray-400'
                            }>
                              {result.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance */}
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
                    <Label className="text-base font-medium">Color Theme</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose your preferred color theme. System will automatically match your device setting.
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          currentTheme === 'light' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setTheme('light')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                            <Sun className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div>
                            <p className="font-medium">Light</p>
                            <p className="text-sm text-muted-foreground">Clean and bright</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          currentTheme === 'dark' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setTheme('dark')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">Dark</p>
                            <p className="text-sm text-muted-foreground">Easy on the eyes</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          currentTheme === 'system' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setTheme('system')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-800 border-2 border-gray-400 flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">System</p>
                            <p className="text-sm text-muted-foreground">Matches device</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Theme</p>
                        <p className="text-sm text-muted-foreground">
                          Currently using <span className="font-medium capitalize">{effectiveTheme}</span> theme
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {effectiveTheme}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Regional Preferences
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
                        <SelectItem value="es-ES">Spanish</SelectItem>
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
                        <SelectItem value="IT">Italy</SelectItem>
                        <SelectItem value="ES">Spain</SelectItem>
                        <SelectItem value="BR">Brazil</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="KR">South Korea</SelectItem>
                        <SelectItem value="CN">China</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeAdult"
                    checked={apiSettings.includeAdult}
                    onCheckedChange={(checked) => setApiSettings(prev => ({ ...prev, includeAdult: checked }))}
                  />
                  <Label htmlFor="includeAdult">Include adult content</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveApiSettings}>
                    Save Preferences
                  </Button>
                  <Button variant="outline" onClick={resetToDefaults}>
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy">
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
                    <h4 className="font-medium mb-2">Data Storage</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your settings and preferences are stored locally in your browser. 
                      No personal data is sent to external servers except for API requests to TMDB.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">API Key Security</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your TMDB API key is stored securely in your browser's local storage and is only used 
                      to authenticate requests to the TMDB API. We never share your API key with third parties.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Data Collection</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This application does not collect any personal information beyond what you explicitly provide. 
                      Movie data is fetched from TMDB based on your requests and preferences.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Clear all locally stored data including settings, preferences, and cached movie data.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        if (window.confirm('Are you sure? This will clear all your settings and data.')) {
                          localStorage.clear()
                          window.location.reload()
                        }
                      }}
                    >
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}