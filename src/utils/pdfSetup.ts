import * as pdfjsLib from 'pdfjs-dist';

export function setupPdfWorker() {
    // Try to use the local worker file from node_modules via Vite's URL handling
    try {
        const workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString();

        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    } catch (e) {
        console.error("Failed to set up PDF worker", e);
        // Fallback or leave empty to let it try default? 
        // User Step 2 suggests setting to '' if it fails, but that's a different strategy.
        // We will stick to the requested Step 1 implementation logic.
    }
}

export async function loadPdfDocument(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
    const arrayBuffer = await file.arrayBuffer();
    // Use standard loading, workerSrc should be set globally
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    return await loadingTask.promise;
}

export { pdfjsLib };
