"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Calendar, Users, FileText, Activity, Clock, AlertCircle, Plus, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DoctorDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch current user and dashboard data
    const fetchData = async () => {
      try {
        // First, authenticate
        const authResponse = await fetch('/api/auth/me')
        
        if (!authResponse.ok) {
          router.push('/auth/login')
          return
        }
        
        const authData = await authResponse.json()
        
        // Allow both doctors and nurses to access this dashboard
        if (authData.user.role !== 'doctor' && authData.user.role !== 'nurse') {
          router.push('/auth/login')
          return
        }
        
        setCurrentUser(authData.user)

        // Then fetch dashboard data (only for doctors)
        if (authData.user.role === 'doctor') {
          const dashboardResponse = await fetch('/api/doctor/dashboard')
          
          if (dashboardResponse.ok) {
            const dashboardResult = await dashboardResponse.json()
            if (dashboardResult.success) {
              setDashboardData(dashboardResult.data)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const profile = dashboardData?.profile || {}
  const stats = dashboardData?.stats || { todayAppointments: 0, upcomingAppointments: 0, totalPatients: 0, recentVisits: 0 }
  const todayAppointments = dashboardData?.todayAppointments || []
  const upcomingAppointments = dashboardData?.upcomingAppointments || []
  const recentPatients = dashboardData?.recentPatients || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Doctor Dashboard</h1>
                <p className="text-xs text-muted-foreground">Healthcare Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="capitalize">
                Dr. {profile.first_name || currentUser.email}
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
          <h1 className="text-3xl font-bold mb-2">
            Welcome, Dr. {profile.first_name || 'Doctor'} {profile.last_name || ''}!
          </h1>
          <p className="text-muted-foreground">
            {profile.specialization || 'General Practice'} • {profile.department || 'Medical Department'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Under your care</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Visits</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentVisits}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList>
            <TabsTrigger value="today">Today's Schedule</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="patients">Recent Patients</TabsTrigger>
          </TabsList>

          {/* Today's Appointments */}
          <TabsContent value="today" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>
                  {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} scheduled for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment: any) => (
                      <div 
                        key={appointment.id} 
                        onClick={() => router.push(`/doctor/patients/${appointment.patient_id}`)}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {appointment.patient_first_name} {appointment.patient_last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              MRN: {appointment.medical_record_number}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.reason || 'General consultation'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {new Date(appointment.appointment_date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                            {appointment.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {appointment.duration_minutes} min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No appointments today</h3>
                    <p className="text-muted-foreground mb-4">You have a clear schedule for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Appointments */}
          <TabsContent value="upcoming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment: any) => (
                      <div 
                        key={appointment.id} 
                        onClick={() => router.push(`/doctor/patients/${appointment.patient_id}`)}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {appointment.patient_first_name} {appointment.patient_last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.reason || 'Consultation'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {new Date(appointment.appointment_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.appointment_date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
                    <p className="text-muted-foreground">No appointments scheduled for the next 7 days</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Patients */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Patients you've seen recently</CardDescription>
              </CardHeader>
              <CardContent>
                {recentPatients.length > 0 ? (
                  <div className="space-y-4">
                    {recentPatients.map((record: any) => (
                      <div 
                        key={record.id} 
                        onClick={() => router.push(`/doctor/patients/${record.patient_id}`)}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {record.first_name} {record.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              MRN: {record.medical_record_number}
                            </p>
                            {record.diagnosis && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {record.diagnosis}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(record.visit_date).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {record.gender || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No recent patients</h3>
                    <p className="text-muted-foreground">Patient records will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
