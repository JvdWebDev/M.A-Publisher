import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { BookOpen, Scroll, Feather, Heart, ArrowRight, BookMarked, Sparkles } from 'lucide-react'

export default async function Home() {
  const { data: latestBooks, error } = await supabase
    .from('books')
    .select('*')
    .order('id', { ascending: false })
    .limit(4);

    if (error) {
    console.error("Supabase Error:", error);
    }

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-stone-900 overflow-x-hidden pt-20">
      
      {/* 1. HERO SECTION: Modern & Readable */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 overflow-hidden bg-white">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 -right-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center mt-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-5 py-2 rounded-full border border-emerald-100 mb-8 animate-bounce-slow shadow-sm">
            <Sparkles size={16} className="text-amber-500" />
            <span className="text-xs font-black tracking-widest uppercase">M.A. Publisher & Library</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tight leading-[1.1] text-emerald-950">
            જ્ઞાનનો દરિયો, <br/>
            <span className="text-emerald-600 font-serif italic drop-shadow-sm">અહલેબૈત (અ.સ.)</span> નો માર્ગ
          </h1>

          <div className="max-w-2xl mx-auto bg-[#FDFCF8] p-8 md:p-12 rounded-[3rem] border border-stone-100 shadow-xl mb-12 relative group hover:shadow-2xl transition-all duration-500">
             <div className="absolute -top-4 -left-4 bg-amber-500 text-white p-3 rounded-2xl rotate-[-12deg] shadow-lg">
                <Scroll size={24} />
             </div>
            <p className="text-2xl md:text-4xl font-serif italic mb-6 leading-relaxed text-stone-800">
              "જેણે પોતાને ઓળખ્યો, તેણે પોતાના રબને ઓળખ્યો."
            </p>
            <div className="h-1 w-20 bg-emerald-600 mx-auto mb-4 rounded-full"></div>
            <span className="text-emerald-700 font-black tracking-[0.2em] uppercase text-xs">— મૌલા અલી (અ.સ.)</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link href="/books" className="group bg-emerald-800 hover:bg-emerald-900 text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-3 text-lg hover:-translate-y-1">
              બધી કિતાબો જુઓ 
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#about-section" className="group flex items-center gap-2 text-stone-500 hover:text-emerald-800 font-bold transition-colors">
              અમારા વિશે જાણો
              <div className="w-8 h-[2px] bg-stone-200 group-hover:w-12 group-hover:bg-emerald-600 transition-all"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SECTION: High Contrast */}
      <section id="about-section" className="py-28 px-6 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <span className="text-emerald-600 font-black tracking-widest uppercase text-sm mb-4 block">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-black text-emerald-950 mb-8 leading-tight">
              શિયા ઇસ્લામ અને <br/> <span className="text-amber-600 font-serif italic font-normal underline decoration-stone-200 underline-offset-8">કિતાબોનું મહત્વ</span>
            </h2>
            <div className="space-y-8 text-stone-600 text-lg leading-relaxed">
              <p>
                શિયા દીન એ મોહબ્બત, અદલ (ન્યાય) અને ઇલ્મનો માર્ગ છે. અહલેબૈત (અ.સ.) ના જીવન અને તેમની શિક્ષાઓ આપણા માટે હિદાયતનો નૂર છે.
              </p>
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm italic relative">
                <div className="absolute -top-3 left-8 bg-white px-4 text-emerald-800 font-bold tracking-tighter">Wisdom</div>
                "વાંચન એ રૂહ (આત્મા) નો ખોરાક છે. સાચી કિતાબ માણસને અંધકારમાંથી નૂર તરફ લઇ જાય છે."
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="flex gap-4 items-center">
                  <div className="bg-amber-100 p-3 rounded-2xl text-amber-700 shadow-sm"><Feather size={24}/></div>
                  <div><h4 className="font-black text-stone-800 leading-none">અધ્યાપ્ત</h4><p className="text-xs mt-1 text-stone-400 font-bold uppercase tracking-wider">Education</p></div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700 shadow-sm"><Heart size={24}/></div>
                  <div><h4 className="font-black text-stone-800 leading-none">મોહબ્બત</h4><p className="text-xs mt-1 text-stone-400 font-bold uppercase tracking-wider">Ahlulbayt</p></div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative p-4 bg-white border border-stone-100 rounded-[3.5rem] shadow-2xl overflow-hidden group">
            <img 
              src="https://www.shutterstock.com/shutterstock/videos/3600095681/thumb/1.jpg?ip=x480auto=format&fit=crop&q=80" 
              alt="Islamic Library" 
              className="w-full h-full object-cover rounded-[2.8rem] group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent rounded-[2.8rem]"></div>
          </div>
        </div>
      </section>

      {/* 3. LATEST BOOKS: Clean & Elegant Cards */}
      <section className="bg-white py-28 px-6 border-y border-stone-100 relative">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-stone-50 to-transparent opacity-50"></div>
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-emerald-600 font-black mb-4 tracking-[0.3em] uppercase text-xs">
                <div className="w-10 h-[2px] bg-emerald-600"></div> New Arrivals
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight">તાજેતરની કિતાબો</h2>
            </div>
            <Link href="/books" className="group bg-stone-100 hover:bg-emerald-800 hover:text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3">
              બધી કિતાબો જુઓ <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {latestBooks?.map((book) => (
              <div key={book.id} className="group flex flex-col bg-[#FDFCF8] rounded-[2.5rem] p-4 border border-stone-100 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-[3/4.2] overflow-hidden rounded-[2rem] shadow-md mb-6">
                  <img 
                    src={book.cover_url} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-emerald-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter border border-emerald-100 shadow-sm">
                    {book.category}
                  </div>
                </div>
                
                <div className="px-4 pb-4 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-stone-900 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-stone-400 text-xs font-bold mb-8 uppercase tracking-widest">પ્રકાશક: {book.author}</p>
                  
                  <Link 
                    href={`/read/${book.id}`} 
                    className="mt-auto w-full py-4 rounded-2xl bg-white border-2 border-emerald-800 text-emerald-800 font-black text-sm text-center hover:bg-emerald-800 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <BookOpen size={16} /> વાંચો
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="py-32 px-6 text-center container mx-auto relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-emerald-50 rounded-full blur-[100px] -z-10 opacity-40"></div>
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="bg-white w-24 h-24 rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform border border-stone-50">
            <BookMarked size={48} className="text-emerald-800" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-emerald-950 tracking-tight">વાંચન એ ઇબાદત છે</h2>
          <p className="text-xl md:text-2xl text-stone-600 leading-relaxed italic font-serif">
            "હું જ્ઞાનનું શહેર છું અને અલી તેનો દરવાજો છે." <br/>
            <span className="text-emerald-700 font-bold not-italic text-lg">— પયગંબર મોહમ્મદ (સ.અ.વ.)</span>
          </p>
          <div className="pt-10 flex flex-col sm:flex-row gap-6 justify-center">
             <Link href="/books" className="px-16 py-5 rounded-[2rem] bg-emerald-950 text-white font-black hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-950/20 active:scale-95">
                લાઈબ્રેરી માં પ્રવેશ કરો
             </Link>
          </div>
        </div>
      </section>
    </main>
  )
}