import { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AdsterraSocialBar from './components/AdsterraSocialBar';
import AdsterraBanner from './components/AdsterraBanner';
import SidePromo from './components/SidePromo';
import { LanguageProvider } from './i18n';

const HomePage = lazy(() => import('./pages/HomePage'));
const CompressPage = lazy(() => import('./pages/CompressPage'));
const ConvertPage = lazy(() => import('./pages/ConvertPage'));
const ResizePage = lazy(() => import('./pages/ResizePage'));
const PdfMergePage = lazy(() => import('./pages/PdfMergePage'));
const PdfSplitPage = lazy(() => import('./pages/PdfSplitPage'));
const PdfCompressPage = lazy(() => import('./pages/PdfCompressPage'));
const QrCodePage = lazy(() => import('./pages/QrCodePage'));
const RemoveBgPage = lazy(() => import('./pages/RemoveBgPage'));
const UpscalePage = lazy(() => import('./pages/UpscalePage'));
const PasswordGeneratorPage = lazy(() => import('./pages/PasswordGeneratorPage'));
const VideoToGifPage = lazy(() => import('./pages/VideoToGifPage'));
const OcrPage = lazy(() => import('./pages/OcrPage'));
const WatermarkPage = lazy(() => import('./pages/WatermarkPage'));
const WatermarkRemovePage = lazy(() => import('./pages/WatermarkRemovePage'));

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-text bg-background">
      <AdsterraSocialBar />
      <Header />

      <div className="flex justify-center gap-1 w-full">
        {/* Left Ad - Adsterra 160x600 */}
        <aside className="hidden xl:flex flex-col items-center flex-shrink-0 sticky top-20 self-start mt-4" style={{ width: '220px', maxWidth: '220px', overflow: 'hidden' }}>
          <AdsterraBanner adKey="773ae2130cac0ed030214d55efc7e866" width={160} height={600} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-[960px] w-full min-w-0">
          <Suspense fallback={
            <div className="flex justify-center items-center h-64 text-gray-400">
              Loading...
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/compress" element={<CompressPage />} />
              <Route path="/convert" element={<ConvertPage />} />
              <Route path="/resize" element={<ResizePage />} />
              <Route path="/pdf-merge" element={<PdfMergePage />} />
              <Route path="/pdf-split" element={<PdfSplitPage />} />
              <Route path="/pdf-compress" element={<PdfCompressPage />} />
              <Route path="/qr-code" element={<QrCodePage />} />
              <Route path="/remove-bg" element={<RemoveBgPage />} />
              <Route path="/upscale" element={<UpscalePage />} />
              <Route path="/password-generator" element={<PasswordGeneratorPage />} />
              <Route path="/video-to-gif" element={<VideoToGifPage />} />
              <Route path="/ocr" element={<OcrPage />} />
              <Route path="/watermark-remove" element={<WatermarkRemovePage />} />
              <Route path="/watermark" element={<WatermarkPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Right - SidePromo */}
        <aside className="hidden xl:flex flex-col items-center flex-shrink-0 sticky top-20 self-start mt-4" style={{ width: '220px', maxWidth: '220px', overflow: 'hidden' }}>
          <SidePromo />
        </aside>
      </div>
      <Footer />
    </div>
  );
}

const App = () => {
  return (
    <LanguageProvider>
      <HelmetProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </HelmetProvider>
    </LanguageProvider>
  );
};

export default App;
