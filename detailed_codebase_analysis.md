# CYBER COACH - Detailed Codebase Analysis

## 1. BACKEND ARCHITECTURE
**Tech Stack**: Node.js, Express, TypeScript, MongoDB (Mongoose), Supabase (external), ImageKit (video), Groq (AI).

### 1.1 Server Entry Point (`server.ts`)
- **Initialization**: Connects to MongoDB (`connectDB()`).
- **Middleware**:
  - `cors()`: Enables Cross-Origin Resource Sharing.
  - `express.json({ limit: '1mb' })`: Parses JSON bodies.
  - `globalLimiter`: Rate limits IP to 100 requests per 15 minutes to prevent abuse.
- **Route Mounting**:
  - `/api/student` -> `studentRoutes`
  - `/api/teacher` -> `teacherRoutes`
  - `/api/admin` -> `adminApiRoutes`
  - `/api/imagekit` -> `imagekitRoutes`
  - `/api/vu` -> `vuRoutes`
  - `/api/ai` -> `aiRoutes`
  - `/` -> `adminLegacyRoutes` (Legacy root handler)
- **Health Check**: `GET /` returns JSON with active modules list.
- **Execution**: Listens on `PORT` (default 4000) only if executed directly.

### 1.2 Route Modules & Logic

#### A. AI Module (`routes/aiRoutes.ts`)
- **Limiter**: Stricter rate limit (10 req / 15 min).
- **POST /ask**:
  - **Inputs**: `question`, `context` (optional).
  - **Logic**: Uses `Groq` SDK with model `llama-3.3-70b-versatile`.
  - **System Prompt**: Enforces persona as "Elite Cybersecurity Instructor". Strictly refuses non-security topics.
  - **Output**: JSON `{ answer: string }`.

#### B. VU (Virtual University) Module (`routes/vuRoutes.ts`)
- **Model**: `VUStudent` (MongoDB).
- **POST /register**: Creates new student record (name, email, faculty, year, department). Checks duplicates by email.
- **GET /check-registration/:email**: Returns boolean `registered`.
- **POST /progress**: Updates/Inserts module progress.
  - **Logic**: Finds student, checks `progress` array. If tuple (course_id, module_id) exists, updates it; otherwise pushes new object. Tracks `quiz_score`, `locked_until`, `completed_at`.
- **GET /progress/:email/:courseId**: Returns progress array filtered by course ID.
- **GET /student/:email**: Fetches full student profile.

#### C. Student Module
**Routes (`student/routes/index.ts`)**:
- **GET /overview**: Returns dashboard summary (mock data in `studentService.ts` currently).
- **GET /jobs**: Calls `getScrapedJobs`.
  - **Logic**: Selects all rows from Supabase table `scraped_jobs`, ordered by `posted_at`.
- **POST /verify-company**: **(Complex Feature - Detective Mode)**
  - **Controller**: `verificationController.ts`
  - **Process**:
    1.  **Detective Phase (Parallel Execution)**:
        -   **Scraper**: (`webScraper.ts`) Fetches HTML via Axios, cleans with Cheerio, extracts title, meta description, and first 5000 chars of body text.
        -   **Domain Intel**: (`domainIntel.ts`) Performs WHOIS lookup (with 10s timeout) to get registrar, creation date, country. Calculates `ageDays`.
        -   **Reputation**: (`reputationCheck.ts`) Uses SerpApi (Google) to search `"[Company] reviews fake legit"`. Counts "scam/fake/fraud" keywords in snippets.
            -   *Thresholds*: >12 hits = Negative, <=3 hits = Positive.
    2.  **Analyst Phase**: (`contentAnalyzer.ts`)
        -   Scans body text for keywords.
        -   *Red Flags*: "registration fee", "pay to work", "security deposit". (-25 pts each)
        -   *Green Flags*: "stipend", "insurance", "provident fund". (+20 pts each)
    3.  **Judge Phase**: (`decisionEngine.ts`)
        -   **Heuristic Score**: Base 15.
            -   *Domain Age*: <60 days (+25 risk), >3 years (-20 risk).
            -   *Reputation*: Negative (+25 risk), Positive (-15 risk).
            -   *Content*: Adds/Subtracts based on flags.
            -   *Scraper Fail*: (+5 risk).
            -   *Common TLD Bonus*: (-10 risk) if .com/.org and short length.
        -   **LLM Enhancement**: If Gemini key exists, sends aggregated data to Gemini 2.5 Flash for a second opinion ("SAFE"/"CAUTION"/"DANGER").
        -   **Final Verdict**: Risk > 65 = DANGER, > 45 = CAUTION, else SAFE.
- **Lab Routes**:
  - `POST /labs/:labId/complete`: Marks lab as done (In-memory map `labService.ts`).
  - `GET /labs/stats`: Returns completion percentage.
  - `GET /labs/:labId/status`: Checks if specific lab is done.

#### D. Teacher Module
**Routes (`teacher/routes/index.ts`)**:
- **Models**: `Teacher`, `Course`, `Enrollment`, `StudentProgress` (Shared MongoDB).
- **GET /profile/:email**: Checks if teacher exists in DB.
- **POST /onboarding**: Creates new `Teacher` document (Name, Org). Enforces unique email.
- **POST /courses**: Creates `Course`.
  - **Validation**: Title, description, code (unique), teacherEmail required.
- **GET /courses/:email**: Lists courses by teacher.
- **GET /courses/public/all**: Lists all `published: true` courses (for students).
- **GET /courses/public/:id**: Public course details.
- **POST /enroll**:
  - **Logic**: Verifies `accessCode` matches `Course.code`. Upserts `Enrollment` document.
