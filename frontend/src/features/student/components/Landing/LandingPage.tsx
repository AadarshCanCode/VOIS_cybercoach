import React, { useEffect, useState } from 'react';
import { ArrowRight, Terminal } from 'lucide-react';
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
import LandingTestimonials from './LandingTestimonials';

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
              <NavbarButton
                href="https://t.me/careerconnet_cyber_bot"
                variant="outline"
                className="hidden lg:flex items-center gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500"
              >
                <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="url(#telegram_gradient_nav)" />
                  <path d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z" fill="white" />
                  <defs>
                    <linearGradient id="telegram_gradient_nav" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#37BBFE" />
                      <stop offset="1" stopColor="#007DBB" />
                    </linearGradient>
                  </defs>
                </svg>
                <span>Try Bot</span>
              </NavbarButton>
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
                  href="https://t.me/careerconnet_cyber_bot"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-blue-500/30 text-blue-400"
                >
                  <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" fill="#007DBB" />
                    <path d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z" fill="white" />
                  </svg>
                  <span>Try Telegram Bot</span>
                </NavbarButton>
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








        {/* Testimonials */}
        <section id="testimonials" className="py-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-[#00FF88]/20 to-transparent" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16 space-y-4">
              <div className="w-12 h-1 bg-[#00FF88] mx-auto rounded-full" />
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                OPERATIONAL <span className="text-[#00FF88]">FEEDBACK</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Voices from the frontlines of digital defense.
              </p>
            </div>

            <LandingTestimonials />
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
