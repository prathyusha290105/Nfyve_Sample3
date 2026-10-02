# NFYVE – The Change
### Premium Integrated Wellness, Aesthetics & Transformation Centre
**Location:** 4th Floor, Kura Towers, Begumpet, Hyderabad, Telangana 500016, India  
**Contact:** +91 9000023050 | support@nfyve.com  

---

## 1. Project Overview
**NFYVE – The Change** is an integrated transformation and wellness platform designed for a premier multi-disciplinary centre in Begumpet, Hyderabad. The centre provides:
1. **Clinical Aesthetics & Dermatology**
2. **Medical Metabolic Weight Loss**
3. **Private Fitness & Personal Training**
4. **Luxury Hair & Salon Artistry**
5. **Clinical Nutrition & Gut Health**

The application contains three seamlessly connected interfaces:
1. **Public-Facing Business Website:** Brand storytelling, service catalogue, interactive gallery, testimonials, and slot-locked appointment booking.
2. **Admin Management Dashboard (`/admin`):** Full business oversight, 11 date range analytics presets, appointment table, customer directory, staff management with multiple specialties, service catalogue management, inquiry inbox, review moderation, and business settings.
3. **Personalized Staff Dashboard (`/staff`):** Data-isolated practitioner workspace displaying only appointments assigned to the logged-in staff UID, personal workload forecasts, completion rates, attributed revenue, and client care dossiers.

---

## 2. Technology Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion, Recharts
- **Authentication:** Firebase Authentication (Email/Password) with role-based access control (`admin`, `staff`, `customer`) and active account enforcement.
- **Application Database:** Cloud Firestore with strict Firestore Security Rules (`firestore.rules`).
- **Full-Stack Server:** Express with Vite middlewares (`server.ts`) for unified client-server execution.
- **Resilience Architecture:** Dual-Store Mode — when Firebase environment credentials are configured, the app runs natively on Cloud Firestore & Firebase Auth; when running in initial local preview, it gracefully falls back without crashing while preserving complete interactivity.

---

## 3. Firebase Configuration & Environment Setup

### Environment Variables
Configure the following client environment variables in `.env` (refer to `.env.example`):

```bash
# Firebase Client Configuration
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="nfyve-the-change.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="nfyve-the-change"
VITE_FIREBASE_STORAGE_BUCKET="nfyve-the-change.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"

# Optional Gemini AI Assistant & Server Configuration
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
PORT=3000
JWT_SECRET="nfyve-the-change-secret-key-2026"
```

---

## 4. Firebase Authentication & User Roles

### Roles
- **`admin`**: Full business administrative access (`/admin`). Can manage appointments, staff, services, pricing, revenue analytics, customer dossiers, reviews, inquiries, and facility settings.
- **`staff`**: Individual practitioner access (`/staff`). Strict data isolation: staff members only see appointments, performance analytics, and dossiers for clients assigned directly to their Firebase UID.
- **`customer`**: Public visitor/client account (`/account`). Can view their own bookings, reschedule requests, and update contact information.

### First-Admin Setup Procedure
To establish your root administrator account:
1. In the **Firebase Console**, navigate to **Authentication** > **Sign-in method** and enable **Email/Password**.
2. Click **Add User** and create an administrator account, for example: `admin@nfyve.com`.
3. In **Firestore Database**, navigate to the `users` collection and create a document with the Document ID matching the admin's Firebase Auth `UID`:
   ```json
   {
     "uid": "<AUTH_UID>",
     "name": "Sanctuary Director",
     "email": "admin@nfyve.com",
     "phone": "+91 9000023050",
     "role": "admin",
     "active": true,
     "designation": "Executive Sanctuary Director",
     "department": "Management",
     "createdAt": "2026-10-02T12:00:00.000Z"
   }
   ```
4. Sign in via `/login` under the **Staff / Admin Login** tab.

### Staff Account Provisioning Workflow
To prevent unauthorized staff creation:
1. Administrators invite staff through **Admin Console > Staff Management** (`/admin/staff`) by clicking **+ Add / Invite Practitioner**.
2. Fill in the practitioner's name, email, phone, designation, multiple specialties (e.g., Aesthetics, Weight Loss, Fitness, Salon, Nutrition), and initial password.
3. The system securely provisions the practitioner's Firestore profile under `users/{staffUid}` with `role: 'staff'` and `active: true`.
4. Staff members sign in using the **Staff / Admin Login** portal and are routed directly to their personalized dashboard at `/staff`.

---

## 5. Cloud Firestore Data Schema

