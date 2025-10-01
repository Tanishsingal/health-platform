"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Calendar, FileText, Activity, Pill, Bell, Plus, X, User, TestTube } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ProfileUpdateModal } from '@/components/patient/ProfileUpdateModal'
import { MedicalHistoryUpload } from '@/components/patient/MedicalHistoryUpload'
import { ViewPrescriptionModal } from '@/components/doctor/ViewPrescriptionModal'
import { ViewLabResultsModal } from '@/components/doctor/ViewLabResultsModal'

export default function PatientDashboardPage() {
  const t = useTranslations('dashboard.patient')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [viewPrescriptionModal, setViewPrescriptionModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [viewLabResultsModal, setViewLabResultsModal] = useState(false)
  const [selectedLabTest, setSelectedLabTest] = useState<any>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showMedicalHistory, setShowMedicalHistory] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
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
        
        if (authData.user.role !== 'patient') {
          router.push('/auth/login')
          return
        }
        
        setCurrentUser(authData.user)

        // Then fetch dashboard data
        const dashboardResponse = await fetch('/api/patient/dashboard')
        
        if (dashboardResponse.ok) {
          const dashboardResult = await dashboardResponse.json()
          if (dashboardResult.success) {
            setDashboardData(dashboardResult.data)
          }
        }
        
        // Fetch notifications
        await fetchNotifications()
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [router])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setNotifications(result.data.notifications)
          setUnreadCount(result.data.unreadCount)
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      if (response.ok) {
        // Refresh notifications
        fetchNotifications()
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
      if (response.ok) {
        // Refresh notifications
        fetchNotifications()
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const refreshDashboard = () => {
    // Reload dashboard data after profile update or document upload
    const fetchData = async () => {
      try {
        const dashboardResponse = await fetch('/api/patient/dashboard')
        
        if (dashboardResponse.ok) {
          const dashboardResult = await dashboardResponse.json()
          if (dashboardResult.success) {
            setDashboardData(dashboardResult.data)
          }
        }
        
        // Also refresh notifications
        fetchNotifications()
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    
    fetchData()
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/auth/login')
    }
  }

  const handleBookAppointment = async () => {
    console.log('📅 Book Appointment clicked!') // Debug log
    
    // Fetch available doctors
    try {
      console.log('🔍 Fetching doctors from /api/doctors/available...') // Debug log
      const response = await fetch('/api/doctors/available')
      console.log('✅ Response status:', response.status) // Debug log
      
      if (response.ok) {
        const result = await response.json()
        console.log('📊 Doctors data:', result) // Debug log
        
        if (result.success) {
          setDoctors(result.data.doctors)
          setShowBookingModal(true)
          console.log('🎉 Modal should be open now') // Debug log
        } else {
          console.error('❌ API returned success:false') // Debug log
          alert('No doctors available at the moment.')
        }
      } else {
        console.error('❌ Response not OK:', response.status) // Debug log
        alert('Failed to load doctors. Please try again.')
      }
    } catch (error) {
      console.error('❌ Failed to fetch doctors:', error)
      alert('Failed to load doctors. Please try again.')
    }
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Combine date and time in IST (Indian Standard Time)
      // Input: date="2025-10-01", time="16:00"
      // Create local date object (browser timezone)
      const localDateTime = new Date(`${bookingForm.appointmentDate}T${bookingForm.appointmentTime}:00`)
      
      // Convert to ISO string (this will be in UTC)
      const appointmentDateTime = localDateTime.toISOString()
      
      console.log('📅 Booking appointment:', {
        date: bookingForm.appointmentDate,
        time: bookingForm.appointmentTime,
        localDateTime: localDateTime.toString(),
        isoString: appointmentDateTime
      })

      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: bookingForm.doctorId,
          appointmentDate: appointmentDateTime,
          reason: bookingForm.reason,
          duration: 30
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Appointment booked successfully!')
        setShowBookingModal(false)
        setBookingForm({ doctorId: '', appointmentDate: '', appointmentTime: '', reason: '' })
        // Refresh dashboard data
        window.location.reload()
      } else {
        alert(result.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Booking failed:', error)
      alert('Failed to book appointment. Please try again.')
    } finally {
      setIsSubmitting(false)
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
  const upcomingAppointments = dashboardData?.upcomingAppointments || []
  const activePrescriptions = dashboardData?.activePrescriptions || []
  const recentRecords = dashboardData?.recentRecords || []

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
                <h1 className="text-xl font-bold text-foreground">{t('title', 'Patient Portal')}</h1>
                <p className="text-xs text-muted-foreground">{t('subtitle', 'Your Healthcare Dashboard')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              
              {/* Notifications Bell */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    <div className="divide-y">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-accent cursor-pointer ${
                              !notification.is_read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              if (!notification.is_read) {
                                markAsRead(notification.id)
                              }
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                !notification.is_read ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Badge variant="secondary" className="capitalize">
                {currentUser.email}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t('logout', 'Logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t('welcome', 'Welcome back')}, {profile.first_name || 'Patient'}!
          </h1>
          <p className="text-muted-foreground">
            {profile.medical_record_number ? `MRN: ${profile.medical_record_number} • ` : ''}
            {t('healthOverview', "Here's your health overview")}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('upcomingAppointments', 'Upcoming Appointments')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingAppointments[0]
                  ? `${t('next', 'Next')}: ${new Date(upcomingAppointments[0].appointment_date).toLocaleDateString()}`
                  : t('noUpcomingAppointments', 'No upcoming appointments')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('medicalRecords', 'Medical Records')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentRecords.length}</div>
              <p className="text-xs text-muted-foreground">
                {recentRecords[0]
                  ? `${t('lastVisit', 'Last visit')}: ${new Date(recentRecords[0].visit_date).toLocaleDateString()}`
                  : t('noRecentVisits', 'No recent visits')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('activePrescriptions', 'Active Prescriptions')}</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePrescriptions.length}</div>
              <p className="text-xs text-muted-foreground">{t('currentMedications', 'Current medications')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('healthStatus', 'Health Status')}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{t('statusGood', 'Good')}</div>
              <p className="text-xs text-muted-foreground">{t('overallHealth', 'Overall health')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled medical appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment: any) => (
                      <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.reason || "General consultation"}
                          </p>
                          <p className="text-xs text-muted-foreground">{appointment.specialization}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.appointment_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                    <Button onClick={handleBookAppointment}>
                      <Plus className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Prescriptions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Active Prescriptions</CardTitle>
                <CardDescription>Your current medications</CardDescription>
              </CardHeader>
              <CardContent>
                {activePrescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {activePrescriptions.map((prescription: any) => (
                      <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-3">
                          <Pill className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">{prescription.dosage}</p>
                            <p className="text-sm text-muted-foreground">
                              {prescription.frequency}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={prescription.status === 'filled' ? 'default' : 'secondary'}>
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
                            <FileText className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Pill className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No active prescriptions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lab Results */}
            <Card>
              <CardHeader>
                <CardTitle>Lab Test Results</CardTitle>
                <CardDescription>Your recent lab tests and results</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.labTests && dashboardData.labTests.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.labTests.map((test: any) => (
                      <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{test.test_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Ordered: {new Date(test.ordered_date).toLocaleDateString()}
                            </p>
                            {test.doctor_first_name && (
                              <p className="text-xs text-muted-foreground">
                                By: Dr. {test.doctor_first_name} {test.doctor_last_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              test.status === 'completed' ? 'default' : 
                              test.status === 'in_progress' ? 'secondary' : 
                              'outline'
                            }
                          >
                            {test.status}
                          </Badge>
                          {test.status === 'completed' && test.results && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const labTestWithPatient = {
                                  ...test,
                                  patient_name: `${dashboardData.profile.first_name} ${dashboardData.profile.last_name}`
                                }
                                setSelectedLabTest(labTestWithPatient)
                                setViewLabResultsModal(true)
                              }}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View Results
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                    <p className="text-muted-foreground text-sm">No lab tests yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Health Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-transparent" 
                  variant="outline"
                  onClick={handleBookAppointment}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
                <Button 
                  className="w-full justify-start bg-transparent" 
                  variant="outline"
                  onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {showMedicalHistory ? 'Hide' : 'View'} Medical Records
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Pill className="w-4 h-4 mr-2" />
                  My Prescriptions
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Lab Results
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.blood_type && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Blood Type:</span>
                    <span className="text-sm font-medium">{profile.blood_type}</span>
                  </div>
                )}
                {profile.height_cm && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Height:</span>
                    <span className="text-sm font-medium">{profile.height_cm} cm</span>
                  </div>
                )}
                {profile.weight_kg && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <span className="text-sm font-medium">{profile.weight_kg} kg</span>
                  </div>
                )}

                {profile.allergies && profile.allergies.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Allergies:</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.allergies.slice(0, 3).map((allergy: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-transparent"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medical History Upload Section */}
        {showMedicalHistory && (
          <div className="mt-6">
            <MedicalHistoryUpload onDocumentsChange={refreshDashboard} />
          </div>
        )}
      </div>

      {/* Profile Update Modal */}
      <ProfileUpdateModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdate={refreshDashboard}
        currentProfile={profile}
      />

      {/* View Prescription Modal */}
      <ViewPrescriptionModal
        isOpen={viewPrescriptionModal}
        onClose={() => {
          setViewPrescriptionModal(false)
          setSelectedPrescription(null)
        }}
        prescription={selectedPrescription}
        patientName={profile ? `${profile.first_name} ${profile.last_name}` : "Patient"}
        doctorName="Your Doctor"
      />

      {/* View Lab Results Modal */}
      <ViewLabResultsModal
        isOpen={viewLabResultsModal}
        onClose={() => {
          setViewLabResultsModal(false)
          setSelectedLabTest(null)
        }}
        labTest={selectedLabTest}
      />

      {/* Appointment Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Book Appointment</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitBooking} className="space-y-4">
                {/* Doctor Selection */}
                <div>
                  <Label htmlFor="doctor">Select Doctor</Label>
                  <Select
                    value={bookingForm.doctorId}
                    onValueChange={(value) => setBookingForm({ ...bookingForm, doctorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div>
                  <Label htmlFor="appointmentDate">Date</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={bookingForm.appointmentDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <Label htmlFor="appointmentTime">Time</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={bookingForm.appointmentTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointmentTime: e.target.value })}
                    required
                  />
                </div>

                {/* Reason */}
                <div>
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    placeholder="Describe your symptoms or reason for visit"
                    rows={4}
                    required
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !bookingForm.doctorId || !bookingForm.appointmentDate || !bookingForm.appointmentTime || !bookingForm.reason}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
