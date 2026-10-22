# NIVARA — Complete Modular Rural Healthcare Platform (MERN)

> **"Healthcare that reaches every community."**

NIVARA is a production-grade, multilingual, offline-ready, low-bandwidth healthcare platform architected specifically for rural communities across India. Built on the full MERN stack (MongoDB Atlas, Express.js, React, and Node.js), it empowers rural patients and Primary Health Center (PHC) healthcare workers to book consultations, maintain digital health records, assess symptoms safely, and synchronize offline field data seamlessly.

---

## 1. Core Principles

1. **Multilingual Access**: First-class support for English, தமிழ் (Tamil), and हिंदी (Hindi) with a centralized dictionary system that translates interfaces, navigation, badges, status notifications, and clinical records.
2. **Offline-First Functionality**: Progressive Web App (PWA) with service workers, local queue caching, client-generated temporary IDs, and an authenticated two-way synchronization engine.
3. **Low-Bandwidth Performance**: Lightweight Vite frontend, minimal HTTP payload size, SVG graphics, zero heavy assets, and resilience against intermittent 2G/3G mobile data connections.
4. **Modular Regional Deployment**: Dynamic database-backed regional configurations adapting local health services, clinical specialties, and Primary Health Centers based on regional state and district needs.

---

## 2. Technology Stack

- **Frontend**:
  - React 18
  - Vite 6
  - React Router DOM v6
  - Axios (with JWT interceptors and offline error handling)
  - Lucide React (featherlight SVG iconography)
  - Custom responsive CSS design system (pastel-blue healthcare aesthetic)
- **Backend**:
  - Node.js (v18+) & Express.js
  - RESTful APIs with centralized error handling
  - Mongoose 8 (Object Data Modeling)
  - JSON Web Tokens (JWT) for secure stateless authentication
  - bcryptjs for salted password hashing
  - Database connection diagnostics & graceful shutdown handlers
- **Database**:
  - MongoDB Atlas Cloud Database (`mywebsitecluster.61me3dd.mongodb.net`, database: `nivara`)
- **Offline & PWA**:
  - Web App Manifest (`manifest.json`)
  - Service Worker (`sw.js`) with stale-while-revalidate asset caching
  - Local queue with idempotent `clientTempId` tracking
- **Development Tooling**:
  - `concurrently` for running client and server together

---

## 3. Project Structure

```text
NIVARA-V2/
├── client/
│   ├── public/
│   │   ├── icon.svg             # App SVG icon
│   │   ├── manifest.json        # PWA Web App Manifest
│   │   └── sw.js                # Service Worker for offline asset caching
│   ├── src/
│   │   ├── components/          # Navbar, Footer, OfflineBanner, ProtectedRoute
│   │   ├── context/             # AuthContext, LanguageContext, RegionContext, OfflineSyncContext
│   │   ├── hooks/               # useNetworkStatus
│   │   ├── pages/               # LandingPage, LoginPage, RegisterPage, Dashboards, Consultations
│   │   ├── services/            # api.js, offlineStorage.js, syncService.js
│   │   ├── translations/        # Central dictionaries (en.js, ta.js, hi.js)
│   │   ├── App.jsx              # Main routing and layout
│   │   ├── index.css            # Pastel-blue healthcare design system
│   │   └── main.jsx             # Entry point with PWA SW registration
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   │   └── db.js                # MongoDB Atlas connection manager with diagnostics
│   ├── controllers/             # auth, patient, appointment, record, center, article, region, sync, admin
│   ├── middleware/              # auth.js, dbCheck.js, errorHandler.js
│   ├── models/                  # User, PatientProfile, HealthcareCenter, Appointment, MedicalRecord, HealthArticle, Region
│   ├── routes/                  # authRoutes, patientRoutes, appointmentRoutes, etc.
│   ├── scripts/
│   │   ├── createAdmin.js       # Secure CLI tool for provisioning administrator
│   │   └── initMasterCatalog.js # Initializes regions, centers, & articles (0 dummy users)
│   ├── tests/
│   │   └── runAllTests.js       # Automated test suite
│   ├── .env.example
│   ├── index.js                 # Express server & graceful shutdown
│   └── package.json
├── .env.example
├── .gitignore
├── package.json                 # Root orchestration scripts
└── README.md
```

---

## 4. Database Models

