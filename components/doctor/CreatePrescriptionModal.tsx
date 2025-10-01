"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, Trash2, Loader2, Pill, Activity, Stethoscope, ClipboardList, Utensils, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Medication {
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface CreatePrescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  onSuccess: () => void
}

export function CreatePrescriptionModal({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName,
  onSuccess 
}: CreatePrescriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Clinical Information
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: '',
    temperature: '',
    pulse: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: ''
  })
  const [examinationFindings, setExaminationFindings] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  
  // Medications
  const [medications, setMedications] = useState<Medication[]>([
    {
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }
  ])
  
  // Additional Instructions
  const [dietInstructions, setDietInstructions] = useState('')
  const [activityInstructions, setActivityInstructions] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpInstructions, setFollowUpInstructions] = useState('')
  const [generalInstructions, setGeneralInstructions] = useState('')

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications]
    updated[index][field] = value
    setMedications(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Compile complete prescription data
      const prescriptionData = {
        patient_id: patientId,
        chief_complaint: chiefComplaint,
        vital_signs: vitalSigns,
        examination_findings: examinationFindings,
        diagnosis: diagnosis,
        medications: medications,
        diet_instructions: dietInstructions,
        activity_instructions: activityInstructions,
        follow_up_date: followUpDate,
        follow_up_instructions: followUpInstructions,
        general_instructions: generalInstructions
      }

      const response = await fetch('/api/doctor/prescriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      })

      const result = await response.json()

      if (result.success) {
        alert('Comprehensive prescription created successfully!')
        onSuccess()
        onClose()
        // Reset all form fields
        setChiefComplaint('')
        setVitalSigns({
          bloodPressure: '',
          temperature: '',
          pulse: '',
          respiratoryRate: '',
          oxygenSaturation: '',
          weight: ''
        })
        setExaminationFindings('')
        setDiagnosis('')
        setMedications([{
          medication_name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }])
        setDietInstructions('')
        setActivityInstructions('')
        setFollowUpDate('')
        setFollowUpInstructions('')
        setGeneralInstructions('')
      } else {
        alert(result.error || 'Failed to create prescription')
      }
    } catch (error) {
      console.error('Create prescription failed:', error)
      alert('Failed to create prescription. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Pill className="w-6 h-6 text-primary" />
              Create Prescription
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Patient: <span className="font-medium">{patientName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <Tabs defaultValue="clinical" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="clinical">Clinical Info</TabsTrigger>
              <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="followup">Follow-up</TabsTrigger>
            </TabsList>

            {/* Clinical Information Tab */}
            <TabsContent value="clinical" className="space-y-4">
              <div>
                <Label htmlFor="chief_complaint" className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Chief Complaint *
                </Label>
                <Textarea
                  id="chief_complaint"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Why did the patient come today? (e.g., Fever for 3 days, chest pain, headache)"
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="examination" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Examination Findings
                </Label>
                <Textarea
                  id="examination"
                  value={examinationFindings}
                  onChange={(e) => setExaminationFindings(e.target.value)}
                  placeholder="Physical examination findings (e.g., Throat congestion, no abnormal sounds in lungs)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="diagnosis" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Diagnosis *
                </Label>
                <Input
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Medical diagnosis (e.g., Acute Upper Respiratory Tract Infection)"
                  required
                />
              </div>
            </TabsContent>

            {/* Vital Signs Tab */}
            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blood Pressure (mmHg)</Label>
                  <Input
                    value={vitalSigns.bloodPressure}
                    onChange={(e) => setVitalSigns({...vitalSigns, bloodPressure: e.target.value})}
                    placeholder="e.g., 120/80"
                  />
                </div>
                <div>
                  <Label>Temperature (°F)</Label>
                  <Input
                    value={vitalSigns.temperature}
                    onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
                    placeholder="e.g., 98.6"
                  />
                </div>
                <div>
                  <Label>Pulse (bpm)</Label>
                  <Input
                    value={vitalSigns.pulse}
                    onChange={(e) => setVitalSigns({...vitalSigns, pulse: e.target.value})}
                    placeholder="e.g., 72"
                  />
                </div>
                <div>
                  <Label>Respiratory Rate</Label>
                  <Input
                    value={vitalSigns.respiratoryRate}
                    onChange={(e) => setVitalSigns({...vitalSigns, respiratoryRate: e.target.value})}
                    placeholder="e.g., 16"
                  />
                </div>
                <div>
                  <Label>Oxygen Saturation (%)</Label>
                  <Input
                    value={vitalSigns.oxygenSaturation}
                    onChange={(e) => setVitalSigns({...vitalSigns, oxygenSaturation: e.target.value})}
                    placeholder="e.g., 98"
                  />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    value={vitalSigns.weight}
                    onChange={(e) => setVitalSigns({...vitalSigns, weight: e.target.value})}
                    placeholder="e.g., 70"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Medications *
                  </h3>
                  <Button type="button" onClick={addMedication} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </div>

            <div className="space-y-4">
              {medications.map((med, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Medication Name *</Label>
                      <Input
                        value={med.medication_name}
                        onChange={(e) => updateMedication(index, 'medication_name', e.target.value)}
                        placeholder="e.g., Amoxicillin, Lisinopril"
                        required
                      />
                    </div>

                    <div>
                      <Label>Dosage *</Label>
                      <Input
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg, 10mg"
                        required
                      />
                    </div>

                    <div>
                      <Label>Frequency *</Label>
                      <Input
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        placeholder="e.g., Twice daily, Once daily"
                        required
                      />
                    </div>

                    <div>
                      <Label>Duration *</Label>
                      <Input
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days, 30 days"
                        required
                      />
                    </div>

                    <div>
                      <Label>Specific Instructions</Label>
                      <Input
                        value={med.instructions}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        placeholder="e.g., Take with food"
                      />
                    </div>
                  </div>
                </div>
              ))}
                </div>
              </div>
            </TabsContent>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="space-y-4">
              <div>
                <Label htmlFor="diet_instructions" className="flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Diet Instructions
                </Label>
                <Textarea
                  id="diet_instructions"
                  value={dietInstructions}
                  onChange={(e) => setDietInstructions(e.target.value)}
                  placeholder="Dietary recommendations (e.g., Drink plenty of fluids, avoid spicy food, light diet)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="activity_instructions">Activity/Rest Instructions</Label>
                <Textarea
                  id="activity_instructions"
                  value={activityInstructions}
                  onChange={(e) => setActivityInstructions(e.target.value)}
                  placeholder="Activity and rest recommendations (e.g., Bed rest for 2 days, avoid heavy exercise)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="general_instructions">General Precautions</Label>
                <Textarea
                  id="general_instructions"
                  value={generalInstructions}
                  onChange={(e) => setGeneralInstructions(e.target.value)}
                  placeholder="General instructions, warnings, or precautions for the patient..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Follow-up Tab */}
            <TabsContent value="followup" className="space-y-4">
              <div>
                <Label htmlFor="follow_up_date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Follow-up Date
                </Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="follow_up_instructions">Follow-up Instructions</Label>
                <Textarea
                  id="follow_up_instructions"
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  placeholder="Instructions for next visit (e.g., Come for follow-up if fever persists, bring previous reports)"
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Set a follow-up date to track patient recovery and adjust treatment if needed.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6 mt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Prescription...
                </>
              ) : (
                <>
                  <Pill className="w-4 h-4 mr-2" />
                  Create Complete Prescription
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 