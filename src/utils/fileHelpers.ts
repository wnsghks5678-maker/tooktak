import heic2any from 'heic2any';
import UTIF from 'utif';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

/**
 * Formats bytes into a human-readable string (B, KB, MB)
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${formattedSize} ${sizes[i]}`;
};

/**
 * Check if the file is HEIC/HEIF
 */
export const isHEIC = (file: File): boolean => {
    return file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');
};

/**
 * Check if the file is TIFF
 */
export const isTIFF = (file: File): boolean => {
    return file.type === 'image/tiff' ||
        file.name.toLowerCase().endsWith('.tiff') ||
        file.name.toLowerCase().endsWith('.tif');
};

/**
 * Converts HEIC/HEIF file to JPEG Blob/File
 */
export const convertHEICToJPEG = async (file: File): Promise<File> => {
    const filename = file.name.replace(/\.(heic|heif)/i, '.jpg');
    try {
        const blobOrBlobs = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.92
        });
        const resultBlob = Array.isArray(blobOrBlobs) ? blobOrBlobs[0] : blobOrBlobs;
        return new File([resultBlob], filename, { type: 'image/jpeg' });
    } catch (error) {
        console.error('HEIC conversion failed:', error);
        throw new Error(`HEIC 변환 실패: ${file.name}`);
    }
};

/**
 * Converts TIFF file to JPEG Blob/File (via Canvas)
 */
export const convertTIFFToJPEG = async (file: File): Promise<File> => {
    const filename = file.name.replace(/\.(tiff|tif)/i, '.jpg');
    try {
        const buffer = await file.arrayBuffer();
        const ifds = UTIF.decode(buffer);
        if (!ifds || ifds.length === 0) throw new Error('Invalid TIFF');

        UTIF.decodeImage(buffer, ifds[0]);
        const rgba = UTIF.toRGBA8(ifds[0]);

        const canvas = document.createElement('canvas');
        canvas.width = ifds[0].width;
        canvas.height = ifds[0].height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        const imageData = ctx.createImageData(canvas.width, canvas.height);
        imageData.data.set(new Uint8Array(rgba));
        ctx.putImageData(imageData, 0, 0);

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], filename, { type: 'image/jpeg' }));
                } else {
                    reject(new Error('Canvas to Blob failed'));
                }
            }, 'image/jpeg', 0.92);
        });
    } catch (error) {
        console.error('TIFF conversion failed:', error);
        throw new Error(`TIFF 변환 실패: ${file.name}`);
    }
};

/**
 * Downloads a single file
 */
export const downloadFile = (file: File | Blob, filename: string) => {
    saveAs(file, filename);
};

/**
 * Downloads multiple files as a ZIP
 */
export const downloadAsZip = async (files: File[], zipFilename: string = 'files.zip') => {
    const zip = new JSZip();
    files.forEach(file => {
        zip.file(file.name, file);
    });

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, zipFilename);
    } catch (error) {
        console.error('ZIP generation failed:', error);
        throw new Error('ZIP 파일 생성 실패');
    }
};

/**
 * Loads an image from a source URL
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

/**
 * Converts File/Blob to URL
 */
export const fileToUrl = (file: Blob): string => {
    return URL.createObjectURL(file);
};
