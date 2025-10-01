"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, TestTube, AlertTriangle, CheckCircle, Download, Printer } from "lucide-react"

interface ViewLabResultsModalProps {
  isOpen: boolean
  onClose: () => void
  labTest: any
}

export function ViewLabResultsModal({ isOpen, onClose, labTest }: ViewLabResultsModalProps) {
  if (!isOpen || !labTest) return null

  const results = labTest.results ? (typeof labTest.results === 'string' ? JSON.parse(labTest.results) : labTest.results) : null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a text representation of the results
    let text = `LAB TEST RESULTS\n\n`
    text += `Test: ${labTest.test_name}\n`
    text += `Patient: ${labTest.patient_name}\n`
    text += `Test Type: ${labTest.test_type}\n`
    text += `Status: ${labTest.status}\n`
    text += `Ordered Date: ${new Date(labTest.ordered_date).toLocaleString()}\n`
    if (labTest.completed_date) {
      text += `Completed Date: ${new Date(labTest.completed_date).toLocaleString()}\n`
    }
    text += `\n--- RESULTS ---\n\n`

    if (results) {
      if (results.specimenType) {
        text += `Specimen Type: ${results.specimenType}\n`
      }
      if (results.methodology) {
        text += `Methodology: ${results.methodology}\n`
      }
      text += `\nTEST PARAMETERS:\n\n`

      if (results.parameters && results.parameters.length > 0) {
        results.parameters.forEach((param: any) => {
          text += `${param.name}: ${param.value} ${param.unit || ''}\n`
          if (param.referenceRange) {
            text += `  Reference Range: ${param.referenceRange}\n`
          }
          if (param.flag && param.flag !== 'normal') {
            text += `  Flag: ${param.flag.toUpperCase()}\n`
          }
          text += `\n`
        })
      }

      text += `\nOVERALL INTERPRETATION: ${results.interpretation || 'N/A'}\n`
      
      if (results.comments) {
        text += `\nCOMMENTS:\n${results.comments}\n`
      }
    } else {
      text += `No results available yet.\n`
    }

    // Create and download
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lab-results-${labTest.test_name}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'ordered': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFlagBadge = (flag: string) => {
    switch (flag) {
      case 'high': return <Badge variant="destructive" className="text-xs">HIGH</Badge>
      case 'low': return <Badge variant="secondary" className="text-xs">LOW</Badge>
      case 'critical': return <Badge variant="destructive" className="text-xs">CRITICAL ⚠️</Badge>
      default: return <Badge variant="outline" className="text-xs">Normal</Badge>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <TestTube className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">{labTest.test_name}</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Patient: <strong>{labTest.patient_name}</strong></span>
              <span>•</span>
              <span>Test Type: <strong className="capitalize">{labTest.test_type}</strong></span>
              <span>•</span>
              <Badge className={getStatusColor(labTest.status)}>
                {labTest.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Test Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Ordered Date</p>
              <p className="font-medium">{new Date(labTest.ordered_date).toLocaleString()}</p>
            </div>
            {labTest.sample_collected_date && (
              <div>
                <p className="text-sm text-muted-foreground">Sample Collected</p>
                <p className="font-medium">{new Date(labTest.sample_collected_date).toLocaleString()}</p>
              </div>
            )}
            {labTest.completed_date && (
              <div>
                <p className="text-sm text-muted-foreground">Completed Date</p>
                <p className="font-medium">{new Date(labTest.completed_date).toLocaleString()}</p>
              </div>
            )}
            {labTest.notes && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Clinical Notes</p>
                <p className="font-medium">{labTest.notes}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          {results ? (
            <>
              {/* Specimen and Methodology */}
              {(results.specimenType || results.methodology) && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  {results.specimenType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Specimen Type</p>
                      <p className="font-medium">{results.specimenType}</p>
                    </div>
                  )}
                  {results.methodology && (
                    <div>
                      <p className="text-sm text-muted-foreground">Methodology</p>
                      <p className="font-medium">{results.methodology}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Test Parameters */}
              {results.parameters && results.parameters.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Test Parameters
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Parameter</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Value</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Unit</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Reference Range</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {results.parameters.map((param: any, index: number) => (
                          <tr key={index} className={param.flag && param.flag !== 'normal' ? 'bg-red-50' : ''}>
                            <td className="px-4 py-3 font-medium">{param.name}</td>
                            <td className="px-4 py-3">
                              <span className={param.flag && param.flag !== 'normal' ? 'font-bold text-red-600' : ''}>
                                {param.value}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{param.unit || '-'}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{param.referenceRange || '-'}</td>
                            <td className="px-4 py-3">
                              {getFlagBadge(param.flag || 'normal')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Overall Interpretation */}
              {results.interpretation && (
                <div className={`p-4 rounded-lg border-2 ${
                  results.interpretation === 'critical' 
                    ? 'bg-red-50 border-red-200' 
                    : results.interpretation === 'abnormal'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {results.interpretation === 'critical' || results.interpretation === 'abnormal' ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <h3 className="font-semibold">Overall Interpretation</h3>
                  </div>
                  <p className="text-sm capitalize">
                    <strong>{results.interpretation}</strong>
                    {results.interpretation === 'normal' && ' - All parameters within normal range'}
                    {results.interpretation === 'abnormal' && ' - Some parameters outside normal range'}
                    {results.interpretation === 'critical' && ' - Immediate attention required'}
                    {results.interpretation === 'inconclusive' && ' - Retest recommended'}
                  </p>
                </div>
              )}

              {/* Laboratory Comments */}
              {results.comments && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold mb-2">Laboratory Comments & Recommendations</h3>
                  <p className="text-sm whitespace-pre-wrap">{results.comments}</p>
                </div>
              )}

              {/* Entry Timestamp */}
              {results.entryDate && (
                <div className="text-sm text-muted-foreground text-center pt-4 border-t">
                  Results entered on {new Date(results.entryDate).toLocaleString()}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <TestTube className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Results Available Yet</p>
              <p className="text-sm mt-2">
                This test is still being processed by the laboratory.
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 