import React, { useState, useEffect } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#FDFBF7]/90 backdrop-blur-md border-b border-black/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-slate-900 text-white p-1.5 rounded-md group-hover:rotate-3 transition-transform duration-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
              BukuCerdas
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {['Beranda', 'Showcase', 'Katalog', 'Tentang', 'Kontak'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Masuk
            </button>
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              Daftar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              className="text-slate-900 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FDFBF7] border-b border-black/5 p-4 space-y-4">
           {['Beranda', 'Katalog', 'Tentang', 'Kontak'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="block text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <button className="w-full text-sm font-medium text-slate-600 hover:text-slate-900">
                Masuk
              </button>
              <button className="w-full bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium">
                Daftar
              </button>
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;