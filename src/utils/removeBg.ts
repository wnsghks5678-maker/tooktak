import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

export async function removeBackground(
    file: File,
    onProgress?: (progress: number) => void
): Promise<Blob> {
    const imageUrl = URL.createObjectURL(file);

    try {
        const result = await imglyRemoveBackground(imageUrl, {
            progress: (_key: string, current: number, total: number) => {
                if (onProgress && total > 0) {
                    // Normalize progress to 0-100
                    // The library might report progress in different stages (fetch, compute, etc)
                    // For simplicity, we just pass the percentage if available
                    const percent = Math.round((current / total) * 100);
                    onProgress(percent);
                }
            },
            output: {
                format: 'image/png',
                quality: 0.9
            }
        });

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

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Fill background
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw image
            ctx.drawImage(img, 0, 0);

            URL.revokeObjectURL(url);

            canvas.toBlob(
                blob => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob failed'));
                },
                format,
                0.92
            );
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
}
