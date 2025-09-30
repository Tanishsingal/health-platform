"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Calendar, Users, FileText, Activity, Clock, AlertCircle, Plus, Stethoscope } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Mock data for nurse dashboard
const NURSE_DATA = {
  profile: {
    first_name: "Emily",
    last_name: "Nurse"
  },
  todayAppointments: [
    {
      id: 1,
      appointment_date: "2024-01-15T09:00:00Z",
      duration_minutes: 30,
      reason: "Vitals Check",
      status: "confirmed",
      patient: {
        medical_record_number: "MRN-001",
        user_profile: {
          first_name: "John",
          last_name: "Doe"
        }
      }
    }
  ],
  assignedPatients: [
    {
      id: 1,
      patient_id: "patient-1",
      medical_record_number: "MRN-001",
      user_profile: {
        first_name: "John",
        last_name: "Doe"
      },
      last_vitals: "2 hours ago"
    },
    {
      id: 2,
      patient_id: "patient-2",
      medical_record_number: "MRN-002",
      user_profile: {
        first_name: "Jane",
        last_name: "Smith"
      },
      last_vitals: "4 hours ago"
    }
  ],
  pendingTasks: [
    {
      id: 1,
      task: "Administer medication",
      patient: "John Doe",
      priority: "High",
      time: "09:00 AM"
    },
    {
      id: 2,
      task: "Check vitals",
      patient: "Jane Smith",
      priority: "Medium",
      time: "10:30 AM"
    }
  ]
}

export default function NurseDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch current user from API
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (!response.ok) {
          router.push('/auth/login')
          return
        }
        
        const data = await response.json()
        
        if (data.user.role !== 'nurse') {
          router.push('/auth/login')
          return
        }
        
        setCurrentUser(data.user)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUser()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/auth/login')
    }
  }

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Stethoscope className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Nurse Portal</h1>
                <p className="text-xs text-muted-foreground">Patient Care Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="capitalize">
                {currentUser.email}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, Nurse {NURSE_DATA.profile.first_name}!</h1>
          <p className="text-muted-foreground">Here's your patient care overview for today</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{NURSE_DATA.assignedPatients.length}</div>
              <p className="text-xs text-muted-foreground">Active patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{NURSE_DATA.pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground">Pending tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{NURSE_DATA.todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Today's schedule</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">2</div>
              <p className="text-xs text-muted-foreground">Urgent items</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Patients */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Patients</CardTitle>
                <CardDescription>Your current patient roster</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {NURSE_DATA.assignedPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {patient.user_profile.first_name} {patient.user_profile.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            MRN: {patient.medical_record_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last vitals: {patient.last_vitals}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Chart
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Tasks & Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Today's priorities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {NURSE_DATA.pendingTasks.map((task) => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{task.task}</p>
                        <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'} className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{task.patient}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {task.time}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Record Vitals
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Update Charts
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 