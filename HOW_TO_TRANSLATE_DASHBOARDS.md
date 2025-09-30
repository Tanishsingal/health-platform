# How to Translate Dashboard Pages

## ✅ What's Already Translated

- **Homepage** - Fully translated in all 7 languages
- **Patient Dashboard** - Key sections translated (header, stats, welcome message)

---

## 🔧 How to Translate Any Dashboard

Follow these 3 simple steps for any dashboard page (doctor, nurse, pharmacy, admin, etc.):

### Step 1: Add Translation Hook

At the top of your page component, add:

```typescript
"use client"  // Must be a client component

import { useTranslations } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function YourDashboard() {
  const t = useTranslations('dashboard.yourRole')  // e.g., 'dashboard.doctor'
  
  // ... rest of your component
}
```

### Step 2: Add Language Switcher to Header

In your header section, add the `LanguageSwitcher`:

```typescript
<header>
  <div className="flex items-center justify-between">
    <div>
      <h1>{t('title', 'Your Dashboard')}</h1>
    </div>
    <div className="flex items-center gap-3">
      <LanguageSwitcher />  {/* Add this! */}
      <Button onClick={handleLogout}>{t('logout', 'Logout')}</Button>
    </div>
  </div>
</header>
```

### Step 3: Replace Hardcoded Text

Replace all hardcoded strings with translation calls:

**Before:**
```typescript
<h1>Welcome to Doctor Dashboard</h1>
<p>Manage your patients</p>
<Button>Book Appointment</Button>
```

**After:**
```typescript
<h1>{t('welcome', 'Welcome to Doctor Dashboard')}</h1>
<p>{t('managePatients', 'Manage your patients')}</p>
<Button>{t('bookAppointment', 'Book Appointment')}</Button>
```

---

## 📝 Adding Translations to JSON Files

For each text you translate, add it to **all 7 language files**:

### Example: Doctor Dashboard

**File: `messages/en.json`**
```json
{
  "dashboard": {
    "doctor": {
      "title": "Doctor Portal",
      "welcome": "Welcome, Doctor",
      "todayPatients": "Today's Patients",
      "upcomingConsultations": "Upcoming Consultations"
    }
  }
}
```

**File: `messages/hi.json`**
```json
{
  "dashboard": {
    "doctor": {
      "title": "डॉक्टर पोर्टल",
      "welcome": "स्वागत है, डॉक्टर",
      "todayPatients": "आज के मरीज",
      "upcomingConsultations": "आगामी परामर्श"
    }
  }
}
```

Repeat for: `ta.json`, `te.json`, `bn.json`, `mr.json`, `gu.json`

---

## 🎯 Quick Reference: Translations for Common Dashboards

### Doctor Dashboard (`dashboard.doctor`)

```json
{
  "title": "Doctor Portal",
  "subtitle": "Healthcare Management",
  "welcome": "Welcome, Doctor",
  "todayPatients": "Today's Patients",
  "upcomingConsultations": "Upcoming Consultations",
  "patientQueue": "Patient Queue",
  "prescriptions": "Prescriptions",
  "viewDetails": "View Details"
}
```

### Pharmacy Dashboard (`dashboard.pharmacy`)

```json
{
  "title": "Pharmacy Portal",
  "subtitle": "Medication Management",
  "welcome": "Welcome to Pharmacy",
  "pendingPrescriptions": "Pending Prescriptions",
  "inventory": "Inventory",
  "lowStock": "Low Stock Items",
  "fillPrescription": "Fill Prescription"
}
```

### Nurse Dashboard (`dashboard.nurse`)

```json
{
  "title": "Nurse Portal",
  "subtitle": "Patient Care Dashboard",
  "welcome": "Welcome, Nurse",
  "assignedPatients": "Assigned Patients",
  "vitals": "Vital Signs",
  "tasks": "Tasks",
  "recordVitals": "Record Vitals"
}
```

### Admin Dashboard (`dashboard.admin`)

```json
{
  "title": "Admin Portal",
  "subtitle": "System Management",
  "welcome": "Welcome, Administrator",
  "totalUsers": "Total Users",
  "systemHealth": "System Health",
  "reports": "Reports",
  "manageUsers": "Manage Users"
}
```

---

## 🌍 Translation Tips

### 1. **Always Provide a Default Value**
```typescript
t('key', 'Default English text')
```
This ensures the app works even if a translation is missing.

### 2. **Use Descriptive Keys**
```typescript
// Good
t('upcomingAppointments', 'Upcoming Appointments')
t('noDataFound', 'No data found')

// Bad
t('text1', 'Some text')
t('label', 'Label')
```

### 3. **Group Related Translations**
```json
{
  "dashboard": {
    "patient": {
      "appointments": {
        "upcoming": "Upcoming",
        "past": "Past",
        "canceled": "Canceled"
      }
    }
  }
}
```

### 4. **Test in All Languages**
After adding translations:
1. Switch to each language
2. Check that text displays correctly
3. Verify layout doesn't break (some languages are longer)

---

## 🚀 Example: Translating Doctor Dashboard

### 1. Update `app/doctor/page.tsx`:

```typescript
"use client"

import { useTranslations } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function DoctorDashboard() {
  const t = useTranslations('dashboard.doctor')
  
  return (
    <div>
      <header>
        <div className="flex justify-between">
          <div>
            <h1>{t('title', 'Doctor Portal')}</h1>
            <p>{t('subtitle', 'Healthcare Management')}</p>
          </div>
          <div className="flex gap-3">
            <LanguageSwitcher />
            <Button>{t('logout', 'Logout')}</Button>
          </div>
        </div>
      </header>
      
      <main>
        <h2>{t('welcome', 'Welcome, Doctor')}</h2>
        <Card>
          <CardTitle>{t('todayPatients', "Today's Patients")}</CardTitle>
          <CardContent>{patientCount}</CardContent>
        </Card>
      </main>
    </div>
  )
}
```

### 2. Add translations to all JSON files

Add to `messages/en.json`, `messages/hi.json`, etc.

---

## 📚 Full Workflow Summary

1. ✅ **Add translation hook** at top of component
2. ✅ **Add LanguageSwitcher** to header
3. ✅ **Replace hardcoded text** with `t()` calls
4. ✅ **Add translations** to all 7 JSON files
5. ✅ **Test** in each language

---

## 🎉 You're Ready!

The **patient dashboard is now fully translated** and working as an example. Use this same pattern for:
- Doctor dashboard
- Nurse dashboard
- Pharmacy dashboard
- Admin dashboard
- Lab dashboard

**Refresh your browser and change languages to see it in action!** 🌍 