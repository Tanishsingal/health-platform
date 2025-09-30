"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Users,
  UserPlus,
  Activity,
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText,
  Settings,
  Database,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Mock data for admin dashboard
const ADMIN_DATA = {
  profile: {
    first_name: "Admin",
    last_name: "User"
  },
  stats: {
    totalUsers: 1250,
    totalPatients: 890,
    totalStaff: 45,
    todayAppointments: 127
  },
  recentUsers: [
    {
      id: 1,
      first_name: "John",
      last_name: "Smith",
      role: "patient",
      created_at: "2024-01-14T10:00:00Z",
      phone: "+1-555-0123"
    },
    {
      id: 2,
      first_name: "Dr. Sarah",
      last_name: "Johnson",
      role: "doctor", 
      created_at: "2024-01-13T15:30:00Z",
      phone: "+1-555-0124"
    },
    {
      id: 3,
      first_name: "Nurse Mary",
      last_name: "Williams",
      role: "nurse",
      created_at: "2024-01-12T09:15:00Z",
      phone: "+1-555-0125"
    }
  ],
  pendingStaff: [
    {
      id: 1,
      specialization: "Cardiology",
      department: "Internal Medicine",
      license_number: "MD12345",
      years_of_experience: 8,
      created_at: "2024-01-10T14:00:00Z",
      user_profile: {
        first_name: "Michael",
        last_name: "Brown",
        role: "doctor"
      }
    },
    {
      id: 2,
      specialization: "Emergency Medicine",
      department: "Emergency",
      license_number: "RN67890",
      years_of_experience: 5,
      created_at: "2024-01-09T11:30:00Z",
      user_profile: {
        first_name: "Emily",
        last_name: "Davis",
        role: "nurse"
      }
    }
  ]
}

export default function AdminDashboardPage() {
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
        
        if (data.user.role !== 'admin' && data.user.role !== 'super_admin') {
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
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">System Management & Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Badge variant="secondary" className="capitalize">
                Administrator
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
          <h1 className="text-3xl font-bold mb-2">Welcome, {ADMIN_DATA.profile.first_name}!</h1>
          <p className="text-muted-foreground">System overview and management dashboard</p>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ADMIN_DATA.stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{ADMIN_DATA.recentUsers.length} new this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ADMIN_DATA.stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Registered patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medical Staff</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ADMIN_DATA.stats.totalStaff}</div>
              <p className="text-xs text-muted-foreground">Active staff members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ADMIN_DATA.stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Registrations</CardTitle>
                  <CardDescription>New users registered in the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {ADMIN_DATA.recentUsers.length ? (
                    <div className="space-y-4">
                      {ADMIN_DATA.recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.role} • {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No recent registrations</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    System Alerts
                  </CardTitle>
                  <CardDescription>Items requiring administrative attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 border rounded-lg border-destructive/20 bg-destructive/5">
                      <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Database Backup Overdue</p>
                        <p className="text-sm text-muted-foreground">Last backup: 3 days ago</p>
                      </div>
                      <Badge variant="destructive">High</Badge>
                    </div>

                    <div className="flex items-center gap-4 p-3 border rounded-lg border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Staff Credentials Expiring</p>
                        <p className="text-sm text-muted-foreground">5 staff members need renewal</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400"
                      >
                        Medium
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">System Performance Good</p>
                        <p className="text-sm text-muted-foreground">All services running normally</p>
                      </div>
                      <Badge variant="secondary">Info</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">User Management</h3>
                <p className="text-sm text-muted-foreground">Manage all system users and their roles</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Users
                </Button>
                <Button size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Complete list of system users with their roles and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ADMIN_DATA.recentUsers.slice(0, 8).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <Badge variant="secondary" className="capitalize text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.phone || "No phone"} • Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Staff Management</h3>
                <p className="text-sm text-muted-foreground">Manage medical staff, credentials, and departments</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Database className="w-4 h-4 mr-2" />
                  Departments
                </Button>
                <Button size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Medical Staff</CardTitle>
                <CardDescription>All medical staff members and their credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ADMIN_DATA.pendingStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            Dr. {staff.user_profile.first_name} {staff.user_profile.last_name}
                          </p>
                          <Badge variant="secondary" className="capitalize text-xs">
                            {staff.user_profile.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {staff.specialization} • {staff.department}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          License: {staff.license_number} • {staff.years_of_experience || 0} years experience
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Active</p>
                        <p className="text-xs text-muted-foreground">
                          Since {new Date(staff.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Connection Status</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm font-medium">3 days ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Used</span>
                    <span className="text-sm font-medium">2.4 GB / 10 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Connections</span>
                    <span className="text-sm font-medium">47</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Server Status</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response Time</span>
                    <span className="text-sm font-medium">142ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <span className="text-sm font-medium">0.01%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>Scheduled maintenance and system updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Database Backup</p>
                      <p className="text-sm text-muted-foreground">Scheduled for tonight at 2:00 AM</p>
                    </div>
                    <Badge variant="secondary">Scheduled</Badge>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">System Update</p>
                      <p className="text-sm text-muted-foreground">Security patches and performance improvements</p>
                    </div>
                    <Badge variant="secondary">This Weekend</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">User Activity Report</CardTitle>
                  <CardDescription>Login patterns and user engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Appointment Analytics</CardTitle>
                  <CardDescription>Booking trends and no-show rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Staff Performance</CardTitle>
                  <CardDescription>Productivity and patient satisfaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Financial Summary</CardTitle>
                  <CardDescription>Revenue and billing analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">System Usage</CardTitle>
                  <CardDescription>Resource utilization and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Compliance Audit</CardTitle>
                  <CardDescription>HIPAA and regulatory compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
