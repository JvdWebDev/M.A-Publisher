'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Heart, ArrowLeft, BookOpen, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    const favIds = JSON.parse(localStorage.getItem('ma_favs') || '[]');
    
    if (favIds.length === 0) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('books')
      .select('*')
      .in('id', favIds);

    if (!error && data) setBooks(data);
    setLoading(false);
  }

  const removeFav = (id: string) => {
    const favs = JSON.parse(localStorage.getItem('ma_favs') || '[]');
    const newFavs = favs.filter((favId: string) => favId !== id);
    localStorage.setItem('ma_favs', JSON.stringify(newFavs));
    setBooks(books.filter(b => b.id !== id));
    window.dispatchEvent(new Event('favorites-updated'));
  };

  return (
    <main className="min-h-screen bg-[#FDFCF8] pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-emerald-950">તમારા મનપસંદ પુસ્તકો</h1>
            <p className="text-stone-500 mt-2 italic font-serif">તમારા દ્વારા સાચવેલ અમૂલ્ય જ્ઞાનનો સંગ્રહ</p>
          </div>
          <Link href="/books" className="text-emerald-800 font-bold flex items-center gap-2 hover:underline">
            <ArrowLeft size={18} /> પાછા જાઓ
          </Link>
        </div>

        {books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book) => (
              <div key={book.id} className="flex gap-4 bg-white p-4 rounded-3xl border border-stone-100 shadow-sm group">
                <img src={book.cover_url} className="w-24 h-32 object-cover rounded-xl shadow-md" />
                <div className="flex flex-col justify-between py-1 flex-1">
                  <div>
                    <h3 className="font-bold text-stone-900 line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-stone-400 mt-1 italic">{book.author}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/read/${book.id}`} className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                      <BookOpen size={14}/> વાંચો
                    </Link>
                    <button onClick={() => removeFav(book.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-stone-200">
            <Heart size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-500 font-medium">તમે હજુ સુધી કોઈ પુસ્તક પસંદ કર્યું નથી.</p>
            <Link href="/books" className="text-emerald-700 font-bold underline mt-4 inline-block">પુસ્તકો જુઓ</Link>
          </div>
        )}
      </div>
    </main>
  );
}