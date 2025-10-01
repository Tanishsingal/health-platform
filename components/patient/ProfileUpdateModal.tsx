"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Loader2 } from "lucide-react"

interface ProfileUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  currentProfile: any
}

export function ProfileUpdateModal({ isOpen, onClose, onUpdate, currentProfile }: ProfileUpdateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    blood_type: '',
    height_cm: '',
    weight_kg: '',
    allergies: [] as string[],
    chronic_conditions: [] as string[],
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: ''
  })
  const [allergyInput, setAllergyInput] = useState('')
  const [conditionInput, setConditionInput] = useState('')

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        first_name: currentProfile.first_name || '',
        last_name: currentProfile.last_name || '',
        phone: currentProfile.phone || '',
        date_of_birth: currentProfile.date_of_birth ? currentProfile.date_of_birth.split('T')[0] : '',
        gender: currentProfile.gender || '',
        address: currentProfile.address || '',
        blood_type: currentProfile.blood_type || '',
        height_cm: currentProfile.height_cm || '',
        weight_kg: currentProfile.weight_kg || '',
        allergies: currentProfile.allergies || [],
        chronic_conditions: currentProfile.chronic_conditions || [],
        emergency_contact_name: currentProfile.emergency_contact_name || '',
        emergency_contact_phone: currentProfile.emergency_contact_phone || '',
        emergency_contact_relationship: currentProfile.emergency_contact_relationship || ''
      })
    }
  }, [currentProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        alert('Profile updated successfully!')
        onUpdate()
        onClose()
      } else {
        alert(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Update failed:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addAllergy = () => {
    if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, allergyInput.trim()]
      })
      setAllergyInput('')
    }
  }

  const removeAllergy = (allergy: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter(a => a !== allergy)
    })
  }

  const addCondition = () => {
    if (conditionInput.trim() && !formData.chronic_conditions.includes(conditionInput.trim())) {
      setFormData({
        ...formData,
        chronic_conditions: [...formData.chronic_conditions, conditionInput.trim()]
      })
      setConditionInput('')
    }
  }

  const removeCondition = (condition: string) => {
    setFormData({
      ...formData,
      chronic_conditions: formData.chronic_conditions.filter(c => c !== condition)
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Update Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="blood_type">Blood Type</Label>
                <Select value={formData.blood_type} onValueChange={(value) => setFormData({ ...formData, blood_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="height_cm">Height (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  value={formData.height_cm}
                  onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
            
            {/* Allergies */}
            <div className="mb-4">
              <Label>Allergies</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  placeholder="Add allergy"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                />
                <Button type="button" onClick={addAllergy} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {allergy}
                    <button type="button" onClick={() => removeAllergy(allergy)} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <Label>Chronic Conditions</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  placeholder="Add chronic condition"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                />
                <Button type="button" onClick={addCondition} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.chronic_conditions.map((condition, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {condition}
                    <button type="button" onClick={() => removeCondition(condition)} className="hover:text-blue-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input
                  id="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 