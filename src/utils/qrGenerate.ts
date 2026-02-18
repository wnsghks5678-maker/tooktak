import QRCode from 'qrcode';

export interface QrOptions {
    width: number;
    color: {
        dark: string;
        light: string;
    };
}

export async function generateQRCode(data: string, options: QrOptions): Promise<{ pngDataUrl: string, svgString: string }> {
    try {
        const pngDataUrl = await QRCode.toDataURL(data, {
            width: options.width,
            margin: 2,
            color: options.color,
            errorCorrectionLevel: 'M'
        });

        const svgString = await QRCode.toString(data, {
            type: 'svg',
            width: options.width,
            margin: 2,
            color: options.color,
            errorCorrectionLevel: 'M'
        });

        return { pngDataUrl, svgString };
    } catch (error) {
        console.error("Failed to generate QR code", error);
        throw error;
    }
}
