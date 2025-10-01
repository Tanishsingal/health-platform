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
  Edit,
  Plus
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { PatientMedicalHistory } from "@/components/doctor/PatientMedicalHistory"
import { CreatePrescriptionModal } from "@/components/doctor/CreatePrescriptionModal"
import { CreateLabOrderModal } from "@/components/doctor/CreateLabOrderModal"
import { ViewPrescriptionModal } from "@/components/doctor/ViewPrescriptionModal"
import { ViewLabResultsModal } from "@/components/doctor/ViewLabResultsModal"

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
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [showLabOrderModal, setShowLabOrderModal] = useState(false)
  const [viewPrescriptionModal, setViewPrescriptionModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [viewLabResultsModal, setViewLabResultsModal] = useState(false)
  const [selectedLabTest, setSelectedLabTest] = useState<any>(null)
  const [patientData, setPatientData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication using API
        const authResponse = await fetch('/api/auth/me')
        
        if (!authResponse.ok) {
          router.push('/auth/login')
          return
        }
        
        const authData = await authResponse.json()
        
        if (!["doctor", "nurse", "admin"].includes(authData.user.role)) {
          router.push('/auth/login')
          return
        }
        
        setCurrentUser(authData.user)

        // Fetch patient data
        if (params.id) {
          const response = await fetch(`/api/doctor/patient/${params.id}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setPatientData(result.data)
            } else {
              console.error('Failed to fetch patient data:', result.error)
            }
          } else {
            console.error('Failed to fetch patient data: HTTP', response.status)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, params.id])

  const refreshPatientData = async () => {
    // Refresh patient data after creating prescription or lab order
    if (params.id) {
      try {
        const response = await fetch(`/api/doctor/patient/${params.id}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setPatientData(result.data)
          }
        }
      } catch (error) {
        console.error('Failed to refresh patient data:', error)
      }
    }
  }

  const handlePrescriptionSuccess = async () => {
    console.log('Prescription created successfully')
    // Refresh patient data to show new prescription
    await refreshPatientData()
  }

  const handleLabOrderSuccess = async () => {
    console.log('Lab order created successfully')
    // Refresh patient data to show new lab order
    await refreshPatientData()
  }

  if (!currentUser || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    )
  }

  const patient = patientData.patient
  
  // Format patient data to match the expected structure
  const formattedPatient = {
    id: patient.id,
    patientId: patient.medical_record_number || 'N/A',
    profile: {
      firstName: patient.first_name,
      lastName: patient.last_name,
      dateOfBirth: patient.date_of_birth,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address || 'Not provided'
    },
    medicalInfo: {
      bloodGroup: patient.blood_type || 'N/A',
      height: patient.height_cm ? `${patient.height_cm} cm` : 'N/A',
      weight: patient.weight_kg ? `${patient.weight_kg} kg` : 'N/A',
      allergies: patient.allergies || [],
      chronicConditions: patient.chronic_conditions || [],
      emergencyContact: {
        name: patient.emergency_contact_name || 'Not provided',
        relationship: patient.emergency_contact_relationship || 'N/A',
        phone: patient.emergency_contact_phone || 'Not provided'
      }
    },
    appointments: patientData.appointments || [],
    prescriptions: patientData.prescriptions || [],
    labTests: patientData.labTests || [],
    consultations: [] // Consultations not implemented yet
  }

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
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => setShowPrescriptionModal(true)}
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Create Prescription
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowLabOrderModal(true)}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Order Lab Test
                </Button>
              </div>
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
                      {formattedPatient.profile.firstName} {formattedPatient.profile.lastName}
                    </h1>
                    <p className="text-muted-foreground">Patient ID: {formattedPatient.patientId}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{formattedPatient.profile.gender}</span>
                      <span>•</span>
                      <span>Age: {formattedPatient.profile.dateOfBirth ? new Date().getFullYear() - new Date(formattedPatient.profile.dateOfBirth).getFullYear() : 'N/A'}</span>
                      <span>•</span>
                      <span>DOB: {formattedPatient.profile.dateOfBirth ? new Date(formattedPatient.profile.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
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
                    <span className="text-sm">{formattedPatient.profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{formattedPatient.profile.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{formattedPatient.profile.address}</span>
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
                    <span className="text-sm font-medium">{formattedPatient.medicalInfo.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Height:</span>
                    <span className="text-sm font-medium">{formattedPatient.medicalInfo.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <span className="text-sm font-medium">{formattedPatient.medicalInfo.weight}</span>
                  </div>
                  
                  {formattedPatient.medicalInfo.allergies.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Allergies:</p>
                      <div className="flex flex-wrap gap-1">
                        {formattedPatient.medicalInfo.allergies.map((allergy: string, index: number) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {formattedPatient.medicalInfo.chronicConditions.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Chronic Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {formattedPatient.medicalInfo.chronicConditions.map((condition: string, index: number) => (
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
                    <p className="font-medium">{formattedPatient.medicalInfo.emergencyContact.name}</p>
                    <p className="text-sm text-muted-foreground">{formattedPatient.medicalInfo.emergencyContact.relationship}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{formattedPatient.medicalInfo.emergencyContact.phone}</span>
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
                  {PATIENT_DATA.consultations.slice(0, 3).map((consultation) => (
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
                  {formattedPatient.appointments.length > 0 ? (
                    formattedPatient.appointments.map((appointment: any) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{appointment.reason || 'Consultation'}</p>
                            <p className="text-sm text-muted-foreground">{appointment.notes || 'No notes'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                              {new Date(appointment.appointment_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No appointments yet</p>
                  )}
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
                  {PATIENT_DATA.consultations.map((consultation) => (
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
                  {formattedPatient.prescriptions.length > 0 ? (
                    formattedPatient.prescriptions.map((prescription: any) => (
                      <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Pill className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{prescription.dosage}</p>
                            <p className="text-sm text-muted-foreground">{prescription.frequency}</p>
                            <p className="text-xs text-muted-foreground">
                              Duration: {prescription.duration_days ? `${prescription.duration_days} days` : 'N/A'} • Prescribed: {new Date(prescription.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={prescription.status === "pending" ? "secondary" : "default"}>
                            {prescription.status}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedPrescription(prescription)
                              setViewPrescriptionModal(true)
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No prescriptions yet</p>
                  )}
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
                  {formattedPatient.labTests.length > 0 ? (
                    formattedPatient.labTests.map((result: any) => (
                      <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <TestTube className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{result.test_name}</p>
                            <p className="text-sm text-muted-foreground">Type: {result.test_type}</p>
                            <p className="text-xs text-muted-foreground">
                              Ordered: {new Date(result.ordered_date).toLocaleDateString()}
                            </p>
                            {result.completed_date && (
                              <p className="text-xs text-green-600 font-medium">
                                ✓ Completed: {new Date(result.completed_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={result.status === "completed" ? "default" : "secondary"}>
                            {result.status}
                          </Badge>
                          {result.status === "completed" && result.results && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Add patient name to the result object
                                const labTestWithPatient = {
                                  ...result,
                                  patient_name: `${formattedPatient.profile.firstName} ${formattedPatient.profile.lastName}`
                                }
                                setSelectedLabTest(labTestWithPatient)
                                setViewLabResultsModal(true)
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Results
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No lab tests yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <PatientMedicalHistory patientId={formattedPatient.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreatePrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        patientId={formattedPatient.id}
        patientName={`${formattedPatient.profile.firstName} ${formattedPatient.profile.lastName}`}
        onSuccess={handlePrescriptionSuccess}
      />

      <CreateLabOrderModal
        isOpen={showLabOrderModal}
        onClose={() => setShowLabOrderModal(false)}
        patientId={formattedPatient.id}
        patientName={`${formattedPatient.profile.firstName} ${formattedPatient.profile.lastName}`}
        onSuccess={handleLabOrderSuccess}
      />

      <ViewPrescriptionModal
        isOpen={viewPrescriptionModal}
        onClose={() => {
          setViewPrescriptionModal(false)
          setSelectedPrescription(null)
        }}
        prescription={selectedPrescription}
        patientName={`${formattedPatient.profile.firstName} ${formattedPatient.profile.lastName}`}
        doctorName={currentUser?.name || "Dr. [Name]"}
      />

      <ViewLabResultsModal
        isOpen={viewLabResultsModal}
        onClose={() => {
          setViewLabResultsModal(false)
          setSelectedLabTest(null)
        }}
        labTest={selectedLabTest}
      />
    </div>
  )
}
