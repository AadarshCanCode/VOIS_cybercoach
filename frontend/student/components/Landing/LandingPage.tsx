import React, { useEffect, useMemo, useState } from 'react';
import { Shield, BookOpen, Award, Target, Zap, ArrowRight, Brain, Video, Menu, X, Users, Terminal, Activity, Bot, Briefcase, FileText, ClipboardCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';

// UI Components
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; copy: string }> = ({ icon, title, copy }) => (
  <div className="group bg-[#0A0F0A] border border-[#00FF88]/10 hover:border-[#00FF88]/50 rounded-2xl p-8 transition-all hover:bg-[#00FF88]/5 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF88]/5 blur-2xl rounded-full translate-x-12 -translate-y-12 group-hover:bg-[#00FF88]/10 transition-colors" />
    <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[#00FF88]/20 relative z-10">
      <div className="text-[#00FF88]">{icon}</div>
    </div>
    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide relative z-10">{title}</h3>
    <p className="text-sm text-[#00B37A] leading-relaxed relative z-10">{copy}</p>
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

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // interactive UI state


  // testimonials carousel
  const testimonials = useMemo(
    () => [
      {
        name: 'Kailas Patil',
        title: 'Lead Security Architect',
        quote: 'The Cyber Forge is a game-changer for high-stakes defensive operations. Its fidelity is unmatched.',
        initials: 'KP',
      },
      {
        name: 'Shriram Dixit',
        title: 'Red Team Lead',
        quote: 'Finally, a platform that matches the intensity of real-world cyber warfare. The AI Interviewer is brutal yet brilliant.',
        initials: 'SD',
      },
      {
        name: 'Sujal Gundlapelli',
        title: 'Security Researcher',
        quote: "The seamless integration of threat intel into training ranges has significantly accelerated our response times.",
        initials: 'SG',
      },
      {
        name: 'Sanika Sadre',
        title: 'SOC Manager',
        quote: 'Monitoring student progress through the Unified Defense Initiative has never been more intuitive.',
        initials: 'SS',
      },
      {
        name: 'Abhijit Karji',
        title: 'Cyber Education Specialist',
        quote: 'Vois CyberCoach is the ultimate bridge between classroom theory and the digital frontlines.',
        initials: 'AK',
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
      if (type === 'teacher' && user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
      return;
    }
    navigate(`/login?type=${type}${tab ? `&tab=${tab}` : ''}`);
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

      <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#00FF88]/30">
        {/* Grid Background */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#00FF8805_1px,transparent_1px),linear-gradient(to_bottom,#00FF8805_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Animated Blobs */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00FF88]/10 blur-[120px] rounded-full animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00FF88]/10 blur-[120px] rounded-full animate-blob animation-delay-2000" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#00FF88]/5 blur-[100px] rounded-full animate-blob animation-delay-4000" />
        </div>

        {/* Radial Gradient Glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#00FF88]/15 to-transparent blur-[120px] rounded-full pointer-events-none" />

        {/* Nav */}
        <header className="py-5 px-6 sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-black/60 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button aria-label="Home" className="flex items-center gap-5 focus:outline-none group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="relative">
                  <div className="absolute -inset-3 bg-[#00FF88]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
                  <img src="/cybercoach.png" alt="Cybercoach" className="relative h-16 w-16 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-2xl font-black tracking-tighter text-white uppercase flex items-center gap-1 group-hover:text-[#00FF88] transition-colors duration-500">
                    CYBER <span className="text-[#00FF88]">COACH</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#00B37A] tracking-[0.4em] uppercase opacity-50">Unified Defense Initiative</div>
                </div>
              </button>
            </div>

            {/* desktop links */}
            <nav className="hidden lg:flex items-center gap-10">
              {['Features', 'Testimonials'].map((item) => (
                <a key={item} className="text-[11px] font-mono font-bold text-[#00B37A]/60 hover:text-[#00FF88] transition-all uppercase tracking-[0.2em] relative group/item" href={`#${item.toLowerCase()}`}>
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#00FF88] transition-all group-hover/item:w-full" />
                </a>
              ))}
              <div className="h-5 w-px bg-white/10" />
              <button
                onClick={() => handleGetStarted('student')}
                className="relative px-8 py-3.5 rounded-2xl bg-[#00FF88] hover:bg-[#00CC66] text-black font-black text-xs tracking-[0.2em] transition-all hover:scale-105 shadow-[0_0_30px_rgba(0,255,136,0.2)] active:scale-95 group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 uppercase">{user ? 'ACCESS_TERMINAL' : 'REGISTER'}</span>
              </button>
            </nav>

            {/* mobile menu button */}
            <div className="lg:hidden">
              <button aria-expanded={mobileOpen} aria-controls="mobile-menu" onClick={() => setMobileOpen((s) => !s)} className="p-3 rounded-2xl text-[#00FF88] bg-[#00FF88]/5 border border-[#00FF88]/20 hover:bg-[#00FF88]/10 transition-all">
                {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>

          {/* mobile nav panel */}
          {mobileOpen && (
            <div id="mobile-menu" className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 p-8 animate-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col gap-8">
                {['Features', 'Testimonials'].map((item) => (
                  <a key={item} className="text-[10px] font-mono font-bold text-[#00B37A] hover:text-[#00FF88] transition-colors uppercase tracking-[0.4em]" href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)}>
                    {item}
                  </a>
                ))}
                <button
                  onClick={() => { setMobileOpen(false); handleGetStarted('student'); }}
                  className="w-full text-center px-6 py-5 rounded-2xl bg-[#00FF88] text-black font-black uppercase text-xs tracking-[0.3em] shadow-[0_0_30px_rgba(0,255,136,0.2)]"
                >
                  {user ? 'ACCESS TERMINAL' : 'REGISTER'}
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Hero */}
        <section className="relative pt-20 pb-12 px-6 overflow-hidden flex items-center">
          {/* Background Decorative Elements */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00FF88]/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00CC66]/5 blur-[150px] rounded-full pointer-events-none animate-pulse delay-1000" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 w-full">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#00FF88]/5 border border-[#00FF88]/20 text-[#00FF88] text-[9px] font-mono tracking-[0.3em] uppercase group cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF88]"></span>
                </span>
                Neural Network Link: Stable // Latency: 4ms
              </div>

              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] uppercase">
                  MASTER THE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] via-[#00FF88] to-[#00CC66] filter drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]">
                    DEFENSE
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed font-light tracking-wide">
                  The elite tactical platform for unified cybersecurity defense. Forge your edge in high-fidelity ranges.
                </p>
              </div>

              <div className="flex flex-wrap gap-6 items-center">
                <button
                  onClick={() => handleGetStarted('student')}
                  className="group relative flex items-center gap-4 px-8 py-4 bg-[#00FF88] hover:bg-[#00CC66] text-black rounded-[2rem] font-black text-lg tracking-tight transition-all hover:scale-[1.05] active:scale-95 shadow-[0_0_50px_rgba(0,255,136,0.4)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Terminal className="h-6 w-6 relative z-10" />
                  <span className="relative z-10">{user ? 'ACCESS TERMINAL' : 'REGISTER'}</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform relative z-10" />
                </button>

              </div>

              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/10 max-w-lg">
                {[
                  { label: 'Modules', val: '500+' },
                  { label: 'Uptime', val: '99.9%' },
                  { label: 'Ops', val: '12K+' }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-2xl font-black text-white tracking-tighter">{stat.val}</div>
                    <div className="text-[9px] font-mono text-[#00B37A] tracking-widest uppercase opacity-60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-10 bg-[#00FF88]/10 blur-[100px] rounded-full opacity-40 animate-pulse pointer-events-none" />

              <div className="relative bg-[#0A0F0A] border border-[#00FF88]/20 rounded-[3rem] p-2 shadow-2xl backdrop-blur-3xl overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent opacity-50" />
                <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-[#00FF88] tracking-[0.4em] uppercase">Status: Nominal</div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Live Feed_</h3>
                    </div>
                    <div className="p-4 bg-[#00FF88]/10 rounded-2xl border border-[#00FF88]/20 animate-pulse">
                      <Activity className="h-8 w-8 text-[#00FF88]" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-black/60 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#00B37A] opacity-60">
                        <span>COGNITIVE LOAD</span>
                        <span>42%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00FF88] w-[42%] rounded-full shadow-[0_0_10px_#00FF88]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-black/60 rounded-3xl border border-white/5">
                        <div className="text-[10px] font-mono text-[#00B37A] mb-1 opacity-60 uppercase">Threats</div>
                        <div className="text-3xl font-black text-white italic">00</div>
                      </div>
                      <div className="p-4 bg-black/60 rounded-3xl border border-white/5">
                        <div className="text-[10px] font-mono text-[#00B37A] mb-1 opacity-60 uppercase">Alert</div>
                        <div className="text-3xl font-black text-[#00FF88] italic">LOW</div>
                      </div>
                    </div>

                    <div className="p-4 bg-black/80 rounded-2xl border border-white/10 font-mono text-[10px] space-y-2">
                      <div className="flex gap-2 text-[#00FF88]">
                        <span className="opacity-40">{">>"}</span>
                        <span>SCAN_COMPLETE</span>
                      </div>
                      <div className="flex gap-2 text-[#00FF88]">
                        <span className="opacity-40">{">>"}</span>
                        <span>ENC_ACTIVE</span>
                      </div>
                      <div className="flex gap-2 text-red-500/80 animate-pulse">
                        <span className="opacity-40">{">>"}</span>
                        <span>UNTRUST_PING</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        < section id="features" className="py-24 px-6 bg-[#050505] relative" >
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
                onClick={() => navigate('/community')}
              />
              <ActionCard
                icon={<Shield className="h-10 w-10 text-[#00FF88]" />}
                title="Verify Target"
                subtitle="SCAN DATABASE"
                description="Validate company credentials and security clearance levels against the central registry."
                onClick={() => navigate('/verify-target')}
              />
              <ActionCard
                icon={<Activity className="h-10 w-10 text-[#00FF88]" />}
                title="Analyze Target"
                subtitle="VULNERABILITY SCAN"
                description="Deploy AI-driven heuristic analysis on target domains to identify potential vectors."
                onClick={() => navigate('/analyze-target')}
              />
            </div>

            <div className="flex items-center gap-4 mb-12">
              <div className="h-px bg-[#00FF88]/20 flex-1" />
              <span className="text-xs font-mono text-[#00B37A] uppercase tracking-widest">System Modules</span>
              <div className="h-px bg-[#00FF88]/20 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <FeatureCard icon={<LayoutDashboard />} title="Dashboard" copy="Real-time operational overview of your cybersecurity progress and missions." />
              <FeatureCard icon={<BookOpen />} title="Courses" copy="Classified intelligence archives and structured technical learning paths." />
              <FeatureCard icon={<Terminal />} title="Virtual Labs" copy="Hands-on combat simulations in isolated, high-fidelity environments." />
              <FeatureCard icon={<Video />} title="Video Intel" copy="On-demand tactical briefings and expert-led technical walkthroughs." />
              <FeatureCard icon={<Award />} title="Certificates" copy="Earn blockchain-verifiable credentials and field-ready clearance levels." />
              <FeatureCard icon={<FileText />} title="Mission Notes" copy="Securely document findings, strategies, and key intelligence during operations." />
              <FeatureCard icon={<Briefcase />} title="Career Vault" copy="Direct uplink to elite cybersecurity opportunities and recruiter networks." />
              <FeatureCard icon={<Bot />} title="AI Interview" copy="Advanced neural-linked combat prep for high-stakes technical evaluations." />
              <FeatureCard icon={<FileText />} title="Resume Engine" copy="Forge a battle-tested professional identity with our automated builder." />
              <FeatureCard icon={<ClipboardCheck />} title="Assessments" copy="Validate your technical efficiency with rigorous performance evaluations." />
            </div>
          </div>
        </section >




        {/* AI Intelligence Section */}
        < section className="py-24 px-6 relative overflow-hidden bg-black text-white" >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-10 bg-[#00FF88]/10 blur-[100px] rounded-full opacity-50" />
              <div className="relative bg-[#0A0F0A] border border-[#00FF88]/20 rounded-3xl p-8 overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent opacity-50" />
                <div className="flex items-start gap-6 mb-8 mt-4">
                  <div className="p-4 bg-[#00FF88]/10 rounded-2xl border border-[#00FF88]/20">
                    <Brain className="h-10 w-10 text-[#00FF88]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">AI INTERVIEWER</h3>
                    <p className="text-[#00B37A] font-mono text-xs tracking-widest mt-1">NEURAL LINK ESTABLISHED</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-black/50 rounded-2xl border border-white/5 hover:border-[#00FF88]/30 transition-colors">
                    <p className="text-sm text-gray-300 italic">"Based on your recent lab performance, I recommend focusing on SQL Injection patterns. Your defense timing is currently at 84%."</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                      <span className="text-[10px] font-mono text-[#00FF88] uppercase tracking-tighter">Analyzing Session Data...</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/50 rounded-xl border border-white/5 text-center">
                      <Bot className="h-5 w-5 text-[#00FF88] mx-auto mb-2" />
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter mb-1">INTERVIEW PREP</div>
                    </div>
                    <div className="p-4 bg-black/50 rounded-xl border border-white/5 text-center">
                      <Target className="h-5 w-5 text-[#00FF88] mx-auto mb-2" />
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter mb-1">SKILL ANALYSIS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div className="w-16 h-1 bg-[#00FF88]" />
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                AI-DRIVEN <br />
                <span className="text-[#00FF88]">INTELLIGENCE</span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed font-light">
                Elevate your training with CORTEX, our advanced AI neural network. Get real-time feedback, personalized learning paths, and practice high-stakes interviews with an AI adversary designed by industry experts.
              </p>
              <ul className="space-y-4">
                {[
                  'Personalized Skill Gap Analysis',
                  'AI-Powered Mock Interviews',
                  'Dynamic Learning Path Adjustment',
                  'Real-time Lab Hints & Support'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-bold group">
                    <div className="w-5 h-5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-center group-hover:bg-[#00FF88]/20 transition-colors">
                      <Zap className="h-3 w-3 text-[#00FF88]" />
                    </div>
                    <span className="text-lg tracking-wide">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section >

        {/* Global Cyber Forge Section */}
        < section className="py-24 px-6 bg-[#050505] relative overflow-hidden" >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF88]/20 to-transparent" />
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#00FF88]/5 border border-[#00FF88]/20 text-[#00FF88] text-[10px] font-mono uppercase tracking-[0.2em]">
                Live Training Sim
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                THE GLOBAL <br />
                <span className="text-[#00FF88]">CYBER FORGE</span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed font-light">
                Step into the most advanced training environment ever built. The Forge synchronizes real-world threat intelligence with high-fidelity virtual ranges, allowing you to sharpen your edge against the world's most sophisticated attack vectors.
              </p>
              <div className="flex flex-col gap-6 pt-4">
                {[
                  { label: "High-Fidelity Ranges", detail: "Isolated sandboxes with real OS instances" },
                  { label: "Live Malware Analysis", detail: "Safely deconstruct active threat samples" },
                  { label: "Red vs Blue Ops", detail: "Real-time team-based combat simulations" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="mt-1 p-2 bg-[#00FF88]/10 rounded border border-[#00FF88]/20 group-hover:bg-[#00FF88]/20 transition-colors">
                      <Zap className="h-4 w-4 text-[#00FF88]" />
                    </div>
                    <div>
                      <h4 className="text-white font-black uppercase text-sm tracking-wide">{item.label}</h4>
                      <p className="text-xs text-[#00B37A] font-mono tracking-tight opacity-70">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Visual Representation of a 'Range' or 'Map' */}
              <div className="absolute -inset-10 bg-[#00FF88]/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative bg-[#0A0F0A] border border-[#00FF88]/10 rounded-[2.5rem] p-8 overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 blur-3xl rounded-full -translate-y-16 translate-x-16" />

                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black border border-[#00FF88]/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-[#00FF88]" />
                    </div>
                    <span className="text-xs font-mono text-white tracking-widest uppercase">Global Node Map</span>
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`h-12 rounded-lg border border-white/5 bg-black/50 relative overflow-hidden group/node`}>
                      <div className={`absolute inset-0 bg-[#00FF88]/5 opacity-0 group-hover/node:opacity-100 transition-opacity`} />
                      {i % 3 === 0 && <div className="absolute inset-0 bg-[#00FF88]/10 animate-pulse" />}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-black/80 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono text-[#00B37A]">OPERATIONAL READINESS</span>
                      <span className="text-[10px] font-mono text-white">94%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00FF88] to-[#00CC66] w-[94%]" />
                    </div>
                  </div>
                  <button className="w-full py-4 bg-black border border-[#00FF88]/30 rounded-2xl text-[11px] font-mono text-[#00FF88] uppercase tracking-[0.3em] hover:bg-[#00FF88]/10 transition-all">
                    Deploy to Virtual Range_
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section >

        {/* Testimonials */}
        <section id="testimonials" className="py-20 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#00FF88]/20 to-transparent" />

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-12 space-y-3">
              <div className="w-10 h-1 bg-[#00FF88] mx-auto" />
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
                OPERATIONAL <span className="text-[#00FF88]">FEEDBACK</span>
              </h2>
            </div>

            <div className="relative">
              <div className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-[2.5rem] p-8 md:p-16 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 blur-2xl rounded-full" />

                <div className="relative z-10 space-y-8">
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Zap key={i} className="h-4 w-4 text-[#00FF88] fill-[#00FF88]" />
                    ))}
                  </div>

                  <blockquote className="text-xl md:text-2xl font-light text-white leading-relaxed text-center italic">
                    "{testimonials[activeTestimonial].quote}"
                  </blockquote>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 border-t border-white/5">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#00FF88]/20 to-[#00FF88]/5 rounded-2xl border border-[#00FF88]/20 flex items-center justify-center text-xl font-black text-[#00FF88]">
                      {testimonials[activeTestimonial].initials}
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-xl font-black text-white uppercase tracking-tight">{testimonials[activeTestimonial].name}</div>
                      <div className="text-[10px] font-mono text-[#00B37A] mt-1 tracking-widest uppercase opacity-60">{testimonials[activeTestimonial].title}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-1.5 transition-all duration-500 rounded-full ${i === activeTestimonial ? 'bg-[#00FF88] w-8' : 'bg-[#00FF88]/10 w-3'}`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-40 px-6 relative overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#00FF8808_0%,transparent_70%)]" />

          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-12">
            <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none">
              READY FOR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC66] filter drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">DEPLOYMENT?</span>
            </h2>
            <p className="text-[#00B37A] text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              The frontlines are waiting. Initialize your mission protocols and secure your place among the world's most elite defenders.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              <button
                onClick={() => handleGetStarted('student')}
                className="group px-12 py-6 bg-[#00FF88] hover:bg-[#00CC66] text-black font-black rounded-full uppercase tracking-widest transition-all hover:scale-110 shadow-[0_0_50px_rgba(0,255,136,0.4)] flex items-center gap-4 text-lg"
              >
                <Terminal className="h-6 w-6" />
                Initialize System_
              </button>
              <button
                onClick={() => handleGetStarted('teacher')}
                className="px-12 py-6 bg-transparent border-2 border-[#00FF88]/30 hover:border-[#00FF88] text-[#00FF88] font-black rounded-full uppercase tracking-widest transition-all hover:bg-[#00FF88]/5 flex items-center gap-4 text-lg"
              >
                <Users className="h-6 w-6" />
                Instructor Uplink
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-32 px-6 border-t border-[#00FF88]/10 bg-[#050505] relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
              <div className="md:col-span-5 space-y-8">
                <div className="flex items-center gap-4">
                  <img src="/cybercoach.png" alt="Cybercoach" className="h-16 w-16" />
                  <div>
                    <div className="text-3xl font-black tracking-tighter text-white uppercase">
                      CYBER <span className="text-[#00FF88]">COACH</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#00B37A] tracking-[0.4em] uppercase">Unified Defense Protocol</div>
                  </div>
                </div>
                <p className="text-lg text-[#00B37A]/80 leading-relaxed font-light">
                  Architecting the future of cybersecurity training. Our platform combines neuro-linked AI mentorship with high-fidelity simulations to forge the world's most elite digital defenders.
                </p>
                <div className="space-y-6 pt-12 border-t border-white/5">
                  <div className="text-[12px] font-mono text-[#00FF88] tracking-[0.3em] uppercase">Operational Founders</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Piyush Dhoka', url: 'https://piyush.sparkstudio.co.in' },
                      { name: 'Aadarsh Pathre', url: 'https://aadarsh.sparkstudio.co.in' },
                      { name: 'Varun Inamdar', url: 'https://varun.sparkstudio.co.in' }
                    ].map((founder) => (
                      <a
                        key={founder.name}
                        href={founder.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between p-4 bg-[#00FF88]/5 border border-[#00FF88]/10 rounded-2xl hover:border-[#00FF88]/50 transition-all hover:bg-[#00FF88]/10"
                      >
                        <span className="text-sm font-black text-white group-hover:text-[#00FF88] transition-colors">{founder.name}</span>
                        <div className="p-1.5 bg-[#00FF88]/10 rounded-lg group-hover:bg-[#00FF88] group-hover:text-black transition-all">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                <div className="space-y-6">
                  <h4 className="text-white font-black uppercase text-sm tracking-widest">Training Modules</h4>
                  <ul className="space-y-3 text-sm text-[#00B37A]/60 font-medium">
                    <li><a href="#" className="hover:text-[#00FF88] transition-colors leading-relaxed">Neural Assessment</a></li>
                    <li><a href="#" className="hover:text-[#00FF88] transition-colors leading-relaxed">High-Fidelity Ranges</a></li>
                    <li><a href="#" className="hover:text-[#00FF88] transition-colors leading-relaxed">AI Combat Briefs</a></li>
                    <li><a href="#" className="hover:text-[#00FF88] transition-colors leading-relaxed">Protocol Forge</a></li>
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-white font-black uppercase text-sm tracking-widest">Resources</h4>
                  <ul className="space-y-3 text-sm text-[#00B37A]/60 font-medium">
                    <li><a href="#" className="hover:text-[#00FF88] transition-colors leading-relaxed">Intel Archives</a></li>
                    <li><a href="#" className="hover:text-[#00FF88] transition-colors leading-relaxed">Operative Manual</a></li>
                    <li><a href="#" className="hover:text-[#00FF88] transition-colors leading-relaxed">Strategic Feed</a></li>
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-white font-black uppercase text-sm tracking-widest">Legal</h4>
                  <ul className="space-y-3 text-sm text-[#00B37A]/60 font-medium">
                    <li><a href="#" className="hover:text-[#00FF88] transition-colors leading-relaxed">Clearance Level</a></li>
                    <li><a href="#" className="hover:text-[#00FF88] transition-colors leading-relaxed">Data Protocol</a></li>
                    <li><a href="#" className="hover:text-[#00FF88] transition-colors leading-relaxed">Engagement T&C</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-white/5">
              <div className="flex items-center gap-6 text-[11px] font-mono text-[#00B37A]/40 uppercase tracking-[0.3em] overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_10px_#00FF88]" />
                  NODES_NOMINAL
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00FF88]/30" />
                  LATENCY_04MS
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00FF88]/30" />
                  UPTIME_99.99
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#00B37A]/30 uppercase tracking-widest text-center md:text-right leading-loose">
                PROTOCOL_V.4.2 // © {new Date().getFullYear()} VOIS CYBERCOACH // FORGED IN THE DIGITAL FRONTINES
              </div>
            </div>
          </div>
        </footer>

      </div >
    </>
  );
};
