# GradeU

An AI-powered hyperpersonalised learning platform that transforms education into a tailored, interactive experience. Featuring adaptive learning paths, automated course generation, integrated student communities, and advanced analytics—all in one unified platform.

![GradeU](https://img.shields.io/badge/GradeU-Advanced%20LMS-00FF88)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-7-646CFF)


## Features
### 🎓 Learning & Education


- **Adaptive Learning Paths** - AI-personalized curriculum that evolves based on student performance
- **Automated Course Generation** - AI-powered tools for educators to create structured modules quickly
- **Interactive Courses** - Structured modules with video, text, and rich media content
- **Knowledge Graph Memory** - Tracks cognitive patterns to optimize learning delivery
- **RAG-Powered AI Tutor** - Answers grounded in academic frameworks and course material

### 📝 Assessments & Proctoring

- **AI-Driven Proctoring** - Client-side face detection for exam integrity via the browser
- **Adaptive Difficulty** - Assessment questions adjust based on real-time student performance
- **Real-time Evaluation** - Instant feedback and detailed analytics for learners
- **Certificate Management** - Automated generation of verifiable course completion certificates
- **Skill Gap Analysis** - Deep insights into strengths and areas for improvement

### 🏫 Academic & Research Tools

- **DOI Research Paper Fetcher** - Streamlines academic research by fetching metadata and full-text PDFs
- **Personalized Remediation** - Automatically injects refresher materials based on learning gaps
- **Student Communities** - Peer-to-peer engagement and collaborative learning hubs
- **Comprehensive Analytics** - Tracks engagement points and optimizes content delivery

### 💼 Career Development

- **AI Interview Bot** - Practice technical interviews with real-time feedback
- **Resume Builder** - Create professional resumes tailored for specific roles
- **Job Board** - Curated listings with AI-powered company verification
- **Technical Question Bank** - Categorized practice problems for various disciplines

### 👨‍🏫 Teacher & Admin Portals

- **AI Course Designer** - Tools for educators to semi-automate structured learning pathways
- **Student Analytics** - Track cohort progress and identify struggling learners at a glance
- **Platform Monitoring** - System health and usage statistics for administrators
- **Role-Based Access** - Secure management of student, teacher, and admin permissions


## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for database)
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/gradeu.git
   cd gradeu
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

## 🛠️ Tech Stack

### Frontend

- **[Next.js 16](https://nextjs.org/)** - App Router with React 19
- **[TypeScript](https://www.typescriptlang.org/)** - Strict type safety
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first styling
- **[Shadcn UI](https://ui.shadcn.com/)** - Accessible UI components
- **[Zustand](https://github.com/pmndrs/zustand)** - Global state management

### Backend

- **[Express 5](https://expressjs.com/)** - Web framework for custom routes
- **[Supabase](https://supabase.com/)** - PostreSQL, Auth, and Storage
- **[MongoDB](https://www.mongodb.com/)** - Behavioral analytics and proctoring logs

### AI & specialized Libraries

- **[Google Gemini](https://ai.google.dev/)** - Core AI engine for content generation
- **[TensorFlow.js](https://www.tensorflow.org/js)** - Client-side face proctoring
- **[Mermaid](https://mermaid.js.org/)** - Dynamic flowchart generation


## 📁 Project Structure

```text
gradeu/
├── frontend/                # Next.js application
│   ├── admin/              # Admin dashboard
│   ├── student/            # Student portal
│   │   ├── components/     # UI components
│   │   │   ├── Assessment/ # Proctored tests
│   │   │   ├── Career/     # Job board, resume
│   │   │   ├── Chatbot/    # AI assistant
│   │   │   ├── Course/     # Learning modules
│   │   │   └── Landing/    # Homepage
│   │   └── pages/          # Route pages
│   ├── teacher/            # Teacher dashboard
├── backend/                 # Express API
└── supabase/               # Database migrations
```

## 👥 Team

| Name | Portfolio |
|------|-----------|
| Piyush Dhoka | [piyush.sparkstudio.co.in](https://piyush.sparkstudio.co.in) |
| Aadarsh Pathre | [aadarsh.sparkstudio.co.in](https://aadarsh.sparkstudio.co.in) |
| Varun Inamdar | [varun.sparkstudio.co.in](https://varun.sparkstudio.co.in) |

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.
ject is licensed under the terms specified in the [LICENSE](./LICENSE) file.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For questions or support, reach out to the development team or open a GitHub issue.
