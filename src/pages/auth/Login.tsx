import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useUser } from '../../contexts/UserContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Separator } from '../../components/ui/separator'
import { Film, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, loading } = useUser()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as any)?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await signIn(formData.email, formData.password)
      toast.success('Welcome back!', {
        description: 'You have successfully signed in.'
      })
      navigate(from, { replace: true })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setError(errorMessage)
      toast.error('Sign in failed', {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    const demoCredentials = {
      user: { email: 'demo@movieapp.com', password: 'demo123' },
      admin: { email: 'admin@movieapp.com', password: 'admin123' }
    }

    setFormData(demoCredentials[role])
    
    try {
      setIsSubmitting(true)
      await signIn(demoCredentials[role].email, demoCredentials[role].password)
      toast.success(`Welcome ${role}!`, {
        description: `Signed in as demo ${role}.`
      })
      navigate(role === 'admin' ? '/admin' : '/', { replace: true })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Demo login failed'
      setError(errorMessage)
      toast.error('Demo login failed', {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center"
            >
              <Film className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your MovieApp account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={isSubmitting}
                    className="pr-10 transition-all duration-200 focus:scale-[1.02]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full transition-all duration-200 hover:scale-[1.02]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                or try demo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleDemoLogin('user')}
                disabled={isSubmitting}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                Demo User
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin('admin')}
                disabled={isSubmitting}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                Demo Admin
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                to="/register"
                className="text-primary hover:underline transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          <p>Demo credentials are pre-filled for testing</p>
          <p>User: demo@movieapp.com / demo123</p>
          <p>Admin: admin@movieapp.com / admin123</p>
        </motion.div>
      </motion.div>
    </div>
  )
}