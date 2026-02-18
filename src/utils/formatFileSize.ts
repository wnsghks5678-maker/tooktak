/**
 * Formats bytes into a human-readable string (B, KB, MB)
 * @param bytes The size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    // Calculate the appropriate unit index
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Format the number
    // For B, no decimal. For KB and above, up to 2 decimal places.
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

    return `${formattedSize} ${sizes[i]}`;
};
