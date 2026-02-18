import { PDFDocument } from 'pdf-lib';

export interface CompressOptions {
    quality: 'low' | 'medium' | 'high';
}

// Note: pdf-lib does not support true image re-compression/downsampling easily in browser without heavy libraries.
// We use object stream compression and metadata removal as the primary methods.
// The options are kept for future extensibility or if we add image processing.


export async function compressPDF(file: File, options: CompressOptions): Promise<{ blob: Blob, originalSize: number, compressedSize: number }> {
    // Prevent unused variable error
    void options;

    const arrayBuffer = await file.arrayBuffer();
    const originalSize = file.size;

    // Load PDF
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: false
    });

    // Minimal metadata
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('TookTak');
    pdfDoc.setCreator('TookTak');

    // Save with compression logic (Object Streams)
    // pdf-lib's `save` with `useObjectStreams: true` can significantly reduce size for files with many objects.
    const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
    });

    const compressedSize = compressedBytes.length;
    // Cast to any to avoid Uint8Array vs BlobPart mismatch in specific TS environments
    const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });

    return { blob, originalSize, compressedSize };
}
