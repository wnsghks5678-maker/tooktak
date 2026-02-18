import heic2any from 'heic2any';
import UTIF from 'utif';

export interface ResizeResult {
    originalFile: File;
    resizedFile: File;
    originalWidth: number;
    originalHeight: number;
    newWidth: number;
    newHeight: number;
    originalSize: number;
    resizedSize: number;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

const fileToUrl = (file: Blob): string => {
    return URL.createObjectURL(file);
};

// Helper: Convert File/Blob to standard Image Blob (handle HEIC/TIFF)
const preprocessImage = async (file: File): Promise<Blob> => {
    if (file.type === 'image/heic' || file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        const blobOrBlobs = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
        return Array.isArray(blobOrBlobs) ? blobOrBlobs[0] : blobOrBlobs;
    }

    if (file.type === 'image/tiff' || file.name.toLowerCase().endsWith('.tiff') || file.name.toLowerCase().endsWith('.tif')) {
        const buffer = await file.arrayBuffer();
        const ifds = UTIF.decode(buffer);
        if (!ifds || ifds.length === 0) throw new Error('Invalid TIFF');
        UTIF.decodeImage(buffer, ifds[0]);
        const rgba = UTIF.toRGBA8(ifds[0]);
        const canvas = document.createElement('canvas');
        canvas.width = ifds[0].width;
        canvas.height = ifds[0].height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context error');
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        imageData.data.set(new Uint8Array(rgba));
        ctx.putImageData(imageData, 0, 0);
        return new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('TIFF error')), 'image/jpeg', 0.92);
        });
    }

    return file;
};

// Helper: Get dimensions of an image file
export const getImageDimensions = async (file: File): Promise<{ width: number; height: number }> => {
    try {
        const blob = await preprocessImage(file);
        const url = fileToUrl(blob);
        const img = await loadImage(url);
        const dims = { width: img.naturalWidth, height: img.naturalHeight };
        URL.revokeObjectURL(url);
        return dims;
    } catch (error) {
        console.error('Error getting dimensions:', error);
        return { width: 0, height: 0 };
    }
};

/**
 * Resizes an image file
 * @param file Original file
 * @param targetWidth Target width (px). If null/undefined, calculated from height/percentage.
 * @param targetHeight Target height (px). If null/undefined, calculated from width/percentage.
 * @param percentage Percentage to scale (e.g. 50 for 50%). Ignored if width/height provided.
 */
export const resizeImage = async (
    file: File,
    targetWidth?: number,
    targetHeight?: number,
    percentage?: number
): Promise<ResizeResult> => {
    const sourceBlob = await preprocessImage(file);
    const url = fileToUrl(sourceBlob);
    const img = await loadImage(url);

    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (targetWidth && targetHeight) {
        newWidth = targetWidth;
        newHeight = targetHeight;
    } else if (percentage) {
        newWidth = Math.round(originalWidth * (percentage / 100));
        newHeight = Math.round(originalHeight * (percentage / 100));
    } else if (targetWidth) {
        newWidth = targetWidth;
        newHeight = Math.round(originalHeight * (targetWidth / originalWidth));
    } else if (targetHeight) {
        newHeight = targetHeight;
        newWidth = Math.round(originalWidth * (targetHeight / originalHeight));
    }

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context error');

    // If transparent PNG/WEBP -> JPG, might need background fill? 
    // But requirement says "Output MIME: Original (HEIC/TIFF -> JPG)".
    // If original is PNG, we keep PNG, so transparency is fine.
    // If original is JPG, we keep JPG.
    // HEIC/TIFF converted to JPEG in preprocess, so we export as JPEG.

    // Actually, we need to know the output type.
    let outputType = file.type;
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') ||
        file.type === 'image/tiff' || file.name.toLowerCase().endsWith('.tiff') || file.name.toLowerCase().endsWith('.tif')) {
        outputType = 'image/jpeg';
    } else if (!outputType) {
        // If type is missing/empty, deduce from extension or default to JPEG
        if (file.name.toLowerCase().endsWith('.png')) outputType = 'image/png';
        else if (file.name.toLowerCase().endsWith('.webp')) outputType = 'image/webp';
        else outputType = 'image/jpeg';
    }

    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    URL.revokeObjectURL(url);

    const resizedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Resize failed')), outputType, 0.92);
    });

    // Construct new filename
    const dotIndex = file.name.lastIndexOf('.');
    const nameWithoutExt = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
    const ext = outputType === 'image/jpeg' ? '.jpg' :
        outputType === 'image/png' ? '.png' :
            outputType === 'image/webp' ? '.webp' :
                file.name.substring(dotIndex); // Fallback to original extension

    const newFileName = `${nameWithoutExt}_resized${ext}`;
    const resizedFile = new File([resizedBlob], newFileName, { type: outputType });

    return {
        originalFile: file,
        resizedFile,
        originalWidth,
        originalHeight,
        newWidth,
        newHeight,
        originalSize: file.size,
        resizedSize: resizedFile.size
    };
};
