import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Heart, ChevronRight, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Daily Dua | M.A. Library',
  description: 'પવિત્ર દુઆઓનો સંગ્રહ - M.A. Publisher Digital Library',
};

export default async function DailyDuaListPage() {
  // Database se data fetch karein
  const { data: duas, error } = await supabase
    .from('duas')
    .select('id, title, slug, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="pt-32 text-center text-red-500">
        Error fetching duas: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcfb] pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Heart className="text-emerald-600" size={30} />
          </div>
          <h1 className="text-4xl font-bold text-stone-900 font-serif mb-2">Daily Dua</h1>
          <p className="text-stone-500 font-gujarati">તમારી મનપસંદ દુઆઓ અહીંથી વાંચો અને શેર કરો</p>
        </div>

        {/* List of Duas */}
        <div className="space-y-4">
          {duas?.map((dua) => (
            <Link href={`/daily-dua/${dua.slug}`} key={dua.id} className="block group">
              <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-sm group-hover:shadow-md group-hover:border-emerald-300 transition-all flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-stone-50 p-3 rounded-2xl text-stone-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <BookOpen size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-stone-800 font-gujarati group-hover:text-emerald-700 transition-colors">
                    {dua.title}
                  </h2>
                </div>
                <ChevronRight className="text-stone-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" size={24} />
              </div>
            </Link>
          ))}

          {duas?.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
              <p className="text-stone-400 italic">No Duas available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}