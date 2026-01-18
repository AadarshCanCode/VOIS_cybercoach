<div align="center">

<img src="./frontend/public/cybercoach-logo.png" alt="CyberCoach Logo" width="200"/>

# 🛡️ VOIS CyberCoach

### AI-Powered Cybersecurity Education Platform

Transform passive learning into hands-on, job-ready cybersecurity skills with adaptive learning paths, proctored assessments, vulnerability labs, and career tools—all in one unified platform.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#️-tech-stack) • [Documentation](#-project-structure) • [Team](#-team)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎓 **Learning & Education**
- 🧠 **Adaptive Learning Paths** - AI-personalized curriculum
- 📚 **Interactive Courses** - Video, text, and lab content
- 🔬 **Hands-on Labs** - Real vulnerability scenarios
- 📊 **Progress Tracking** - Visual dashboards
- 🤖 **RAG-Powered AI Tutor** - OWASP/NIST grounded answers

</td>
<td width="50%">

### 📝 **Assessments & Proctoring**
- 🎥 **Proctored Exams** - Face detection monitoring
- 🎯 **Adaptive Difficulty** - Performance-based questions
- 🚨 **Violation Detection** - Real-time alerts
- 📈 **Detailed Analytics** - Skill gap analysis
- 🏆 **Certificate Generation** - Verifiable credentials

</td>
</tr>
<tr>
<td width="50%">

### 🛡️ **Security Tools**
- 🔍 **Vulnerability Scanner** - AI-powered assessments
- 🕵️ **Company Verification** - Fraud detection
- 🌐 **Domain Intelligence** - WHOIS & analysis
- 📄 **Content Analysis** - NLP scam detection

</td>
<td width="50%">

### 💼 **Career Development**
- 🎤 **AI Interview Bot** - Real-time feedback
- 📝 **Resume Generator** - Professional templates
- 💼 **Job Board** - Verified listings
- 💡 **Technical Practice** - Categorized problems

</td>
</tr>

</table>

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+ | npm | Git | Supabase Account | Google Gemini API Key
```

### Installation

1️⃣ **Clone the repository**
```bash
git clone https://github.com/AadarshCanCode/VOIS_cybercoach.git
cd VOIS_cybercoach
```

2️⃣ **Install dependencies**
```bash
npm install
```

3️⃣ **Set up environment variables**

Create `.env` and `frontend/.env` files:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini AI (Required)
VITE_GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key

# MongoDB (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_TEACHER=mongodb+srv://username:password@cluster.mongodb.net/

# ImageKit (Optional - for media storage)
VITE_IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key

# API Keys (Optional)
GROQ_API_KEY=your-groq-api-key
SERPAPI_KEY=your-serpapi-key
```

4️⃣ **Download face detection models** (for proctoring)
```bash
npm run fetch-faceapi
```

5️⃣ **Start the development server**
```bash
npm run dev:full
```

