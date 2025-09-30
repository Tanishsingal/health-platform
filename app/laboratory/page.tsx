"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { TestTube, Clock, CheckCircle, AlertTriangle, Microscope, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LaboratoryPage() {
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
        
        if (data.user.role !== 'lab_technician') {
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

  // Mock data for laboratory system
  const pendingTests = [
    {
      id: 1,
      patient: "John Smith",
      test: "Complete Blood Count",
      priority: "High",
      ordered: "2024-01-15 09:30",
      doctor: "Dr. Johnson",
    },
    {
      id: 2,
      patient: "Sarah Wilson",
      test: "Lipid Panel",
      priority: "Normal",
      ordered: "2024-01-15 10:15",
      doctor: "Dr. Brown",
    },
    {
      id: 3,
      patient: "Mike Davis",
      test: "Thyroid Function",
      priority: "Urgent",
      ordered: "2024-01-15 11:00",
      doctor: "Dr. Smith",
    },
  ]

  const inProgressTests = [
    {
      id: 4,
      patient: "Emma Johnson",
      test: "Liver Function",
      priority: "Normal",
      started: "2024-01-15 08:00",
      estimated: "14:00",
    },
    {
      id: 5,
      patient: "David Brown",
      test: "Glucose Test",
      priority: "High",
      started: "2024-01-15 09:00",
      estimated: "15:30",
    },
  ]

  const completedTests = [
    {
      id: 6,
      patient: "Lisa Anderson",
      test: "Urinalysis",
      completed: "2024-01-14 16:30",
      result: "Normal",
      doctor: "Dr. Wilson",
    },
    {
      id: 7,
      patient: "Tom Wilson",
      test: "Blood Chemistry",
      completed: "2024-01-14 15:45",
      result: "Abnormal",
      doctor: "Dr. Johnson",
    },
  ]

  const equipment = [
    {
      id: 1,
      name: "Hematology Analyzer",
      status: "Online",
      lastMaintenance: "2024-01-10",
      nextMaintenance: "2024-02-10",
    },
    {
      id: 2,
      name: "Chemistry Analyzer",
      status: "Online",
      lastMaintenance: "2024-01-08",
      nextMaintenance: "2024-02-08",
    },
    {
      id: 3,
      name: "Microscope Station 1",
      status: "Maintenance",
      lastMaintenance: "2024-01-12",
      nextMaintenance: "2024-02-12",
    },
    { id: 4, name: "Centrifuge", status: "Online", lastMaintenance: "2024-01-05", nextMaintenance: "2024-02-05" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laboratory Management</h1>
            <p className="text-gray-600 mt-1">Manage test orders, results, and equipment</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <TestTube className="w-4 h-4 mr-2" />
              {currentUser.name}
            </Badge>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Tests</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingTests.length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{inProgressTests.length}</p>
                </div>
                <TestTube className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{completedTests.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Equipment Issues</p>
                  <p className="text-2xl font-bold text-red-600">1</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tests">Test Management</TabsTrigger>
            <TabsTrigger value="results">Results Entry</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="quality">Quality Control</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Pending Tests
                  </CardTitle>
                  <CardDescription>Tests waiting to be processed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingTests.map((test) => (
                    <div key={test.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{test.patient}</h4>
                        <Badge
                          variant={
                            test.priority === "Urgent"
                              ? "destructive"
                              : test.priority === "High"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {test.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{test.test}</p>
                      <p className="text-xs text-gray-500">Ordered: {test.ordered}</p>
                      <p className="text-xs text-gray-500">Doctor: {test.doctor}</p>
                      <Button size="sm" className="w-full">
                        Start Test
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* In Progress Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-blue-600" />
                    In Progress
                  </CardTitle>
                  <CardDescription>Currently running tests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inProgressTests.map((test) => (
                    <div key={test.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{test.patient}</h4>
                        <Badge variant="outline">In Progress</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{test.test}</p>
                      <p className="text-xs text-gray-500">Started: {test.started}</p>
                      <p className="text-xs text-gray-500">Est. Complete: {test.estimated}</p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        View Details
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Completed Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Completed
                  </CardTitle>
                  <CardDescription>Recently completed tests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {completedTests.map((test) => (
                    <div key={test.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{test.patient}</h4>
                        <Badge variant={test.result === "Normal" ? "default" : "destructive"}>{test.result}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{test.test}</p>
                      <p className="text-xs text-gray-500">Completed: {test.completed}</p>
                      <p className="text-xs text-gray-500">Doctor: {test.doctor}</p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        Send Results
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enter Test Results</CardTitle>
                <CardDescription>Input and validate test results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="test-id">Test ID</Label>
                      <Input id="test-id" placeholder="Enter test ID" />
                    </div>
                    <div>
                      <Label htmlFor="test-type">Test Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blood">Blood Test</SelectItem>
                          <SelectItem value="urine">Urine Test</SelectItem>
                          <SelectItem value="chemistry">Blood Chemistry</SelectItem>
                          <SelectItem value="hematology">Hematology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="result-status">Result Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="abnormal">Abnormal</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="results">Test Results</Label>
                      <Textarea id="results" placeholder="Enter detailed test results..." className="min-h-32" />
                    </div>
                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea id="notes" placeholder="Any additional observations or notes..." />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-4">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Submit Results</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="w-5 h-5" />
                  Equipment Status
                </CardTitle>
                <CardDescription>Monitor and manage laboratory equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Last Maintenance: {item.lastMaintenance}</p>
                        <p className="text-sm text-gray-600">Next Maintenance: {item.nextMaintenance}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={item.status === "Online" ? "default" : "destructive"}>{item.status}</Badge>
                        <Button size="sm" variant="outline">
                          {item.status === "Online" ? "Schedule Maintenance" : "Report Issue"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Control</CardTitle>
                <CardDescription>Monitor quality control measures and standards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Daily QC Checks</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">Calibration Check</span>
                        <Badge variant="default">Completed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">Control Samples</span>
                        <Badge variant="default">Completed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">Temperature Log</span>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Quality Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Accuracy Rate</span>
                        <span className="text-sm font-medium">99.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Turnaround Time</span>
                        <span className="text-sm font-medium">2.3 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Error Rate</span>
                        <span className="text-sm font-medium">0.8%</span>
                      </div>
                    </div>
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
