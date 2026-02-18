import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
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

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col font-sans text-text bg-background">
          <Header />
          <main className="flex-grow">
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
                {/* Fallback */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
