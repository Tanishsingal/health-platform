"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Trash2, CheckCircle, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TestParameter {
  name: string
  value: string
  unit: string
  referenceRange: string
  flag: 'normal' | 'high' | 'low' | 'critical' | ''
}

interface TestResultsModalProps {
  isOpen: boolean
  onClose: () => void
  test: any
  onSubmit: (testId: string, results: any) => void
}

// Common test panels with their parameters
const testPanels = {
  'Complete Blood Count': [
    { name: 'WBC (White Blood Cells)', unit: '/μL', referenceRange: '4,000-11,000' },
    { name: 'RBC (Red Blood Cells)', unit: 'million/μL', referenceRange: '4.5-5.5' },
    { name: 'Hemoglobin', unit: 'g/dL', referenceRange: '13.5-17.5' },
    { name: 'Hematocrit', unit: '%', referenceRange: '40-50' },
    { name: 'MCV (Mean Corpuscular Volume)', unit: 'fL', referenceRange: '80-100' },
    { name: 'MCH (Mean Corpuscular Hemoglobin)', unit: 'pg', referenceRange: '27-33' },
    { name: 'MCHC', unit: 'g/dL', referenceRange: '32-36' },
    { name: 'Platelets', unit: '/μL', referenceRange: '150,000-450,000' },
  ],
  'Basic Metabolic Panel': [
    { name: 'Glucose', unit: 'mg/dL', referenceRange: '70-100' },
    { name: 'Calcium', unit: 'mg/dL', referenceRange: '8.5-10.5' },
    { name: 'Sodium', unit: 'mEq/L', referenceRange: '135-145' },
    { name: 'Potassium', unit: 'mEq/L', referenceRange: '3.5-5.0' },
    { name: 'Chloride', unit: 'mEq/L', referenceRange: '96-106' },
    { name: 'CO2', unit: 'mEq/L', referenceRange: '23-29' },
    { name: 'BUN (Blood Urea Nitrogen)', unit: 'mg/dL', referenceRange: '7-20' },
    { name: 'Creatinine', unit: 'mg/dL', referenceRange: '0.7-1.3' },
  ],
  'Lipid Panel': [
    { name: 'Total Cholesterol', unit: 'mg/dL', referenceRange: '<200' },
    { name: 'HDL Cholesterol', unit: 'mg/dL', referenceRange: '>40' },
    { name: 'LDL Cholesterol', unit: 'mg/dL', referenceRange: '<100' },
    { name: 'Triglycerides', unit: 'mg/dL', referenceRange: '<150' },
    { name: 'VLDL Cholesterol', unit: 'mg/dL', referenceRange: '5-40' },
  ],
  'Liver Function Tests': [
    { name: 'ALT (Alanine Aminotransferase)', unit: 'U/L', referenceRange: '7-56' },
    { name: 'AST (Aspartate Aminotransferase)', unit: 'U/L', referenceRange: '10-40' },
    { name: 'ALP (Alkaline Phosphatase)', unit: 'U/L', referenceRange: '44-147' },
    { name: 'Total Bilirubin', unit: 'mg/dL', referenceRange: '0.1-1.2' },
    { name: 'Direct Bilirubin', unit: 'mg/dL', referenceRange: '0-0.3' },
    { name: 'Total Protein', unit: 'g/dL', referenceRange: '6.0-8.3' },
    { name: 'Albumin', unit: 'g/dL', referenceRange: '3.5-5.5' },
  ],
  'Thyroid Function Tests': [
    { name: 'TSH (Thyroid Stimulating Hormone)', unit: 'μIU/mL', referenceRange: '0.4-4.0' },
    { name: 'T4 (Thyroxine)', unit: 'μg/dL', referenceRange: '4.5-12.0' },
    { name: 'T3 (Triiodothyronine)', unit: 'ng/dL', referenceRange: '80-200' },
    { name: 'Free T4', unit: 'ng/dL', referenceRange: '0.8-1.8' },
  ],
}

