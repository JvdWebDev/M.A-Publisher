'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Share2, ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

export default function DuaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [dua, setDua] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDua() {
      const { data, error } = await supabase
        .from('duas')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .single();

      if (!error) setDua(data);
      setLoading(false);
    }
    fetchDua();
  }, [resolvedParams.slug]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `*${dua.title}*\n\nઆ દુઆ વાંચવા માટે નીચેની લિંક પર ક્લિક કરો:\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: dua.title, text: shareText, url: shareUrl });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <Loader2 className="animate-spin text-emerald-600" size={32} />
    </div>
  );

  if (!dua) return <div className="text-center pt-40 font-gujarati">દુઆ મળી નથી.</div>;

  return (
    <div className="min-h-screen bg-[#fcfaf8] pt-16 pb-28 overflow-x-hidden">
      <div className="w-full max-w-2xl mx-auto px-0 md:px-4">
        
        {/* Navigation - Clean & Padded */}
        <div className="px-4 mb-4 mt-4">
          <Link href="/daily-dua" className="inline-flex items-center text-emerald-800 font-semibold gap-2 bg-white border border-stone-200 px-4 py-2 rounded-full text-xs shadow-sm hover:bg-emerald-50 transition-colors">
            <ArrowLeft size={14} /> BACK TO LIBRARY
          </Link>
        </div>

        {/* Main Card Wrapper */}
        <article className="bg-white w-full border-y md:border md:border-stone-200 md:rounded-3xl shadow-sm overflow-hidden">
          
          {/* Minimalist Title Section */}
          <div className="bg-emerald-50/50 px-6 py-8 md:p-12 text-center border-b border-stone-100">
            <h1 className="text-2xl md:text-4xl font-bold text-emerald-950 font-gujarati leading-tight break-words">
              {dua.title}
            </h1>
            <div className="mt-4 w-12 h-1 bg-emerald-200 mx-auto rounded-full"></div>
          </div>

          {/* Reading Area - Designed for Gujarati Script */}
          <div className="px-5 py-8 md:p-12 w-full box-border">
            <div 
              className="prose-container w-full max-w-full overflow-hidden"
              style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}
            >
              <div 
                className="prose prose-stone prose-lg max-w-none 
                           font-gujarati text-[1.15rem] md:text-[1.3rem] 
                           leading-[2.2] text-stone-800
                           
                           /* CRITICAL FIXES FOR WRAPPING */
                           prose-p:whitespace-pre-wrap 
                           prose-p:break-words 
                           prose-p:max-w-full
                           prose-p:overflow-hidden
                           
                           /* IMAGE RESPONSIVENESS */
                           prose-img:max-w-full 
                           prose-img:h-auto 
                           prose-img:rounded-xl 
                           prose-img:mx-auto"
                dangerouslySetInnerHTML={{ __html: dua.content }}
              />
            </div>
          </div>
        </article>
      </div>

      {/* Floating Action Button (Mobile) - Modern & Clean */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 px-6 z-50">
        <button 
          onClick={handleShare}
          className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-[0_10px_30px_-10px_rgba(4,120,87,0.5)] flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {copied ? <Check size={20} /> : <Share2 size={20} />}
          <span className="text-lg">
            {copied ? "Link Copied!" : "WhatsApp પર શેર કરો"}
          </span>
        </button>
      </div>

      {/* Desktop Share Button */}
      <div className="hidden md:flex justify-center mt-12">
        <button 
          onClick={handleShare}
          className="bg-white text-emerald-700 border-2 border-emerald-100 px-10 py-3 rounded-full font-bold shadow-sm hover:bg-emerald-50 flex items-center gap-2 transition-all"
        >
          <Share2 size={18} /> Share Dua
        </button>
      </div>
    </div>
  );
}