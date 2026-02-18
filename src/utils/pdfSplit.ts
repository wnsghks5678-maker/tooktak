import { PDFDocument } from 'pdf-lib';

export async function splitPDF(file: File, selectedPages: number[]): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    // selectedPages is 1-based, pdf-lib is 0-based
    const pageIndices = selectedPages.map(p => p - 1);
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
}

export async function splitPDFToIndividual(file: File, selectedPages: number[]): Promise<{ page: number, blob: Blob }[]> {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const results = [];

    for (const pageNum of selectedPages) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        results.push({ page: pageNum, blob: new Blob([pdfBytes as any], { type: 'application/pdf' }) });
    }

    return results;
}
