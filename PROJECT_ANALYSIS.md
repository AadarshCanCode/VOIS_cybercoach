# VOIS Hackathon - Complete Project Analysis

## 📋 Executive Summary

**Project Name:** VOIS Hackathon Education Platform (Cyber Coach)  
**Type:** Full-Stack Web Application  
**Tech Stack:** React + TypeScript + Vite (Frontend) | Express + TypeScript (Backend) | Supabase (Database)  
**Purpose:** Comprehensive cybersecurity education platform with adaptive learning, proctoring, company verification, and job board features.

---

## 🏗️ Architecture Overview

### High-Level Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Student  │  │ Teacher  │  │  Admin   │  │  Tools   │   │
│  │  Portal  │  │ Portal   │  │  Portal  │  │  (Public)│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │            │             │              │         │
│         └────────────┴─────────────┴──────────────┘         │
│                         │                                    │
│                    Auth Context                              │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                   API Layer (Services)
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                    BACKEND (Express)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Student  │  │ Teacher  │  │  Admin   │  │ ImageKit │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Proxy   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                    SUPABASE                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables: courses, modules, user_progress,           │   │
│  │  assessment_responses, user_certificates,           │   │
│  │  interview_questions, company_registry,             │   │
│  │  scraped_jobs, learner_memory                       │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 Detailed Component Breakdown

### 1. Frontend Structure

#### A. Student Portal (`/frontend/student/`)
**Purpose:** Main student learning interface  
**Key Features:**
- **Dashboard:** Course progress, statistics, recent activities
- **Course Catalog:** Browse and enroll in courses
- **Learning Interface:** Module viewing with video/lab integration
- **Adaptive Assessments:** AI-powered skill evaluation
- **Interview Preparation:** Practice with categorized questions
- **Job Board:** Scraped job listings (Mission Board)
- **Company Verification:** Detective-themed fraud detection tool
- **Vulnerability Scanner:** Security assessment tool
- **Community:** Discussion and collaboration space
- **Floating Chatbot:** AI-powered assistance

**Pages:**
- `StudentApp.tsx` - Main student application container

#### B. Teacher Portal (`/frontend/teacher/`)
**Purpose:** Course creation and student management  
**Key Features:**
- Course creation with AI-generated outlines
- Module management (video, lab links, content)
- Student progress tracking
- Analytics dashboard

**Pages:**
- `TeacherApp.tsx` - Main teacher dashboard

#### C. Admin Portal (`/frontend/admin/`)
**Purpose:** Platform administration  
**Key Features:**
- System monitoring
- Proctoring logs review
- API proxy management
- Model checking service

**Pages:**
- `AdminApp.tsx` - Main admin interface

#### D. Shared Components (`/frontend/components/`)
**Core Components:**
- `AppContent.tsx` - Main routing logic
- `Badge.tsx`, `Button.tsx`, `Card.tsx`, `Input.tsx` - UI primitives
- `FloatingChatbot/` - AI chatbot interface
- `layout/` - Header, navigation, layout components
- `auth/` - Login/register forms

#### E. Context & State Management
**File:** `/frontend/context/AuthContext.tsx`  
**Responsibilities:**
- User authentication state
- Role-based access control (student/teacher/admin)
- Session persistence via Supabase

---

### 2. Backend Structure

#### A. Server Entry Point
**File:** `/backend/server.ts`  
**Configuration:**
- Port: 4000 (configurable via env)
- CORS enabled
- JSON parsing (1MB limit)

**Routes:**
- `/api/student/*` - Student-specific endpoints
- `/api/teacher/*` - Teacher-specific endpoints
- `/api/admin/*` - Admin endpoints
- `/api/imagekit/*` - ImageKit proxy for media
- `/` - Legacy admin routes

#### B. Student Services (`/backend/student/services/`)

**1. Job Service** (`jobService.ts`)
- Fetches scraped jobs from `scraped_jobs` table
- Provides job listings for Mission Board

**2. Student Service** (`studentService.ts`)
- Student profile management
- Progress tracking
- Dashboard data aggregation

