import heic2any from 'heic2any';
import UTIF from 'utif';

export interface ConvertResult {
    originalFile: File;
    convertedFile: File;
    originalSize: number;
    convertedSize: number;
}

const mimeTypeMap: Record<string, string> = {
    'JPG': 'image/jpeg',
    'PNG': 'image/png',
    'WEBP': 'image/webp',
    'GIF': 'image/gif',
    'BMP': 'image/bmp',
    'AVIF': 'image/avif',
};

const extensionMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/bmp': '.bmp',
    'image/avif': '.avif',
};

/**
 * Loads a Blob/File into an HTMLImageElement
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

/**
 * Converts local file to image source URL (blob URL)
 */
const fileToUrl = (file: Blob): string => {
    return URL.createObjectURL(file);
};

/**
 * Converts an image file to the target format
 * @param file Original file
 * @param targetFormat Target format string (e.g., 'JPG', 'PNG')
 */
export const convertImage = async (file: File, targetFormat: string): Promise<ConvertResult> => {
    const targetMimeType = mimeTypeMap[targetFormat] || 'image/jpeg';
    const targetExt = extensionMap[targetMimeType] || '.jpg';
    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const newFileName = `${fileNameWithoutExt}${targetExt}`;

    let sourceBlob: Blob = file;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    // 1. Handle Special Formats (HEIC, TIFF)
    try {
        // HEIC/HEIF
        if (file.type === 'image/heic' || file.type === 'image/heif' ||
            file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
            const blobOrBlobs = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.92
            });
            sourceBlob = Array.isArray(blobOrBlobs) ? blobOrBlobs[0] : blobOrBlobs;
        }
        // TIFF
        else if (file.type === 'image/tiff' || file.name.toLowerCase().endsWith('.tiff') || file.name.toLowerCase().endsWith('.tif')) {
            const buffer = await file.arrayBuffer();
            const ifds = UTIF.decode(buffer);
            if (!ifds || ifds.length === 0) throw new Error('Invalid TIFF file');

            UTIF.decodeImage(buffer, ifds[0]);
            const rgba = UTIF.toRGBA8(ifds[0]);

            canvas = document.createElement('canvas');
            canvas.width = ifds[0].width;
            canvas.height = ifds[0].height;

            ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context not available');

            const imageData = ctx.createImageData(canvas.width, canvas.height);
            imageData.data.set(new Uint8Array(rgba));
            ctx.putImageData(imageData, 0, 0);

            // For TIFF, we already have it on canvas, so we can skip the standard loading step usually
            // But to unify logic (resize, rotation, consistency), we might want to convert to blob first or just return from here.
            // However, our standard path below handles background fill for JPG.
            // Let's Convert canvas to Blob (PNG/JPEG) to treat it as a standard image source for the final conversion step
            // ensuring consistent handling of "targetFormat".
            // Actually, we can just proceed with `canvas` if we structured it that way, but existing logic loads `sourceBlob`.
            // Let's make a blob from this canvas to feed into the standard pipeline.
            sourceBlob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('TIFF processing failed')), 'image/png');
            });
        }
    } catch (error) {
        console.error('Format pre-processing failed:', error);
        throw new Error(`이미지 읽기 실패: ${file.name}`);
    }

    // 2. Standard Image Processing (Load -> Draw -> Export)
    const imageUrl = fileToUrl(sourceBlob);
    const img = await loadImage(imageUrl);

    canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context error');

    // Handle transparent background for JPG (fill white)
    if (targetMimeType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    // Clean up URL
    URL.revokeObjectURL(imageUrl);

    // 3. Export to Target Format
    let quality: number | undefined;
    if (targetMimeType === 'image/jpeg' || targetMimeType === 'image/webp') quality = 0.92;
    if (targetMimeType === 'image/avif') quality = 0.85;

    const convertedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Conversion failed'));
            },
            targetMimeType,
            quality
        );
    });

    const convertedFile = new File([convertedBlob], newFileName, { type: targetMimeType });

    return {
        originalFile: file,
        convertedFile: convertedFile,
        originalSize: file.size,
        convertedSize: convertedFile.size
    };
};
