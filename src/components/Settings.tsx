import React, { useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { Settings as SettingsIcon, Save, Key, Globe, Shield, Info } from 'lucide-react'

interface SettingsProps {
  onBack: () => void
}

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' }
]

const REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'BR', name: 'Brazil' }
]

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { settings, updateSettings, isConfigured } = useSettings()
  const [formData, setFormData] = useState({
    apiKey: settings.apiKey || '',
    language: settings.language,
    region: settings.region,
    includeAdult: settings.includeAdult
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    updateSettings({
      apiKey: formData.apiKey.trim() || null,
      language: formData.language,
      region: formData.region,
      includeAdult: formData.includeAdult
    })
    
    setSaving(false)
    setSaved(true)
    
    // Hide success message after 3 seconds
    setTimeout(() => setSaved(false), 3000)
  }

  const hasChanges = 
    formData.apiKey !== (settings.apiKey || '') ||
    formData.language !== settings.language ||
    formData.region !== settings.region ||
    formData.includeAdult !== settings.includeAdult

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h1 className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Configure your MovieApp experience
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Save className="w-4 h-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Configure your TMDB API key to access real movie data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConfigured && (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  <strong>Using Demo Mode:</strong> Currently using mock data. 
                  Add your TMDB API key to access real movie information.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">TMDB API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your TMDB API key"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Get your free API key at{' '}
                <a 
                  href="https://www.themoviedb.org/settings/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  themoviedb.org
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language & Region
            </CardTitle>
            <CardDescription>
              Customize language and regional preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, language: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={formData.region} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, region: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(region => (
                      <SelectItem key={region.code} value={region.code}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Content Preferences
            </CardTitle>
            <CardDescription>
              Control what type of content you see
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Include Adult Content</Label>
                <p className="text-sm text-muted-foreground">
                  Show movies with adult content in search results
                </p>
              </div>
              <Switch
                checked={formData.includeAdult}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, includeAdult: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving}
            className="min-w-32"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}