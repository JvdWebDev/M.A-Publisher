
import Link from 'next/link'; // Yeh import zaroori hai

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-stone-300 py-16 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* About Section */}
        <div>
          <h3 className="text-white font-bold text-xl mb-6 font-serif italic">M.A. Publisher</h3>
          <p className="text-sm leading-relaxed text-emerald-100/60">
            અમારો ઉદ્દેશ્ય સાચા અને પવિત્ર જ્ઞાનને દરેક ઘર સુધી પહોંચાડવાનો છે. અહલેબૈત (અ.સ.) ના માર્ગ પર ચાલવા માટે જ્ઞાન જ પ્રથમ કદમ છે.
          </p>
        </div>

        {/* Links Section */}
        <div>
          <h4 className="text-amber-500 font-bold mb-6 uppercase text-xs tracking-widest">ઝડપી લિંક્સ</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li>
              <Link href="/books" className="hover:text-white transition-colors cursor-pointer">
                બધી કિતાબો
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-white transition-colors cursor-pointer">
                અમારા વિશે
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors cursor-pointer">
                સંપર્ક કરો
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h4 className="text-amber-500 font-bold mb-6 uppercase text-xs tracking-widest">સંપર્ક</h4>
          <p className="text-sm">Bhavnagar, Gujarat, India</p>
          <p className="text-sm mt-2 font-bold text-white">Email: info@mapublisher.com</p>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="container mx-auto mt-16 pt-8 border-t border-white/5 text-center text-xs text-emerald-100/30">
        © {new Date().getFullYear()} M.A. Publisher. All rights reserved. Built with ❤️ for the community.
      </div>
    </footer>
  );
}