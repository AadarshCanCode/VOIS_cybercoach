

# Cybercoach

An AI-powered cybersecurity education platform that transforms passive learning into hands-on, job-ready skills. Featuring adaptive learning paths, proctored assessments, vulnerability labs, and career tools—all in one unified platform.

![Cybercoach](https://img.shields.io/badge/Cybercoach-Cybersecurity%20Education-00FF88)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-7-646CFF)


## Features
### 🎓 Learning & Education

- **Adaptive Learning Paths** - AI-personalized curriculum that evolves based on performance
- **Interactive Courses** - Structured modules with video, text, and lab content
- **Hands-on Labs** - Real vulnerability scenarios and security challenges
- **Progress Tracking** - Visual dashboards showing completion and skill levels
- **RAG-Powered AI Tutor** - Answers grounded in OWASP/NIST frameworks

### 📝 Assessments & Proctoring

- **Proctored Exams** - Video monitoring with face detection for exam integrity
- **Adaptive Difficulty** - Questions adjust based on learner performance
- **Real-time Violation Detection** - Alerts for suspicious behavior during tests
- **Detailed Analytics** - Performance breakdowns and skill gap analysis
- **Certificate Generation** - Verifiable completion certificates

### 🛡️ Security Tools

- **Vulnerability Scanner** - AI-powered security assessment simulation
- **Company Verification** - Detective-style fraud detection for job listings
- **Domain Intelligence** - WHOIS lookups and domain analysis
- **Content Analysis** - NLP-based scam detection with red/green flags

### 💼 Career Development

- **AI Interview Bot** - Practice technical interviews with real-time feedback
- **Resume Generator** - Create professional cybersecurity resumes
- **Job Board** - Curated listings with company verification
- **Technical Questions** - Categorized practice problems

### 👨‍🏫 Teacher Portal

- **AI Course Generator** - Auto-generate course outlines with Gemini
- **Module Management** - Organize video, lab, and text content
- **Student Analytics** - Track progress and identify struggling learners
- **Assessment Builder** - Create custom quizzes and exams


### 🔧 Admin Portal

- **Platform Monitoring** - System health and usage statistics
- **Proctoring Logs** - Review flagged exam sessions
- **User Management** - Role-based access control
- **API Proxy Services** - Secure external API access

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for database)
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/cybercoach.git
   cd cybercoach
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Supabase Configuration (Required)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Google Gemini AI (Required for AI features)
   VITE_GEMINI_API_KEY=your-gemini-api-key

   # Backend Port (Optional - defaults to 4000)
   PORT=4000
   ```

4. **Start the development server**

   ```bash
   # Run both frontend and backend
   npm run dev:full
   ```

5. **Open your browser**

   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:4000](http://localhost:4000)

## 📖 Usage

### Student Workflow

1. **Register/Login** - Create an account or sign in
2. **Take Assessment** - Complete initial skill evaluation with proctoring
3. **Follow Learning Path** - AI recommends personalized course sequence
4. **Complete Labs** - Hands-on security challenges
5. **Practice Interviews** - AI-powered technical interview preparation
6. **Apply for Jobs** - Browse verified job listings

### Teacher Workflow

1. **Create Course** - Use AI to generate course outline
2. **Add Modules** - Upload videos, create labs, write content
3. **Publish** - Make course available to students
4. **Monitor** - Track student progress and analytics

## 🛠️ Tech Stack

### Frontend

- **[React 18](https://react.dev/)** - UI library with hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first styling
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[React Router](https://reactrouter.com/)** - Client-side routing

### Backend

- **[Express 5](https://expressjs.com/)** - Web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[tsx](https://github.com/privatenumber/tsx)** - Fast TS execution

### Database & Auth

- **[Supabase](https://supabase.com/)** - PostgreSQL database + Auth + Real-time

### AI & ML

- **[Google Gemini 2.5 Flash](https://ai.google.dev/)** - AI responses, quiz generation, content analysis
- **[face-api.js](https://github.com/justadudewhohacks/face-api.js/)** - Face detection for proctoring
- **[Natural](https://naturalnode.github.io/natural/)** - NLP for content analysis

### Other

- **[PDF.js](https://mozilla.github.io/pdf.js/)** - PDF rendering
- **[Cheerio](https://cheerio.js.org/)** - Web scraping for company verification
- **[jsPDF](https://github.com/parallax/jsPDF)** - Certificate generation

## 📁 Project Structure

```text
cybercoach/
├── frontend/                # React application
│   ├── admin/              # Admin dashboard
│   ├── student/            # Student portal
│   │   ├── components/     # UI components
│   │   │   ├── Assessment/ # Proctored tests
│   │   │   ├── Career/     # Job board, resume
│   │   │   ├── Chatbot/    # AI tutor
│   │   │   ├── Course/     # Learning modules
│   │   │   ├── Landing/    # Homepage
│   │   │   └── Tools/      # Security tools
│   │   └── pages/          # Route pages
│   ├── teacher/            # Teacher dashboard
│   ├── components/         # Shared components
│   ├── context/            # React context (Auth)
│   ├── services/           # API service layer
│   └── types/              # TypeScript definitions
├── backend/                 # Express API
│   ├── admin/              # Admin routes/services
│   ├── student/            # Student routes/services
│   ├── teacher/            # Teacher routes/services
│   └── server.ts           # Entry point
├── public/                  # Static assets
│   ├── docs/               # RAG documents
│   └── models/             # Face detection models
└── supabase/               # Database migrations
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite frontend dev server |
| `npm run dev:full` | Start both frontend and backend |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run proxy` | Run backend server |
| `npm run backend:dev` | Run backend with hot reload |
| `npm run backend:build` | Compile TypeScript backend |
| `npm run lint` | Run ESLint |
| `npm run fetch-faceapi` | Download face detection models |

## 🔌 API Endpoints

### Student

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/overview` | Dashboard summary |
| GET | `/api/student/jobs` | Job listings |

### Teacher

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teacher/overview` | Teacher dashboard |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/status` | System status |
| GET | `/api/admin/models` | Model availability |
| POST | `/api/admin/proctor/logs` | Record proctoring events |

## 🔒 Security

- **Proctored Assessments** - Face detection prevents exam fraud
- **CORS Configuration** - Secure cross-origin requests
- **Environment Variables** - Secrets never in code
- **Type-Safe API** - TypeScript prevents runtime errors
- **Authorized Testing Only** - Detective tools require consent

## 🐛 Troubleshooting

### Loading screen stuck
- Check Supabase credentials in `.env`
- Ensure `VITE_SUPABASE_URL` starts with `https://`
- Disable ad blockers for localhost

### Backend doesn't start
- Ensure port 4000 is available
- Run `npm run backend:build` to check for TS errors

### AI features not working
- Verify `VITE_GEMINI_API_KEY` is set
- Check API quota in Google AI Studio

### Proctoring not detecting face
- Run `npm run fetch-faceapi` to download models
- Ensure camera permissions are granted

## 👥 Team

| Name | Portfolio |
|------|-----------|
| Piyush Dhoka | [piyush.sparkstudio.co.in](https://piyush.sparkstudio.co.in) |
| Aadarsh Pathre | [aadarsh.sparkstudio.co.in](https://aadarsh.sparkstudio.co.in) |
| Varun Inamdar | [varun.sparkstudio.co.in](https://varun.sparkstudio.co.in) |

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For questions or support, reach out to the development team or open a GitHub issue.
