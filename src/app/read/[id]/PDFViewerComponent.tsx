'use client';

import { Worker, Viewer, PageChangeEvent } from '@react-pdf-viewer/core'; // PageChangeEvent add kiya
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { useEffect, useState } from 'react'; // Hooks add kiye
import { useSearchParams } from 'next/navigation'; // Search params check karne ke liye

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Props mein book details add ki taaki save kar sakein
export default function PDFViewerComponent({ fileUrl, bookId, bookTitle, bookCover }: { fileUrl: string, bookId: string, bookTitle: string, bookCover: string }) {
    const searchParams = useSearchParams();
    const [initialPage, setInitialPage] = useState<number | null>(null);

    useEffect(() => {
        // 1. Check if URL has a page (e.g. ?page=5)
        const urlPage = searchParams.get('page');
        if (urlPage) {
            setInitialPage(parseInt(urlPage) - 1);
        } else {
            // 2. Otherwise check LocalStorage for THIS specific book
            const savedData = localStorage.getItem('ma_continue_reading');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed.bookId === bookId) {
                    setInitialPage(parsed.page - 1);
                } else {
                    setInitialPage(0);
                }
            } else {
                setInitialPage(0);
            }
        }
    }, [bookId, searchParams]);

    // Page change hone par save karne ka function
    const handlePageChange = (e: PageChangeEvent) => {
        const progress = {
            bookId,
            title: bookTitle,
            cover: bookCover,
            page: e.currentPage + 1,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('ma_continue_reading', JSON.stringify(progress));
    };

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => [
            defaultTabs[0],
        ],
        renderToolbar: (Toolbar) => (
            <Toolbar>
                {(props) => {
                    const {
                        CurrentPageInput,
                        EnterFullScreen,
                        GoToNextPage,
                        GoToPreviousPage,
                        NumberOfPages,
                        Print,
                        ShowSearchPopover,
                        Zoom,
                        ZoomIn,
                        ZoomOut,
                    } = props;
                    return (
                        <div className="flex items-center justify-between w-full px-2 md:px-4 py-1 bg-[#1a1a1a] border-b border-white/5">
                            <div className="flex items-center gap-1 md:gap-2">
                                <ShowSearchPopover />
                                <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />
                                <ZoomOut />
                                <Zoom />
                                <ZoomIn />
                            </div>
                            <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                                <GoToPreviousPage />
                                <div className="flex items-center text-xs text-white/70 font-mono">
                                    <CurrentPageInput /> <span className="mx-1">/</span> <NumberOfPages />
                                </div>
                                <GoToNextPage />
                            </div>
                            <div className="flex items-center gap-1">
                                <EnterFullScreen />
                                <div className="hidden sm:block">
                                    <Print />
                                </div>
                            </div>
                        </div>
                    );
                }}
            </Toolbar>
        ),
    });

    // Jab tak initialPage decide na ho, render mat karo taaki jump na dikhe
    if (initialPage === null) return null;

    return (
        <div className="h-full w-full">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    theme="dark"
                    defaultScale={1.0}
                    initialPage={initialPage} // Auto-resume setting
                    onPageChange={handlePageChange} // Save progress setting
                />
            </Worker>
            
            <style jsx global>{`
                .rpv-core__viewer { background-color: #1a1a1a !important; }
                .rpv-default-layout__container { border: none !important; }
                .rpv-core__inner-pages { 
                    background-color: #121212 !important; 
                    padding-top: 60px !important; 
                }
                .rpv-core__page-layer { 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; 
                    margin-bottom: 20px !important; 
                }
            `}</style>
        </div>
    );
}