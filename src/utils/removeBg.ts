import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';
import type { Config } from '@imgly/background-removal';

export async function removeBackground(
    file: File,
    onProgress?: (progress: number) => void
): Promise<Blob> {
    const imageUrl = URL.createObjectURL(file);

    try {
        const config: Partial<Config> = {
            publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
            model: 'isnet_fp16' as any,
            progress: (_key: string, current: number, total: number) => {
                if (onProgress && total > 0) {
                    const percent = Math.round((current / total) * 100);
                    onProgress(percent);
                }
            },
            output: {
                format: 'image/png' as const,
                quality: 0.9
            }
        };

        const result = await imglyRemoveBackground(imageUrl, config as Config);
        return result;
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
}

export async function addWhiteBackground(transparentBlob: Blob): Promise<Blob> {
    return addColorBackground(transparentBlob, '#FFFFFF', 'image/jpeg');
}

export async function addColorBackground(
    transparentBlob: Blob,
    color: string,
    format: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<Blob> {
    const img = new Image();
    const url = URL.createObjectURL(transparentBlob);

    return new Promise((resolve, reject) => {
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('No canvas context')); return; }
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            canvas.toBlob(
                blob => { if (blob) resolve(blob); else reject(new Error('toBlob failed')); },
                format, 0.92
            );
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
        img.src = url;
    });
}