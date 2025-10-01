"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Loader2, File, Calendar, X } from "lucide-react"

interface Document {
  id: string
  document_type: string
  document_name: string
  document_date?: string
  file_type: string
  file_size?: number
  notes?: string
  uploaded_at: string
  document_data?: string
}

interface MedicalRecord {
  id: string
  visit_date: string
  diagnosis: string
  treatment_plan: string
  notes: string
  doctor_first_name: string
  doctor_last_name: string
  specialization: string
}

interface PatientMedicalHistoryProps {
  patientId: string
}

export function PatientMedicalHistory({ patientId }: PatientMedicalHistoryProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'documents' | 'records'>('documents')
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)

  useEffect(() => {
    if (patientId) {
      loadMedicalHistory()
    }
  }, [patientId])

  const loadMedicalHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/doctor/patient/${patientId}/medical-history`)
      const result = await response.json()

      if (result.success) {
        setDocuments(result.data.documents || [])
        setMedicalRecords(result.data.medicalRecords || [])
      }
    } catch (error) {
      console.error('Failed to load medical history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      lab_report: 'bg-blue-100 text-blue-800',
      prescription: 'bg-green-100 text-green-800',
      radiology: 'bg-purple-100 text-purple-800',
      discharge_summary: 'bg-orange-100 text-orange-800',
      vaccination_record: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.other
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const handleDownload = (doc: Document) => {
    if (doc.document_data) {
      // Create a download link for the base64 data
      const link = document.createElement('a')
      link.href = doc.document_data
      link.download = doc.document_name
      link.click()
    }
  }

  const handleViewDocument = (doc: Document) => {
    setViewingDocument(doc)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Patient Medical History
        </CardTitle>
        <CardDescription>Uploaded documents and medical records</CardDescription>
        
        {/* Tab Switcher */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'documents' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('documents')}
          >
            <File className="w-4 h-4 mr-2" />
            Documents ({documents.length})
          </Button>
          <Button
            variant={activeTab === 'records' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('records')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Medical Records ({medicalRecords.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeTab === 'documents' ? (
          documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No documents uploaded by patient</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <File className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{doc.document_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                                               <Badge className={getDocumentTypeColor(doc.document_type)} variant="secondary">
                         {doc.document_type.replace('_', ' ')}
                       </Badge>
                       {doc.document_date && (
                         <span className="text-xs font-medium text-primary">
                           📅 {new Date(doc.document_date).toLocaleDateString()}
                         </span>
                       )}
                       <span className="text-xs text-muted-foreground">
                         Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                       </span>
                        {doc.file_size && (
                          <span className="text-xs text-muted-foreground">
                            • {formatFileSize(doc.file_size)}
                          </span>
                        )}
                      </div>
                      {doc.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{doc.notes}</p>
                      )}
                    </div>
                                     </div>
                   <div className="flex items-center gap-2">
                     <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc)}>
                       <FileText className="w-4 h-4 mr-1" />
                       View
                     </Button>
                     <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>
                       <Download className="w-4 h-4 mr-2" />
                       Download
                     </Button>
                   </div>
                </div>
              ))}
            </div>
          )
        ) : (
          medicalRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No medical records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">
                      Visit on {new Date(record.visit_date).toLocaleDateString()}
                    </h3>
                    <Badge variant="outline">
                      Dr. {record.doctor_first_name} {record.doctor_last_name}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Diagnosis:</span>
                      <p className="mt-1">{record.diagnosis || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Treatment Plan:</span>
                      <p className="mt-1">{record.treatment_plan || 'Not specified'}</p>
                    </div>
                    {record.notes && (
                      <div>
                        <span className="font-medium text-muted-foreground">Notes:</span>
                        <p className="mt-1">{record.notes}</p>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {record.specialization}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
                 )}
       </CardContent>

       {/* Document Viewer Modal */}
       {viewingDocument && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
             <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
               <div className="flex-1">
                 <h2 className="text-xl font-bold">{viewingDocument.document_name}</h2>
                 <div className="flex items-center gap-2 mt-1">
                   <Badge className={getDocumentTypeColor(viewingDocument.document_type)} variant="secondary">
                     {viewingDocument.document_type.replace('_', ' ')}
                   </Badge>
                   {viewingDocument.document_date && (
                     <span className="text-sm text-muted-foreground">
                       📅 {new Date(viewingDocument.document_date).toLocaleDateString()}
                     </span>
                   )}
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <Button size="sm" variant="outline" onClick={() => handleDownload(viewingDocument)}>
                   <Download className="w-4 h-4 mr-2" />
                   Download
                 </Button>
                 <button 
                   onClick={() => setViewingDocument(null)} 
                   className="text-gray-500 hover:text-gray-700 p-2"
                 >
                   <X className="w-6 h-6" />
                 </button>
               </div>
             </div>
             
             <div className="flex-1 overflow-auto p-4 bg-gray-50">
               {viewingDocument.document_data && (
                 <>
                   {viewingDocument.file_type.includes('pdf') ? (
                     <iframe
                       src={viewingDocument.document_data}
                       className="w-full h-full min-h-[600px] border rounded"
                       title={viewingDocument.document_name}
                     />
                   ) : viewingDocument.file_type.includes('image') ? (
                     <div className="flex items-center justify-center">
                       <img
                         src={viewingDocument.document_data}
                         alt={viewingDocument.document_name}
                         className="max-w-full h-auto rounded shadow-lg"
                       />
                     </div>
                   ) : (
                     <div className="text-center py-12">
                       <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                       <p className="text-gray-600 mb-4">
                         Preview not available for this file type
                       </p>
                       <Button onClick={() => handleDownload(viewingDocument)}>
                         <Download className="w-4 h-4 mr-2" />
                         Download to View
                       </Button>
                     </div>
                   )}
                 </>
               )}
             </div>
             
             {viewingDocument.notes && (
               <div className="p-4 border-t bg-white">
                 <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                 <p className="text-sm">{viewingDocument.notes}</p>
               </div>
             )}
           </div>
         </div>
       )}
     </Card>
   )
 } 