'use client';

import { Worker, Viewer, PageChangeEvent, SpecialZoomLevel, ScrollMode } from '@react-pdf-viewer/core'; 
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { useEffect, useState } from 'react'; 
import { useSearchParams } from 'next/navigation'; 

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PDFViewerComponent({ fileUrl, bookId, bookTitle, bookCover }: { fileUrl: string, bookId: string, bookTitle: string, bookCover: string }) {
    const searchParams = useSearchParams();
    const [initialPage, setInitialPage] = useState<number | null>(null);

    useEffect(() => {
        const urlPage = searchParams.get('page');
        if (urlPage) {
            setInitialPage(parseInt(urlPage) - 1);
        } else {
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
        // Sidebar icons ko puri tarah hatane ke liye
        sidebarTabs: (defaultTabs) => [], 
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
                        /* pt-12 (padding-top) add kiya hai taaki Back button ke niche Toolbar dikhe */
                        <div className="flex items-center justify-between w-full px-2 md:px-4 py-1 bg-[#1a1a1a] border-b border-white/5 pt-12 md:pt-1">
                            <div className="flex items-center gap-1 md:gap-2">
                                <ShowSearchPopover />
                                <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />
                                <ZoomOut />
                                <div className="hidden xs:block"><Zoom /></div>
                                <ZoomIn />
                            </div>
                            <div className="flex items-center gap-1 bg-black/20 px-2 md:px-3 py-1 rounded-full border border-white/5 scale-90 md:scale-100">
                                <GoToPreviousPage />
                                <div className="flex items-center text-[10px] md:text-xs text-white/70 font-mono">
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

    if (initialPage === null) return null;

    return (
        <div className="h-full w-full overflow-hidden">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    theme="dark"
                    defaultScale={SpecialZoomLevel.PageWidth} 
                    scrollMode={ScrollMode.Vertical}
                    initialPage={initialPage}
                    onPageChange={handlePageChange}
                />
            </Worker>
            
            <style jsx global>{`
                .rpv-core__viewer { background-color: #1a1a1a !important; }
                .rpv-default-layout__container { border: none !important; }
                /* Sidebar ko completely gayab karne ke liye */
                .rpv-default-layout__sidebar { display: none !important; }
                
                .rpv-core__inner-pages { 
                    background-color: #121212 !important; 
                    padding-top: 10px !important; 
                }
                .rpv-core__page-layer { 
                    box-shadow: 0 5px 15px rgba(0,0,0,0.5) !important; 
                    margin-bottom: 10px !important; 
                    max-width: 100% !important;
                }
                .rpv-core__button {
                    padding: 4px !important;
                }
            `}</style>
        </div>
    );
}