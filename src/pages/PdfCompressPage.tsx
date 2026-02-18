import { useState } from 'react';
import { useTranslation } from '../i18n';
import AdPlaceholder from '../components/AdPlaceholder';
import FileUploader from '../components/FileUploader';
import { compressPDF } from '../utils/pdfCompress';
import type { CompressOptions } from '../utils/pdfCompress';
import { formatFileSize, downloadFile, downloadAsZip } from '../utils/fileHelpers';
import { updateSEO } from '../utils/seo';

interface CompressedFile {
    originalFile: File;
    blob: Blob | null;
    compressedSize: number;
    status: 'pending' | 'compressing' | 'done' | 'error';
}

const PdfCompressPage = () => {
    const { t, locale } = useTranslation();
    const [files, setFiles] = useState<CompressedFile[]>([]);
    const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
    const [isGlobalCompressing, setIsGlobalCompressing] = useState(false);

    // Update SEO
    updateSEO('pdfCompress', locale);

    const handleFilesSelected = (selectedFiles: File[]) => {
        const newFiles = selectedFiles.map(file => ({
            originalFile: file,
            blob: null,
            compressedSize: 0,
            status: 'pending' as const
        }));
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleCompress = async () => {
        setIsGlobalCompressing(true);
        const options: CompressOptions = { quality };

        // Create a new array to trigger re-renders correctly
        const updatedFiles = [...files];

        for (let i = 0; i < updatedFiles.length; i++) {
            if (updatedFiles[i].status === 'done') continue; // Skip already done

            updatedFiles[i].status = 'compressing';
            setFiles([...updatedFiles]);

            try {
                const result = await compressPDF(updatedFiles[i].originalFile, options);
                updatedFiles[i].blob = result.blob;
                updatedFiles[i].compressedSize = result.compressedSize;
                updatedFiles[i].status = 'done';
            } catch (error) {
                console.error("Compression failed", error);
                updatedFiles[i].status = 'error';
            }
            setFiles([...updatedFiles]);
        }
        setIsGlobalCompressing(false);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDownloadAll = async () => {
        const completedFiles = files.filter(f => f.status === 'done' && f.blob);
        if (completedFiles.length === 0) return;

        if (completedFiles.length === 1) {
            downloadFile(completedFiles[0].blob!, `compressed_${completedFiles[0].originalFile.name}`);
        } else {
            // Create File objects from Blobs for checking types
            const filesToZip = completedFiles.map(f => {
                return new File([f.blob!], `compressed_${f.originalFile.name}`, { type: 'application/pdf' });
            });

            await downloadAsZip(
                filesToZip,
                'tooktak-pdf-compressed.zip'
            );
        }
    };

    const totalSavedBytes = files.reduce((acc, curr) => {
        if (curr.status === 'done') {
            return acc + Math.max(0, curr.originalFile.size - curr.compressedSize);
        }
        return acc;
    }, 0);

    const QualityCard = ({ value, icon, badge }: { value: 'low' | 'medium' | 'high', icon: string, badge?: boolean }) => (
        <div
            onClick={() => setQuality(value)}
            className={`
                relative border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center text-center
                ${quality === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
            `}
        >
            {badge && (
                <div className="absolute -top-3 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                    Recommended
                </div>
            )}
            <div className="text-3xl mb-2">{icon}</div>
            <div className="font-bold text-gray-800 mb-1">{t(`pdfCompress.${value}`)}</div>
            <div className="text-xs text-gray-500 leading-snug">{t(`pdfCompress.${value}Desc`)}</div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t('pdfCompress.title')}</h1>
                <p className="text-gray-600">{t('pdfCompress.subtitle')}</p>
            </div>

            <div className="w-full mb-10">
                <AdPlaceholder id="ad-pdfcompress-top" showCoupang={true} />
            </div>

            <div className="space-y-8">
                {/* File Uploader */}
                <FileUploader
                    acceptFormats="application/pdf,.pdf"
                    maxFiles={5} // Max 5 files
                    maxSizeMB={50} // 50MB
                    onFilesSelected={handleFilesSelected}
                    icon={<span className="text-4xl mb-3">📦</span>}
                    uploadText={t('pdfCompress.upload')}
                    hintText={t('pdfCompress.uploadHint')}
                />

                {/* Quality Selection */}
                {files.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">{t('pdfCompress.quality')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <QualityCard value="low" icon="🗜️" />
                            <QualityCard value="medium" icon="⚖️" badge />
                            <QualityCard value="high" icon="✨" />
                        </div>
                    </div>
                )}

                {/* File List & Results */}
                {files.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {t('compress.selectedFiles')} ({files.length})
                            </h2>
                            {totalSavedBytes > 0 && (
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                    {t('pdfCompress.saved')}: {formatFileSize(totalSavedBytes)}
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            {files.map((file, index) => (
                                <div key={index} className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
                                    <div className="text-3xl">📄</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate text-gray-800">{file.originalFile.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                            <span>{t('pdfCompress.original')}: {formatFileSize(file.originalFile.size)}</span>
                                            {file.status === 'done' && (
                                                <>
                                                    <span>→</span>
                                                    <span className="font-semibold text-gray-700">{formatFileSize(file.compressedSize)}</span>
                                                    <span className={file.compressedSize < file.originalFile.size ? "text-green-600" : "text-gray-400"}>
                                                        ({file.compressedSize < file.originalFile.size
                                                            ? `-${Math.round((1 - file.compressedSize / file.originalFile.size) * 100)}%`
                                                            : t('pdfCompress.noChange')
                                                        })
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {/* Progress Bar */}
                                        {file.status === 'compressing' && (
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                                <div className="bg-blue-600 h-1.5 rounded-full animate-progress-indeterminate"></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {file.status === 'done' && file.blob && (
                                            <button
                                                onClick={() => downloadFile(file.blob!, `compressed_${file.originalFile.name}`)}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                            >
                                                {t('pdfCompress.download')}
                                            </button>
                                        )}
                                        {file.status !== 'compressing' && (
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="px-2 py-1.5 text-gray-400 hover:text-red-500 transition"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                onClick={handleCompress}
                                disabled={isGlobalCompressing}
                                className={`
                                    flex-1 py-3 px-6 rounded-xl font-bold text-lg text-white shadow-md transition-all
                                    flex items-center justify-center gap-2
                                    ${isGlobalCompressing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'}
                                `}
                            >
                                {isGlobalCompressing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {t('pdfCompress.compressing')}
                                    </>
                                ) : (
                                    t('pdfCompress.startCompress')
                                )}
                            </button>

                            {files.some(f => f.status === 'done') && (
                                <button
                                    onClick={handleDownloadAll}
                                    className="flex-1 py-3 px-6 bg-gray-800 text-white rounded-xl font-bold text-lg hover:bg-gray-900 transition-all shadow-md"
                                >
                                    {t('pdfCompress.downloadAll')}
                                </button>
                            )}
                        </div>
                    </div>
                )}



                {/* FAQ */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{t('pdfCompress.faqTitle')}</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(num => (
                            <div key={num}>
                                <h4 className="font-semibold text-gray-800 mb-1">Q. {t(`pdfCompress.faq${num}q`)}</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">{t(`pdfCompress.faq${num}a`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full mt-10">
                <AdPlaceholder id="ad-pdfcompress-bottom" showCoupang={true} />
            </div>
        </div>
    );
};

export default PdfCompressPage;
