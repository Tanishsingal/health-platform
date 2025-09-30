"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestBookingPage() {
  const [results, setResults] = useState<any[]>([])

  const testDoctorsAPI = async () => {
    console.log('Testing /api/doctors/available...')
    try {
      const response = await fetch('/api/doctors/available')
      const data = await response.json()
      setResults(prev => [...prev, {
        test: 'GET /api/doctors/available',
        status: response.status,
        data: data
      }])
      console.log('Doctors API Response:', data)
    } catch (error) {
      setResults(prev => [...prev, {
        test: 'GET /api/doctors/available',
        error: error instanceof Error ? error.message : String(error)
      }])
      console.error('Error:', error)
    }
  }

  const testHealthAPI = async () => {
    console.log('Testing /api/health...')
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setResults(prev => [...prev, {
        test: 'GET /api/health',
        status: response.status,
        data: data
      }])
      console.log('Health API Response:', data)
    } catch (error) {
      setResults(prev => [...prev, {
        test: 'GET /api/health',
        error: error instanceof Error ? error.message : String(error)
      }])
      console.error('Error:', error)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🧪 API Testing Page</h1>
      
      <div className="space-y-4 mb-8">
        <Button onClick={testHealthAPI} className="mr-4">
          Test Health API
        </Button>
        <Button onClick={testDoctorsAPI}>
          Test Doctors API
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Results:</h2>
        <div className="space-y-4">
          {results.map((result, idx) => (
            <div key={idx} className="border p-4 rounded">
              <div className="font-semibold text-blue-600">{result.test}</div>
              {result.status && (
                <div className="text-sm">Status: {result.status}</div>
              )}
              {result.data && (
                <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
              {result.error && (
                <div className="text-red-600 mt-2">Error: {result.error}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">📋 Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Test Health API" - should return status 200</li>
          <li>Click "Test Doctors API" - should return list of doctors</li>
          <li>Open browser console (F12) to see detailed logs</li>
          <li>If both work, the APIs are fine and the issue is in the patient dashboard</li>
        </ol>
      </div>
    </div>
  )
} 