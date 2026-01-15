# Cybercoach Project Analysis

## Overview
**Cybercoach** is an AI-powered cybersecurity education platform designed to provide hands-on, job-ready skills. It is a monorepo-style project containing both a React frontend and an Express backend, managed by a single root configuration.

## Architecture
The project utilizes a modern full-stack architecture:

-   **Repository Structure**: Unified root with a single `package.json` managing dependencies for both frontend and backend.
-   **Frontend**: React 18 SPA (Vite). The `frontend/` directory serves as the source root (equivalent to `src/`).
-   **Backend**: Express 5 (Node.js). Located in `backend/`, executed via `tsx`.
-   **Database**: Supabase (PostgreSQL) with Row Level Security (RLS).
-   **AI Integration**: Google Gemini 2.5 Flash, `face-api.js` (Client-side proctoring), `natural` (NLP).

## Tech Stack Deep Dive

### Frontend (`frontend/`)
-   **build**: Vite + TypeScript
-   **UI**: TailwindCSS (v4), Lucide React, Shadcn/Radix Primitives
-   **State**: React Context API
-   **Routing**: React Router DOM
-   **Key Libraries**: `face-api.js`, `imagekitio-react`, `jspdf`

### Backend (`backend/`)
-   **Runtime**: Node.js (via `tsx` for TypeScript execution)
-   **Framework**: Express 5
-   **Entry Point**: `backend/server.ts`
-   **Organization**: Modular routes (`student`, `teacher`, `admin`)

### Shared Configuration
-   **Dependencies**: All dependencies are listed in the root `package.json`.
-   **Scripts**: `npm run dev:full` runs both frontend (Vite) and backend (tsx watch) concurrently.

## Project Structure

```text
cybercoach/
├── frontend/                # React Source Root (Acts as src/)
│   ├── student/            # Student Portal
│   ├── teacher/            # Teacher Portal
│   ├── admin/              # Admin Portal
│   ├── components/         # Shared UI Components
│   ├── context/            # Global State
│   ├── services/           # API Services
│   ├── App.tsx             # Main App Component
│   ├── main.tsx            # Entry Point
│   └── vite-env.d.ts       # Vite Types
├── backend/                 # Express API
│   ├── student/            # Student API Routes
│   ├── teacher/            # Teacher API Routes
│   ├── admin/              # Admin API Routes
│   └── server.ts           # Server Entry Point
├── supabase/                # Database
├── public/                  # Static Assets
├── package.json             # Root Dependencies & Scripts
├── vite.config.ts           # Vite Config (Defines aliases @ -> frontend/)
├── tsconfig.json            # Base TypeScript Config
└── .env                     # Environment Variables
```

## Import Aliases
Configured in `vite.config.ts`:
-   `@` -> `frontend/`
-   `@student` -> `frontend/student/`
-   `@teacher` -> `frontend/teacher/`
-   `@admin` -> `frontend/admin/`
-   `@components` -> (Implicitly via `@/components`)
-   `@services` -> `frontend/services/`
-   etc.

## Key Features & Security
-   **RLS**: Supabase policies protect data.
-   **Proctoring**: Frontend-based face detection.
-   **AI**: Gemini integrated for content generation and tutoring.
-   **Auth**: Supabase Auth (JWT).

## Conclusion
The project is well-structured for rapid full-stack development. The use of `tsx` allows for seamless TypeScript execution on the backend without a separate build step during development, while Vite handles the frontend hot-reloading.