**3. Analyst Service** (`analyst/contentAnalyzer.ts`)
- **Content Analysis:** Detects red flags (fees, scams) vs green flags (salary, benefits)
- **Scoring System:** -100 to +100 based on keyword detection
- **Categories:** SUSPICIOUS, LEGIT_CANDIDATE, NEUTRAL

**4. Detective Services** (`detective/`)
- **Web Scraper** (`webScraper.ts`):
  - Scrapes company websites (title, meta, body text)
  - Extracts links and content for analysis
  - Uses Axios + Cheerio
  
- **Domain Intel** (`domainIntel.ts`):
  - WHOIS lookups
  - Domain age calculation
  - Registrar information
  - Country identification
  
- **Reputation Check** (`reputationCheck.ts`):
  - Google search via SerpApi
  - Scam/legitimacy analysis
  - Sentiment scoring

**5. Judge Service** (`judge/decisionEngine.ts`)
- Final verdict on company legitimacy
- Combines all detective/analyst results

#### C. Teacher Services (`/backend/teacher/services/`)
**File:** `teacherService.ts`
- Course CRUD operations
- Module management
- Student analytics

#### D. Admin Services (`/backend/admin/services/`)

**1. Proctoring Service** (`proctoringService.ts`)
- Records exam proctoring events
- Logs suspicious activities (face detection, tab switches)

**2. Model Check Service** (`modelCheckService.ts`)
- Validates AI model responses
- Ensures quality control

**3. Proxy Service** (`proxyService.ts`)
- Acts as proxy for external APIs
- ImageKit integration

---

### 3. Frontend Services Layer

#### A. AI Service (`aiService.ts`)
**Provider:** Google Gemini 2.5 Flash  
**Features:**
- Chat interface
- Course outline generation
- Vulnerability report generation
- Fallback to simulation mode when API key missing

#### B. Assessment Service (`assessmentService.ts`)
**Features:**
- Adaptive question selection
- Response recording
- Confidence tracking
- Time tracking per question

#### C. Interview Service (`interviewService.ts`)
**Features:**
- Fetches categorized questions (technical, HR, aptitude)
- Injects verified company names
- Fallback to hardcoded questions

#### D. RAG Services
**1. RAG Service** (`ragService.ts`)
- Analyzes student answers against topic documentation
- Generates topic scores and gap analysis
- Uses Gemini for NLP

**2. RAG Docs Service** (`ragDocsService.ts`)
- Manages knowledge base documents
- Chunks documents for processing
- Provides context for AI responses

#### E. Learning Path Service (`learningPathService.ts`)
- Allocates personalized learning paths
- Prioritizes modules based on knowledge gaps
- Rebalances progression dynamically

#### F. Learner Memory Service (`learnerMemoryService.ts`)
- Stores facts about student learning patterns
- Retrieves context for personalized assistance

#### G. Onboarding Chat Service (`onboardingChatService.ts`)
- Guided initial assessment
- Conversational skill evaluation
- Path recommendation

#### H. Course Service (`courseService.ts`)
- Course fetching and management
- Enrollment handling
- Progress tracking

#### I. Auth Service (`authService.ts`)
- Supabase authentication
- User registration/login
- Profile management

#### J. ImageKit Service (`imagekitService.ts`)
- Fetches course videos via proxy
- Media asset management

---

## 🗄️ Database Schema (Supabase)

### Core Tables

#### 1. `courses`
```sql
- id: uuid (PK)
- title: text
- description: text
- teacher_id: uuid (FK -> auth.users)
- created_at, updated_at: timestamp
```

#### 2. `modules`
```sql
- id: uuid (PK)
- title, description, content: text
- course_id: uuid (FK -> courses)
- video_url, lab_url: text
- order: integer
- created_at, updated_at: timestamp
```

#### 3. `user_progress`
```sql
- id: uuid (PK)
- user_id: uuid (FK -> auth.users)
- course_id: uuid (FK -> courses)
- module_id: uuid (FK -> modules)
- completed: boolean
- quiz_score: integer
- source: text
- created_at, updated_at: timestamp
- UNIQUE(user_id, module_id)
```

