# VOIS Hackathon - Education Platform

A comprehensive education platform built with React, TypeScript, and Express for managing courses,assessments, and proctoring.
## 🏗️Architecture

### Frontend (React + TypeScript + Vite)
- **Student Module**: Course access, assessments, proctoring system
- **Teacher Module**: Course creation, student management.
- **Admin Module**: Platform administration, proxy services
- Built with React 18, Vite, TypeScript, and TailwindCSS

### Backend (Express + TypeScript)
- Fast TypeScript-based Express API
- Modular structure (Student, Teacher, Admin services)
- Type-safe with comprehensive interfaces
- Compiled with TypeScript for production

## 📦 Project Structure

```
/backend/
  /admin/
    /models/      - TypeScript models for admin entities
    /routes/      - API routes for admin
    /services/    - Business logic for admin operations
  /student/
    /models/      - TypeScript models for student entities
    /routes/      - API routes for students
    /services/    - Business logic for student operations
  /teacher/
    /models/      - TypeScript models for teacher entities
    /routes/      - API routes for teachers
    /services/    - Business logic for teacher operations
  server.ts       - Main Express server
  tsconfig.json   - TypeScript configuration for backend

/frontend/
  /admin/         - Admin dashboard components
  /student/       - Student dashboard components
  /teacher/       - Teacher dashboard components
  /context/       - React context providers
  /services/      - API service layer
  /types/         - TypeScript type definitions
/public/          - Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vois_hackathon
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file with the following:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Backend Port (optional, defaults to 4000)
PORT=4000
```

## 🛠️ Development

### Run the full application (Frontend + Backend)
```bash
npm run dev:full
```

This will start:
- Frontend dev server on http://localhost:5173
- Backend API server on http://localhost:4000

### Run frontend only
```bash
npm run dev
```

### Run backend only
```bash
npm run proxy
# or with watch mode
npm run backend:dev
```

### Build backend TypeScript
```bash
npm run backend:build
```

### Build frontend for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 🧪 Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint
- `npm run proxy` - Run backend server with tsx
- `npm run backend:dev` - Run backend in watch mode
- `npm run backend:build` - Compile TypeScript backend
- `npm run dev:full` - Run both frontend and backend concurrently
- `npm run fetch-faceapi` - Download face detection models

## 🔌 API Endpoints

### Student Endpoints
- `GET /api/student/overview` - Get student dashboard summary

### Teacher Endpoints
- `GET /api/teacher/overview` - Get teacher dashboard overview

### Admin Endpoints
- `GET /api/admin/status` - Get admin status and allowlist
- `GET /api/admin/models` - Check face detection model availability
- `POST /api/admin/proctor/logs` - Record proctoring logs

### Legacy Endpoints (for backward compatibility)
- `GET /proxy?url=<url>` - Proxy external requests
- `POST /proctor-logs` - Record proctoring logs (legacy)
- `GET /test-models` - Test model availability (legacy)

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS
- **Lucide React** - Icon library
- **PDF.js** - PDF rendering
- **face-api.js** - Face detection for proctoring
- **Supabase** - Backend as  service

### Backend
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **tsx** - Fast TypeScript execution
- **CORS** - Cross-origin resource sharing
- **Node.js 18+** - Runtime environment

## 🔐 Security

- CORS configured for secure cross-origin requests
- Proxy allowlist for external domain access
- Request body size limited to 1MB
- Type-safe API with TypeScript
- Environment variables for sensitive data

## 🎯 Features

### Student Portal
- Course enrollment and progress tracking
- Assessment taking with proctoring
- Video library and live streams
- Technical interview practice
- Notes and learning resources

### Teacher Portal
- Course creation and management
- Module organization
- Student progress monitoring
- Assessment creation

### Admin Portal
- Platform administration
- Proxy service management
- Proctoring log monitoring
- System health checks

## 🐛 Troubleshooting

### Backend doesn't start
- Ensure port 4000 is not in use
- Check TypeScript compilation: `npm run backend:build`

### Frontend proxy errors
- Ensure backend is running on port 4000
- Check Vite proxy configuration in `vite.config.ts`

### TypeScript errors
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` configurations

## 📝 License

See LICENSE file for details.

## 🤝 Contributing

This is a hackathon project. For contributions or issues, please contact the team.

## 📧 Contact

For questions or support, reach out to the development team.