- **GET /analytics/:courseId**:
  - **Logic**: Agregates data from `Enrollment` and `StudentProgress`. Calculates `completedModules` count and `avgScore` per student.

#### E. Admin Module
**Routes (`admin/routes/*`)**:
- **API (`apiRoutes.ts`)**:
  - `GET /status`: Returns server status and allowlist (`proxyService.ts`).
  - `GET /models`: Checks filesystem for FaceAPI models presence (`modelCheckService.ts`).
  - `POST /proctor/logs`: Saves proctoring violation logs to DB (`proctoringService.ts`).
- **ImageKit (`imagekitRoutes.ts`)**:
  - `GET /videos`: Lists files from ImageKit folder `/cybercoach` using private key authentication.
  - `GET /video/:fileId`: Gets details for specific video.
- **Legacy (`legacyRoutes.ts`)**:
  - `GET /proxy`: **Secure Browser Proxy**
    - **Logic**: Validates target URL against `ALLOWLIST` (e.g., `juice-shop.herokuapp.com`).
    - Fetches content serverside.
    - **Security Stripping**: Removes `X-Frame-Options` and `Content-Security-Policy` headers from upstream response to allow embedding in iframe. Adds `frame-ancestors 'self'`.

---

## 2. FRONTEND ARCHITECTURE
**Tech Stack**: React, Vite, TailwindCSS, Lucide Icons, Context API (`AuthContext`), Gemini (Client-side AI).

### 2.1 Entry & Routing (`AppContent.tsx`)
- **Role-Based Routing**:
  - `/` (Home): Redirects based on role (Teacher -> `/teacher`, Admin -> `/admin`, Student -> `StudentAppContent`).
  - `/login`, `/signup`: Public auth pages.
  - `/verify-target`: **Public Tool** (`CompanyVerification`).
  - `/analyze-target`: **Public Tool** (`VulnerabilityAnalyzer`).
  - `/community`: Public.
  - `/teacher/*`: Protected `TeacherDashboard`.
  - `/admin/*`: Protected `AdminDashboard`.
  - `/dashboard`: Protected `StudentAppContent`.

### 2.2 Student Application (`StudentAppContent.tsx`)
**State Management**: `activeTab` switches main view content.
- **Dashboard**: standard widgets.
- **Courses**: `CourseList` -> Click -> `CourseDetail` (Fetches modules/quizzes).
- **Labs**: `LabsList` -> Click -> `LabViewer` (Embeds proxy or iframe).
- **Career Tools**:
  - **`JobsBoard.tsx`**: Fetches from backend `/api/student/jobs`. Client-side filtering by Type (Full-time/Intern via text match) and Search Query.
  - **`InterviewBot.tsx`**:
    - **Resume Parsing**: Uses `pdfjs-dist` to extract text client-side. Sends to `aiService` (Gemini) to extract Skills/Experience JSON.
    - **Chat Interface**: Maintains message history.
    - **Validation**: On user reply, sends (Question + Answer + Resume Context) to `interviewService` (which likely validates via AI) to get feedback/correction.
    - **Modes**: Technical, HR, Aptitude.
- **Verification Tool (`CompanyVerification.tsx`)**:
  - **UI**: Search bar input.
  - **Action**: calls `verificationService.verifyCompany(query)` -> Backend `/api/student/verify-company`.
  - **Display**: Shows Trust Score (colored), "Red Flags" / "Green Flags" lists, and final Verdict (Safe/Danger).
- **Vulnerability Analyzer (`VulnerabilityAnalyzer.tsx`)**:
  - **Simulation UI**: Fake terminal logs ("Resolving DNS...", "Port Scanning...").
  - **Logic**: Calls `aiService.generateVulnerabilityReport(url)`.
    - **AI Service (`aiService.ts`)**:
      - Tries to call Gemini Client API with prompt acting as "Advanced Security Scanner".
      - **Fallback (Simulation)**: If API key missing, generates *deterministic* fake report using URL hash as seed.
      - **Fake Vulnerabilities**: Randomly picks from set (SQLi, Reflection XSS, Open Port 21) based on seed.

### 2.3 Teacher Dashboard (`TeacherDashboard.tsx`)
- **Onboarding**: Checks `GET /api/teacher/profile`. If missing, shows form to POST `/api/teacher/onboarding`.
- **Course Management**:
  - Lists courses (`GET /api/teacher/courses/:email`).
  - **Create Wizard**: `CourseCreation` component (not detailed here but handles form flow).
- **Analytics**:
  - `CourseAnalytics` component fetches data `GET /api/teacher/analytics/:courseId`. Displays table of students, scores, completion.

### 2.4 Admin Dashboard (`AdminDashboard.tsx`)
- **Sidebar Tabs**: Overview, Users, Courses, Analytics, Settings.
- **Real-time**: Subscribes to Supabase channels (`users`, `courses`, `course_enrollments`) for auto-refresh.
- **Data Fetching**: `adminService` calls.
- **User Management**: Table to view users, change roles (`student`/`teacher`/`admin`).
- **Course Management**: Toggle Publish/Unpublish status.
- **Stats**: Aggregates counts (Students vs Teachers, Published vs Draft).

### 2.5 Services & External Integrations
- **`aiService.ts`**:
  - direct access to `generativelanguage.googleapis.com`.
  - Keys loaded from `import.meta.env.VITE_GEMINI_API_KEY`.
- **`authService.ts`**: Handles Supabase Auth or internal Mock Auth.
- **`imagekitService.ts`**: Frontend wrapper for backend imagekit routes. Creates authenticated URL for video player.

---
**End of Minute Detail Analysis.**
