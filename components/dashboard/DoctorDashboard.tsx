'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Clock,
  Users,
  FileText,
  TestTube,
  Pill,
  Search,
  Phone,
  Video,
  AlertCircle,
  TrendingUp,
  Activity,
  Stethoscope,
  ClipboardList,
  UserCheck,
  Bell,
  Filter
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { staffApi, appointmentApi, patientApi } from '@/lib/api/client';
import type { 
  DoctorDashboardData,
  Doctor,
  Appointment,
  Patient,
  Consultation,
  LabOrder
} from '@/lib/types/healthcare';

interface DoctorDashboardProps {
  doctor: Doctor;
}

export default function DoctorDashboard({ doctor }: DoctorDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DoctorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [doctor.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getDoctorDashboard(doctor.id);
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

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'scheduled': return 'secondary';
      case 'in_progress': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const getTimeStatus = (scheduledAt: Date) => {
    const appointmentDate = new Date(scheduledAt);
    if (isToday(appointmentDate)) return 'Today';
    if (isTomorrow(appointmentDate)) return 'Tomorrow';
    return format(appointmentDate, 'MMM dd');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Good morning, Dr. {doctor.profile?.lastName}!
            </h1>
            <p className="text-green-100 mt-2">
              {doctor.specialization} • {doctor.department}
            </p>
          </div>
          <div className="text-right space-y-2">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-sm text-green-100">Today's Appointments</p>
              <p className="text-2xl font-bold">
                {dashboardData.todaysAppointments.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.patientStats.totalPatients}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.patientStats.newPatientsThisMonth}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultations Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData.patientStats.consultationsToday}
                </p>
              </div>
              <Stethoscope className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Results</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData.pendingLabResults.length}
                </p>
              </div>
              <TestTube className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Button className="h-16 flex flex-col items-center justify-center space-y-1">
          <ClipboardList className="h-5 w-5" />
          <span className="text-xs">New Consultation</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Schedule</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
          <TestTube className="h-5 w-5" />
          <span className="text-xs">Lab Orders</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
          <Pill className="h-5 w-5" />
          <span className="text-xs">Prescriptions</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
          <Video className="h-5 w-5" />
          <span className="text-xs">Telemedicine</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
          <Users className="h-5 w-5" />
          <span className="text-xs">Patients</span>
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Appointments
                </CardTitle>
                <CardDescription>
                  {format(new Date(), 'EEEE, MMMM dd, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.todaysAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No appointments scheduled for today
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.todaysAppointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.upcomingAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No upcoming appointments
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.upcomingAppointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">
                            {appointment.patient?.profile?.firstName} {appointment.patient?.profile?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.reasonForVisit || appointment.appointmentType}
                          </p>
                          <p className="text-sm text-blue-600">
                            {getTimeStatus(appointment.scheduledAt)} • {format(new Date(appointment.scheduledAt), 'h:mm a')}
                          </p>
                        </div>
                        <Badge variant={getAppointmentStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Search</CardTitle>
              <CardDescription>Find and manage your patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search patients by name, ID, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <PatientSearchResults searchQuery={searchQuery} doctorId={doctor.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.recentConsultations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No recent consultations
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentConsultations.map((consultation) => (
                    <ConsultationCard key={consultation.id} consultation={consultation} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Results Tab */}
        <TabsContent value="lab-results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Pending Lab Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.pendingLabResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No pending lab results
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.pendingLabResults.map((labOrder) => (
                    <LabOrderCard key={labOrder.id} labOrder={labOrder} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <ScheduleSection doctor={doctor} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium">
            {appointment.patient?.profile?.firstName} {appointment.patient?.profile?.lastName}
          </p>
          {appointment.appointmentType === 'telemedicine' && (
            <Video className="h-4 w-4 text-blue-500" />
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1">
          {appointment.reasonForVisit || appointment.appointmentType}
        </p>
        <p className="text-sm font-medium text-blue-600">
          {format(new Date(appointment.scheduledAt), 'h:mm a')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline">
            <Phone className="h-4 w-4" />
          </Button>
          {appointment.appointmentType === 'telemedicine' && (
            <Button size="sm" variant="outline">
              <Video className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm">
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}

// Consultation Card Component
function ConsultationCard({ consultation }: { consultation: Consultation }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">
          {consultation.patient?.profile?.firstName} {consultation.patient?.profile?.lastName}
        </p>
        <p className="text-sm text-gray-500">
          {format(new Date(consultation.createdAt), 'MMM dd, yyyy')}
        </p>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        Chief Complaint: {consultation.chiefComplaint || 'Not specified'}
      </p>
      {consultation.diagnosis && consultation.diagnosis.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {consultation.diagnosis.map((diagnosis, index) => (
            <Badge key={index} variant="outline">
              {diagnosis}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Lab Order Card Component
function LabOrderCard({ labOrder }: { labOrder: LabOrder }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">
          {labOrder.patient?.profile?.firstName} {labOrder.patient?.profile?.lastName}
        </p>
        <Badge variant={labOrder.status === 'completed' ? 'default' : 'secondary'}>
          {labOrder.status.replace('_', ' ')}
        </Badge>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        Order #{labOrder.orderNumber} • {labOrder.tests.length} test(s)
      </p>
      <p className="text-sm text-gray-500">
        Ordered: {format(new Date(labOrder.createdAt), 'MMM dd, yyyy')}
      </p>
      {labOrder.urgent && (
        <div className="flex items-center gap-1 mt-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600 font-medium">Urgent</span>
        </div>
      )}
    </div>
  );
}

// Patient Search Results Component
function PatientSearchResults({ searchQuery, doctorId }: { searchQuery: string; doctorId: string }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchPatients();
    } else {
      setPatients([]);
    }
  }, [searchQuery]);

  const searchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientApi.searchPatients({
        name: searchQuery,
        limit: 10
      });
      if (response.success && response.data) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Patient search error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Searching...</div>;
  }

  if (searchQuery.length < 2) {
    return (
      <div className="text-center py-8 text-gray-500">
        Enter at least 2 characters to search for patients
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No patients found matching your search
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patients.map((patient) => (
        <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">
              {patient.profile?.firstName} {patient.profile?.lastName}
            </p>
            <p className="text-sm text-gray-500">
              Patient ID: {patient.patientId}
            </p>
            <p className="text-sm text-gray-500">
              {patient.profile?.dateOfBirth && (
                `Age: ${new Date().getFullYear() - new Date(patient.profile.dateOfBirth).getFullYear()}`
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              View History
            </Button>
            <Button size="sm">
              New Consultation
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Schedule Section Component
function ScheduleSection({ doctor }: { doctor: Doctor }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>Manage your availability and working hours</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-center py-8">
          Schedule management - to be implemented
        </p>
      </CardContent>
    </Card>
  );
} 