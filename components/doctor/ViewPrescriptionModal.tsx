"use client"

import { Button } from "@/components/ui/button"
import { X, Printer, Download, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  dosage: string
  frequency: string
  duration_days: number
  instructions: string
  status: string
  prescribed_date: string
  created_at: string
}

interface ViewPrescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  prescription: Prescription | null
  patientName: string
  doctorName?: string
}

export function ViewPrescriptionModal({
  isOpen,
  onClose,
  prescription,
  patientName,
  doctorName = "Dr. [Name]"
}: ViewPrescriptionModalProps) {
  if (!isOpen || !prescription) return null

  // Parse instructions to extract different sections
  const parseInstructions = (instructions: string) => {
    const sections = {
      chiefComplaint: '',
      vitalSigns: '',
      examinationFindings: '',
      diagnosis: '',
      medications: '',
      diet: '',
      activity: '',
      generalInstructions: '',
      followUp: '',
      followUpDate: ''
    }

    // Extract each section using regex or split
    const chiefComplaintMatch = instructions.match(/CHIEF COMPLAINT:(.*?)(?=\n\n|VITAL SIGNS:|$)/s)
    const vitalSignsMatch = instructions.match(/VITAL SIGNS:(.*?)(?=\n\n|EXAMINATION FINDINGS:|DIAGNOSIS:|$)/s)
    const examinationMatch = instructions.match(/EXAMINATION FINDINGS:(.*?)(?=\n\n|DIAGNOSIS:|$)/s)
    const diagnosisMatch = instructions.match(/DIAGNOSIS:(.*?)(?=\n\n|DIET:|ACTIVITY:|GENERAL INSTRUCTIONS:|FOLLOW-UP|$)/s)
    const dietMatch = instructions.match(/DIET:(.*?)(?=\n\n|ACTIVITY:|GENERAL INSTRUCTIONS:|FOLLOW-UP|$)/s)
    const activityMatch = instructions.match(/ACTIVITY:(.*?)(?=\n\n|GENERAL INSTRUCTIONS:|FOLLOW-UP|$)/s)
    const generalMatch = instructions.match(/GENERAL INSTRUCTIONS:(.*?)(?=\n\n|FOLLOW-UP|$)/s)
    const followUpDateMatch = instructions.match(/FOLLOW-UP DATE:(.*?)(?=\n|$)/s)
    const followUpInstructionsMatch = instructions.match(/FOLLOW-UP INSTRUCTIONS:(.*?)$/s)

    if (chiefComplaintMatch) sections.chiefComplaint = chiefComplaintMatch[1].trim()
    if (vitalSignsMatch) sections.vitalSigns = vitalSignsMatch[1].trim()
    if (examinationMatch) sections.examinationFindings = examinationMatch[1].trim()
    if (diagnosisMatch) sections.diagnosis = diagnosisMatch[1].trim()
    if (dietMatch) sections.diet = dietMatch[1].trim()
    if (activityMatch) sections.activity = activityMatch[1].trim()
    if (generalMatch) sections.generalInstructions = generalMatch[1].trim()
    if (followUpDateMatch) sections.followUpDate = followUpDateMatch[1].trim()
    if (followUpInstructionsMatch) sections.followUp = followUpInstructionsMatch[1].trim()

    return sections
  }

  const sections = parseInstructions(prescription.instructions)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a text file with prescription details
    const prescriptionText = `
PRESCRIPTION
============

Patient: ${patientName}
Doctor: ${doctorName}
Date: ${new Date(prescription.prescribed_date).toLocaleDateString()}
Prescription ID: ${prescription.id}

${prescription.instructions}

MEDICATION DETAILS:
- Medication: ${prescription.dosage}
- Frequency: ${prescription.frequency}
- Duration: ${prescription.duration_days} days
- Status: ${prescription.status}

---
Generated on ${new Date().toLocaleString()}
    `.trim()

    const blob = new Blob([prescriptionText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Prescription_${prescription.id.substring(0, 8)}_${new Date(prescription.prescribed_date).toISOString().split('T')[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Prescription Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Prescribed on {new Date(prescription.prescribed_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Prescription Content */}
        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Patient Name</p>
                <p className="font-medium">{patientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">{doctorName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(prescription.prescribed_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={prescription.status === 'pending' ? 'secondary' : 'default'}>
                  {prescription.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Chief Complaint */}
          {sections.chiefComplaint && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-primary">Chief Complaint</h3>
              <p className="text-sm">{sections.chiefComplaint}</p>
            </div>
          )}

          {/* Vital Signs */}
          {sections.vitalSigns && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-primary">Vital Signs</h3>
              <pre className="text-sm whitespace-pre-wrap font-sans">{sections.vitalSigns}</pre>
            </div>
          )}

          {/* Examination Findings */}
          {sections.examinationFindings && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-primary">Examination Findings</h3>
              <p className="text-sm">{sections.examinationFindings}</p>
            </div>
          )}

          {/* Diagnosis */}
          {sections.diagnosis && (
            <div className="border rounded-lg p-4 bg-yellow-50">
              <h3 className="font-semibold mb-2 text-primary">Diagnosis</h3>
              <p className="text-sm font-medium">{sections.diagnosis}</p>
            </div>
          )}

          {/* Medications */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold mb-3 text-primary">Prescribed Medication</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Medication:</span>
                <span className="font-medium">{prescription.dosage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Frequency:</span>
                <span className="font-medium">{prescription.frequency}</span>
              </div>
              {prescription.duration_days && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="font-medium">{prescription.duration_days} days</span>
                </div>
              )}
            </div>
          </div>

          {/* Diet Instructions */}
          {sections.diet && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-primary">Diet Instructions</h3>
              <p className="text-sm whitespace-pre-wrap">{sections.diet}</p>
            </div>
          )}

          {/* Activity Instructions */}
          {sections.activity && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-primary">Activity Instructions</h3>
              <p className="text-sm whitespace-pre-wrap">{sections.activity}</p>
            </div>
          )}

          {/* General Instructions */}
          {sections.generalInstructions && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-primary">General Instructions</h3>
              <p className="text-sm whitespace-pre-wrap">{sections.generalInstructions}</p>
            </div>
          )}

          {/* Follow-up */}
          {(sections.followUpDate || sections.followUp) && (
            <div className="border rounded-lg p-4 bg-purple-50">
              <h3 className="font-semibold mb-2 text-primary">Follow-up</h3>
              {sections.followUpDate && (
                <p className="text-sm mb-2">
                  <strong>Date:</strong> {sections.followUpDate}
                </p>
              )}
              {sections.followUp && (
                <p className="text-sm">{sections.followUp}</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-4 mt-6">
            <p className="text-xs text-muted-foreground">
              Prescription ID: {prescription.id}
            </p>
            <p className="text-xs text-muted-foreground">
              Created: {new Date(prescription.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="border-t p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
} 