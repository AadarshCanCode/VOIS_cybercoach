import React, { useEffect, useMemo, useState } from 'react';
import { Zap, ArrowRight, Terminal } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';

// UI Components
import { Tabs } from '@components/ui/tabs';
import { SEO } from '@components/SEO/SEO';
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
} from '@components/ui/resizable-navbar';
import { StickyBanner } from '@components/ui/sticky-banner';

const TabImage = ({ src }: { src: string }) => (
  <img
    src={src}
    alt="Cyber Intel"
    width="1000"
    height="1000"
    className="object-cover object-left-top h-[60%] md:h-[90%] absolute -bottom-10 inset-x-0 w-[90%] rounded-xl mx-auto"
  />
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
        quote: 'Cybercoach is a game-changer for high-stakes defensive operations. Its fidelity is unmatched.',
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
      <SEO
        description="The elite tactical platform for unified cybersecurity defense. Master real-world threats with AI-powered labs and assessments."
      />

      <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-[system-ui] selection:bg-[#00FF88]/30">
        <StickyBanner className="bg-blue-600 border-none">
          <p className="text-sm font-medium text-white tracking-wide text-center px-4">
            Announcing the Cybercoach Community. Connect with elite operatives and share tactical intel.{" "}
            <button
              onClick={() => navigate('/community')}
              className="text-white font-black hover:underline ml-2 uppercase tracking-tighter"
            >
              Join Community &rarr;
            </button>
          </p>
        </StickyBanner>
        {/* Grid Background */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#00FF8805_1px,transparent_1px),linear-gradient(to_bottom,#00FF8805_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

        {/* Animated Blobs */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00FF88]/10 blur-[120px] rounded-full animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00FF88]/10 blur-[120px] rounded-full animate-blob animation-delay-2000" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#00FF88]/5 blur-[100px] rounded-full animate-blob animation-delay-4000" />
        </div>

        {/* Radial Gradient Glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-linear-to-b from-[#00FF88]/15 to-transparent blur-[120px] rounded-full pointer-events-none" />

        {/* Nav */}
        <Navbar>
          {/* Desktop Navigation */}
          <NavBody>
            <NavbarLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <NavItems
              items={[
                {
                  name: 'Features',
                  link: '#features',
                  onClick: () => {
                    const el = document.getElementById('features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                },
                {
                  name: 'Testimonials',
                  link: '#testimonials',
                  onClick: () => {
                    const el = document.getElementById('testimonials');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                },
              ]}
            />
            <div className="flex items-center gap-3">
              <NavbarButton variant="primary" onClick={() => handleGetStarted('student')}>
                {user ? 'Dashboard' : 'Register'}
              </NavbarButton>
            </div>
          </NavBody>

          {/* Mobile Navigation */}
          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
              <MobileNavToggle
                isOpen={mobileOpen}
                onClick={() => setMobileOpen(!mobileOpen)}
              />
            </MobileNavHeader>

            <MobileNavMenu
              isOpen={mobileOpen}
              onClose={() => setMobileOpen(false)}
            >
              <button
                onClick={() => {
                  setMobileOpen(false);
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[#EAEAEA] hover:text-[#00FF88] transition-colors text-sm font-bold uppercase tracking-wider"
              >
                Features
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  const el = document.getElementById('testimonials');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[#EAEAEA] hover:text-[#00FF88] transition-colors text-sm font-bold uppercase tracking-wider"
              >
                Testimonials
              </button>
              <div className="flex w-full flex-col gap-3 pt-4 border-t border-[#00FF88]/10">
                <NavbarButton
                  onClick={() => { setMobileOpen(false); handleGetStarted('student'); }}
                  variant="primary"
                  className="w-full"
                >
                  {user ? 'Dashboard' : 'Register'}
                </NavbarButton>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>

        {/* Hero */}
        <section className="relative pt-20 pb-12 px-6 overflow-hidden flex items-center">
          {/* Background Decorative Elements */}
          <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-[#00FF88]/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-[#00CC66]/5 blur-[150px] rounded-full pointer-events-none animate-pulse delay-1000" />

          <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 w-full space-y-12">





            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] uppercase">
                MASTER THE <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF88] via-[#00FF88] to-[#00CC66] filter drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]">
                  DEFENSE
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                The elite tactical platform for unified cybersecurity defense. Master real-world threats in high-fidelity ranges.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 items-center justify-center">
              <button
                onClick={() => handleGetStarted('student')}
                className="group relative flex items-center gap-4 px-12 py-5 bg-[#00FF88] hover:bg-[#00CC66] text-black rounded-[2rem] font-black text-lg tracking-tight transition-all hover:scale-[1.05] active:scale-95 shadow-[0_0_50px_rgba(0,255,136,0.4)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Terminal className="h-6 w-6 relative z-10" />
                <span className="relative z-10">{user ? 'ACCESS TERMINAL' : 'REGISTER'}</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform relative z-10" />
              </button>
            </div>



            {/* Operational Founders - Moved to Bottom */}
            <div className="pt-10 w-full max-w-4xl mx-auto">
              <div className="mb-4 text-[#00FF88] font-mono text-xs tracking-[0.2em] uppercase opacity-70">
                OPERATIONAL FOUNDERS
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { name: 'Piyush Dhoka', url: 'https://piyush.sparkstudio.co.in' },
                  { name: 'Aadarsh Pathre', url: 'https://aadarsh.sparkstudio.co.in' },
                  { name: 'Varun Inamdar', url: 'https://varun.sparkstudio.co.in' },
                  { name: 'Vedant Pandhare', url: 'https://www.linkedin.com/in/vedant-pandhare' }
                ].map((founder) => (
                  <a
                    key={founder.name}
                    href={founder.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-5 py-3 bg-[#00FF88]/5 border border-[#00FF88]/20 rounded-xl hover:bg-[#00FF88]/10 transition-all hover:scale-105"
                  >
                    <span className="text-white font-bold leading-none">{founder.name.split(' ').map((n, i) => <span key={i} className={i === 0 ? "" : "block"}>{n} </span>)}</span>
                    <ArrowRight className="h-4 w-4 text-[#00FF88] group-hover:translate-x-1 transition-transform" />
                  </a>
                ))}
              </div>
            </div>



          </div>
        </section>

        {/* Features */}
        < section id="features" className="py-24 px-6 bg-[#050505] relative" >
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#00FF88]/20 to-transparent" />

          <div className="max-w-7xl mx-auto">




            <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative b flex flex-col max-w-5xl mx-auto w-full items-start justify-start my-40">
              <Tabs tabs={[
                {
                  title: "Tactical Dashboard",
                  value: "dashboard",
                  content: (
                    <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-black bg-linear-to-br from-[#00FF88] to-[#00B37A]">
                      <p>Tactical Overview</p>
                      <TabImage src="/tabs/dashboard.png" />
                    </div>
                  ),
                },
                {
                  title: "Combat Labs",
                  value: "labs",
                  content: (
                    <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-black bg-linear-to-br from-[#00FF88] to-[#00B37A]">
                      <p>Combat Simulations</p>
                      <TabImage src="/tabs/course.png" />
                    </div>
                  ),
                },
                {
                  title: "Neural Intel",
                  value: "intel",
                  content: (
                    <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-black bg-linear-to-br from-[#00FF88] to-[#00B37A]">
                      <p>Neural Intelligence</p>
                      <TabImage src="/tabs/chatbot.png" />
                    </div>
                  ),
                },
                {
                  title: "Resume Engine",
                  value: "resume",
                  content: (
                    <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-black bg-linear-to-br from-[#00FF88] to-[#00B37A]">
                      <p>Resume Protocol</p>
                      <TabImage src="/tabs/resume.png" />
                    </div>
                  ),
                },
                {
                  title: "Career Vault",
                  value: "career",
                  content: (
                    <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-black bg-linear-to-br from-[#00FF88] to-[#00B37A]">
                      <p>Career Vault</p>
                      <TabImage src="/tabs/career.png" />
                    </div>
                  ),
                },
              ]} />
            </div>
          </div>
        </section >






        {/* Global Cyber Forge Section - Simplified */}
        <section className="py-24 px-6 bg-[#050505] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00FF88]/20 to-transparent" />

          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#00FF88]/5 border border-[#00FF88]/20 text-[#00FF88] text-[10px] font-mono uppercase tracking-[0.2em] mx-auto">
              Intelligence Uplink
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              CYBERSEC <br />
              <span className="text-[#00FF88]">UPDATE BOT</span>
            </h2>

            <p className="text-xl text-gray-400 leading-relaxed font-light max-w-2xl mx-auto">
              Stay ahead of the curve with our dedicated Telegram intelligence bot. Get real-time cybersecurity updates, threat alerts, and career insights delivered directly to your device.
            </p>

            <div className="pt-8 flex justify-center">
              <a
                href="https://t.me/careerconnet_cyber_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-4 px-12 py-6 bg-[#00FF88] hover:bg-[#00CC66] text-black rounded-full font-black text-lg tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_30px_rgba(0,255,136,0.3)] overflow-hidden"
              >
                <svg className="h-8 w-8 relative z-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="url(#telegram_gradient)" />
                  <path d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z" fill="white" />
                  <defs>
                    <linearGradient id="telegram_gradient" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#37BBFE" />
                      <stop offset="1" stopColor="#007DBB" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="relative z-10">Open Telegram Bot</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* Decorative background element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00FF88]/5 blur-[120px] rounded-full pointer-events-none" />
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-[#00FF88]/20 to-transparent" />

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
                    <div className="w-16 h-16 bg-linear-to-br from-[#00FF88]/20 to-[#00FF88]/5 rounded-2xl border border-[#00FF88]/20 flex items-center justify-center text-xl font-black text-[#00FF88]">
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



        {/* Footer */}
        <footer className="py-12 px-6 border-t border-[#00FF88]/10 bg-[#050505] relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3">
                <img src="/cybercoach-logo.png" alt="Cybercoach" className="h-8 w-8" />
                <span className="text-lg font-black tracking-tight text-white uppercase">
                  Cyber<span className="text-[#00FF88]">coach</span>
                </span>
              </div>



              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#00FF88]/60 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88] animate-pulse" />
                System Online
              </div>
            </div>
          </div>
        </footer>

      </div >
    </>
  );
};
