'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Book, Heart, Menu, X, Home, Library, DownloadCloud } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const updateCount = () => {
      const favs = JSON.parse(localStorage.getItem('ma_favs') || '[]');
      setFavCount(favs.length);
    };

    // PWA Install Logic
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });

    updateCount();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('favorites-updated', updateCount);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('favorites-updated', updateCount);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 border-b ${
      isScrolled 
      ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-stone-100' 
      : 'bg-white py-4 border-transparent'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
  <div className="group-hover:scale-110 transition-transform">
    {/* Naya Image Logo */}
    <img 
      src="/icon-512.png" 
      alt="M.A. Publisher" 
      className="w-10 h-10 object-contain" 
    />
  </div>
          <div className="flex flex-col">
            <span className="font-black text-xl leading-none text-emerald-950 tracking-tight">
              M.A. <span className="text-emerald-600">Publisher</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mt-0.5">Digital Library</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-bold text-[13px] uppercase tracking-widest">
          <Link 
            href="/" 
            className={`transition-colors hover:text-emerald-600 ${isActive('/') ? 'text-emerald-700' : 'text-stone-600'}`}
          >
            Home
          </Link>
          <Link 
            href="/books" 
            className={`transition-colors hover:text-emerald-600 ${isActive('/books') ? 'text-emerald-700' : 'text-stone-600'}`}
          >
            Library
          </Link>

          {/* Install App Button Desktop */}
          {showInstallBtn && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all text-[11px]"
            >
              <DownloadCloud size={16} /> Install App
            </button>
          )}
          
          <div className="h-6 w-[1px] bg-stone-200 mx-2"></div>

          <Link 
            href="/favorites" 
            className="group relative p-2.5 bg-stone-50 rounded-full hover:bg-red-50 transition-all border border-stone-100"
            title="My Favorites"
          >
            <Heart 
              size={18} 
              className={`transition-colors ${isActive('/favorites') ? 'text-red-500 fill-red-500' : 'text-stone-400 group-hover:text-red-500'}`} 
            />
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {favCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="md:hidden p-2 text-emerald-950 bg-stone-50 rounded-lg border border-stone-100 relative" 
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          {!mobileMenu && favCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenu && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-stone-100 shadow-2xl p-6 flex flex-col gap-4 md:hidden animate-in fade-in slide-in-from-top-2">
          <Link 
            href="/" 
            onClick={() => setMobileMenu(false)} 
            className={`flex items-center gap-4 p-4 rounded-xl font-bold text-lg ${isActive('/') ? 'bg-emerald-50 text-emerald-800' : 'text-stone-700 active:bg-stone-50'}`}
          >
            <Home size={22}/> Home
          </Link>
          <Link 
            href="/books" 
            onClick={() => setMobileMenu(false)} 
            className={`flex items-center gap-4 p-4 rounded-xl font-bold text-lg ${isActive('/books') ? 'bg-emerald-50 text-emerald-800' : 'text-stone-700 active:bg-stone-50'}`}
          >
            <Library size={22}/> Library
          </Link>

          {/* Install Option Mobile */}
          {showInstallBtn && (
            <button 
              onClick={() => { handleInstallClick(); setMobileMenu(false); }}
              className="flex items-center gap-4 p-4 rounded-xl font-bold text-lg text-emerald-800 bg-emerald-50"
            >
              <DownloadCloud size={22}/> એપ ઇન્સ્ટોલ કરો
            </button>
          )}

          <Link 
            href="/favorites" 
            onClick={() => setMobileMenu(false)} 
            className={`flex items-center justify-between p-4 rounded-xl font-bold text-lg ${isActive('/favorites') ? 'bg-red-50 text-red-600' : 'text-stone-700'}`}
          >
            <div className="flex items-center gap-4">
              <Heart size={22} fill={isActive('/favorites') ? "currentColor" : "none"}/> My Favorites
            </div>
            {favCount > 0 && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs italic">
                {favCount} Books
              </span>
            )}
          </Link>
        </div>
      )}
    </nav>
  );
}