1. **User**: Full name, email (unique), password (bcrypt hashed, `select: false`), phone, role (`patient`, `healthcare_worker`, `admin`), preferred language, region, active status.
2. **PatientProfile**: Linked `userId`, age, gender, village, district, state, emergency contact, blood group, allergies.
3. **HealthcareCenter**: Center name, village, district, state, services array, emergency contact, working hours, assigned healthcare workers.
4. **Appointment**: Patient ID, healthcare worker ID, healthcare center ID, service, date, time slot, status (`Pending`, `Confirmed`, `Completed`, `Cancelled`), notes.
5. **MedicalRecord**: Patient ID, healthcare worker ID, consultation date, symptoms, diagnosis, prescription, clinical notes, follow-up date, `isOfflineCreated`, `clientTempId`, `syncedAt`.
6. **HealthArticle**: Title, category (`Maternal Health`, `Child Health`, `Nutrition`, `Hygiene`, `Diabetes`, `Blood Pressure`, `Vaccination`, `Common Diseases`), content, symptoms, prevention, when to seek help, language, region.
7. **Region**: Region name (unique), default language, supported languages array, services array, districts array, description, active status.

---

## 5. REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a new patient. Strictly prevents self-assigned `admin` or `healthcare_worker` roles. |
| `POST` | `/api/auth/login` | Public | Authenticates user credentials via bcrypt; returns JWT token and user profile. |
| `GET` | `/api/auth/me` | Private | Returns currently authenticated user and profile. |
| `POST` | `/api/auth/logout` | Public | Clears session. |

### Patient Management (`/api/patients`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/patients` | Worker, Admin | Search and filter patients by village, phone, or name. |
| `GET` | `/api/patients/:id` | Private | Retrieves patient profile, appointments, and records. Patients can only view themselves. |
| `POST` | `/api/patients` | Worker, Admin | Onboard a walk-in village patient during field consultations. |

### Healthcare Centers (`/api/centers`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/centers` | Public | Search directory with filters for state, district, and service. |
| `GET` | `/api/centers/:id` | Public | Get single center details and duty personnel. |
| `POST` | `/api/centers` | Admin | Create a new Primary Health Center. |
| `PUT` | `/api/centers/:id` | Admin | Update center details and services. |
| `DELETE` | `/api/centers/:id` | Admin | Deactivate center. |

### Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/appointments` | Private | Patients view only their own appointments. Healthcare workers view assigned and center appointments. |
| `POST` | `/api/appointments` | Private | Books a new appointment with date, time, and service validation. |
| `PUT` | `/api/appointments/:id` | Private | Update appointment status (`Confirmed`, `Completed`, `Cancelled`). |
| `DELETE` | `/api/appointments/:id` | Private | Patient or worker cancellation. |

### Medical Records (`/api/records`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/records/:patientId` | Private | Patient views only their own records. Workers/Admins view authorized records. |
| `POST` | `/api/records` | Worker, Admin | Create a clinical consultation record with symptoms, diagnosis, and prescription. |

### Modular Regional Deployment (`/api/regions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/regions` | Public | Get all active regional deployment configurations. |
| `GET` | `/api/regions/:id` | Public | Get details of a single region. |
| `POST` | `/api/regions` | Admin | Deploy a new region with localized languages and services. |
| `PUT` | `/api/regions/:id` | Admin | Modify regional settings. |

### Health Articles & Education (`/api/articles`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/articles` | Public | Filter educational guides by category, language, and search query. |
| `GET` | `/api/articles/:id` | Public | View article with clinical disclaimer. |
| `POST` | `/api/articles` | Admin | Publish verified health educational guides. |

### Synchronization & Metrics (`/api`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/sync` | Worker, Admin | Idempotent bulk sync of offline patients and medical records. Returns real MongoDB IDs. |
| `GET` | `/api/stats` | Admin | System dashboard counts: total patients, workers, centers, today's appointments, active regions. |
| `GET` | `/api/health` | Public | Health and diagnostic check with MongoDB connection status and cluster host. |

---

## 6. MongoDB Atlas Configuration

Your existing Atlas cluster hostname is:
`mywebsitecluster.61me3dd.mongodb.net`

Application database: `nivara`

### Environment Variables
Configure `server/.env` with these exact keys:

```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@mywebsitecluster.61me3dd.mongodb.net/nivara?retryWrites=true&w=majority

# Application Database Name
MONGODB_DB_NAME=nivara

# JWT Secret for session authentication
JWT_SECRET=your_secure_jwt_secret_key_nivara_2026

# Backend Server Port
PORT=5000

# Client Application URL for CORS
CLIENT_URL=http://localhost:3000
```

