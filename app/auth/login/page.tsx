"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Heart, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Call the actual login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed')
      }

      // Redirect based on user role
      const role = data.user.role
      const roleRedirects: Record<string, string> = {
        'super_admin': '/admin',
        'admin': '/admin',
        'doctor': '/doctor',
        'nurse': '/nurse',
        'patient': '/patient',
        'pharmacist': '/pharmacy',
        'lab_technician': '/laboratory',
      }

      const redirectTo = roleRedirects[role] || '/dashboard'
      
      // Use window.location for a hard redirect to ensure cookie is set
      window.location.href = redirectTo
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg mx-auto mb-4">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your healthcare portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Create account
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Demo Credentials - Click to Auto-fill</CardTitle>
            <CardDescription className="text-xs">Default password: password123</CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-3">
            <div 
              className="cursor-pointer p-2 rounded border bg-blue-50 hover:bg-blue-100 transition-colors"
              onClick={() => handleDemoLogin('patient@hospital.com', 'password123')}
            >
              <strong>👤 Patient Portal:</strong> patient@hospital.com / password123
            </div>
            <div 
              className="cursor-pointer p-2 rounded border bg-green-50 hover:bg-green-100 transition-colors"
              onClick={() => handleDemoLogin('doctor@hospital.com', 'password123')}
            >
              <strong>🩺 Doctor Portal:</strong> doctor@hospital.com / password123
            </div>
            <div 
              className="cursor-pointer p-2 rounded border bg-purple-50 hover:bg-purple-100 transition-colors"
              onClick={() => handleDemoLogin('admin@hospital.com', 'password123')}
            >
              <strong>⚙️ Admin Portal:</strong> admin@hospital.com / password123
            </div>
            <div 
              className="cursor-pointer p-2 rounded border bg-orange-50 hover:bg-orange-100 transition-colors"
              onClick={() => handleDemoLogin('pharmacist@hospital.com', 'password123')}
            >
              <strong>💊 Pharmacy Portal:</strong> pharmacist@hospital.com / password123
            </div>
            <div 
              className="cursor-pointer p-2 rounded border bg-teal-50 hover:bg-teal-100 transition-colors"
              onClick={() => handleDemoLogin('nurse@hospital.com', 'password123')}
            >
              <strong>🔬 Nurse Portal:</strong> nurse@hospital.com / password123
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
