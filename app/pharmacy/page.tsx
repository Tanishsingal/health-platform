"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Pill, Package, AlertTriangle, Search, Plus, TrendingDown, Clock, CheckCircle, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface DashboardData {
  profile: {
    first_name: string
    last_name: string
  }
  pendingPrescriptions: any[]
  lowStockItems: any[]
  expiringItems: any[]
  recentInventory: any[]
  stats: {
    pendingPrescriptions: number
    lowStockCount: number
    expiringCount: number
    filledToday: number
  }
}

export default function PharmacyDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Modal states
  const [viewPrescriptionModal, setViewPrescriptionModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [viewInventoryModal, setViewInventoryModal] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<any>(null)
  const [addInventoryModal, setAddInventoryModal] = useState(false)
  const [updateStockModal, setUpdateStockModal] = useState(false)
  const [medications, setMedications] = useState<any[]>([])
  
  // Form states
  const [addInventoryForm, setAddInventoryForm] = useState({
    medicationId: '',
    quantityAvailable: '',
    minimumStockLevel: '',
    expiryDate: '',
    batchNumber: '',
    supplier: ''
  })

  const [updateStockForm, setUpdateStockForm] = useState({
    quantityAvailable: '',
    minimumStockLevel: '',
    expiryDate: '',
    batchNumber: '',
    supplier: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (!response.ok) {
        window.location.href = '/auth/login'
        return
      }
      
      const data = await response.json()
      
      if (data.user.role !== 'pharmacist') {
        window.location.href = '/auth/login'
        return
      }
      
      setCurrentUser(data.user)

      // Fetch dashboard data
      const dashboardResponse = await fetch('/api/pharmacy/dashboard')
      
      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json()
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      window.location.href = '/auth/login'
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/pharmacy/medications')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMedications(result.data.medications)
        }
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error)
    }
  }

  const handleViewPrescription = async (prescriptionId: string) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSelectedPrescription(result.data.prescription)
          setViewPrescriptionModal(true)
        }
      } else {
        alert('Failed to fetch prescription details')
      }
    } catch (error) {
      console.error('Error fetching prescription:', error)
      alert('Error fetching prescription details')
    }
  }

  const handleFillPrescription = async (prescriptionId: string) => {
    if (!confirm('Are you sure you want to fill this prescription?')) return

    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}/fill`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Prescription filled successfully!')
        setViewPrescriptionModal(false)
        fetchData() // Refresh dashboard
      } else {
        const result = await response.json()
        alert(result.error || 'Failed to fill prescription')
      }
    } catch (error) {
      console.error('Error filling prescription:', error)
      alert('Error filling prescription')
    }
  }

  const handleViewInventory = async (inventoryId: string) => {
    try {
      const response = await fetch(`/api/pharmacy/inventory/${inventoryId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSelectedInventory(result.data.inventory)
          setViewInventoryModal(true)
        }
      } else {
        alert('Failed to fetch inventory details')
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      alert('Error fetching inventory details')
    }
  }

  const handleOpenAddInventory = async () => {
    await fetchMedications()
    setAddInventoryModal(true)
  }

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/pharmacy/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: addInventoryForm.medicationId,
          quantityAvailable: parseInt(addInventoryForm.quantityAvailable),
          minimumStockLevel: parseInt(addInventoryForm.minimumStockLevel),
          expiryDate: addInventoryForm.expiryDate || undefined,
          batchNumber: addInventoryForm.batchNumber || undefined,
          supplier: addInventoryForm.supplier || undefined
        })
      })

      if (response.ok) {
        alert('Inventory added successfully!')
        setAddInventoryModal(false)
        setAddInventoryForm({
          medicationId: '',
          quantityAvailable: '',
          minimumStockLevel: '',
          expiryDate: '',
          batchNumber: '',
          supplier: ''
        })
        fetchData() // Refresh dashboard
      } else {
        const result = await response.json()
        alert(result.error || 'Failed to add inventory')
      }
    } catch (error) {
      console.error('Error adding inventory:', error)
      alert('Error adding inventory')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenUpdateStock = (inventory: any) => {
    setSelectedInventory(inventory)
    setUpdateStockForm({
      quantityAvailable: inventory.quantity_available?.toString() || '',
      minimumStockLevel: inventory.minimum_stock_level?.toString() || '',
      expiryDate: inventory.expiry_date || '',
      batchNumber: inventory.batch_number || '',
      supplier: inventory.supplier || ''
    })
    setUpdateStockModal(true)
  }

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInventory) return
    
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/pharmacy/inventory/${selectedInventory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantityAvailable: updateStockForm.quantityAvailable ? parseInt(updateStockForm.quantityAvailable) : undefined,
          minimumStockLevel: updateStockForm.minimumStockLevel ? parseInt(updateStockForm.minimumStockLevel) : undefined,
          expiryDate: updateStockForm.expiryDate || undefined,
          batchNumber: updateStockForm.batchNumber || undefined,
          supplier: updateStockForm.supplier || undefined
        })
      })

      if (response.ok) {
        alert('Stock updated successfully!')
        setUpdateStockModal(false)
        fetchData() // Refresh dashboard
      } else {
        const result = await response.json()
        alert(result.error || 'Failed to update stock')
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Error updating stock')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/auth/login'
    }
  }

  if (isLoading || !currentUser || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const { profile, pendingPrescriptions, lowStockItems, expiringItems, recentInventory, stats } = dashboardData

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Pill className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Pharmacy Portal</h1>
                <p className="text-xs text-muted-foreground">Medication & Inventory Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={handleOpenAddInventory}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
              <Badge variant="secondary" className="capitalize">
                {currentUser.name}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Good morning, {profile.first_name}!</h1>
          <p className="text-muted-foreground">Pharmacy operations and inventory overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPrescriptions}</div>
              <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.lowStockCount}</div>
              <p className="text-xs text-muted-foreground">Need reordering</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.expiringCount}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Filled</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.filledToday}</div>
              <p className="text-xs text-muted-foreground">Prescriptions completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Pharmacy Tabs */}
        <Tabs defaultValue="prescriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Prescription Management</h3>
                <p className="text-sm text-muted-foreground">Process and fulfill patient prescriptions</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search prescriptions..." className="pl-10 w-64" />
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pending Prescriptions</CardTitle>
                <CardDescription>Prescriptions awaiting fulfillment</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingPrescriptions.length ? (
                  <div className="space-y-4">
                    {pendingPrescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Pill className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{prescription.medication_name || 'Unknown Medication'}</p>
                            <Badge variant="secondary" className="text-xs">
                              {prescription.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {prescription.patient_first_name}{" "}
                            {prescription.patient_last_name} • {prescription.dosage} •{" "}
                            {prescription.frequency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Prescribed by Dr. {prescription.doctor_first_name}{" "}
                            {prescription.doctor_last_name} •{" "}
                            {new Date(prescription.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewPrescription(prescription.id)}
                          >
                            View
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleFillPrescription(prescription.id)}
                          >
                            Fill
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending prescriptions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Inventory Management</h3>
                <p className="text-sm text-muted-foreground">Track medications and medical supplies</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search inventory..." className="pl-10 w-64" />
                </div>
                <Button size="sm" onClick={handleOpenAddInventory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Low Stock Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-destructive" />
                    Low Stock Items
                  </CardTitle>
                  <CardDescription>Items that need reordering</CardDescription>
                </CardHeader>
                <CardContent>
                  {lowStockItems.length ? (
                    <div className="space-y-3">
                      {lowStockItems.slice(0, 5).map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/50"
                          onClick={() => handleOpenUpdateStock(item)}
                        >
                          <div>
                            <p className="font-medium">{item.item_name}</p>
                            <p className="text-sm text-muted-foreground">{item.item_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-destructive">{item.current_stock} units</p>
                            <p className="text-xs text-muted-foreground">Min: {item.minimum_stock}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">All items well stocked</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expiring Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Expiring Soon
                  </CardTitle>
                  <CardDescription>Items expiring in the next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {expiringItems.length ? (
                    <div className="space-y-3">
                      {expiringItems.slice(0, 5).map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/50"
                          onClick={() => handleViewInventory(item.id)}
                        >
                          <div>
                            <p className="font-medium">{item.item_name}</p>
                            <p className="text-sm text-muted-foreground">{item.current_stock} units</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-yellow-600">
                              {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "No date"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.expiry_date
                                ? `${Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                                : "Unknown"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No items expiring soon</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Inventory Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Inventory Updates</CardTitle>
                <CardDescription>Latest changes to inventory items</CardDescription>
              </CardHeader>
              <CardContent>
                {recentInventory.length ? (
                  <div className="space-y-4">
                    {recentInventory.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.item_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.item_type} • Stock: {item.current_stock} units
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ₹{item.unit_price ? Number(item.unit_price).toFixed(2) : "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewInventory(item.id)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent inventory updates</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  System Alerts
                </CardTitle>
                <CardDescription>Important notifications requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Critical Stock Alert */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg border-destructive/20 bg-destructive/5">
                    <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Critical Stock Levels</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.lowStockCount} items below minimum stock levels
                      </p>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>

                  {/* Expiring Items Alert */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Items Expiring Soon</p>
                      <p className="text-sm text-muted-foreground">{stats.expiringCount} items expire within 30 days</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400"
                    >
                      Warning
                    </Badge>
                  </div>

                  {/* Pending Prescriptions Alert */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Pending Prescriptions</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.pendingPrescriptions} prescriptions awaiting fulfillment
                      </p>
                    </div>
                    <Badge variant="secondary">Info</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Prescription Analytics</CardTitle>
                  <CardDescription>Fulfillment rates and processing times</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Inventory Turnover</CardTitle>
                  <CardDescription>Stock movement and usage patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Expiry Management</CardTitle>
                  <CardDescription>Waste reduction and expiry tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Cost Analysis</CardTitle>
                  <CardDescription>Medication costs and supplier analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Patient Compliance</CardTitle>
                  <CardDescription>Prescription pickup and adherence rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Regulatory Compliance</CardTitle>
                  <CardDescription>DEA and FDA compliance tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Prescription Modal */}
      <Dialog open={viewPrescriptionModal} onOpenChange={setViewPrescriptionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>Full prescription information</DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Medication</Label>
                  <p className="text-lg font-semibold">{selectedPrescription.medication_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant="secondary">{selectedPrescription.status}</Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Patient</Label>
                <p>{selectedPrescription.patient_first_name} {selectedPrescription.patient_last_name}</p>
                <p className="text-sm text-muted-foreground">MRN: {selectedPrescription.medical_record_number}</p>
                <p className="text-sm text-muted-foreground">Phone: {selectedPrescription.patient_phone}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Prescribing Doctor</Label>
                <p>Dr. {selectedPrescription.doctor_first_name} {selectedPrescription.doctor_last_name}</p>
                <p className="text-sm text-muted-foreground">{selectedPrescription.doctor_specialization}</p>
                <p className="text-sm text-muted-foreground">License: {selectedPrescription.doctor_license}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dosage</Label>
                  <p>{selectedPrescription.dosage}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Frequency</Label>
                  <p>{selectedPrescription.frequency}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                <p>{selectedPrescription.duration_days} days</p>
              </div>

              {selectedPrescription.instructions && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Instructions</Label>
                  <p className="text-sm">{selectedPrescription.instructions}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setViewPrescriptionModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                {selectedPrescription.status === 'pending' && (
                  <Button 
                    onClick={() => handleFillPrescription(selectedPrescription.id)}
                    className="flex-1"
                  >
                    Fill Prescription
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Inventory Modal */}
      <Dialog open={viewInventoryModal} onOpenChange={setViewInventoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inventory Details</DialogTitle>
            <DialogDescription>Complete inventory item information</DialogDescription>
          </DialogHeader>
          {selectedInventory && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Medication</Label>
                <p className="text-lg font-semibold">{selectedInventory.medication_name}</p>
                <p className="text-sm text-muted-foreground">{selectedInventory.medication_category}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Stock</Label>
                  <p className="text-2xl font-bold">{selectedInventory.quantity_available} units</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Minimum Level</Label>
                  <p className="text-2xl font-bold">{selectedInventory.minimum_stock_level} units</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Unit Price</Label>
                  <p>₹{selectedInventory.unit_price ? Number(selectedInventory.unit_price).toFixed(2) : 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Expiry Date</Label>
                  <p>{selectedInventory.expiry_date ? new Date(selectedInventory.expiry_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {selectedInventory.batch_number && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Batch Number</Label>
                  <p>{selectedInventory.batch_number}</p>
                </div>
              )}

              {selectedInventory.supplier && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Supplier</Label>
                  <p>{selectedInventory.supplier}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setViewInventoryModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setViewInventoryModal(false)
                    handleOpenUpdateStock(selectedInventory)
                  }}
                  className="flex-1"
                >
                  Update Stock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Inventory Modal */}
      <Dialog open={addInventoryModal} onOpenChange={setAddInventoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Add a new medication to inventory</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddInventory} className="space-y-4">
            <div>
              <Label htmlFor="medication">Medication *</Label>
              <select
                id="medication"
                className="w-full mt-1 p-2 border rounded-md"
                value={addInventoryForm.medicationId}
                onChange={(e) => setAddInventoryForm({...addInventoryForm, medicationId: e.target.value})}
                required
              >
                <option value="">Select medication</option>
                {medications.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.name} - {med.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={addInventoryForm.quantityAvailable}
                  onChange={(e) => setAddInventoryForm({...addInventoryForm, quantityAvailable: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="minStock">Minimum Stock *</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="1"
                  value={addInventoryForm.minimumStockLevel}
                  onChange={(e) => setAddInventoryForm({...addInventoryForm, minimumStockLevel: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={addInventoryForm.expiryDate}
                onChange={(e) => setAddInventoryForm({...addInventoryForm, expiryDate: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                value={addInventoryForm.batchNumber}
                onChange={(e) => setAddInventoryForm({...addInventoryForm, batchNumber: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={addInventoryForm.supplier}
                onChange={(e) => setAddInventoryForm({...addInventoryForm, supplier: e.target.value})}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button"
                onClick={() => setAddInventoryModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Stock Modal */}
      <Dialog open={updateStockModal} onOpenChange={setUpdateStockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>Modify inventory item details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="updateQuantity">Quantity</Label>
                <Input
                  id="updateQuantity"
                  type="number"
                  min="0"
                  value={updateStockForm.quantityAvailable}
                  onChange={(e) => setUpdateStockForm({...updateStockForm, quantityAvailable: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="updateMinStock">Minimum Stock</Label>
                <Input
                  id="updateMinStock"
                  type="number"
                  min="0"
                  value={updateStockForm.minimumStockLevel}
                  onChange={(e) => setUpdateStockForm({...updateStockForm, minimumStockLevel: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="updateExpiryDate">Expiry Date</Label>
              <Input
                id="updateExpiryDate"
                type="date"
                value={updateStockForm.expiryDate}
                onChange={(e) => setUpdateStockForm({...updateStockForm, expiryDate: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="updateBatchNumber">Batch Number</Label>
              <Input
                id="updateBatchNumber"
                value={updateStockForm.batchNumber}
                onChange={(e) => setUpdateStockForm({...updateStockForm, batchNumber: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="updateSupplier">Supplier</Label>
              <Input
                id="updateSupplier"
                value={updateStockForm.supplier}
                onChange={(e) => setUpdateStockForm({...updateStockForm, supplier: e.target.value})}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button"
                onClick={() => setUpdateStockModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Stock'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
