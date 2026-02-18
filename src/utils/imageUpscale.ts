
export async function upscaleImage(file: File, scale: number): Promise<{
    blob: Blob,
    originalWidth: number,
    originalHeight: number,
    newWidth: number,
    newHeight: number
}> {
    const img = new Image();
    const url = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
        img.onload = () => {
            const originalWidth = img.width;
            const originalHeight = img.height;
            const newWidth = Math.round(originalWidth * scale);
            const newHeight = Math.round(originalHeight * scale);

            // Step-wise downscaling is common, but here we need upscaling.
            // Standard canvas drawImage does bi-linear or similar.
            // For better quality "AI-like" upscale in browser without heavy models,
            // we can do step-wise upscaling for smoother edges, 
            // or just direct drawing with 'high' quality, then apply sharpening.

            // Implementing step-wise upscaling (2x at a time) to mimic better interpolation
            let currentCanvas = document.createElement('canvas');
            currentCanvas.width = originalWidth;
            currentCanvas.height = originalHeight;
            let ctx = currentCanvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context failed'));
                return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0);

            let currentWidth = originalWidth;
            let currentHeight = originalHeight;

            // Upscale in steps (e.g. 2x, then remaining)
            while (currentWidth < newWidth || currentHeight < newHeight) {
                const stepWidth = Math.min(currentWidth * 2, newWidth);
                const stepHeight = Math.min(currentHeight * 2, newHeight);

                const stepCanvas = document.createElement('canvas');
                stepCanvas.width = stepWidth;
                stepCanvas.height = stepHeight;
                const stepCtx = stepCanvas.getContext('2d');
                if (!stepCtx) {
                    reject(new Error('Canvas context failed'));
                    return;
                }

                stepCtx.imageSmoothingEnabled = true;
                stepCtx.imageSmoothingQuality = 'high';
                stepCtx.drawImage(currentCanvas, 0, 0, stepWidth, stepHeight);

                currentCanvas = stepCanvas;
                currentWidth = stepWidth;
                currentHeight = stepHeight;
            }

            // Apply Sharpening
            const finalCtx = currentCanvas.getContext('2d');
            if (finalCtx) {
                const imageData = finalCtx.getImageData(0, 0, newWidth, newHeight);
                const sharpened = applySharpenFilter(imageData);
                finalCtx.putImageData(sharpened, 0, 0);
            }

            URL.revokeObjectURL(url);

            const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const quality = mimeType === 'image/jpeg' ? 0.92 : undefined;

            currentCanvas.toBlob(
                blob => {
                    if (blob) {
                        resolve({ blob, originalWidth, originalHeight, newWidth, newHeight });
                    } else {
                        reject(new Error('Blob creation failed'));
                    }
                },
                mimeType,
                quality
            );
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
}

function applySharpenFilter(imageData: ImageData): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new ImageData(new Uint8ClampedArray(data), width, height);
    const od = output.data;

    // Simple sharpen kernel
    //  0 -0.5  0
    // -0.5  3  -0.5
    //  0 -0.5  0
    const kernel = [0, -0.5, 0, -0.5, 3, -0.5, 0, -0.5, 0];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let val = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                        val += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                od[(y * width + x) * 4 + c] = Math.min(255, Math.max(0, val));
            }
            // Alpha channel logic: keep original alpha
            od[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
        }
    }

    return output;
}
