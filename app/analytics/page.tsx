"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import {
  TrendingUp,
  Users,
  Calendar,
  Activity,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Download,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Mock data for analytics
const ANALYTICS_DATA = {
  stats: {
    totalPatients: 1245,
    totalStaff: 87,
    totalAppointments: 3456,
    totalPrescriptions: 2134
  },
  appointmentStatusData: [
    { status: "confirmed", count: 156 },
    { status: "scheduled", count: 89 },
    { status: "completed", count: 234 },
    { status: "cancelled", count: 23 }
  ],
  monthlyAppointmentData: [
    { month: "Jan 2024", appointments: 245 },
    { month: "Feb 2024", appointments: 289 },
    { month: "Mar 2024", appointments: 267 },
    { month: "Apr 2024", appointments: 324 },
    { month: "May 2024", appointments: 298 },
    { month: "Jun 2024", appointments: 356 }
  ],
  userRoleData: [
    { role: "patient", count: 856 },
    { role: "doctor", count: 45 },
    { role: "nurse", count: 28 },
    { role: "admin", count: 12 },
    { role: "pharmacist", count: 8 }
  ]
}

export default function AnalyticsDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const user = localStorage.getItem('currentUser')
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    const userData = JSON.parse(user)
    if (!["admin", "doctor"].includes(userData.role)) {
      router.push('/auth/login')
      return
    }
    
    setCurrentUser(userData)
  }, [router])

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    router.push('/auth/login')
  }

  // Sample data for additional charts
  const departmentPerformanceData = [
    { department: "Cardiology", patients: 145, satisfaction: 4.8 },
    { department: "Orthopedics", patients: 132, satisfaction: 4.6 },
    { department: "Pediatrics", patients: 98, satisfaction: 4.9 },
    { department: "Emergency", patients: 234, satisfaction: 4.2 },
    { department: "Internal Medicine", patients: 187, satisfaction: 4.7 },
  ]

  const revenueData = [
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 35000 },
    { month: "Mar", revenue: 48000, expenses: 33000 },
    { month: "Apr", revenue: 61000, expenses: 38000 },
    { month: "May", revenue: 55000, expenses: 36000 },
    { month: "Jun", revenue: 67000, expenses: 41000 },
  ]

  const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Analytics Dashboard</h1>
                <p className="text-xs text-muted-foreground">Healthcare Insights & Metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue="30days">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Badge variant="secondary" className="capitalize">
                {currentUser.role}
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
          <h1 className="text-3xl font-bold mb-2">Healthcare Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your healthcare operations</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ANALYTICS_DATA.stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ANALYTICS_DATA.stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ANALYTICS_DATA.stats.totalStaff}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">+2</span> new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ANALYTICS_DATA.stats.totalPrescriptions}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Appointments Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Trends</CardTitle>
                  <CardDescription>Monthly appointment volume over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={ANALYTICS_DATA.monthlyAppointmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="appointments" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ANALYTICS_DATA.userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ role, percent }: any) => `${role} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {ANALYTICS_DATA.userRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Patient volume and satisfaction by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="patients" fill="#8b5cf6" name="Patients" />
                    <Bar yAxisId="right" dataKey="satisfaction" fill="#06b6d4" name="Satisfaction" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointment Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Status</CardTitle>
                  <CardDescription>Current status of all appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ANALYTICS_DATA.appointmentStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percent }: any) => `${status} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {ANALYTICS_DATA.appointmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Appointment Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Completion Rate</span>
                    </div>
                    <span className="font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Average Wait Time</span>
                    </div>
                    <span className="font-bold text-blue-600">12 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">No-Show Rate</span>
                    </div>
                    <span className="font-bold text-yellow-600">5.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm">Satisfaction Score</span>
                    </div>
                    <span className="font-bold text-primary">4.7/5</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Appointment Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Appointment Volume</CardTitle>
                <CardDescription>Appointments scheduled per day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { day: "Mon", appointments: 45 },
                      { day: "Tue", appointments: 52 },
                      { day: "Wed", appointments: 48 },
                      { day: "Thu", appointments: 61 },
                      { day: "Fri", appointments: 55 },
                      { day: "Sat", appointments: 23 },
                      { day: "Sun", appointments: 12 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient Age Distribution</CardTitle>
                  <CardDescription>Breakdown of patients by age group</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { ageGroup: "0-18", patients: 145 },
                        { ageGroup: "19-35", patients: 234 },
                        { ageGroup: "36-50", patients: 187 },
                        { ageGroup: "51-65", patients: 156 },
                        { ageGroup: "65+", patients: 98 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="ageGroup" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="patients" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Patient Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient Registration Growth</CardTitle>
                  <CardDescription>New patient registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={[
                        { month: "Jan", newPatients: 23 },
                        { month: "Feb", newPatients: 34 },
                        { month: "Mar", newPatients: 28 },
                        { month: "Apr", newPatients: 45 },
                        { month: "May", newPatients: 38 },
                        { month: "Jun", newPatients: 52 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="newPatients" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Most Common Conditions</CardTitle>
                <CardDescription>Frequently diagnosed conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { condition: "Hypertension", count: 234, percentage: 28 },
                    { condition: "Diabetes Type 2", count: 187, percentage: 22 },
                    { condition: "Anxiety Disorders", count: 156, percentage: 19 },
                    { condition: "Asthma", count: 134, percentage: 16 },
                    { condition: "Depression", count: 98, percentage: 12 },
                  ].map((item) => (
                    <div key={item.condition} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.condition}</span>
                          <span className="text-sm text-muted-foreground">{item.count} patients</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            {/* Revenue vs Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Financial KPIs */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial KPIs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="font-bold text-green-600">$328,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Expenses</span>
                    <span className="font-bold text-red-600">$215,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Net Profit</span>
                    <span className="font-bold text-primary">$113,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Profit Margin</span>
                    <span className="font-bold">34.5%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Consultations", value: 45 },
                          { name: "Procedures", value: 30 },
                          { name: "Pharmacy", value: 15 },
                          { name: "Lab Tests", value: 10 },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Insurance</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cash/Card</span>
                    <span className="font-medium">22%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Plans</span>
                    <span className="font-medium">8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Other</span>
                    <span className="font-medium">2%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Staff Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Staff Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentPerformanceData.map((dept) => (
                      <div key={dept.department} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{dept.department}</span>
                          <span className="text-sm text-muted-foreground">
                            {dept.patients} patients • {dept.satisfaction}/5 rating
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(dept.satisfaction / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Technical metrics and uptime</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">System Uptime</span>
                    <span className="font-bold text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Response Time</span>
                    <span className="font-bold">142ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="font-bold">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Error Rate</span>
                    <span className="font-bold text-green-600">0.01%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Data Backup Status</span>
                    <span className="font-bold text-green-600">Current</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Healthcare quality indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">96.2%</div>
                    <p className="text-sm text-muted-foreground">Patient Satisfaction</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">98.5%</div>
                    <p className="text-sm text-muted-foreground">Treatment Success Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">2.1%</div>
                    <p className="text-sm text-muted-foreground">Readmission Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