export function TestResultsModal({ isOpen, onClose, test, onSubmit }: TestResultsModalProps) {
  const [parameters, setParameters] = useState<TestParameter[]>(() => {
    // Initialize with common parameters if test name matches
    const commonParams = testPanels[test?.test_name as keyof typeof testPanels]
    if (commonParams) {
      return commonParams.map(p => ({
        name: p.name,
        value: '',
        unit: p.unit,
        referenceRange: p.referenceRange,
        flag: '' as const
      }))
    }
    // Default to one empty parameter
    return [{
      name: '',
      value: '',
      unit: '',
      referenceRange: '',
      flag: '' as const
    }]
  })

  const [interpretation, setInterpretation] = useState('')
  const [specimenType, setSpecimenType] = useState('')
  const [methodology, setMethodology] = useState('')
  const [comments, setComments] = useState('')

  const addParameter = () => {
    setParameters([...parameters, {
      name: '',
      value: '',
      unit: '',
      referenceRange: '',
      flag: '' as const
    }])
  }

  const removeParameter = (index: number) => {
    if (parameters.length > 1) {
      setParameters(parameters.filter((_, i) => i !== index))
    }
  }

  const updateParameter = (index: number, field: keyof TestParameter, value: string) => {
    const updated = [...parameters]
    updated[index][field] = value as any
    setParameters(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const results = {
      parameters: parameters.filter(p => p.name && p.value),
      interpretation,
      specimenType,
      methodology,
      comments,
      entryDate: new Date().toISOString()
    }

    onSubmit(test.id, results)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold">Enter Test Results</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {test?.test_name} - {test?.patient_name}
            </p>
            <Badge variant="outline" className="mt-2">
              Test Type: {test?.test_type}
            </Badge>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Specimen and Methodology */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="specimen">Specimen Type</Label>
              <Input
                id="specimen"
                value={specimenType}
                onChange={(e) => setSpecimenType(e.target.value)}
                placeholder="e.g., Whole Blood, Serum, Plasma"
              />
            </div>
            <div>
              <Label htmlFor="methodology">Methodology</Label>
              <Input
                id="methodology"
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                placeholder="e.g., Automated Analyzer, ELISA"
              />
            </div>
          </div>

          {/* Test Parameters */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Test Parameters</h3>
              <Button type="button" onClick={addParameter} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Parameter
              </Button>
            </div>

            <div className="space-y-3">
              {parameters.map((param, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-white">
                  <div className="col-span-3">
                    <Label className="text-xs">Parameter Name *</Label>
                    <Input
                      value={param.name}
                      onChange={(e) => updateParameter(index, 'name', e.target.value)}
                      placeholder="e.g., Hemoglobin"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Value *</Label>
                    <Input
                      value={param.value}
                      onChange={(e) => updateParameter(index, 'value', e.target.value)}
                      placeholder="e.g., 14.2"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      value={param.unit}
                      onChange={(e) => updateParameter(index, 'unit', e.target.value)}
                      placeholder="e.g., g/dL"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Reference Range</Label>
                    <Input
                      value={param.referenceRange}
                      onChange={(e) => updateParameter(index, 'referenceRange', e.target.value)}
                      placeholder="e.g., 13.5-17.5"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Flag</Label>
                    <Select
                      value={param.flag}
                      onValueChange={(value) => updateParameter(index, 'flag', value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Normal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    {parameters.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParameter(index)}
                        className="h-9 w-9 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Interpretation */}
          <div>
            <Label htmlFor="interpretation">Overall Interpretation *</Label>
            <Select value={interpretation} onValueChange={setInterpretation} required>
              <SelectTrigger>
                <SelectValue placeholder="Select overall interpretation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal - All parameters within range</SelectItem>
                <SelectItem value="abnormal">Abnormal - Some parameters outside range</SelectItem>
                <SelectItem value="critical">Critical - Immediate attention required</SelectItem>
                <SelectItem value="inconclusive">Inconclusive - Retest recommended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comments */}
          <div>
            <Label htmlFor="comments">Laboratory Comments & Recommendations</Label>
            <Textarea 
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter any additional observations, quality control notes, or recommendations..."
              rows={4}
            />
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Results will be sent to the ordering doctor ({test?.doctor_name}) 
                for review and patient notification. Critical values should be reported immediately.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Complete Results
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 