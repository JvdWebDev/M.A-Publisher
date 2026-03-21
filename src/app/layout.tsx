'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import Script from 'next/script'; // Script import kiya

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  const isReaderPage = pathname.startsWith('/read/');

  return (
    <html lang="gu">
      <head>
        {/* PWA Settings */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#064e3b" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        
        {/* Title aur Description */}
        <title>M.A. Publisher | Digital Library</title>
        <meta name="description" content="Shia Islamic Digital Library in Gujarati" />

        {/* --- OneSignal Setup Start --- */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "8524acbb-4f3e-4e81-acd6-ecf19b99fd16",
                allowLocalhostAsSecureOrigin: true,
                serviceWorkerPath: 'OneSignalSDKWorker.js',
                notifyButton: {
                  enable: true,
                  position: 'bottom-left',
                  size: 'medium',
                  theme: 'default',
                  displayPredicate: function() {
                    return OneSignal.isPushNotificationsEnabled().then(function(isEnabled) {
                        return !isEnabled;
                    });
                  }
                },
                welcomeNotification: {
                  title: "M.A. Publisher",
                  message: "શુક્રિયા! નોટિફિકેશન સેટ થઈ ગઈ છે."
                }
              });
            });
          `}
        </Script>
        {/* --- OneSignal Setup End --- */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FDFCF8] flex flex-col min-h-screen`}
      >
        {!isReaderPage && <Navbar />}

        <main className={`flex-grow ${!isReaderPage ? 'pt-0' : ''}`}>
          {children}
        </main>

        {!isReaderPage && <Footer />}
      </body>
    </html>
  );
}