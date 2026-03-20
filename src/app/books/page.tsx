'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BookOpen, Download, Search, ArrowLeft, Loader2, Heart, Share2 } from 'lucide-react';

export default function BooksPage() {
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchBooks();
    const savedFavs = localStorage.getItem('ma_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  async function fetchBooks() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      if (data) {
        setAllBooks(data);
        setFilteredBooks(data);
        const uniqueCats = ['All', ...new Set(data.map(b => b.category).filter(Boolean))] as string[];
        setCategories(uniqueCats);
      }
    } catch (err) {
      console.error("Error loading books:", err);
    } finally {
      setLoading(false);
    }
  }

  const toggleFavorite = (id: string) => {
    let newFavs = [...favorites];
    if (newFavs.includes(id)) {
      newFavs = newFavs.filter(favId => favId !== id);
    } else {
      newFavs.push(id);
    }
    setFavorites(newFavs);
    localStorage.setItem('ma_favs', JSON.stringify(newFavs));
  };

  const shareBook = (book: any) => {
    const shareUrl = `${window.location.origin}/read/${book.id}`;
    const text = `📖 *${book.title}*\nલેખક: ${book.author}\n\nઆ કિતાબ વાંચવા માટે નીચેની લિંક પર ક્લિક કરો:\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  useEffect(() => {
    let result = allBooks;
    if (activeTab !== 'All') {
      result = result.filter(b => b.category === activeTab);
    }
    if (searchTerm) {
      result = result.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredBooks(result);
  }, [activeTab, searchTerm, allBooks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <Loader2 className="animate-spin text-emerald-800" size={40} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-stone-900 pb-20">
      
      {/* 1. Header Section - Added pt-24 for Navbar spacing */}
      <div className="bg-emerald-950 text-white pt-28 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 italic">ડિજિટલ લાઈબ્રેરી</h1>
          <p className="text-emerald-100/70 max-w-xl mx-auto mb-10 text-sm md:text-base">
            અહલેબૈત (અ.સ.) ના જ્ઞાનના ખજાનામાંથી આપના મનપસંદ પુસ્તકો શોધો અને વાંચો.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="પુસ્તક અથવા લેખકનું નામ શોધો..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-stone-900 pl-16 pr-6 py-5 rounded-[2rem] shadow-2xl outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all text-lg"
            />
          </div>
        </div>
      </div>

      {/* 2. Category Tabs Section */}
      <div className="container mx-auto px-4 -mt-10 relative z-20 mb-12">
        <div className="bg-white p-3 rounded-[2.5rem] shadow-xl border border-stone-100 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-3 rounded-full text-[13px] font-black tracking-wide transition-all whitespace-nowrap ${
                activeTab === cat 
                ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20 scale-105' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-emerald-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Books Grid */}
      <div className="container mx-auto px-6 max-w-7xl">
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
            {filteredBooks.map((book) => (
              <div key={book.id} className="group flex flex-col">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border border-stone-200 group-hover:shadow-2xl md:group-hover:-translate-y-2 transition-all duration-500">
                  <img 
                    src={book.cover_url} 
                    alt={book.title} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Action Buttons (Always visible on mobile, hover on desktop) */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-30">
                    <button 
                      onClick={() => toggleFavorite(book.id)}
                      className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-all active:scale-90 ${favorites.includes(book.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-400 hover:text-red-500'}`}
                    >
                      <Heart size={16} fill={favorites.includes(book.id) ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => shareBook(book)}
                      className="p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>

                  {/* Desktop Hover Overlay */}
                  <div className="absolute inset-0 bg-emerald-950/80 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col items-center justify-center p-4 gap-3">
                    <Link 
                      href={`/read/${book.id}`} 
                      className="w-full bg-white text-emerald-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors"
                    >
                      <BookOpen size={18} /> વાંચન
                    </Link>
                    <a 
                      href={book.pdf_url} 
                      download 
                      target="_blank"
                      className="w-full bg-emerald-700/50 backdrop-blur-md text-white py-3 rounded-xl font-bold border border-white/20 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                    >
                      <Download size={18} /> ડાઉનલોડ
                    </a>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-md text-emerald-900 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter shadow-sm border border-emerald-100">
                      {book.category}
                    </span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="mt-4 flex flex-col gap-2 md:hidden">
                  <Link 
                    href={`/read/${book.id}`} 
                    className="w-full bg-emerald-800 text-white py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 active:bg-emerald-900 shadow-sm"
                  >
                    <BookOpen size={15} /> વાંચન
                  </Link>
                  <a 
                    href={book.pdf_url} 
                    download 
                    className="w-full bg-stone-100 text-stone-700 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 border border-stone-200 active:bg-stone-200"
                  >
                    <Download size={15} /> ડાઉનલોડ
                  </a>
                </div>

                {/* Title & Author */}
                <div className="mt-3 md:mt-5 text-center px-2">
                  <h3 className="font-bold text-stone-800 text-sm md:text-lg leading-tight line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-stone-500 text-[10px] md:text-sm mt-1 mb-3 italic">પ્રકાશક: {book.author}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-stone-200 mx-4">
             <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                <Search size={40} />
             </div>
             <p className="text-stone-400 font-medium italic">માફ કરશો, આ કેટેગરી માં કોઈ પુસ્તક મળ્યું નથી.</p>
             <button onClick={() => {setActiveTab('All'); setSearchTerm('');}} className="mt-4 text-emerald-700 font-bold underline">બધી કિતાબો જુઓ</button>
          </div>
        )}
      </div>
    </main>
  );
}