import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ExternalLink } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { UMDLogo } from './UMDLogo';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedMobileItem(null);
  }, [location]);



  const toggleMobileDropdown = (label: string) => {
    setExpandedMobileItem(expandedMobileItem === label ? null : label);
  };

  return (
    <>
      {/* Top Utility Bar - Dark elegant gradient */}
      <div
        className="hidden lg:block z-50 relative"
        style={{
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-center h-10">
          <div className="flex items-center gap-6">
            <a
              href="https://www.rhsmith.umd.edu/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold tracking-wide text-neutral-400 hover:text-umd-gold transition-colors duration-300"
            >
              Robert H. Smith School of Business
            </a>
            <div className="h-3 w-px bg-neutral-700" />
            <span className="text-[11px] font-medium tracking-wide text-neutral-500">University of Maryland</span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href="https://www.rhsmith.umd.edu/news"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-[11px] font-semibold tracking-wide text-neutral-400 hover:text-white rounded-md transition-all duration-200 hover:bg-white/[0.06]"
            >
              News
            </a>
            <a
              href="https://www.rhsmith.umd.edu/faculty"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-[11px] font-semibold tracking-wide text-neutral-400 hover:text-white rounded-md transition-all duration-200 hover:bg-white/[0.06]"
            >
              Faculty
            </a>
          </div>
        </div>
      </div>


      {/* Main Navigation Bar - Premium frosted glass */}
      <nav
        className={`fixed top-0 lg:top-10 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'lg:top-0' : ''
          }`}
        style={{
          background: isScrolled
            ? 'rgba(255, 255, 255, 0.92)'
            : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: isScrolled
            ? '0 4px 30px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0,0,0,0.03)'
            : 'none',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-16 lg:h-[68px]">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="flex items-center justify-center w-10 h-10 transition-all duration-300 group-hover:scale-105">
                <UMDLogo className="h-10 w-10" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-[#1a1a1a] tracking-tight text-lg lg:text-xl">
                  Maryland Opportunity Project
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Clean & Modern */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isExternal = item.path.startsWith('http');
                const isActive = location.pathname.startsWith(item.path) && item.path !== '/';

                if (isExternal) {
                  return (
                    <a
                      key={item.label}
                      href={item.path}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-600 hover:text-[#E03A3E] rounded-lg transition-all duration-200 flex items-center gap-2 hover:bg-red-50/50"
                    >
                      {item.label}
                      <ExternalLink size={11} className="text-neutral-400" />
                    </a>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {item.subItems && item.disableNavigation ? (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDropdown(activeDropdown === item.label ? null : item.label)
                        }
                        className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] rounded-lg transition-all duration-200 flex items-center gap-2 ${isActive
                          ? 'text-[#E03A3E] bg-red-50'
                          : 'text-neutral-600 hover:text-[#E03A3E] hover:bg-red-50/50'
                          }`}
                        aria-haspopup="menu"
                        aria-expanded={activeDropdown === item.label}
                      >
                        {item.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180 text-[#E03A3E]' : 'text-neutral-400'}`}
                        />
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] rounded-lg transition-all duration-200 flex items-center gap-2 ${isActive
                          ? 'text-[#E03A3E] bg-red-50'
                          : 'text-neutral-600 hover:text-[#E03A3E] hover:bg-red-50/50'
                          }`}
                      >
                        {item.label}
                        {item.subItems && (
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180 text-[#E03A3E]' : 'text-neutral-400'}`}
                          />
                        )}
                      </Link>
                    )}

                    {/* Black Minimal Dropdown */}
                    {item.subItems && (
                      <div
                        className={`absolute top-full left-0 pt-0 transition-all duration-200 ease-out ${item.label === 'Research' ? 'w-[320px]' : 'w-[240px]'
                          } ${activeDropdown === item.label
                            ? 'opacity-100 translate-y-0 visible'
                            : 'opacity-0 -translate-y-1 invisible pointer-events-none'
                          }`}
                      >
                        <div
                          className="py-3"
                          style={{
                            background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)',
                          }}
                        >
                          {item.subItems.map((sub, idx) => (
                            <Link
                              key={sub.label}
                              to={sub.path}
                              className="group/item block px-5 py-2.5 transition-all duration-150"
                            >
                              <span className="text-[13px] text-white/90 font-normal tracking-wide group-hover/item:text-white group-hover/item:pl-1 transition-all duration-200" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {sub.label}
                              </span>
                              {sub.partner && (
                                <span className="ml-2 text-[9px] font-medium text-white/40 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  {sub.partner}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* CTA Button - Premium gradient */}
              <Link
                to="/about/contact"
                className="ml-5 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white rounded-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #E03A3E 0%, #c92a2e 100%)',
                  boxShadow: '0 4px 20px rgba(224, 58, 62, 0.4)',
                }}
              >
                Get Involved
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Side Sheet Mobile Menu - Premium */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-[380px] z-50 transition-transform duration-400 ease-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-100">
          <span className="font-display font-bold text-neutral-900 text-lg">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="h-[calc(100%-64px)] overflow-y-auto py-6 px-4">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                {item.path.startsWith('http') ? (
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-4 py-3.5 text-[15px] font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
                  >
                    {item.label}
                    <ExternalLink size={14} className="text-neutral-400" />
                  </a>
                ) : item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleMobileDropdown(item.label)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-[15px] font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
                    >
                      {item.label}
                      <ChevronDown
                        size={18}
                        className={`text-neutral-400 transition-transform duration-300 ${expandedMobileItem === item.label ? 'rotate-180' : ''
                          }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${expandedMobileItem === item.label ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                      <div className="py-2 ml-4 pl-4 border-l-2 border-neutral-200">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.path}
                            className="block px-4 py-3 text-[14px] text-neutral-600 hover:text-neutral-900 rounded-lg transition-all duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{sub.label}</span>
                              {sub.partner && (
                                <span
                                  className="text-[10px] font-semibold text-neutral-500 px-2 py-0.5 rounded-full"
                                  style={{ background: 'rgba(0,0,0,0.04)' }}
                                >
                                  {sub.partner}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className="block px-4 py-3.5 text-[15px] font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-8 px-2">
            <Link
              to="/about/contact"
              className="block w-full text-center px-4 py-3.5 text-[14px] font-bold tracking-wide text-white rounded-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #E03A3E 0%, #c92a2e 100%)',
                boxShadow: '0 4px 14px rgba(224, 58, 62, 0.35)',
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Involved
            </Link>
          </div>


        </div>
      </div>
    </>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">

          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-4 mb-8">
              <UMDLogo className="h-14 w-14 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-gray-900 leading-none">Maryland<br />Opportunity<br />Project</span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-light">
              Advancing economic opportunity through rigorous data analysis and research at the University of Maryland.
            </p>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-[0.15em] text-gray-900 mb-8 pb-2 border-b border-gray-100 inline-block">Navigation</h4>
            <ul className="space-y-4 text-sm font-light text-gray-600">
              <li><Link to="/about" className="hover:text-umd-red transition-colors">Mission</Link></li>
              <li><Link to="/data/maryland" className="hover:text-umd-red transition-colors">Maryland Data</Link></li>
              <li><Link to="/data/national" className="hover:text-umd-red transition-colors">National Data</Link></li>
              <li><Link to="/research" className="hover:text-umd-red transition-colors">Research</Link></li>
              <li><Link to="/projects" className="hover:text-umd-red transition-colors">Projects</Link></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-[0.15em] text-gray-900 mb-8 pb-2 border-b border-gray-100 inline-block">Connect</h4>
            <ul className="space-y-4 text-sm font-light text-gray-600">
              <li><a href="mailto:mop@rhsmith.umd.edu" className="hover:text-umd-red transition-colors border-b border-transparent hover:border-umd-red">mop@rhsmith.umd.edu</a></li>
              <li><a href="#" className="hover:text-umd-red transition-colors">Twitter / X</a></li>
              <li><a href="#" className="hover:text-umd-red transition-colors">LinkedIn</a></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-[0.15em] text-gray-900 mb-8 pb-2 border-b border-gray-100 inline-block">Institution</h4>
            <ul className="space-y-4 text-sm font-light text-gray-600">
              <li className="font-medium text-gray-900">Robert H. Smith School of Business</li>
              <li>University of Maryland</li>
              <li>College Park, MD 20742</li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-gray-400 border-t border-gray-100 pt-8">
          <p>&copy; {new Date().getFullYear()} Maryland Opportunity Project.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="https://www.rhsmith.umd.edu/" target="_blank" rel="noreferrer" className="hover:text-umd-red">Smith School of Business</a>
            <a href="#" className="hover:text-umd-red">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-gray-900 selection:bg-red-50 selection:text-umd-red">
      <Header />
      {/* Padding for two-bar nav */}
      <main className="flex-grow pt-[72px] md:pt-[100px] lg:pt-[112px]">
        {children}
      </main>
      <Footer />
    </div>
  );
};
