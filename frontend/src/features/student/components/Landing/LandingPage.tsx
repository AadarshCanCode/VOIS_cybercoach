
import React, { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';

// UI Components
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

// Sections
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingFooter } from './LandingFooter';
import LandingTestimonials from './LandingTestimonials';


export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = (tab?: string) => {
    if (user) {
      navigate('/dashboard');
      return;
    }
    navigate(`/ login${tab ? `?tab=${tab}` : ''} `);
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
        description="Master cybersecurity with comprehensive training, virtual labs, and career support. Join CyberCoach today."
      />

      <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-[#00FF88]/30">
        <StickyBanner className="bg-zinc-900 border-b border-zinc-800">
          <p className="text-sm font-medium text-zinc-300 tracking-wide text-center px-4">
            Join the CyberCoach Community. Connect with students and mentors.{" "}
            <button
              onClick={() => navigate('/community')}
              className="text-[#00FF88] font-bold hover:underline ml-2"
            >
              Join Community &rarr;
            </button>
          </p>
        </StickyBanner>

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
                  name: 'Reviews',
                  link: '#testimonials',
                  onClick: () => {
                    const el = document.getElementById('testimonials');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                },
              ]}
            />
            <div className="flex items-center gap-3">
              <NavbarButton variant="primary" onClick={() => handleGetStarted()}>
                {user ? 'Go to Dashboard' : 'Get Started'}
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
                className="text-zinc-300 hover:text-[#00FF88] transition-colors text-sm font-medium"
              >
                Features
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  const el = document.getElementById('testimonials');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-zinc-300 hover:text-[#00FF88] transition-colors text-sm font-medium"
              >
                Reviews
              </button>
              <div className="flex w-full flex-col gap-3 pt-4 border-t border-zinc-800">
                <NavbarButton
                  onClick={() => { setMobileOpen(false); handleGetStarted(); }}
                  variant="primary"
                  className="w-full"
                >
                  {user ? 'Dashboard' : 'Get Started'}
                </NavbarButton>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>

        <LandingHero />

        <LandingFeatures />

        {/* Testimonials - Self Contained */}
        <div id="testimonials">
          <LandingTestimonials />
        </div>

        {/* Footer */}
        {/* Footer Area */}
        <footer className="bg-black border-t border-zinc-900">
          <LandingFooter />
        </footer>

      </div>
    </>
  );
};
