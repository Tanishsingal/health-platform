# 🔔 Notifications System

## ✅ **What's New**

Patients now receive **real-time notifications** when doctors:
- ✅ Create prescriptions for them
- ✅ Order lab tests for them

---

## 🎯 **Features**

### **For Patients** 🧑‍🦱

**Notification Bell in Header:**
- 🔔 Bell icon shows **unread count** badge
- Click bell to see notification dropdown
- Blue dot indicates unread notifications
- Click notification to mark as read
- "Mark all as read" button available

**Notification Types:**
1. **New Prescription** - When doctor prescribes medication
2. **New Lab Test Order** - When doctor orders a lab test

**Information Shown:**
- Notification title
- Detailed message
- Date and time
- Read/unread status

---

## 📋 **How It Works**

### **Workflow**

```
Doctor creates prescription
        ↓
System saves prescription to database
        ↓
System creates notification for patient
        ↓
Patient sees notification immediately
        ↓
Patient clicks notification
        ↓
Notification marked as read
        ↓
Patient can view full prescription details
```

---

## 🎨 **UI Features**

### **Notification Bell**
- **Red badge** shows unread count (e.g., "3")
- Badge shows "9+" for 10 or more notifications
- Bell icon in patient dashboard header
- Clickable to show/hide dropdown

### **Notification Dropdown**
- **Width:** 320px
- **Max height:** 384px with scroll
- **Position:** Right-aligned below bell
- **Shows:** Last 10 notifications
- **Styling:**
  - Unread: Blue background
  - Read: White background
  - Hover: Accent background

### **Notification Item**
- **Blue dot** for unread
- **Gray dot** for read
- Title (bold)
- Message (small text)
- Timestamp (relative/absolute)

---

## 💬 **Notification Messages**

### **Prescription Notification**
```
Title: "New Prescription"
Message: "Your doctor has prescribed Amoxicillin (500mg). 
         Please check your prescriptions for details."
```

### **Lab Test Notification**
```
Title: "New Lab Test Order"
Message: "Your doctor has ordered a lab test: Complete Blood Count (CBC). 
         Please visit the lab for sample collection."
```

---

## 🔧 **Technical Details**

### **Database Schema**
```sql
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,  -- 'prescription', 'lab_test', 'appointment', 'general'
  related_id UUID,             -- ID of prescription, lab test, etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
)
```

### **Indexes**
- `user_id` - Fast lookup by user
- `is_read` - Filter unread notifications
- `created_at` - Order by date
- `user_id, is_read` - Combined index for unread queries

### **API Endpoints**

**GET `/api/notifications`**
- Fetches notifications for current user
- Returns:
  - notifications: Array of notification objects
  - unreadCount: Number of unread notifications

**PUT `/api/notifications`**
- Mark notification(s) as read
- Body options:
  - `{ notificationId: "uuid" }` - Mark single notification
  - `{ markAllAsRead: true }` - Mark all as read

---

## 🚀 **How to Use**

### **For Patients:**

1. **See notifications:**
   - Look at bell icon in header
   - Red badge shows unread count

2. **Open notifications:**
   - Click bell icon
   - Dropdown appears

3. **Read notification:**
   - Click on any notification
   - Blue background disappears (marked as read)
   - View full details by going to prescriptions/lab tests

4. **Mark all as read:**
   - Click "Mark all as read" button
   - All notifications become read

### **For Developers:**

**Creating a Notification:**
```javascript
await query(
  `INSERT INTO notifications 
   (user_id, title, message, type, related_id, created_at)
   VALUES ($1, $2, $3, $4, $5, NOW())`,
  [userId, title, message, type, relatedId]
);
```

**Fetching Notifications:**
```javascript
const response = await fetch('/api/notifications')
const result = await response.json()
const { notifications, unreadCount } = result.data
```

**Marking as Read:**
```javascript
// Single notification
await fetch('/api/notifications', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notificationId: 'uuid' })
})

// All notifications
await fetch('/api/notifications', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markAllAsRead: true })
})
```

---

## 📊 **Automatic Notification Creation**

### **When Doctor Creates Prescription**
**API:** `POST /api/doctor/prescriptions/create`

1. Doctor submits prescription form
2. Prescription saved to database
3. **System automatically:**
   - Gets patient's user_id
   - Creates notification
   - Links to prescription via `related_id`
4. Patient sees notification immediately

### **When Doctor Orders Lab Test**
**API:** `POST /api/doctor/lab-orders/create`

1. Doctor submits lab order form
2. Lab order saved to database
3. **System automatically:**
   - Gets patient's user_id
   - Creates notification
   - Links to lab test via `related_id`
4. Patient sees notification immediately

---

## 🎯 **Use Cases**

### **Use Case 1: New Prescription**
```
1. Doctor creates prescription for fever medicine
2. Patient logs into dashboard
3. Sees notification bell with "1" badge
4. Clicks bell
5. Sees: "New Prescription - Your doctor has prescribed Paracetamol (650mg)"
6. Clicks notification to mark as read
7. Goes to prescriptions to view details
```

### **Use Case 2: Lab Test Order**
```
1. Doctor orders blood test
2. Patient already on dashboard
3. Notification bell updates to "1"
4. Patient clicks bell
5. Sees: "New Lab Test Order - Complete Blood Count (CBC)"
6. Patient knows to visit lab for sample collection
```

### **Use Case 3: Multiple Notifications**
```
1. Doctor creates 2 prescriptions and 1 lab order
2. Patient sees "3" badge on bell
3. Clicks bell
4. Sees all 3 notifications
5. Clicks "Mark all as read"
6. All marked as read
7. Badge disappears
```

---

## ✨ **Benefits**

### **For Patients:**
- ✅ **Instant updates** - Know immediately when doctor takes action
- ✅ **Never miss** - All notifications preserved
- ✅ **Easy access** - One click to see all
- ✅ **Clear status** - Visual indicators for read/unread
- ✅ **Better care** - Act on prescriptions and lab orders promptly

### **For Doctors:**
- ✅ **Better communication** - Patients notified automatically
- ✅ **No manual work** - System handles notifications
- ✅ **Improved compliance** - Patients aware of treatments
- ✅ **Faster response** - Patients see orders immediately

### **For Healthcare System:**
- ✅ **Improved engagement** - Patients stay informed
- ✅ **Better outcomes** - Faster treatment starts
- ✅ **Audit trail** - All notifications logged
- ✅ **Scalable** - Works for any number of users

---

## 🔄 **Notification Lifecycle**

```
Created
  ↓
Stored in database
  ↓
Fetched by patient dashboard
  ↓
Displayed in dropdown (unread with blue background)
  ↓
Patient clicks notification
  ↓
Marked as read (background turns white)
  ↓
Stays in history (can view old notifications)
```

---

## 📱 **Responsive Design**

- **Desktop:** Full-width dropdown
- **Tablet:** Adjusted width
- **Mobile:** Full-width with scroll
- Works on all screen sizes

---

## 🎊 **Summary**

**Real-time notification system** that keeps patients informed:
- ✅ **Automatic** - No manual sending needed
- ✅ **Real-time** - See updates immediately
- ✅ **Visual** - Badge and dot indicators
- ✅ **Interactive** - Click to mark as read
- ✅ **Complete** - View full details from notification

**Result:** Better communication between doctors and patients!

---

**📖 See Also:**
- `COMPREHENSIVE_PRESCRIPTION_SYSTEM.md` - How to create prescriptions
- `DOCTOR_DASHBOARD_FEATURES.md` - All doctor features
- `FINAL_DOCTOR_FEATURES_SETUP.md` - Complete setup guide 