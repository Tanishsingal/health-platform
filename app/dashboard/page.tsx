"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch current user from API and redirect to appropriate dashboard
    const fetchUserAndRedirect = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (!response.ok) {
          // Not authenticated, redirect to login
          window.location.href = '/auth/login'
          return
        }
        
        const data = await response.json()
        const role = data.user.role
        
        // Redirect based on role using hard navigation
        switch (role) {
          case "super_admin":
          case "admin":
            window.location.href = "/admin"
            break
          case "doctor":
            window.location.href = "/doctor"
            break
          case "nurse":
            window.location.href = "/nurse" // Nurses have dedicated dashboard
            break
          case "pharmacist":
            window.location.href = "/pharmacy"
            break
          case "lab_technician":
            window.location.href = "/laboratory"
            break
          case "patient":
          default:
            window.location.href = "/patient"
            break
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        window.location.href = '/auth/login'
      }
    }
    
    fetchUserAndRedirect()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}
