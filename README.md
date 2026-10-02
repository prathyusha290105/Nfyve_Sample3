# NFYVE – The Change
### Premium Integrated Wellness, Aesthetics & Transformation Centre
**Location:** 4th Floor, Kura Towers, Begumpet, Hyderabad, Telangana 500016, India  
**Contact:** +91 9000023050 | support@nfyve.com  

---

## 1. Overview
**NFYVE – The Change** is a full-stack web application designed for a premier multi-disciplinary transformation sanctuary. The sanctuary harmonizes medical dermatology, physician-led weight loss, functional athletic movement, trichology and salon rituals, and clean nutrition under one roof.

### Distinct Visual Language
The interface embraces a warm, editorial, boutique aesthetic:
- **Canvas:** Warm White / Ivory (`#FAF9F5`) and Soft Cream (`#F0EEE5`)
- **Brand Accents:** Deep Forest Green (`#244B3A`) and Sage Green (`#A8B8A0`)
- **Typography:** Refined Serif (`Cormorant Garamond`) for large headlines paired with clean geometric Sans (`Plus Jakarta Sans`)
- **Zero-Pill Discipline:** Pure unboxed metadata with typographic separators (`·`), single-line controls, tabular numerals (`tabular-nums`), and single-level elevation.

---

## 2. Architecture & Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion (Framer Motion), Recharts
- **Routing:** React Router v7 with protected customer and administrative route guards
- **Backend:** Express full-stack API mounted with Vite middlewares in development (`server.ts`)
- **Database & Persistence:** File-backed relational database engine with schemas, transactions, conflict-free appointment slot booking, and 12-month sample dataset.
- **Authentication:** Password hashing via `bcryptjs`, session tokens, and server-enforced role-based access control (`customer`, `staff`, `admin`).

---

## 3. Pre-Seeded Demonstration Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@nfyve.com` | `Admin@NFYVE2026` | Full administrative console at `/admin`, service CRUD, analytics, moderation |
| **Staff Member** | `staff@nfyve.com` | `Staff@NFYVE2026` | Operational console at `/admin`, walk-in booking, appointment management |
| **Customer** | `priya.sharma@example.com` | `Customer@123` | Public website, booking flow, `/account` dashboard |

*Quick-fill buttons are provided on the login page (`/login`) for convenience.*

---

## 4. Key Functional Features

### A. Public Website
- **Home (`/`):** Split-screen hero with custom botanical imagery, 4 core benefit pillars, interactive service showcases, Begumpet facility preview, verified reviews preview, working FAQ accordion, and footer.
- **About (`/about`):** Genesis story, multidisciplinary philosophy, facility tour, and medical/fitness leadership profiles.
- **Services Directory (`/services` & `/services/:slug`):** Interactive category filters across the 6 pillars, transparent INR pricing, session durations, detailed benefits, and precautions.
- **Spaces Gallery (`/gallery`):** Category-filtered photography of treatment suites, movement floors, and styling stations with high-res modal viewer.
- **Why Choose Us (`/why-choose-us`):** Breakdown of unified care vs fragmented traditional clinic models.
- **Verified Reviews (`/reviews`):** Filterable customer feedback with client review submission modal.
- **Contact & Map (`/contact`):** Operating hours, direct Begumpet phone line, interactive Google map embed, and validated inquiry form.
- **Comprehensive FAQ (`/faq`):** Expandable accordions covering aesthetics, weight loss, gym, and sanctuary logistics.

### B. Scheduling & Appointment Booking (`/book-appointment`)
- Multi-step interactive reservation workflow.
- Live available slot retrieval with double-booking prevention and concurrency protection.
- Authenticated customer verification with automatic return flow.
- Reference number generation (`NF-2026-XXXX`).

### C. Customer Sanctuary Portal (`/account`)
- Real-time appointment tracking (Upcoming vs Completed vs Cancelled).
- In-app appointment cancellation.
- Profile information management.

### D. Concierge Chatbot Widget
- Floating bottom-right assistant with quick replies for service exploration, booking direct links, opening hours, and Begumpet directions.

### E. Administrative Console (`/admin`)
- **Operations Overview (`/admin`):** Real-time summary metrics, quick actions, recent bookings register.
- **Sales & Revenue Analytics (`/admin/analytics`):** Dynamic area graphs, booking volume bar charts, discipline share pie charts, and all 11 date range presets (Today, Yesterday, This Week, Last 7 Days, This Month, Last Month, Last 3 Months, Last 6 Months, This Year, Last Year, Custom Range).
- **Appointment Register (`/admin/appointments`):** Search, status filters, status updates (Confirm, Complete, Cancel, No-Show), and walk-in/phone booking creation.
- **Customer Dossier Database (`/admin/customers`):** Searchable customer profiles with lifetime spend and appointment history.
- **Services & Pricing Management (`/admin/services`):** Full CRUD for treatments, INR prices, durations, and active states.
- **Inquiries Inbox (`/admin/inquiries`):** Status management for public messages.
- **Review Moderation (`/admin/reviews`):** Approve or withhold testimonials.
- **Settings (`/admin/settings`):** Business address, hours, and policies.

---

## 5. Development & Run Instructions

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Lint code and typecheck
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```