#### 4. `assessment_responses`
```sql
- id: uuid (PK)
- attempt_id: uuid
- user_id: uuid (FK -> auth.users)
- question_id: text
- selected_answer: integer
- confidence_level: integer
- is_correct: boolean
- time_taken_seconds: integer
- context: text
- created_at: timestamp
```

#### 5. `user_certificates`
```sql
- id: uuid (PK)
- user_id: uuid (FK -> auth.users)
- course_name: text
- issued_date: timestamp
- certificate_url: text
- created_at: timestamp
```

#### 6. `interview_questions`
```sql
- id: uuid (PK)
- category: text (technical, HR, aptitude)
- question: text
- ideal_answer: text
- difficulty: text
- company_name: text (optional)
```

#### 7. `company_registry`
```sql
- id: uuid (PK)
- name: text
- verified: boolean
```

#### 8. `scraped_jobs`
```sql
- id: uuid (PK)
- title, company, type: text
- salary_range, location: text
- requirements: text[]
- link: text (UNIQUE)
- posted_at: timestamp
- source: text
- created_at: timestamp
```

#### 9. `learner_memory`
```sql
- id: uuid (PK)
- user_id: uuid (FK -> auth.users)
- fact_type: text
- content: text
- confidence: numeric
- created_at: timestamp
```

---

## 🔄 Data Flow Examples

### Example 1: Student Takes Adaptive Assessment
```
1. Student starts assessment
   ↓
2. Frontend: assessmentService.startAssessment()
   ↓
3. Frontend: ragService.analyzeAnswers()
   ↓
4. Gemini API: Analyzes answers against docs
   ↓
5. Frontend: learningPathService.allocateInitialPath()
   ↓
6. Supabase: Creates user_progress records
   ↓
7. UI: Shows recommended learning path
```

### Example 2: Company Verification
```
1. User enters company URL
   ↓
2. Frontend: POST /api/student/verify-company
   ↓
3. Backend Detective Services:
   - webScraper.scrapeCompanyWebsite()
   - domainIntel.analyzeDomain()
   - reputationCheck.checkReputation()
   ↓
4. Backend Analyst: contentAnalyzer.analyzeContent()
   ↓
5. Backend Judge: decisionEngine.makeDecision()
   ↓
6. Response: Verdict + detailed report
   ↓
7. UI: Displays tactical-themed results
```

### Example 3: Teacher Creates Course with AI
```
1. Teacher fills course form
   ↓
2. Frontend: aiService.generateCourseOutline()
   ↓
3. Gemini API: Generates module structure
   ↓
4. Frontend: courseService.createCourse()
   ↓
5. Backend: POST /api/teacher/courses
   ↓
6. Supabase: INSERT courses + modules
   ↓
7. UI: Course published
```

---

## 🎨 UI/UX Design Theme

**Theme:** Tactical/Military Cybersecurity  
**Color Palette:**
- Primary: `#00FF88` (Cyber Green)
- Background: Black/Dark Grey
- Accents: Neon colors

**Terminology:**
- "Cortex Unit" - AI system
- "Mission Board" - Job board
- "Operative", "Recruit", "Specialist" - User levels
- "Target Analysis" - Vulnerability scanning
- "Intel Report" - Assessment results

**Fonts & Styling:**
- Monospace for code/technical elements
- TailwindCSS for utility-first styling
- Lucide React for icons

---

## 🔌 External Integrations

### 1. Supabase
- **Purpose:** Database + Authentication
- **Usage:** User management, course data, progress tracking
- **Config:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### 2. Google Gemini 2.5 Flash
- **Purpose:** AI-powered features
- **Usage:** 
  - Chat assistance
  - Course outline generation
  - Answer analysis (RAG)
  - Vulnerability report generation
- **Config:** `VITE_GEMINI_API_KEY`

### 3. ImageKit
- **Purpose:** Media CDN
- **Usage:** Video hosting for course modules
- **Proxy:** `/api/imagekit/videos`

