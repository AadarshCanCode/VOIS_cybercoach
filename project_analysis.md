# Cybercoach Project Analysis

## Overview
**Cybercoach** is an AI-powered cybersecurity education platform designed to provide hands-on, job-ready skills through adaptive learning, interactive labs, and proctored assessments. The platform caters to students, teachers, and administrators.

## Architecture
The project follows a modern full-stack architecture with a clear separation of concerns:

- **Frontend**: A React-based Single Page Application (SPA) using Vite, TypeScript, and TailwindCSS. It is organized into three main portals: Student, Teacher, and Admin.
- **Backend**: An Express.js (Node.js) server written in TypeScript, providing RESTful API endpoints for each portal.
- **Database**: Supabase (PostgreSQL) is used for data storage, authentication, and real-time features. Row Level Security (RLS) is heavily utilized for data protection.
- **AI Integration**: Leverages Google Gemini for various AI features like personalized learning paths, quiz generation, and content analysis.

## Key Features

### 🎓 Learning & Education
- **Adaptive Learning**: AI-personalized curriculum based on student performance.
- **Hands-on Labs**: Real-world vulnerability scenarios.
- **RAG-Powered AI Tutor**: Specialized cybersecurity tutor grounded in NIST/OWASP frameworks.

### 📝 Assessments & Proctoring
- **AI Proctoring**: Face detection and real-time violation monitoring (using `face-api.js`).
- **Adaptive Exams**: Difficulty adjustments based on learner performance.
- **Automated Grading**: Instant feedback and score analysis.

### 🛡️ Security & Career Tools
- **Vulnerability Scanner Simulation**: Practical security assessment training.
- **Fraud Detection**: AI-driven verification of company and job listings.
- **Resume & Interview Tools**: AI-assisted career development.

## Tech Stack Deep Dive

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context API (e.g., AuthContext)
- **Icons**: Lucide React
- **Client Routing**: React Router DOM
- **Specialized Libs**: `face-api.js` (Proctoring), `jsPDF` (Certificates), `PDF.js` (Document viewing)

### Backend
- **Framework**: Express 5
- **Language**: TypeScript
- **Execution**: `tsx` for high-performance execution.
- **Integration**: `imagekit` for image management, `natural` for NLP tasks.

### Database & Auth
- **Service**: Supabase
- **Database**: PostgreSQL with custom functions and RLS policies.
- **Auth**: Supabase Auth integration.

## Project Structure
```text
cybercoach/
├── frontend/                # React application
│   ├── student/            # Student portal components and logic
│   ├── teacher/            # Teacher portal components and logic
│   ├── admin/              # Admin portal components and logic
│   ├── components/         # Shared UI components
│   ├── context/            # Global state (Auth)
│   ├── services/           # Backend API integration
│   └── data/               # Static data and configurations
├── backend/                 # Express API
│   ├── student/            # Student-related routes and services
│   ├── teacher/            # Teacher-related routes and services
│   ├── admin/              # Admin-related routes and services
│   └── server.ts           # API Entry point
├── supabase/                # DB Schema and migrations
│   ├── schema.sql          # Main database definition
│   └── exam_schema.sql     # Specialized assessment schema
└── public/                  # Static assets (Models, Docs)
```

## Security Implementation
- **Row Level Security (RLS)**: Policies in Supabase ensure users only access their own data.
- **Proctoring**: Client-side face detection to ensure academic integrity.
- **Environment Management**: Secure handling of API keys (Gemini, Supabase, ImageKit).

## Conclusion
Cybercoach is a highly modular and feature-rich platform. The use of AI is central to its value proposition, not just for content generation but for enhancing the entire learning and assessment lifecycle. The codebase is well-organized, leveraging TypeScript for type safety across both frontend and backend.
