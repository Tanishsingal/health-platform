"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Heart, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Pill, 
  TestTube, 
  AlertTriangle,
  User,
  Edit
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

// Mock patient data
const PATIENT_DATA = {
  id: "1",
  patientId: "MRN-12345",
  profile: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1985-06-15",
    gender: "Male",
    phone: "+1-555-0123",
    email: "john.doe@email.com",
    address: "123 Main St, City, State 12345"
  },
  medicalInfo: {
    bloodGroup: "O+",
    height: "175 cm",
    weight: "70 kg",
    allergies: ["Penicillin", "Shellfish"],
    chronicConditions: ["Hypertension"],
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1-555-0124"
    }
  },
  appointments: [
    {
      id: 1,
      date: "2024-01-20T09:00:00Z",
      type: "Follow-up",
      status: "Scheduled",
      reason: "Blood pressure check"
    },
    {
      id: 2,
      date: "2024-01-10T14:30:00Z",
      type: "Consultation",
      status: "Completed",
      reason: "Annual physical"
    }
  ],
  consultations: [
    {
      id: 1,
      date: "2024-01-10T14:30:00Z",
      chiefComplaint: "Routine check-up",
      diagnosis: ["Essential hypertension"],
      treatment: "Continue current medication, lifestyle modifications",
      notes: "Patient feeling well, BP controlled"
    }
  ],
  prescriptions: [
    {
      id: 1,
      medication: "Lisinopril 10mg",
      dosage: "Once daily",
      duration: "30 days",
      status: "Active",
      prescribedDate: "2024-01-10"
    }
  ],
  labResults: [
    {
      id: 1,
      testName: "Complete Blood Count",
      date: "2024-01-08",
      status: "Completed",
      results: "Normal"
    }
  ]
}

export default function PatientDetailPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Check authentication
    const user = localStorage.getItem('currentUser')
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    const userData = JSON.parse(user)
    if (!["doctor", "nurse", "admin"].includes(userData.role)) {
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

  const patient = PATIENT_DATA

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/doctor" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Patient Details</h1>
                  <p className="text-xs text-muted-foreground">Medical Record Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Record
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Patient Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {patient.profile.firstName} {patient.profile.lastName}
                    </h1>
                    <p className="text-muted-foreground">Patient ID: {patient.patientId}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{patient.profile.gender}</span>
                      <span>•</span>
                      <span>Age: {new Date().getFullYear() - new Date(patient.profile.dateOfBirth).getFullYear()}</span>
                      <span>•</span>
                      <span>DOB: {new Date(patient.profile.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="default" className="mb-2">Active Patient</Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{patient.profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{patient.profile.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{patient.profile.address}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Blood Group:</span>
                    <span className="text-sm font-medium">{patient.medicalInfo.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Height:</span>
                    <span className="text-sm font-medium">{patient.medicalInfo.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <span className="text-sm font-medium">{patient.medicalInfo.weight}</span>
                  </div>
                  
                  {patient.medicalInfo.allergies.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Allergies:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.medicalInfo.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {patient.medicalInfo.chronicConditions.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Chronic Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.medicalInfo.chronicConditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{patient.medicalInfo.emergencyContact.name}</p>
                    <p className="text-sm text-muted-foreground">{patient.medicalInfo.emergencyContact.relationship}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{patient.medicalInfo.emergencyContact.phone}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest medical events and appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.consultations.slice(0, 3).map((consultation) => (
                    <div key={consultation.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Consultation</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(consultation.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {consultation.chiefComplaint}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>All scheduled and completed appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.type}</p>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(appointment.date).toLocaleDateString()} at{" "}
                            {new Date(appointment.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={appointment.status === "Completed" ? "default" : "secondary"}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultations">
            <Card>
              <CardHeader>
                <CardTitle>Consultation History</CardTitle>
                <CardDescription>Detailed consultation records and notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {patient.consultations.map((consultation) => (
                    <div key={consultation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Consultation - {new Date(consultation.date).toLocaleDateString()}</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Chief Complaint:</p>
                          <p className="text-sm text-muted-foreground">{consultation.chiefComplaint}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Diagnosis:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {consultation.diagnosis.map((diagnosis, index) => (
                              <Badge key={index} variant="outline">
                                {diagnosis}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Treatment:</p>
                          <p className="text-sm text-muted-foreground">{consultation.treatment}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-sm text-muted-foreground">{consultation.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Prescription History</CardTitle>
                <CardDescription>Current and past prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Pill className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{prescription.medication}</p>
                          <p className="text-sm text-muted-foreground">{prescription.dosage}</p>
                          <p className="text-xs text-muted-foreground">
                            Duration: {prescription.duration} • Prescribed: {prescription.prescribedDate}
                          </p>
                        </div>
                      </div>
                      <Badge variant={prescription.status === "Active" ? "default" : "secondary"}>
                        {prescription.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab-results">
            <Card>
              <CardHeader>
                <CardTitle>Laboratory Results</CardTitle>
                <CardDescription>Test results and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.labResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <TestTube className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{result.testName}</p>
                          <p className="text-sm text-muted-foreground">Date: {result.date}</p>
                          <p className="text-xs text-muted-foreground">Results: {result.results}</p>
                        </div>
                      </div>
                      <Badge variant={result.status === "Completed" ? "default" : "secondary"}>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents & Reports</CardTitle>
                <CardDescription>Medical documents and uploaded files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>No documents uploaded yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