> [!IMPORTANT]
> **Atlas Setup Checklist:**
> 1. In **MongoDB Atlas > Database Access**, verify your database user has `readWrite` permissions on database `nivara`.
> 2. In **MongoDB Atlas > Network Access**, ensure your current IP address (or `0.0.0.0/0` for development) is added to the IP Access List.
> 3. Replace `<username>` and `<password>` with your actual Atlas user credentials.

---

## 7. Clean Database & Secure Administrator Provisioning

**Zero Demo Login Shortcuts**:
- NIVARA V2 starts with a 100% clean, empty database.
- No dummy users (Lakshmi Devi, Dr. Ananya Sharma, System Admin) or fake accounts are seeded.
- The 1-click demo login banner is completely omitted.

### Provisioning the First Administrator
To safely provision your administrator account into MongoDB Atlas:

```bash
# From root directory:
npm run create-admin

# Or with custom parameters:
npm run create-admin --prefix server -- --name="System Administrator" --email="admin@nivara-health.in" --password="YourSecurePassword123" --phone="9876543210"
```

The script connects to your Atlas database, securely hashes the password with bcrypt, assigns `role: 'admin'`, and verifies the account is active.

### Initializing Regional & Educational Master Catalog
To initialize master regional deployment profiles (Tamil Nadu, Uttar Pradesh, Karnataka), Primary Health Centers, and verified educational health articles **without adding any fake users**:

```bash
npm run init-catalog
```

---

## 8. Installation & Local Development

### Step 1: Install Dependencies
From the project root:
```bash
npm run install-all
```
*(This installs root, server, and client dependencies).*

### Step 2: Configure Environment
Copy `.env.example` to `server/.env` and enter your Atlas credentials:
```bash
cp server/.env.example server/.env
```

### Step 3: Run the Application
Start both the Express backend and React frontend concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Diagnostics**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 9. Offline Mode & Synchronization Workflow

1. **Detection**:
   - The app dynamically detects network loss via `navigator.onLine` and connection quality (2G/3G/4G).
   - An amber/red status pill and alert banner immediately indicate offline status.
   - For demonstrations or QA, click **"Test Offline Mode"** in the top navbar to simulate field conditions with zero internet.
2. **Offline Data Queuing**:
   - Healthcare workers can register walk-in patients and record clinical consultations offline.
   - Records are given a unique client UUID (`clientTempId`) and stored in persistent local queue storage.
   - A visible badge displays the count of pending records: `"X record(s) waiting to sync"`.
3. **Automatic Synchronization**:
   - When internet is restored, the application automatically pushes the queue to `POST /api/sync`.
   - The server validates each record, links patient references, inserts records into MongoDB Atlas, and returns real database IDs.
   - The client verifies server confirmation before safely clearing items from the queue.

---

## 10. Automated Testing & Verification

NIVARA V2 includes an automated test suite that executes real checks against all API validation rules, route guards, security controls, and an isolated temporary test database.

Run the test suite:
```bash
npm test
```

### Executed Tests:
- [x] Health & System Diagnostics endpoint check (`/api/health` returns 200).
- [x] 404 Handler for undefined API routes.
- [x] Input validation on empty and malformed request bodies.
- [x] Security: Public signup privilege escalation strictly blocked (`role: 'admin'` and `role: 'healthcare_worker'` return 403 Forbidden).
- [x] Bcrypt password hashing and salt verification.
- [x] Duplicate email registration rejection via unique index.
- [x] Healthcare center directory creation with service arrays.
- [x] Appointment booking lifecycle and status flow.
- [x] Medical record privacy and doctor consultation tracking.
- [x] Offline synchronization idempotency using `clientTempId`.
- [x] Clean teardown and drop of isolated test database.
- [x] Frontend production bundle compilation (`vite build` passes with 0 errors).

---

## 11. Troubleshooting

| Issue | Cause | Resolution |
|---|---|---|
| `503 DATABASE_UNAVAILABLE` | `MONGODB_URI` not configured or Atlas credentials incorrect. | Open `server/.env`, verify Atlas username, password, and cluster host. Check Atlas Network Access (add `0.0.0.0/0`). |
| Port 5000 already in use | Another process is occupying port 5000. | Change `PORT=5001` in `server/.env` and update `VITE_API_URL` or kill the occupying process. |
| PWA Service Worker not updating | Browser has cached previous version. | Refresh with `Ctrl + F5` or open DevTools > Application > Service Workers and click "Unregister". |
| `Cannot register as admin` | Public registration blocks privilege escalation. | This is an intentional security feature. Use `npm run create-admin` to provision admin accounts. |

---

© 2026 NIVARA Healthcare Platform. Developed for rural healthcare access across India.
