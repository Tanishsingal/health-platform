"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Loader2, TestTube } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface CreateLabOrderModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  onSuccess: () => void
}

export function CreateLabOrderModal({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName,
  onSuccess 
}: CreateLabOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    test_name: '',
    test_type: '',
    urgent: false,
    notes: ''
  })

  // Common lab tests
  const commonTests = [
    { name: 'Complete Blood Count (CBC)', type: 'hematology' },
    { name: 'Basic Metabolic Panel', type: 'chemistry' },
    { name: 'Comprehensive Metabolic Panel', type: 'chemistry' },
    { name: 'Lipid Panel', type: 'chemistry' },
    { name: 'Thyroid Function Tests', type: 'endocrinology' },
    { name: 'Liver Function Tests', type: 'chemistry' },
    { name: 'Kidney Function Tests', type: 'chemistry' },
    { name: 'Urinalysis', type: 'urinalysis' },
    { name: 'Blood Glucose', type: 'chemistry' },
    { name: 'HbA1c', type: 'chemistry' },
    { name: 'Vitamin D', type: 'chemistry' },
    { name: 'Vitamin B12', type: 'chemistry' },
    { name: 'Iron Studies', type: 'hematology' },
    { name: 'COVID-19 PCR', type: 'microbiology' },
    { name: 'Blood Culture', type: 'microbiology' },
    { name: 'X-Ray', type: 'radiology' },
    { name: 'ECG', type: 'cardiology' },
    { name: 'Custom Test', type: 'other' }
  ]

  const testTypes = [
    'hematology',
    'chemistry',
    'microbiology',
    'urinalysis',
    'radiology',
    'cardiology',
    'endocrinology',
    'other'
  ]

  const handleTestSelect = (testName: string) => {
    const test = commonTests.find(t => t.name === testName)
    if (test) {
      setFormData({
        ...formData,
        test_name: testName,
        test_type: test.type
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/doctor/lab-orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          ...formData
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Lab test order created successfully!')
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          test_name: '',
          test_type: '',
          urgent: false,
          notes: ''
        })
      } else {
        alert(result.error || 'Failed to create lab order')
      }
    } catch (error) {
      console.error('Create lab order failed:', error)
      alert('Failed to create lab order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TestTube className="w-6 h-6 text-primary" />
              Order Lab Test
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Patient: <span className="font-medium">{patientName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Select Common Tests */}
          <div>
            <Label>Quick Select Common Tests</Label>
            <Select onValueChange={handleTestSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a common test..." />
              </SelectTrigger>
              <SelectContent>
                {commonTests.map((test) => (
                  <SelectItem key={test.name} value={test.name}>
                    {test.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Test Name */}
          <div>
            <Label htmlFor="test_name">Test Name *</Label>
            <Input
              id="test_name"
              value={formData.test_name}
              onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
              placeholder="Enter test name"
              required
            />
          </div>

          {/* Test Type */}
          <div>
            <Label htmlFor="test_type">Test Type *</Label>
            <Select 
              value={formData.test_type}
              onValueChange={(value) => setFormData({ ...formData, test_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                {testTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Urgent */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="urgent"
              checked={formData.urgent}
              onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked as boolean })}
            />
            <label
              htmlFor="urgent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as Urgent
            </label>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any clinical notes or special instructions..."
              rows={4}
            />
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This order will be sent to the laboratory for processing. 
              The lab technician will be notified to collect samples and perform the test.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
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
                  Creating Order...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Create Lab Order
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 