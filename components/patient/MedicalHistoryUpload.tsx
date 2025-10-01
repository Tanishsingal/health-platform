"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Trash2, Download, X, Loader2, File } from "lucide-react"

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

interface MedicalHistoryUploadProps {
  onDocumentsChange?: () => void
}

export function MedicalHistoryUpload({ onDocumentsChange }: MedicalHistoryUploadProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    document_type: '',
    document_name: '',
    document_date: '',
    file: null as File | null,
    notes: ''
  })
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/patient/medical-history')
      const result = await response.json()

      if (result.success) {
        setDocuments(result.data)
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setUploadForm({
        ...uploadForm,
        file,
        document_name: uploadForm.document_name || file.name
      })
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadForm.file) {
      alert('Please select a file')
      return
    }

    setIsUploading(true)

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Data = reader.result as string

        const response = await fetch('/api/patient/medical-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_type: uploadForm.document_type,
            document_name: uploadForm.document_name,
            document_date: uploadForm.document_date || null,
            document_data: base64Data,
            file_type: uploadForm.file?.type || 'application/octet-stream',
            notes: uploadForm.notes
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Document uploaded successfully!')
          setShowUploadModal(false)
          setUploadForm({ document_type: '', document_name: '', document_date: '', file: null, notes: '' })
          loadDocuments()
          onDocumentsChange?.()
        } else {
          alert(result.error || 'Failed to upload document')
        }
      }

      reader.readAsDataURL(uploadForm.file)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await fetch(`/api/patient/medical-history?id=${documentId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('Document deleted successfully')
        loadDocuments()
        onDocumentsChange?.()
      } else {
        alert(result.error || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete document. Please try again.')
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

  const handleViewDocument = (doc: Document) => {
    setViewingDocument(doc)
  }

  const handleDownloadDocument = (doc: Document) => {
    if (doc.document_data) {
      const link = document.createElement('a')
      link.href = doc.document_data
      link.download = doc.document_name
      link.click()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Medical History Documents
            </CardTitle>
            <CardDescription>Upload and manage your medical records and documents</CardDescription>
          </div>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
            <Button onClick={() => setShowUploadModal(true)} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Document
            </Button>
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
                     <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(doc)}>
                       <Download className="w-4 h-4" />
                     </Button>
                     <Button size="sm" variant="outline" onClick={() => handleDelete(doc.id)}>
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upload Medical Document</h2>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Label htmlFor="document_type">Document Type *</Label>
                  <Select
                    value={uploadForm.document_type}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, document_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab_report">Lab Report</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="radiology">Radiology Report</SelectItem>
                      <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                      <SelectItem value="vaccination_record">Vaccination Record</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                                 <div>
                   <Label htmlFor="document_name">Document Name *</Label>
                   <Input
                     id="document_name"
                     value={uploadForm.document_name}
                     onChange={(e) => setUploadForm({ ...uploadForm, document_name: e.target.value })}
                     placeholder="e.g., Blood Test Results - Jan 2024"
                     required
                   />
                 </div>

                 <div>
                   <Label htmlFor="document_date">Document Date</Label>
                   <Input
                     id="document_date"
                     type="date"
                     value={uploadForm.document_date}
                     onChange={(e) => setUploadForm({ ...uploadForm, document_date: e.target.value })}
                     max={new Date().toISOString().split('T')[0]}
                   />
                   <p className="text-xs text-muted-foreground mt-1">
                     When was this report/test done? (Optional)
                   </p>
                 </div>

                 <div>
                  <Label htmlFor="file">Select File * (Max 5MB)</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                  {uploadForm.file && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={uploadForm.notes}
                    onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                    placeholder="Add any additional notes about this document"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1" disabled={isUploading}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
                 </div>
       )}

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
                 <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(viewingDocument)}>
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
                       <Button onClick={() => handleDownloadDocument(viewingDocument)}>
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