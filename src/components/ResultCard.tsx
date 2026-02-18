import { useTranslation } from '../i18n/useTranslation';
import { formatFileSize } from '../utils/fileHelpers';

interface ResultCardProps {
    fileName: string;
    originalSize?: number;
    newSize?: number;
    extraInfo?: React.ReactNode;
    onDownload: () => void;
    badge?: string; // e.g. "JPG -> PNG" or "50% Reduced"
    badgeColor?: string; // Text color class for badge
}

const ResultCard = ({
    fileName,
    originalSize,
    newSize,
    extraInfo,
    onDownload,
    badge,
    badgeColor = "text-gray-600"
}: ResultCardProps) => {
    const { t } = useTranslation();

    // Calculate reduction if both sizes present
    const renderSizeInfo = () => {
        if (originalSize !== undefined && newSize !== undefined) {
            const diffPercent = ((newSize - originalSize) / originalSize) * 100;
            const isReduced = diffPercent <= 0;

            return (
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 line-through">{formatFileSize(originalSize)}</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-gray-900 font-bold">{formatFileSize(newSize)}</span>
                    </div>
                    <span className={`font-bold ${isReduced ? 'text-green-600' : 'text-orange-500'}`}>
                        {Math.abs(diffPercent).toFixed(1)}% {isReduced ? t('common.decreased') : t('common.increased')}
                    </span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
                <p className="font-medium text-gray-800 truncate mb-1" title={fileName}>{fileName}</p>

                {badge && (
                    <div className={`text-sm mb-2 ${badgeColor}`}>
                        {badge}
                    </div>
                )}

                {extraInfo && (
                    <div className="text-sm text-gray-500 mb-2">
                        {extraInfo}
                    </div>
                )}

                {renderSizeInfo()}
            </div>

            <button
                onClick={onDownload}
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-lg text-sm transition-colors"
            >
                {t('common.download')}
            </button>
        </div>
    );
};

export default ResultCard;
