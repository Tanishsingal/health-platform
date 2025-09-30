# Timezone Fix for Indian Hospitals

## Problem

The healthcare platform is designed for Indian public hospitals, but the appointment system was using inconsistent timezone handling:

1. **Appointment Booking**: Was appending `Z` to the time, forcing it to UTC instead of IST
2. **Doctor Dashboard**: Was using local server time instead of Indian Standard Time (IST)
3. **Result**: Appointments booked at 4:00 PM IST were stored as 10:30 AM UTC, and the doctor dashboard couldn't find them

## Solution

### 1. Fixed Appointment Booking (Patient Dashboard)

**File**: `app/patient/page.tsx`

**Before**:
```typescript
const appointmentDateTime = `${bookingForm.appointmentDate}T${bookingForm.appointmentTime}:00.000Z`
// This forced UTC timezone
```

**After**:
```typescript
const localDateTime = new Date(`${bookingForm.appointmentDate}T${bookingForm.appointmentTime}:00`)
const appointmentDateTime = localDateTime.toISOString()
// This respects the user's local timezone (IST for Indian users)
```

### 2. Fixed Doctor Dashboard (API)

**File**: `app/api/doctor/dashboard/route.ts`

**Before**:
```typescript
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);
// Used local server time
```

**After**:
```typescript
const now = new Date();
const ISTOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes
const nowIST = new Date(now.getTime() + ISTOffset);

const todayStart = new Date(nowIST);
todayStart.setUTCHours(0, 0, 0, 0);
// Explicitly uses IST (UTC+5:30)
```

## How It Works Now

### Appointment Booking Flow

1. **User selects**: Date: Oct 1, 2025 | Time: 4:00 PM
2. **Browser creates**: Local date object (IST timezone for Indian users)
3. **Converts to UTC**: Stored as `2025-10-01T10:30:00.000Z` in database
4. **Display**: When shown to users, automatically converts back to their local timezone (IST)

### Doctor Dashboard Flow

1. **API calculates**: Current time in IST (UTC+5:30)
2. **Sets ranges**:
   - Today: 00:00:00 to 23:59:59 IST
   - Upcoming: Tomorrow onwards in IST
3. **Database query**: Compares UTC timestamps correctly
4. **Result**: Shows appointments in the correct time slots

## Testing

### Test Scenario
1. **Login as patient**: `tanish.singal@shyftlabs.io`
2. **Book appointment**: Oct 1, 2025 at 4:00 PM
3. **Verify in database**: Should be stored as UTC (10:30 AM UTC = 4:00 PM IST)
4. **Login as doctor**: `doctor@test.in`
5. **Check dashboard**: Should see appointment in "Upcoming Appointments"

### Debug Commands

```bash
# Check all appointments with their timezones
node scripts/check-appointments.js

# Verify doctor IDs match
node scripts/check-doctor-ids.js
```

## Indian Standard Time (IST)

- **Timezone**: UTC+5:30 (5 hours 30 minutes ahead of UTC)
- **No DST**: India does not observe Daylight Saving Time
- **Offset**: +5:30 hours = 5.5 * 60 * 60 * 1000 milliseconds = 19800000ms

## Important Notes

1. **Database Storage**: All timestamps are stored in UTC in PostgreSQL
2. **Display**: User's browser automatically converts to their local timezone
3. **Server-side Logic**: Doctor dashboard API explicitly uses IST for date range calculations
4. **Consistency**: Both patient and doctor see times in IST when in India

## Future Improvements

1. **Consider using a timezone library** like `luxon` or `date-fns-tz` for more robust timezone handling
2. **Make timezone configurable** per hospital location (if expanding beyond India)
3. **Add timezone indicator** in UI (e.g., "4:00 PM IST")
4. **Test with users in different timezones** (e.g., Indian doctors accessing from abroad)

## Files Modified

1. `app/patient/page.tsx` - Fixed appointment date/time formatting
2. `app/api/doctor/dashboard/route.ts` - Added IST timezone handling
3. `TIMEZONE_FIX.md` - This documentation 