### 4. SerpApi (Google Search Results)
- **Purpose:** Company reputation analysis
- **Usage:** Searches for scam/legitimacy reviews
- **Package:** `google-search-results-nodejs`

### 5. WHOIS
- **Purpose:** Domain intelligence
- **Usage:** Domain age, registrar info, country
- **Package:** `whois-json`

---

## 📊 Content Sources

### Static Content
| Content Type | Location | Description |
|-------------|----------|-------------|
| **Fallback Questions** | `interviewService.ts` | Hardcoded interview questions |
| **Knowledge Docs** | `/public/docs/` | NIST Framework, OWASP Top 10, sample labs |
| **UI Copy** | Throughout frontend | Labels, instructions, flavor text |
| **Assessment Questions** | `/frontend/data/assessmentQuestions.ts` | Initial skill assessment |
| **Labs Data** | `/frontend/data/labs.ts` | Hands-on lab definitions |

### Database-Sourced Content
| Content Type | Table | Service | Description |
|-------------|-------|---------|-------------|
| **Courses** | `courses` | `courseService.ts` | User-created courses |
| **Modules** | `modules` | `courseService.ts` | Course content units |
| **Interview Questions** | `interview_questions` | `interviewService.ts` | Categorized questions with answers |
| **Jobs** | `scraped_jobs` | `jobService.ts` | Scraped job listings |
| **User Progress** | `user_progress` | `learningPathService.ts` | Module completion tracking |
| **Certificates** | `user_certificates` | `studentService.ts` | Issued certificates |

### Scraped/External Content
| Content Type | Source | Service | Description |
|-------------|--------|---------|-------------|
| **Company Data** | Web scraping | `webScraper.ts` | Website text, links, metadata |
| **Domain Info** | WHOIS | `domainIntel.ts` | Registrar, age, country |
| **Reputation** | Google Search | `reputationCheck.ts` | Scam reviews, sentiment |
| **Job Listings** | External APIs (implied) | Manual import to `scraped_jobs` | Cybersecurity job postings |

---

## 🚀 Deployment & Environment

### Development
```bash
# Install dependencies
npm install

# Run full stack
npm run dev:full

# Frontend only (http://localhost:5173)
npm run dev

# Backend only (http://localhost:4000)
npm run proxy
```

### Production Build
```bash
# Frontend build
npm run build

# Backend build
npm run backend:build
```

### Environment Variables
```env
# Required
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
VITE_GEMINI_API_KEY=<gemini-api-key>

# Optional
PORT=4000  # Backend port
```

### Deployment Platform
**Target:** Vercel (based on `vercel.json`)  
**Config:**
- API routes: `/api/*`
- Fallback: SPA routing to `/index.html`

---

## 🔐 Security Features

### 1. Row-Level Security (RLS)
- Enabled on all Supabase tables
- Policies enforce user-specific data access
- Teachers can only modify their own courses

### 2. Proctoring System
- Face detection monitoring during exams
- Tab switch detection
- Logs sent to admin dashboard
- Uses face-api.js library

### 3. Company Verification
- Multi-layered fraud detection
- WHOIS analysis for domain legitimacy
- Content scraping for red flag detection
- Sentiment analysis via Google search

---

## 🧩 Key Features Summary

| Feature | Category | Technology | Description |
|---------|----------|------------|-------------|
| **Adaptive Learning** | Education | Gemini AI + RAG | Personalized module sequencing |
| **AI Course Generator** | Teacher Tools | Gemini AI | Auto-generate course outlines |
| **Interview Prep** | Student Tools | Supabase | Categorized Q&A with company injection |
| **Proctoring** | Assessment | face-api.js | Exam monitoring & integrity |
| **Company Verification** | Security | Multi-API | Fraud detection for job listings |
| **Vulnerability Scanner** | Security | Gemini AI | Simulated security assessment |
| **Job Board** | Career | Supabase | Scraped cybersecurity jobs |
| **Floating Chatbot** | Support | Gemini AI | Context-aware assistance |
| **RAG Documentation** | Learning | Gemini AI | Answer evaluation against knowledge base |
| **Learner Memory** | Personalization | Supabase | Stores student learning patterns |

