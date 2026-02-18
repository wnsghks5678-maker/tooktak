declare module 'heic2any' {
    function heic2any(options: {
        blob: Blob | Blob[];
        toType?: string;
        quality?: number;
        gifInterval?: number;
    }): Promise<Blob | Blob[]>;
    export default heic2any;
}

declare module 'utif' {
    export function decode(buffer: ArrayBuffer): any[];
    export function decodeImage(buffer: ArrayBuffer, ifd: any): void;
    export function toRGBA8(ifd: any): Uint8Array;
}
