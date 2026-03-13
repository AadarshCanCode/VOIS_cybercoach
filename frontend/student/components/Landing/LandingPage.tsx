import React, { useEffect, useMemo, useState, useRef, useCallback, Component, type ReactNode, lazy, Suspense } from 'react';
import { Shield, ArrowRight, Terminal, Users, Activity, Brain, Crosshair, BookOpen, Award, Eye, Lock, Globe, BarChart3, Star } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO/SEO';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from '@/components/ui/resizable-navbar';
import LightMorphWrapper from '@/components/ui/LightMorphWrapper';

// Lazy-load ShaderGradient to prevent client-side crashes from killing the whole page
const ShaderGradientCanvas = lazy(() =>
  import("@shadergradient/react").then((m) => ({ default: m.ShaderGradientCanvas }))
);
const ShaderGradient = lazy(() =>
  import("@shadergradient/react").then((m) => ({ default: m.ShaderGradient }))
);

// Silent error boundary for the gradient background
class GradientErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════ */
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number; label: string }> = ({
  end, suffix = '', duration = 2000, label,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, end, duration]);

  return (
    <div ref={ref} className="text-center group">
      <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tabular-nums tracking-tight">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-sm text-[#10B981] font-medium">{label}</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TYPING EFFECT
   ═══════════════════════════════════════════════════════════ */
const TypingText: React.FC<{ texts: string[]; className?: string }> = ({ texts, className }) => {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    const timeout = deleting ? 30 : 60;
    const timer = setTimeout(() => {
      if (!deleting) {
        if (charIndex < current.length) {
          setCharIndex(c => c + 1);
        } else {
          setTimeout(() => setDeleting(true), 2500);
        }
      } else {
        if (charIndex > 0) {
          setCharIndex(c => c - 1);
        } else {
          setDeleting(false);
          setTextIndex(i => (i + 1) % texts.length);
        }
      }
    }, timeout);
    return () => clearTimeout(timer);
  }, [charIndex, deleting, textIndex, texts]);

  return (
    <span className={className}>
      {texts[textIndex].slice(0, charIndex)}
      <span className="animate-pulse text-[#10B981]">|</span>
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════
   FEATURE CARD
   ═══════════════════════════════════════════════════════════ */
const FeatureCard: React.FC<{
  icon: React.ReactNode; title: string; description: string; delay?: number;
}> = ({ icon, title, description, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative bg-[#0D1310] border border-[#10B981]/10 rounded-2xl p-6 sm:p-8 hover:border-[#10B981]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#10B981]/5 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative z-10">
        <div className="mb-5 flex items-center gap-4">
          <div className="p-3 bg-[#10B981]/10 rounded-xl text-[#10B981] group-hover:scale-105 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
        </div>
        <p className="text-[15px] text-[#A1A1AA] leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PLATFORM PREVIEW CARD
   ═══════════════════════════════════════════════════════════ */
type PreviewTab = { id: string; label: string; img: string; headline: string; sub: string };
const previewTabs: PreviewTab[] = [
  { id: 'dashboard', label: 'Dashboard', img: '/tabs/dashboard.png', headline: 'Learning Overview', sub: 'Track your progress and achievements' },
  { id: 'labs', label: 'Hands-on Labs', img: '/tabs/course.png', headline: 'Interactive Environments', sub: 'Learn by doing in real vulnerability environments' },
  { id: 'intel', label: 'AI Tutor', img: '/tabs/chatbot.png', headline: 'Always-On Assistant', sub: 'Get personalized help from AI 24/7' },
  { id: 'resume', label: 'Resume Builder', img: '/tabs/resume.png', headline: 'Career Prep', sub: 'Build a standout cybersecurity resume' },
  { id: 'career', label: 'Career Hub', img: '/tabs/career.png', headline: 'Job Opportunities', sub: 'Explore career paths and job listings' },
];

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePreview, setActivePreview] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActivePreview(p => (p + 1) % previewTabs.length), 4500);
    return () => clearInterval(t);
  }, []);

  const testimonials = useMemo(() => [
    { name: 'Kailas Patil', title: 'Security Architect', quote: 'A comprehensive platform that bridges the gap between theory and practical application beautifully.', initials: 'KP' },
    { name: 'Shriram Dixit', title: 'Red Team Lead', quote: 'The interactive labs and AI mock interviews are standard-setting. It accurately prepares students for the industry.', initials: 'SD' },
    { name: 'Sujal Gundlapelli', title: 'Security Researcher', quote: 'The platform integrates learning, practice, and career preparation seamlessly. Highly recommended for beginners.', initials: 'SG' },
    { name: 'Sanika Sadre', title: 'SOC Manager', quote: 'Tracking student progress through the platform provides excellent visibility into their readiness.', initials: 'SS' },
    { name: 'Abhijit Karji', title: 'Education Specialist', quote: 'Cybercoach is the ideal companion for classroom learning, offering robust practical exercises.', initials: 'AK' },
  ], []);

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 640) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleGetStarted = useCallback((type: 'student' | 'teacher', tab?: string) => {
    if (user) {
      navigate(type === 'teacher' && user.role === 'teacher' ? '/teacher' : '/dashboard');
      return;
    }
    navigate(`/login?type=${type}${tab ? `&tab=${tab}` : ''}`);
  }, [user, navigate]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <SEO
        title="Cybercoach - Master Cybersecurity"
        description="The AI-powered platform for cybersecurity education. Master real-world skills with interactive labs and assessments."
      />

      <div className="relative min-h-screen bg-[#050505] text-[#FAFAFA] font-sans selection:bg-[#10B981]/30 overflow-x-hidden">

        {/* ── BACKGROUND EFFECTS ─────────────────────────── */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <GradientErrorBoundary>
            <Suspense fallback={<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,#10B98115_0%,transparent_60%)]" />}>
              <ShaderGradientCanvas
                style={{ width: "100%", height: "100%" }}
                pixelDensity={1}
                pointerEvents="none"
              >
                <ShaderGradient
                  animate="on"
                  type="sphere"
                  wireframe={false}
                  shader="defaults"
                  uTime={0}
                  uSpeed={0.3}
                  uStrength={0.3}
                  uDensity={0.8}
                  uFrequency={5.5}
                  uAmplitude={3.2}
                  positionX={-0.1}
                  positionY={0}
                  positionZ={0}
                  rotationX={0}
                  rotationY={130}
                  rotationZ={70}
                  color1="#004422" // Dark forest green
                  color2="#10B981" // Emerald
                  color3="#00FF88" // Neon/bright green
                  reflection={0.4}
                  cAzimuthAngle={270}
                  cPolarAngle={180}
                  cDistance={0.5}
                  cameraZoom={15.1}
                  lightType="env"
                  brightness={0.8}
                  envPreset="city"
                  grain="on"
                  toggleAxis={false}
                  zoomOut={false}
                  hoverState=""
                  enableTransition={false}
                />
              </ShaderGradientCanvas>
            </Suspense>
          </GradientErrorBoundary>

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-linear-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505]" />
        </div>

        {/* ── NAVBAR ──────────────────────────────────────── */}
        <Navbar>
          <NavBody>
            <NavbarLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <NavItems
              items={[
                { name: 'Features', link: '#features', onClick: () => scrollTo('features') },
                { name: 'Platform', link: '#platform', onClick: () => scrollTo('platform') },
                { name: 'Testimonials', link: '#testimonials', onClick: () => scrollTo('testimonials') },
              ]}
            />
            <div className="flex items-center gap-3">
              <LightMorphWrapper containerClass="rounded-xl p-0.5" inerContainerClass="rounded-[0.9rem]">
                <NavbarButton variant="primary" onClick={() => handleGetStarted('student')} className="bg-transparent shadow-none hover:bg-transparent text-white font-black">
                  {user ? 'Dashboard' : 'SIGN UP FREE'}
                </NavbarButton>
              </LightMorphWrapper>
            </div>
          </NavBody>
          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
              <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
            </MobileNavHeader>
            <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
              {['features', 'platform', 'testimonials'].map(id => (
                <button key={id} onClick={() => { setMobileOpen(false); scrollTo(id); }}
                  className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors text-sm font-medium capitalize">
                  {id}
                </button>
              ))}
              <div className="flex w-full flex-col gap-3 pt-4 border-t border-white/10">
                <NavbarButton onClick={() => { setMobileOpen(false); handleGetStarted('student'); }} variant="primary" className="w-full">
                  {user ? 'Dashboard' : 'Sign Up Free'}
                </NavbarButton>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>

        {/* ══════════════════════════════════════════════════
            HERO
           ══════════════════════════════════════════════════ */}
        <section className="relative pt-32 pb-20 px-6 flex items-center min-h-[85vh]">
          <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center relative z-10 space-y-8">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs sm:text-sm font-medium">
              VOIS Hackathon 2025 Education Track
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white leading-tight">
              Master Courses<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#10B981] to-[#34D399]">
                The Right Way
              </span>
            </h1>

            <div className="max-w-2xl mx-auto space-y-2">
              <p className="text-lg sm:text-xl text-[#A1A1AA] font-normal leading-relaxed">
                The AI-powered platform that turns learners into
              </p>
              <div className="text-xl sm:text-2xl font-semibold text-white h-10">
                <TypingText
                  texts={['Security Analysts', 'Ethical Hackers', 'SOC Engineers', 'Penetration Testers', 'Incident Responders']}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center pt-8">
              <LightMorphWrapper containerClass="rounded-xl p-0.5" inerContainerClass="rounded-[0.9rem]">
                <button
                  onClick={() => handleGetStarted('student')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white rounded-lg font-black text-lg transition-all w-full sm:w-auto min-w-[200px] hover:scale-105"
                >
                  {user ? 'Go to Dashboard' : 'START LEARNING FREE'}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </LightMorphWrapper>
            </div>

            <div className="pt-16 pb-4 flex flex-col items-center gap-4 border-t border-white/5 w-full max-w-2xl mt-8">
              <span className="text-sm font-medium text-[#71717A]">Created by</span>
              <div className="flex flex-wrap justify-center gap-8">
                {[
                  { name: 'Piyush Dhoka', url: 'https://piyush.sparkstudio.co.in' },
                  { name: 'Aadarsh Pathre', url: 'https://aadarsh.sparkstudio.co.in' },
                  { name: 'Varun Inamdar', url: 'https://varun.sparkstudio.co.in' },
                ].map((f) => (
                  <a key={f.name} href={f.url} target="_blank" rel="noopener noreferrer"
                    className="text-[#A1A1AA] hover:text-[#10B981] transition-colors text-sm font-medium flex items-center gap-1">
                    {f.name}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            ACTION CARDS — Community / Verify / Analyze
           ══════════════════════════════════════════════════ */}
        <section className="relative py-16 px-6 bg-[#0A0A0A] border-y border-white/5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => navigate('/community')}
              className="cursor-pointer group flex flex-col p-8 bg-[#121212] border border-white/5 hover:border-[#10B981]/30 rounded-2xl transition-all"
            >
              <div className="mb-4 p-3 bg-[#10B981]/10 rounded-xl w-max">
                <Users className="h-6 w-6 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
              <p className="text-[#A1A1AA] leading-relaxed flex-1">Connect with peers, share findings, ask questions, and collaborate in our dedicated cybersecurity forum.</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#10B981]">
                Join Discussion <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate('/company-verification')}
              className="cursor-pointer group flex flex-col p-8 bg-[#121212] border border-white/5 hover:border-[#10B981]/30 rounded-2xl transition-all"
            >
              <div className="mb-4 p-3 bg-[#10B981]/10 rounded-xl w-max">
                <Shield className="h-6 w-6 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Company Verification</h3>
              <p className="text-[#A1A1AA] leading-relaxed flex-1">Validate company legitimacy with our AI analysis tools before you apply to open cybersecurity roles.</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#10B981]">
                Verify Company <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate('/analyze-target')}
              className="cursor-pointer group flex flex-col p-8 bg-[#121212] border border-white/5 hover:border-[#10B981]/30 rounded-2xl transition-all"
            >
              <div className="mb-4 p-3 bg-[#10B981]/10 rounded-xl w-max">
                <Activity className="h-6 w-6 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analyze Target</h3>
              <p className="text-[#A1A1AA] leading-relaxed flex-1">Deploy automated heuristic analysis on external domains to detect vulnerabilities and potential attack vectors.</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#10B981]">
                Start Analysis <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FEATURES GRID
           ══════════════════════════════════════════════════ */}
        <section id="features" className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Everything you need to succeed
              </h2>
              <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
                A comprehensive ecosystem featuring hands-on practice, AI tutoring, and career preparation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard icon={<BookOpen className="h-6 w-6" />} title="Interactive Courses" description="Structured curriculum covering OWASP, network defense, ethical hacking, and cryptography." delay={0} />
              <FeatureCard icon={<Terminal className="h-6 w-6" />} title="Hands-on Labs" description="Browser-based labs with real, isolated vulnerability environments for safe practice." delay={50} />
              <FeatureCard icon={<Brain className="h-6 w-6" />} title="AI Tutor" description="24/7 AI teaching assistant ready to explain complex concepts or help you get unstuck." delay={100} />
              <FeatureCard icon={<Crosshair className="h-6 w-6" />} title="Proctored Assessments" description="Secure, webcam-proctored exams ensuring the integrity of your achieved certifications." delay={150} />
              <FeatureCard icon={<Eye className="h-6 w-6" />} title="Mock Interviews" description="Practice job interviews with our AI system and receive actionable, scored feedback." delay={200} />
              <FeatureCard icon={<BarChart3 className="h-6 w-6" />} title="Progress Tracking" description="Detailed analytics to monitor your learning journey, XP gains, and course completion." delay={250} />
              <FeatureCard icon={<Award className="h-6 w-6" />} title="Certifications" description="Earn verifiable digital certificates to share on LinkedIn and professional networks." delay={300} />
              <FeatureCard icon={<Globe className="h-6 w-6" />} title="Community Feed" description="A dedicated forum for students to share insights, code, and stay updated." delay={350} />
              <FeatureCard icon={<Lock className="h-6 w-6" />} title="Security Scanners" description="Access built-in tools for verifying companies and analyzing domains safely." delay={400} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            PLATFORM PREVIEW
           ══════════════════════════════════════════════════ */}
        <section id="platform" className="py-24 px-6 bg-[#0A0A0A] border-y border-white/5 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Inside the Platform
              </h2>
              <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
                Explore the tools designed specifically for modern cybersecurity education.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
              <div className="w-full lg:w-1/3 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                {previewTabs.map((tab, i) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreview(i)}
                    className={`shrink-0 text-left p-5 rounded-xl border transition-all ${i === activePreview
                      ? 'bg-[#121815] border-[#10B981]/30'
                      : 'bg-[#121212] border-white/5 hover:border-white/10 hover:bg-[#181818]'
                      }`}
                  >
                    <div className={`text-base font-semibold mb-1 ${i === activePreview ? 'text-[#10B981]' : 'text-white'}`}>
                      {tab.label}
                    </div>
                    <div className="text-sm text-[#A1A1AA] leading-snug">{tab.sub}</div>
                  </button>
                ))}
              </div>

              <div className="w-full lg:w-2/3">
                <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black/50 aspect-16/10">
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#181818] border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]/80" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]/80" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840]/80" />
                    </div>
                  </div>
                  <div className="relative aspect-16/10 bg-[#0A0A0A]">
                    {previewTabs.map((tab, i) => (
                      <img
                        key={tab.id}
                        src={tab.img}
                        alt={tab.headline}
                        className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${i === activePreview ? 'opacity-100' : 'opacity-0'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            IMPACT STATS
           ══════════════════════════════════════════════════ */}
        <section className="py-24 px-6 relative">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <AnimatedCounter end={2500} suffix="+" label="Active Learners" />
            <AnimatedCounter end={150} suffix="+" label="Interactive Labs" />
            <AnimatedCounter end={98} suffix="%" label="Course Completion" />
            <AnimatedCounter end={50} suffix="K" label="Threats Analyzed" />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TELEGRAM BOT
           ══════════════════════════════════════════════════ */}
        <section className="py-24 px-6 relative bg-[#0A0A0A] border-y border-white/5">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Stay Updated with our Telegram Bot
            </h2>
            <p className="text-lg text-[#A1A1AA] max-w-xl mx-auto mb-8">
              Get the latest cybersecurity news, emerging threats, and platform updates sent straight to your device.
            </p>
            <a
              href="https://t.me/careerconnet_cyber_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#212121] hover:bg-[#2A2A2A] border border-white/10 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="#0088cc" />
                <path d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z" fill="white" />
              </svg>
              Open Telegram Bot
            </a>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TESTIMONIALS
           ══════════════════════════════════════════════════ */}
        <section id="testimonials" className="py-24 px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Trusted by Professionals
            </h2>

            <div className="mb-12">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-[#10B981] fill-[#10B981]" />
                ))}
              </div>
              <p className="text-xl md:text-2xl text-white leading-relaxed max-w-3xl mx-auto min-h-[100px] mb-8">
                "{testimonials[activeTestimonial].quote}"
              </p>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center shrink-0 text-left">
                  {testimonials[activeTestimonial].initials}
                </div>
                <h4 className="font-semibold text-white">{testimonials[activeTestimonial].name}</h4>
                <p className="text-[#A1A1AA] text-sm">{testimonials[activeTestimonial].title}</p>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  className={`h-2 transition-all rounded-full ${i === activeTestimonial ? 'bg-[#10B981] w-6' : 'bg-white/20 w-2 hover:bg-white/40'}`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────── */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-3xl mx-auto bg-linear-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#10B981]/15 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#10B981]/30" />
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-[#A1A1AA] text-lg mb-8 max-w-xl mx-auto">
              Join our platform today and acquire the skills needed to protect modern digital infrastructure.
            </p>
            <div className="flex justify-center">
              <LightMorphWrapper containerClass="rounded-xl p-0.5" inerContainerClass="rounded-[0.9rem]">
                <button
                  onClick={() => handleGetStarted('student', 'register')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white rounded-lg font-black text-lg transition-all hover:scale-105"
                >
                  SIGN UP FOR FREE
                  <ArrowRight className="h-5 w-5" />
                </button>
              </LightMorphWrapper>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────── */}
        <footer className="py-12 px-6 border-t border-white/10 bg-[#0A0A0A] relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3 text-white font-bold text-xl">
              <div className="p-1.5 bg-[#10B981]/10 rounded-lg border border-[#10B981]/20">
                <img src="/cybercoach.png" alt="Cybercoach" className="h-6 w-6" />
              </div>
              Cybercoach
            </div>

            <div className="flex gap-8">
              <button onClick={() => navigate('/community')} className="text-sm font-medium text-[#A1A1AA] hover:text-[#10B981] transition-colors">Community</button>
              <button onClick={() => navigate('/company-verification')} className="text-sm font-medium text-[#A1A1AA] hover:text-[#10B981] transition-colors">Verify</button>
              <button onClick={() => navigate('/analyze-target')} className="text-sm font-medium text-[#A1A1AA] hover:text-[#10B981] transition-colors">Analyze</button>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-[#A1A1AA]">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#FAFAFA]">System Status:</span> Operational
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/5 text-center md:text-left">
            <p className="text-xs text-[#52525B]">
              &copy; {new Date().getFullYear()} Cybercoach. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    </>
  );
};