6️⃣ **Open your browser**
- 🌐 Frontend: [http://localhost:5173](http://localhost:5173)
- 🔌 Backend API: [http://localhost:4000](http://localhost:4000)

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.1-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com/)

### Backend
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![tsx](https://img.shields.io/badge/tsx-4.19-000000?style=flat-square)](https://github.com/privatenumber/tsx)

### Database & Auth
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

### AI & ML
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![face-api.js](https://img.shields.io/badge/face--api.js-Proctoring-FF6B6B?style=flat-square)](https://github.com/justadudewhohacks/face-api.js/)
[![Natural](https://img.shields.io/badge/Natural-NLP-4CAF50?style=flat-square)](https://naturalnode.github.io/natural/)

### Additional Tools
[![jsPDF](https://img.shields.io/badge/jsPDF-Certificates-E74C3C?style=flat-square)](https://github.com/parallax/jsPDF)
[![Cheerio](https://img.shields.io/badge/Cheerio-Web_Scraping-F39C12?style=flat-square)](https://cheerio.js.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)

</div>

---

---


## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🚀 Start Vite frontend dev server |
| `npm run dev:full` | 🔥 Start both frontend and backend |
| `npm run build` | 📦 Build frontend for production |
| `npm run preview` | 👀 Preview production build |
| `npm run proxy` | 🔌 Run backend server only |
| `npm run backend:dev` | 🔄 Run backend with hot reload |
| `npm run backend:build` | 🏗️ Compile TypeScript backend |
| `npm run lint` | 🔍 Run ESLint |
| `npm run fetch-faceapi` | 📥 Download face detection models |

---

## 🔌 API Endpoints

<details>
<summary><b>Student Endpoints</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/student/overview` | Dashboard summary |
| `GET` | `/api/student/jobs` | Job listings |
| `GET` | `/api/student/courses` | Available courses |
| `POST` | `/api/student/progress` | Update progress |

</details>



<details>
<summary><b>AI & Utility Endpoints</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/chat` | AI chatbot |
| `POST` | `/api/ai/generate-quiz` | Generate quiz questions |
| `POST` | `/api/vu/register` | VU student registration |
| `GET` | `/api/vu/progress/:email/:courseId` | VU progress |

</details>

---

## 📖 Usage Guide

### 🎓 Student Workflow

```mermaid
graph LR
    A[Register/Login] --> B[Take Assessment]
    B --> C[Get Learning Path]
    C --> D[Complete Courses]
    D --> E[Practice Labs]
    E --> F[AI Interview Prep]
    F --> G[Apply for Jobs]
```

1. **Register/Login** - Create account or sign in
2. **Take Assessment** - Complete proctored skill evaluation
3. **Follow Learning Path** - AI-recommended course sequence
4. **Complete Labs** - Hands-on security challenges
5. **Practice Interviews** - AI-powered interview preparation
6. **Apply for Jobs** - Browse verified job listings



---

## 🔒 Security Features

- 🎥 **Proctored Assessments** - Face detection prevents exam fraud
- 🔐 **CORS Configuration** - Secure cross-origin requests
- 🔑 **Environment Variables** - Secrets never in code
- 📝 **Type-Safe API** - TypeScript prevents runtime errors
- 🛡️ **Row Level Security** - Supabase RLS policies

---

## 🐛 Troubleshooting

<details>
<summary><b>White screen / Loading stuck</b></summary>

- ✅ Check Supabase credentials in `.env` and `frontend/.env`
- ✅ Ensure `VITE_SUPABASE_URL` starts with `https://`
- ✅ Restart dev server: `Ctrl+C` then `npm run dev:full`
- ✅ Disable ad blockers for localhost
- ✅ Clear browser cache

</details>

<details>
<summary><b>Backend doesn't start</b></summary>

- ✅ Ensure port 4000 is available
- ✅ Run `npm run backend:build` to check for TS errors
- ✅ Check MongoDB connection string
- ✅ Verify all environment variables are set

</details>

<details>
<summary><b>AI features not working</b></summary>

- ✅ Verify `VITE_GEMINI_API_KEY` is set in both `.env` files
- ✅ Check API quota in [Google AI Studio](https://aistudio.google.com/)
- ✅ Ensure API key has proper permissions

</details>

<details>
<summary><b>Proctoring not detecting face</b></summary>

- ✅ Run `npm run fetch-faceapi` to download models
- ✅ Ensure camera permissions are granted
- ✅ Check browser console for errors
- ✅ Try a different browser (Chrome recommended)

</details>

<details>
<summary><b>Import errors after restructure</b></summary>

- ✅ Check path aliases in `tsconfig.json` and `vite.config.ts`
- ✅ Ensure imports use `@` aliases (e.g., `@components`, `@services`)
- ✅ Restart TypeScript server in VS Code

</details>

---

## 👥 Team

<div align="center">

| <img src="https://github.com/piyushdhoka.png" width="100" style="border-radius:50%"/> | <img src="https://github.com/AadarshCanCode.png" width="100" style="border-radius:50%"/> | <img src="https://github.com/varuninamdar.png" width="100" style="border-radius:50%"/> |
|:---:|:---:|:---:|
| **Piyush Dhoka** | **Aadarsh Pathre** | **Varun Inamdar** |
| [Portfolio](https://piyush.sparkstudio.co.in) | [Portfolio](https://aadarsh.sparkstudio.co.in) | [Portfolio](https://varun.sparkstudio.co.in) |
| [@piyushdhoka](https://github.com/piyushdhoka) | [@AadarshCanCode](https://github.com/AadarshCanCode) | [@varuninamdar](https://github.com/varuninamdar) |

</div>

---

## 🌟 Acknowledgments

- **OWASP** - Security frameworks and guidelines
- **NIST** - Cybersecurity standards
- **Google Gemini** - AI capabilities
- **Supabase** - Database and authentication
- **MongoDB** - NoSQL database
- **shadcn/ui** - UI component library

---

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support

For questions or support:
- 📧 Email: support@cybercoach.com
- 🐛 Issues: [GitHub Issues](https://github.com/AadarshCanCode/VOIS_cybercoach/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/AadarshCanCode/VOIS_cybercoach/discussions)

---

<div align="center">

### Made with ❤️ by the VOIS CyberCoach Team

**⭐ Star us on GitHub — it motivates us a lot!**

[![GitHub stars](https://img.shields.io/github/stars/AadarshCanCode/VOIS_cybercoach?style=social)](https://github.com/AadarshCanCode/VOIS_cybercoach/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/AadarshCanCode/VOIS_cybercoach?style=social)](https://github.com/AadarshCanCode/VOIS_cybercoach/network/members)

</div>
