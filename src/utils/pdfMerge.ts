import { PDFDocument } from 'pdf-lib';

export interface PdfFileMergeInput {
    file: File;
    selectedPages: number[]; // 1-based page indices
}

export async function mergePDFs(inputs: PdfFileMergeInput[]): Promise<Blob> {
    const mergedPdf = await PDFDocument.create();

    for (const input of inputs) {
        const arrayBuffer = await input.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        // Convert 1-based to 0-based indices
        const pageIndices = input.selectedPages.map(p => p - 1);

        // Copy only selected pages
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    return new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
}

export async function getPdfPageCount(file: File): Promise<number> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    return pdf.getPageCount();
}
