'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  FileText,
  Pill,
  TestTube,
  Heart,
  User,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Download,
  Video,
  Bell,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { patientApi } from '@/lib/api/client';
import type { 
  PatientDashboardData, 
  Appointment, 
  Prescription, 
  Consultation, 
  LabOrder,
  Patient
} from '@/lib/types/healthcare';

interface PatientDashboardProps {
  patient: Patient;
}

export default function PatientDashboard({ patient }: PatientDashboardProps) {
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [patient.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await patientApi.getPatientDashboard(patient.id);
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
        <Button onClick={loadDashboardData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {patient.profile?.firstName}!
            </h1>
            <p className="text-blue-100 mt-2">
              Patient ID: {patient.patientId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Last visit</p>
            <p className="text-lg font-semibold">
              {dashboardData.healthSummary.lastVisit 
                ? format(new Date(dashboardData.healthSummary.lastVisit), 'MMM dd, yyyy')
                : 'No visits yet'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button className="h-20 flex flex-col items-center justify-center space-y-2">
          <Calendar className="h-6 w-6" />
          <span>Book Appointment</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
          <Video className="h-6 w-6" />
          <span>Telemedicine</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
          <TestTube className="h-6 w-6" />
          <span>Lab Results</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
          <Pill className="h-6 w-6" />
          <span>Prescriptions</span>
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medical-history">Medical History</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.upcomingAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No upcoming appointments
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            Dr. {appointment.doctor?.profile?.firstName} {appointment.doctor?.profile?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.doctor?.specialization}
                          </p>
                          <p className="text-sm text-blue-600">
                            {format(new Date(appointment.scheduledAt), 'MMM dd, yyyy - h:mm a')}
                          </p>
                        </div>
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vital Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {patient.bloodGroup || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Blood Group</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {patient.heightCm || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Height (cm)</p>
                  </div>
                </div>

                {/* Chronic Conditions */}
                {dashboardData.healthSummary.chronicConditions.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Chronic Conditions:</p>
                    <div className="flex flex-wrap gap-2">
                      {dashboardData.healthSummary.chronicConditions.map((condition, index) => (
                        <Badge key={index} variant="outline">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {dashboardData.healthSummary.allergies.length > 0 && (
                  <div>
                    <p className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Allergies:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dashboardData.healthSummary.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentConsultations.slice(0, 3).map((consultation) => (
                    <div key={consultation.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          Consultation with Dr. {consultation.doctor?.profile?.firstName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(consultation.createdAt), 'MMM dd, yyyy')}
                        </p>
                        {consultation.diagnosis && consultation.diagnosis.length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            {consultation.diagnosis[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Prescriptions & Lab Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Active Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.activePrescriptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No active prescriptions
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.activePrescriptions.slice(0, 3).map((prescription) => (
                      <div key={prescription.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            Prescription #{prescription.prescriptionNumber}
                          </p>
                          <Badge variant={prescription.isDispensed ? 'default' : 'secondary'}>
                            {prescription.isDispensed ? 'Dispensed' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {prescription.medications.slice(0, 2).map((medication) => (
                            <div key={medication.id} className="text-sm">
                              <span className="font-medium">{medication.medicationName}</span>
                              <span className="text-gray-500 ml-2">
                                {medication.dosage} - {medication.frequency}
                              </span>
                            </div>
                          ))}
                          {prescription.medications.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{prescription.medications.length - 2} more medications
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Lab Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Lab Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.pendingLabResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No pending lab results
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.pendingLabResults.slice(0, 3).map((labOrder) => (
                      <div key={labOrder.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            Order #{labOrder.orderNumber}
                          </p>
                          <Badge variant={
                            labOrder.status === 'completed' ? 'default' :
                            labOrder.status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {labOrder.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {labOrder.tests.length} test(s) ordered
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(labOrder.createdAt), 'MMM dd, yyyy')}
                        </p>
                        {labOrder.status === 'completed' && (
                          <Button size="sm" variant="outline" className="mt-2">
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <AppointmentsSection patient={patient} />
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical-history">
          <MedicalHistorySection patient={patient} />
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions">
          <PrescriptionsSection patient={patient} />
        </TabsContent>

        {/* Lab Results Tab */}
        <TabsContent value="lab-results">
          <LabResultsSection patient={patient} />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <ProfileSection patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Placeholder components for different sections
function AppointmentsSection({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
        <CardDescription>Manage your appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Appointments section - to be implemented</p>
      </CardContent>
    </Card>
  );
}

function MedicalHistorySection({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical History</CardTitle>
        <CardDescription>Your complete medical history</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Medical history section - to be implemented</p>
      </CardContent>
    </Card>
  );
}

function PrescriptionsSection({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescriptions</CardTitle>
        <CardDescription>Your prescription history</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Prescriptions section - to be implemented</p>
      </CardContent>
    </Card>
  );
}

function LabResultsSection({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Results</CardTitle>
        <CardDescription>Your lab test results</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Lab results section - to be implemented</p>
      </CardContent>
    </Card>
  );
}

function ProfileSection({ patient }: { patient: Patient }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <p className="text-lg">{patient.profile?.firstName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <p className="text-lg">{patient.profile?.lastName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Date of Birth</label>
              <p className="text-lg">
                {patient.profile?.dateOfBirth 
                  ? format(new Date(patient.profile.dateOfBirth), 'MMM dd, yyyy')
                  : 'Not provided'
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Blood Group</label>
              <p className="text-lg">{patient.bloodGroup || 'Not provided'}</p>
            </div>
          </div>
          <Button>Edit Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Contact Name</label>
              <p className="text-lg">{patient.emergencyContactName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Contact Phone</label>
              <p className="text-lg">{patient.emergencyContactPhone || 'Not provided'}</p>
            </div>
          </div>
          <Button variant="outline">Update Emergency Contact</Button>
        </CardContent>
      </Card>
    </div>
  );
} 