```
/users/{uid}
  ├── uid: string
  ├── name: string
  ├── email: string
  ├── phone: string
  ├── role: "admin" | "staff" | "customer"
  ├── active: boolean
  ├── designation?: string
  ├── department?: string
  ├── specialties?: string[]
  ├── bio?: string
  └── createdAt: timestamp / ISO string

/appointments/{appointmentId}
  ├── bookingReference: string (e.g. "NF-2026-4821")
  ├── customerId: string
  ├── customerName: string
  ├── customerEmail: string
  ├── customerPhone: string
  ├── serviceId: string
  ├── serviceName: string
  ├── categoryName: string
  ├── assignedStaffId: string (UID of staff member)
  ├── assignedStaffName: string
  ├── appointmentDate: string (YYYY-MM-DD)
  ├── timeSlot: string (e.g. "11:00 AM - 12:00 PM")
  ├── fee: number
  ├── paymentStatus: "pending" | "paid" | "refunded"
  ├── appointmentStatus: "pending" | "confirmed" | "completed" | "cancelled" | "no-show"
  ├── notes: string
  └── createdAt: timestamp / ISO string

/services/{serviceId}
  ├── name: string
  ├── categoryId: string
  ├── categoryName: string
  ├── priceInr: number
  ├── durationMins: number
  ├── shortDesc: string
  ├── fullDesc: string
  ├── active: boolean
  └── imageUrl: string

/customers/{customerId}
  ├── name: string
  ├── email: string
  ├── phone: string
  └── createdAt: timestamp / ISO string

/reviews/{reviewId}
  ├── customerName: string
  ├── serviceCategory: string
  ├── serviceName: string
  ├── rating: number (1-5)
  ├── reviewText: string
  ├── isApproved: boolean
  ├── moderationStatus: "pending" | "approved" | "rejected"
  └── reviewDate: string

/contactInquiries/{inquiryId}
  ├── name: string
  ├── email: string
  ├── phone: string
  ├── subject: string
  ├── message: string
  ├── status: "unread" | "in_progress" | "resolved" | "closed"
  └── createdAt: timestamp / ISO string

/businessSettings/sanctuary
  ├── businessName: "NFYVE – The Change"
  ├── location: "Begumpet, Hyderabad"
  ├── address: "4th Floor, Kura Towers, Begumpet, Hyderabad, Telangana 500016"
  ├── phone: "+91 9000023050"
  ├── email: "support@nfyve.com"
  ├── openingHours: { weekdays: "...", saturday: "...", sunday: "..." }
  └── cancellationPolicy: "..."
```

---

## 6. Firestore Security Rules Deployment

Deploy the included `firestore.rules` via the Firebase CLI:

```bash
# Login to Firebase
firebase login

# Set your active Firebase project
firebase use --add

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

Key security guarantees in `firestore.rules`:
- **Default Deny**: All unspecified paths are closed.
- **Strict Staff Isolation**: Staff practitioners can ONLY read and write appointments where `resource.data.assignedStaffId == request.auth.uid`.
- **Admin Role Verification**: Validates the role in the user's Firestore document.
- **Anti-Elevation Protection**: Users cannot modify their own `role` or `active` status fields.
- **Public Protection**: Customers cannot read other customers' data or administrative financial records.
- **Review Moderation**: Unapproved reviews are strictly unreadable by public visitors.

---

## 7. Firestore Index Requirements

For optimal compound queries with date filtering and status sorting, ensure the following composite indexes are created in Firebase Console:

| Collection | Fields Indexed | Query Scope |
| :--- | :--- | :--- |
| `appointments` | `assignedStaffId` (Ascending), `appointmentDate` (Descending) | Collection |
| `appointments` | `assignedStaffId` (Ascending), `appointmentStatus` (Ascending) | Collection |
| `appointments` | `appointmentDate` (Descending), `appointmentStatus` (Ascending) | Collection |
| `reviews` | `isApproved` (Ascending), `createdAt` (Descending) | Collection |

*(The Firebase Web SDK will automatically output direct console links to create any missing compound indexes during initial development).*

---

## 8. Pre-Seeded Demonstration Accounts

For instant local testing and inspection, the application includes pre-configured credentials:

| Role | Email | Password | Destination Route |
| :--- | :--- | :--- | :--- |
| **Full Administrator** | `admin@nfyve.com` | `Admin@NFYVE2026` | `/admin` (Operations Console) |
| **Aesthetics Specialist** | `dr.ananya@nfyve.com` | `Staff@NFYVE2026` | `/staff` (Practitioner Portal) |
| **Fitness Coach** | `vikram.singh@nfyve.com` | `Staff@NFYVE2026` | `/staff` (Practitioner Portal) |
| **General Staff** | `staff@nfyve.com` | `Staff@NFYVE2026` | `/staff` (Practitioner Portal) |
| **Customer / Client** | `priya.sharma@example.com` | `Customer@123` | `/account` (Client Dossier) |

*Quick-fill demo buttons are accessible directly on the Login screen (`/login`).*

---

## 9. Development & Run Commands

```bash
# Install dependencies
npm install

# Start local full-stack server (Port 3000)
npm run dev

# Check TypeScript types and lint
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```