---

## 📈 Future Enhancements (Based on Code Structure)

1. **Live Coding Labs:** Integrate interactive coding environments (lab URLs currently just links)
2. **Real-time Collaboration:** Community features could expand to live sessions
3. **Automated Job Scraping:** Currently manual, could be automated with cron
4. **Advanced Analytics:** Teacher dashboard could show deeper insights
5. **Peer Review System:** Course quality voting/reviews
6. **Certification Blockchain:** Verify certificates via blockchain
7. **Mobile App:** PWA configuration already in place with Vite

---

## 🐛 Known Limitations

1. **Gemini API Dependency:** Falls back to mock responses if key missing
2. **WHOIS Rate Limits:** May fail for frequent domain checks
3. **Scraping Fragility:** Website structure changes break scrapers
4. **RLS Disabled in Dev:** Some migrations disable RLS for development
5. **Job Scraping:** Not automated, requires manual population

---

## 📝 Code Quality & Standards

### TypeScript Configuration
- Strict mode enabled
- ES modules throughout
- Separate tsconfig for backend (`backend/tsconfig.json`)

### Linting & Formatting
- ESLint configured (`eslint.config.js`)
- React hooks plugin
- TypeScript ESLint integration

### Build Tools
- **Frontend:** Vite 7.x
- **Backend:** TSX for development, TSC for production
- **CSS:** PostCSS + TailwindCSS

---

## 🔗 Project Dependencies

### Key Production Dependencies
- **React:** 18.3.1
- **React Router:** 7.11.0
- **Express:** 5.1.0
- **Supabase JS:** 2.52.0
- **Google Generative AI:** 0.24.1
- **Axios:** 1.13.2
- **Cheerio:** 1.1.2 (web scraping)
- **WHOIS-JSON:** 2.0.4
- **Lucide React:** 0.344.0 (icons)
- **JSPDF:** 3.0.4 (certificate generation)
- **PDF.js:** 4.0.379 (document viewing)

### Key Dev Dependencies
- **TypeScript:** 5.9.3
- **Vite:** 7.1.10
- **TailwindCSS:** 3.4.18
- **ESLint:** 9.38.0
- **TSX:** 4.19.2 (TypeScript execution)
- **Concurrently:** 8.2.2 (run multiple commands)

---

## 🎯 User Roles & Permissions

### Student
- ✅ Enroll in courses
- ✅ Take assessments
- ✅ View job board
- ✅ Use verification tools
- ✅ Chat with AI
- ❌ Create courses
- ❌ Access admin panel

### Teacher
- ✅ Create/edit courses
- ✅ Manage modules
- ✅ View student progress
- ✅ Use AI course generator
- ❌ Access admin panel
- ❌ Modify other teachers' courses

### Admin
- ✅ View all data
- ✅ Monitor proctoring logs
- ✅ Manage proxy services
- ✅ System configuration
- ❌ Create courses (separate role)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Setup instructions, architecture overview |
| `content_analysis.md` | Data source breakdown |
| `LICENSE` | Project licensing |
| This file | Comprehensive project analysis |

---

## 🏁 Conclusion

The VOIS Hackathon Education Platform is a comprehensive, full-stack application that combines modern web technologies with AI-powered features to deliver an adaptive cybersecurity learning experience. The platform features:

- **Three distinct user portals** (Student, Teacher, Admin)
- **AI-driven personalization** via Google Gemini
- **Security-focused tools** (company verification, vulnerability scanning)
- **Adaptive learning paths** based on skill gaps
- **Exam proctoring** for integrity
- **Job board integration** for career development
- **Scalable architecture** with TypeScript throughout

The codebase demonstrates strong architectural patterns, clear separation of concerns, and production-ready features including RLS policies, error handling, and fallback mechanisms.

**Status:** Active development, ready for hackathon demonstration and further enhancement.
