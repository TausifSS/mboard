# Maktab Management System

A minimal, clean, fast, mobile-first web application designed specifically for daily Maktab management (Quran & Islamic lessons).

---

## Key Features

1. **Student Directory & Instant Search**
   - Fast, case-insensitive real-time filtering as you type.
   - Minimalist list view displaying only Student Name and Father's Name.
   - Handles empty states ("No students added yet.", "No student found.").

2. **Student Dashboard & Profile**
   - Individual student view with Name, Father's Name, and Mobile Number (with direct dial support).
   - **Monthly Attendance Summary** (`Present: X`, `Absent: Y`).
   - **Monthly Attendance Calendar** launcher.
   - **Sabak Tracking**: Emphasizes **yesterday's Sabak** (`12 September — Sabak`) with binary `[ ✓ Yes ] [ ✕ No ]`.

3. **Today's Attendance Screen**
   - Dedicated screen focused strictly on **TODAY**.
   - Prominent, touch-friendly `[ Present ]` and `[ Absent ]` toggles for one-handed mobile use.
   - Auto-rollover: When the clock strikes midnight, today's date advances automatically while historical records are preserved.

4. **Monthly Attendance Calendar**
   - High-contrast, clean monthly grid without unnecessary decorative dots.
   - Click any date to inspect historical status (Present / Absent / Unmarked).
   - Effortlessly browse between months.

5. **Secure Teacher Dashboard & CRUD**
   - Protected management console for adding, editing, and deleting students.
   - Foreign-key safe cascading deletes for attendance and Sabak records.
   - Delete confirmation modal prevents accidental data loss.

6. **Enterprise Security & Zero Secrets in Client**
   - Teacher access protected via private code (`19836-6`).
   - **Never hard-coded in plain-text** in frontend JS, HTML, or CSS.
   - Server-side PostgreSQL RPC function (`verify_teacher_passcode`) with `SECURITY DEFINER` and bcrypt hashing.
   - Client-side fallback utilizes one-way SHA-256 cryptographic hashing.
   - Full Row Level Security (RLS) restricts write operations to authorized sessions.

7. **Advertisement Architecture (Ready for Future)**
   - Database schema and `AdsService` fully implemented for Islamic products (miswak, books, etc.).
   - `ADS = OFF`: All advertisement rendering is deactivated in this release.

---

## Directory Structure

```
c:\Users\Tausif Shaikh\Desktop\Mboard\
├── index.html                   # Mobile-first responsive single page app
├── css/
│   ├── styles.css               # Modern Islamic minimalist design palette
│   └── calendar.css             # High-readability attendance calendar styles
├── js/
│   ├── config.js                # Supabase URL and configuration settings
│   ├── dateUtils.js             # Timezone-aware date calculations (Today / Yesterday)
│   ├── supabaseClient.js        # Supabase CDN client initialization
│   ├── db.js                    # Unified Data Access Layer (Supabase + LocalStore)
│   ├── auth.js                  # Cryptographic Teacher Auth module
│   ├── components/
│   │   ├── studentList.js       # Live search & student list
│   │   ├── studentDashboard.js  # Student profile, attendance stats & Sabak
│   │   ├── attendanceView.js    # Rapid today's attendance marking
│   │   ├── calendarModal.js     # Monthly attendance calendar
│   │   ├── teacherDashboard.js  # Teacher CRUD and management console
│   │   └── adsService.js        # Inactive advertisement infrastructure
│   └── app.js                   # Application router and event controller
├── supabase/
│   ├── schema.sql               # PostgreSQL tables, constraints & triggers
│   ├── rls_policies.sql         # Supabase Row Level Security policies
│   ├── rpc_teacher_auth.sql     # Secure server-side passcode verification RPC
│   └── seed.sql                 # Sample students, attendance, and Sabak data
└── README.md                    # Setup and testing guide
```

---

## Running the Application

### Instant Offline / Standalone Mode (Zero Setup)
Simply double click `index.html` or open it with any web browser!
The application comes pre-loaded with realistic seed records (Abdullah Shaikh, Ibrahim Shaikh, etc.), attendance history for September 2026, and offline storage support in `localStorage`.

### Connecting to Supabase (Production Mode)

1. **Create a Supabase Project**:
   - Go to [database.new](https://database.new) and create a new project.
2. **Execute Database Scripts in Supabase SQL Editor**:
   - Run `supabase/schema.sql` (Creates `students`, `attendance`, `sabak`, `advertisements`, `teacher_secrets`).
   - Run `supabase/rls_policies.sql` (Applies Row-Level Security policies).
   - Run `supabase/rpc_teacher_auth.sql` (Installs the secure teacher authentication RPC).
   - Run `supabase/seed.sql` (Loads sample students and attendance).
3. **Configure Frontend**:
   - Open `js/config.js` and set:
     ```javascript
     window.MAKTAB_CONFIG = {
       SUPABASE_URL: "https://your-project.supabase.co",
       SUPABASE_ANON_KEY: "your-anon-key-here",
       TIMEZONE: "Asia/Kolkata",
       ADS_ENABLED: false
     };
     ```

---

## Testing Scenarios Checklist

| # | Test Scenario | Expected Result |
|---|---------------|-----------------|
| 1 | Search `Abdullah` | "Abdullah Shaikh" appears immediately. Clicking opens Student Dashboard. |
| 2 | Abdullah Dashboard | Displays Name, Father Name, Mobile (`tel:` link), Monthly attendance summary, View Calendar button, and yesterday's Sabak. |
| 3 | Teacher Access | Tap "Teacher" in bottom nav. Enter `19836-6`. Authenticates and unlocks Add/Edit/Delete controls. |
| 4 | Mark Attendance | Toggle Abdullah to `Present` on Today's Attendance screen. Record saves with today's date. |
| 5 | Record Sabak | Tap `[ ✓ Yes ]` under yesterday's Sabak on Abdullah's dashboard. Status updates with yesterday's date. |
| 6 | Date Rollover | When midnight passes, active attendance screen automatically advances to the new date. |
| 7 | Calendar View | Open September 2026 calendar. Click 12 September. Shows historical attendance status. |
| 8 | Search non-existent | Type `NonExistentStudent123`. Displays clean empty state: "No student found." |
| 9 | Public write attempt | Public users without teacher authentication cannot mark attendance or save Sabak (blocked by RLS & UI). |
| 10 | Security audit | Inspect frontend code. Plain-text teacher passcode `19836-6` and service role keys are completely absent. |
