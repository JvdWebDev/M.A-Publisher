'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import dynamic from 'next/dynamic';

const PDFViewerComponent = dynamic(() => import('./PDFViewerComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-emerald-100/50 gap-4">
      <Loader2 className="animate-spin" size={40} />
      <p className="font-medium animate-pulse text-sm uppercase tracking-widest">કિતાબ લોડ થઈ રહી છે...</p>
    </div>
  ),
});

export default function ReadPage() {
    const { id } = useParams();
    const router = useRouter();
    const [book, setBook] = useState<any>(null);

    useEffect(() => {
        const fetchBook = async () => {
            const { data } = await supabase.from('books').select('*').eq('id', id).single();
            setBook(data);
        };
        fetchBook();
    }, [id]);

    if (!book) return (
      <div className="h-screen bg-stone-950 flex items-center justify-center">
         <Loader2 className="animate-spin text-emerald-500" />
      </div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a]">
            {/* Immersive Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 md:p-6 flex justify-between items-center pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button 
                      onClick={() => router.back()}
                      className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="hidden sm:block">
                        <h1 className="text-white font-bold text-sm md:text-lg line-clamp-1">{book.title}</h1>
                        <p className="text-emerald-400 text-[10px] uppercase font-black tracking-widest leading-none mt-1">
                          {book.author}
                        </p>
                    </div>
                </div>
                
                <div className="pointer-events-auto flex items-center gap-3">
                    <span className="hidden md:inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-500/30 backdrop-blur-md">
                       <Info size={12} /> READ MODE ACTIVE
                    </span>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 overflow-hidden relative">
    <PDFViewerComponent 
        fileUrl={book.pdf_url} 
        bookId={book.id} 
        bookTitle={book.title} 
        bookCover={book.cover_url} 
    />
</div>
        </div>
    );
}