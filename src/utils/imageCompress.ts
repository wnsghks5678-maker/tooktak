import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';
import UTIF from 'utif';

export interface CompressionResult {
    originalFile: File;
    compressedFile: File;
    originalSize: number;
    compressedSize: number;
    savedPercent: number;
    isConverted?: boolean;
}

/**
 * Converts HEIC/HEIF or TIFF file to JPEG Blob
 * @param file The original file
 * @returns Promise resolving to a JPEG File object
 */
const convertToJpeg = async (file: File): Promise<File> => {
    const filename = file.name.replace(/\.(heic|heif|tiff|tif)/i, '.jpg');

    // HEIC/HEIF Conversion
    if (file.type === 'image/heic' || file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        try {
            const blob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
            });
            // heic2any can return Blob or Blob[], we handle single file here
            const resultBlob = Array.isArray(blob) ? blob[0] : blob;
            return new File([resultBlob], filename, { type: 'image/jpeg' });
        } catch (error) {
            console.error('HEIC conversion failed:', error);
            throw new Error('HEIC 파일 변환에 실패했습니다.');
        }
    }

    // TIFF Conversion
    if (file.type === 'image/tiff' || file.name.toLowerCase().endsWith('.tiff') || file.name.toLowerCase().endsWith('.tif')) {
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
                }, 'image/jpeg', 0.9);
            });
        } catch (error) {
            console.error('TIFF conversion failed:', error);
            throw new Error('TIFF 파일 변환에 실패했습니다.');
        }
    }

    return file;
};

/**
 * Compresses an image file using browser-image-compression
 * @param file The original image file
 * @param quality Quality setting (1-100)
 * @returns Promise resolving to CompressionResult
 */
export const compressImage = async (file: File, quality: number): Promise<CompressionResult> => {
    // Check if conversion is needed
    let fileToCompress = file;
    let isConverted = false;

    if (file.type === 'image/heic' || file.type === 'image/heif' ||
        file.type === 'image/tiff' ||
        file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') ||
        file.name.toLowerCase().endsWith('.tiff') || file.name.toLowerCase().endsWith('.tif')) {
        try {
            fileToCompress = await convertToJpeg(file);
            isConverted = true;
        } catch (error) {
            throw error;
        }
    }

    // Convert 1-100 quality to 0.01-1.0
    const options = {
        maxSizeMB: (fileToCompress.size / 1024 / 1024) * (quality / 100), // Approximate target size
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: quality / 100,
        fileType: fileToCompress.type, // Use converted type if applicable
    };

    try {
        const compressedFile = await imageCompression(fileToCompress, options);

        // Calculate stats (use original file size for comparison)
        const originalSize = file.size;
        const compressedSize = compressedFile.size;

        // Calculate saved percentage
        const savedPercent = ((originalSize - compressedSize) / originalSize) * 100;

        return {
            originalFile: file,
            compressedFile,
            originalSize,
            compressedSize,
            savedPercent,
            isConverted
        };
    } catch (error) {
        console.error('Image compression failed:', error);
        throw error;
    }
};
