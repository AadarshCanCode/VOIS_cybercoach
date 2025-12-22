import React, { useEffect, useMemo, useState } from 'react';
import { Shield, BookOpen, Award, Target, Zap, CheckCircle, ArrowRight, Globe, Brain, Video, Menu, X, Users, Terminal, Lock, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { LoginForm } from '../Auth/LoginForm';
import { RegisterForm } from '../Auth/RegisterForm';

// UI Components
const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-[#000000]/50 p-4 rounded-lg border border-[#00FF88]/10">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-[10px] font-mono text-[#00B37A]">{label}</span>
    </div>
    <div className="text-xl font-bold text-white">{value}</div>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; copy: string }> = ({ icon, title, copy }) => (
  <div className="group bg-[#0A0F0A] border border-[#00FF88]/10 hover:border-[#00FF88]/50 rounded-2xl p-8 transition-all hover:bg-[#00FF88]/5">
    <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[#00FF88]/20">
      <div className="text-[#00FF88]">{icon}</div>
    </div>
    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">{title}</h3>
    <p className="text-sm text-[#00B37A] leading-relaxed">{copy}</p>
  </div>
);

const PathCard: React.FC<{ title: string; level: string; features: string[]; highlight?: boolean; onApply: () => void }> = ({ title, level, features, highlight, onApply }) => (
  <div className={`relative p-8 rounded-2xl border flex flex-col justify-between transition-all hover:-translate-y-1 ${highlight
    ? 'bg-[#00FF88]/5 border-[#00FF88] shadow-[0_0_30px_rgba(0,255,136,0.1)]'
    : 'bg-[#0A0F0A] border-[#00FF88]/10 hover:border-[#00FF88]/30'
    }`}>
    {highlight && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00FF88] text-black text-xs font-bold uppercase tracking-widest rounded-full">
        Recommended
      </div>
    )}
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h3>
          <div className="text-xs font-mono text-[#00FF88] mt-1">{level}</div>
        </div>
        <Shield className={`h-6 w-6 ${highlight ? 'text-[#00FF88]' : 'text-[#00B37A]'}`} />
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-[#EAEAEA]">
            <CheckCircle className="h-4 w-4 text-[#00FF88] mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>

    <button
      onClick={onApply}
      className={`w-full py-3 rounded-lg font-bold uppercase tracking-wide transition-all ${highlight
        ? 'bg-[#00FF88] text-black hover:bg-[#00CC66]'
        : 'bg-[#00FF88]/10 text-[#00FF88] hover:bg-[#00FF88]/20'
        }`}
    >
      Initialize
    </button>
  </div>
);

const ActionCard: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; description: string; onClick: () => void }> = ({ icon, title, subtitle, description, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col items-center text-center p-8 bg-[#0A0F0A] border border-[#00FF88]/20 hover:border-[#00FF88] rounded-2xl transition-all hover:bg-[#00FF88]/5 hover:shadow-[0_0_50px_rgba(0,255,136,0.1)] hover:-translate-y-2 w-full"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-[#00FF88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
    <div className="mb-6 p-6 bg-[#00FF88]/10 rounded-full border border-[#00FF88]/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-2 group-hover:text-[#00FF88] transition-colors">{title}</h3>
    <div className="text-xs font-mono text-[#00B37A] mb-4 tracking-widest">{subtitle}</div>
    <p className="text-sm text-[#EAEAEA]/80 leading-relaxed max-w-xs">{description}</p>

    <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#00FF88] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
      Initialize <ArrowRight className="h-3 w-3" />
    </div>
  </button>
);

interface LandingPageProps {
  onLogin: (targetTab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const { user } = useAuth();
  // auth modal flow
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userType, setUserType] = useState<'student' | 'teacher' | null>(null);
  const [targetTab, setTargetTab] = useState<string | undefined>(undefined);

  // interactive UI state
  const [showDemo, setShowDemo] = useState(false);
  const [email, setEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  // testimonials carousel
  const testimonials = useMemo(
    () => [
      {
        name: 'Sarah Rodriguez',
        title: 'Security Analyst at TechCorp',
        quote: 'Career Connect transformed my cybersecurity career. The hands-on labs made complex topics tangible.',
        initials: 'SR',
      },
      {
        name: 'Michael Johnson',
        title: 'Penetration Tester at SecureNet',
        quote: "The virtual labs are realistic. I practiced techniques safely and gained confidence for real engagements.",
        initials: 'MJ',
      },
      {
        name: 'Dr. Amanda Chen',
        title: 'Cybersecurity Professor',
        quote: 'As an instructor I love how easy it is to create engaging content and track student progress.',
        initials: 'AC',
      },
    ],
    []
  );
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveTestimonial((p) => (p + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const handleGetStarted = (type: 'student' | 'teacher', tab?: string) => {
    if (user) {
      onLogin(tab || 'dashboard');
      return;
    }
    setUserType(type);
    setTargetTab(tab);
    setShowLogin(true);
  };

  const submitEmail = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email)) {
      setEmailMsg('Please enter a valid email address');
      return;
    }
    setEmailMsg('Thanks! We\'ll keep you updated.');
    setEmail('');
    setTimeout(() => setEmailMsg(null), 4000);
  };

  // navbar mobile state
  const [mobileOpen, setMobileOpen] = useState(false);

  // close mobile menu on route change or resize
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 640) setMobileOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <LoginForm 
            userType={userType}
            onToggleMode={() => setShowRegister(true) || setShowLogin(false)}
            onBack={() => setShowLogin(false)}
            onSuccess={() => onLogin(targetTab)}
          />
        </div>
      )}

      {showRegister && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <RegisterForm 
            userType={userType}
            onToggleMode={() => setShowLogin(true) || setShowRegister(false)}
            onBack={() => setShowRegister(false)}
            onSuccess={() => onLogin(targetTab)}
          />
        </div>
      )}
      
      <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#00FF88]/30">
        {/* Grid Background */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#00FF8808_1px,transparent_1px),linear-gradient(to_bottom,#00FF8808_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Radial Gradient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00FF88]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Nav */}
      <header className="py-6 px-6 sticky top-0 z-40 backdrop-blur-md bg-[#000000]/80 border-b border-[#00FF88]/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button aria-label="Home" className="flex items-center gap-3 focus:outline-none group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="p-2 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-lg group-hover:bg-[#00FF88]/20 transition-colors">
                <Shield className="h-6 w-6 text-[#00FF88]" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-lg font-black tracking-tighter text-white uppercase">Career <span className="text-[#00FF88]">Connect</span></div>
                <div className="text-[10px] font-mono text-[#00B37A] tracking-widest">CYBERSECURITY OPS</div>
              </div>
            </button>
          </div>

          {/* desktop links */}
          <nav className="hidden sm:flex items-center gap-8">
            {['Features', 'Paths', 'Testimonials'].map((item) => (
              <a key={item} className="text-sm font-medium text-[#00B37A] hover:text-[#00FF88] transition-colors uppercase tracking-wide" href={`#${item.toLowerCase()}`}>
                {item}
              </a>
            ))}
            <div className="h-4 w-px bg-[#00FF88]/20" />
            <button onClick={() => handleGetStarted('student')} className="px-6 py-2 rounded-lg bg-[#00FF88] hover:bg-[#00CC66] text-black font-bold text-sm tracking-wide transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]">
              {user ? 'ACCESS TERMINAL' : 'INITIALIZE'}
            </button>
          </nav>

          {/* mobile menu button */}
          <div className="sm:hidden">
            <button aria-expanded={mobileOpen} aria-controls="mobile-menu" onClick={() => setMobileOpen((s) => !s)} className="p-2 rounded-md text-[#00FF88] hover:bg-[#00FF88]/10">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* mobile nav panel */}
        {mobileOpen && (
          <div id="mobile-menu" className="sm:hidden absolute top-full left-0 right-0 bg-[#0A0F0A] border-b border-[#00FF88]/20 p-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-4">
              {['Features', 'Paths', 'Testimonials'].map((item) => (
                <a key={item} className="block px-4 py-2 text-[#00B37A] hover:text-[#00FF88] hover:bg-[#00FF88]/10 rounded-lg font-medium uppercase tracking-wide" href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)}>
                  {item}
                </a>
              ))}
              <button onClick={() => { setMobileOpen(false); handleGetStarted('student'); }} className="w-full text-center px-4 py-3 rounded-lg bg-[#00FF88] text-black font-bold uppercase tracking-wide">
                {user ? 'Access Terminal' : 'Initialize System'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] text-xs font-mono mb-6 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#00FF88]" />
              SYSTEM ONLINE // V2.0.4
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-tight">
              MASTER THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC66]">CYBER DOMAIN</span>
            </h1>

            <p className="text-lg text-[#00B37A] mb-8 max-w-xl leading-relaxed font-light">
              Deploy into realistic combat simulations. Train with AI-driven adversaries. Earn industry-recognized credentials in a high-fidelity environment.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={() => handleGetStarted('student')}
                className="group flex items-center gap-3 px-8 py-4 bg-[#00FF88] hover:bg-[#00CC66] text-black rounded-xl font-bold text-lg tracking-wide transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]"
              >
                <Terminal className="h-5 w-5" />
                {user ? 'ENTER DASHBOARD' : 'START MISSION'}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                className="flex items-center gap-2 px-6 py-4 text-[#EAEAEA] hover:text-white border border-[#00FF88]/20 hover:border-[#00FF88]/50 rounded-xl font-medium transition-all hover:bg-[#00FF88]/5"
                href="https://cybergame.sparkstudio.co.in/"
                target="_blank"
                rel="noreferrer"
              >
                <Globe className="h-5 w-5 text-[#00FF88]" />
                Simulate Attack
              </a>
            </div>

            {/* email signup */}
            <form onSubmit={submitEmail} className="mt-12 max-w-md relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FF88] to-[#00CC66] rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative flex gap-2 bg-[#0A0F0A] p-1.5 rounded-lg border border-[#00FF88]/20">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter comms frequency (email)..."
                  className="flex-1 px-4 py-2 bg-transparent text-[#EAEAEA] placeholder-[#00B37A]/50 focus:outline-none font-mono text-sm"
                />
                <button className="px-6 py-2 rounded bg-[#00FF88]/10 hover:bg-[#00FF88]/20 text-[#00FF88] font-bold text-sm uppercase tracking-wide border border-[#00FF88]/20 transition-all">
                  Connect
                </button>
              </div>
              {emailMsg && <div className="absolute -bottom-8 left-0 text-xs font-mono text-[#00FF88]">{emailMsg}</div>}
            </form>
          </div>

          {/* Hero visual / stats */}
          <div className="relative">
            <div className="absolute -inset-4 bg-[#00FF88]/20 blur-3xl rounded-full opacity-20 animate-pulse" />
            <div className="relative bg-[#0A0F0A] border border-[#00FF88]/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8 border-b border-[#00FF88]/10 pb-6">
                <div>
                  <div className="text-2xl font-bold text-white mb-1">Live Operations</div>
                  <div className="text-xs font-mono text-[#00B37A]">GLOBAL THREAT LEVEL: ELEVATED</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-[#00FF88]">98.4%</div>
                  <div className="text-xs font-mono text-[#00B37A]">SUCCESS RATE</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard label="ACTIVE AGENTS" value="12,405" icon={<Users className="h-4 w-4 text-[#00FF88]" />} />
                <StatCard label="SIMULATIONS" value="50+" icon={<Target className="h-4 w-4 text-[#00FF88]" />} />
                <StatCard label="UPTIME" value="99.9%" icon={<Zap className="h-4 w-4 text-[#00FF88]" />} />
                <StatCard label="AI MENTOR" value="ONLINE" icon={<Brain className="h-4 w-4 text-[#00FF88]" />} />
              </div>

              <div className="mt-8 pt-6 border-t border-[#00FF88]/10">
                <div className="flex items-center gap-3 text-xs font-mono text-[#00B37A]">
                  <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-ping" />
                  INCOMING TRANSMISSION: NEW BOUNTIES AVAILABLE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[#050505] relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00FF88]/20 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
              Tactical <span className="text-[#00FF88]">Capabilities</span>
            </h2>
            <p className="text-[#00B37A] max-w-2xl mx-auto font-light">
              Equip yourself with advanced tools and training modules designed for modern cyber warfare.
            </p>
          </div>

          {/* Main Actions - Prominent Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <ActionCard
              icon={<Users className="h-10 w-10 text-[#00FF88]" />}
              title="Join Network"
              subtitle="ESTABLISH UPLINK"
              description="Connect with elite operatives. Share intel, bounties, and strategies in the global feed."
              onClick={() => handleGetStarted('student', 'community')}
            />
            <ActionCard
              icon={<Shield className="h-10 w-10 text-[#00FF88]" />}
              title="Verify Target"
              subtitle="SCAN DATABASE"
              description="Validate company credentials and security clearance levels against the central registry."
              onClick={() => handleGetStarted('student', 'verification')}
            />
            <ActionCard
              icon={<Activity className="h-10 w-10 text-[#00FF88]" />}
              title="Analyze Target"
              subtitle="VULNERABILITY SCAN"
              description="Deploy AI-driven heuristic analysis on target domains to identify potential vectors."
              onClick={() => handleGetStarted('student', 'analyzer')}
            />
          </div>

          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-[#00FF88]/20 flex-1" />
            <span className="text-xs font-mono text-[#00B37A] uppercase tracking-widest">System Modules</span>
            <div className="h-px bg-[#00FF88]/20 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<BookOpen />} title="Intel Archives" copy="Access classified course materials and structured learning paths." />
            <FeatureCard icon={<Target />} title="Live Ranges" copy="Engage in real-time combat simulations with automated scoring." />
            <FeatureCard icon={<Brain />} title="CORTEX AI" copy="Neural-linked mentor providing instant tactical analysis and hints." />
            <FeatureCard icon={<Award />} title="Credentials" copy="Earn verifiable badges and clearance levels for your resume." />
            <FeatureCard icon={<Zap />} title="Performance" copy="Real-time analytics tracking your operational efficiency." />
            <FeatureCard icon={<Globe />} title="Network" copy="Connect with other operatives in the global intelligence feed." />
          </div>
        </div>
      </section>


      {/* Learning Paths */}
      < section id="paths" className="py-24 px-6 relative overflow-hidden" >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
                Mission <span className="text-[#00FF88]">Tracks</span>
              </h2>
              <p className="text-[#00B37A]">Select your specialization and begin training.</p>
            </div>
            <button onClick={() => handleGetStarted('student')} className="text-[#00FF88] font-bold uppercase tracking-wide hover:underline flex items-center gap-2">
              View All Operations <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PathCard
              title="Recruit"
              level="LEVEL 1"
              features={["Security Fundamentals", "Network Basics", "Linux Command Line"]}
              onApply={() => handleGetStarted('student')}
            />
            <PathCard
              title="Operative"
              level="LEVEL 2"
              features={["Penetration Testing", "Vulnerability Assessment", "Web App Security"]}
              highlight
              onApply={() => handleGetStarted('student')}
            />
            <PathCard
              title="Specialist"
              level="LEVEL 3"
              features={["Advanced Exploitation", "Threat Hunting", "Reverse Engineering"]}
              onApply={() => handleGetStarted('student')}
            />
          </div>
        </div>
      </section >

      {/* Testimonials */}
      < section id="testimonials" className="py-24 px-6 bg-[#050505] border-t border-[#00FF88]/10" >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-12">
            Field <span className="text-[#00FF88]">Reports</span>
          </h2>

          <div className="relative bg-[#0A0F0A] border border-[#00FF88]/20 p-10 rounded-2xl shadow-[0_0_50px_rgba(0,255,136,0.05)]">
            <div className="absolute -top-5 -left-5">
              <div className="w-10 h-10 bg-[#00FF88] rounded-lg flex items-center justify-center text-black">
                <Lock className="h-5 w-5" />
              </div>
            </div>

            <blockquote className="text-xl md:text-2xl font-light text-[#EAEAEA] italic mb-8 leading-relaxed">
              "{testimonials[activeTestimonial].quote}"
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-[#00FF88]/10 rounded-full flex items-center justify-center font-bold text-[#00FF88] border border-[#00FF88]/20">
                {testimonials[activeTestimonial].initials}
              </div>
              <div className="text-left">
                <div className="font-bold text-white uppercase tracking-wide">{testimonials[activeTestimonial].name}</div>
                <div className="text-xs font-mono text-[#00B37A]">{testimonials[activeTestimonial].title}</div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-[#00FF88] w-6' : 'bg-[#00FF88]/20'}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section >

      {/* CTA */}
      < section className="py-24 px-6 relative overflow-hidden" >
        <div className="absolute inset-0 bg-[#00FF88]/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
            Ready for <span className="text-[#00FF88]">Deployment?</span>
          </h2>
          <p className="text-[#00B37A] text-lg mb-10 max-w-2xl mx-auto">
            Initialize your training sequence today. Join the elite ranks of cyber operatives.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => handleGetStarted('student')} className="px-8 py-4 bg-[#00FF88] hover:bg-[#00CC66] text-black font-bold rounded-xl uppercase tracking-wide transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]">
              Initialize System
            </button>
            <button onClick={() => handleGetStarted('teacher')} className="px-8 py-4 bg-transparent border border-[#00FF88]/20 hover:border-[#00FF88] text-[#00FF88] font-bold rounded-xl uppercase tracking-wide transition-all hover:bg-[#00FF88]/5">
              Instructor Access
            </button>
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="py-12 px-6 border-t border-[#00FF88]/10 bg-[#020202]" >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-lg">
              <Shield className="h-6 w-6 text-[#00FF88]" />
            </div>
            <div>
              <div className="font-bold text-white uppercase tracking-wide">Career Connect</div>
              <div className="text-[10px] font-mono text-[#00B37A]">SECURE CONNECTION ESTABLISHED</div>
            </div>
          </div>

          <div className="text-xs font-mono text-[#00B37A]/50">
            SYSTEM VERSION 2.0.4 // © {new Date().getFullYear()} ALL RIGHTS RESERVED
          </div>
        </div>
      </footer >

      {/* Demo modal */}
      {
        showDemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl max-w-3xl w-full overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.1)]">
              <div className="flex justify-between items-center p-4 border-b border-[#00FF88]/10">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-[#00FF88]" />
                  <div className="font-bold text-white uppercase tracking-wide">Mission Briefing</div>
                </div>
                <button onClick={() => setShowDemo(false)} className="text-[#00B37A] hover:text-[#00FF88] px-3 font-mono">CLOSE_</button>
              </div>
              <div className="p-4">
                <div className="aspect-video w-full bg-black rounded border border-[#00FF88]/10">
                  <iframe
                    title="Platform demo"
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        )
      }
      </div>
    </>
  );
};


