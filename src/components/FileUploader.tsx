import { useRef, useState, useCallback } from 'react';
import { useTranslation } from '../i18n/useTranslation'; // We'll assume this hook is created or we'll mock it for now. Actually plan said to create hook in i18n step. 
// For now, I will use English/Korean hardcoded or pass text as props? 
// The plan is "Create common components", and "Setup i18n structure" is later.
// However, I should make these components i18n-ready or accept text props.
// Let's use props for text to make it flexible and i18n-compatible from the outside.

// Wait, the prompt said "Refactor pages to use common components" AND "Apply translations to all components".
// I should probably prepare it for i18n but maybe just use hardcoded defaults for now if the hook isn't ready.
// Or I can just pass all text from the parent page which might simpler for now.
// Let's stick to the prompt's specific props: description.
// And I'll add text props for other labels to be passed from parent.

interface FileUploaderProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    acceptFormats?: string;
    icon?: React.ReactNode;
    description?: string;
    uploadText?: string;
    hintText?: string;
}

const FileUploader = ({
    onFilesSelected,
    maxFiles = 10,
    maxSizeMB = 10,
    acceptFormats,
    icon = <span className="text-4xl mb-3">📁</span>,
    description,
    uploadText,
    hintText
}: FileUploaderProps) => {
    const { t } = useTranslation();
    const finalUploadText = uploadText || t('common.upload');

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files) {
            validateAndPassFiles(Array.from(e.dataTransfer.files));
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            validateAndPassFiles(Array.from(e.target.files));
        }
        // Reset value so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const validateAndPassFiles = (files: File[]) => {
        if (files.length > maxFiles) {
            alert(`최대 ${maxFiles}개까지만 선택할 수 있습니다.`);
            return;
        }

        const validFiles: File[] = [];
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        // This logic assumes we append files, but the component just returns selected files.
        // The parent manages state. We should just validate individual files here.
        // Parent should check total count if appending.

        for (const file of files) {
            if (file.size > maxSizeBytes) {
                alert(file.name + ' : 파일이 너무 큽니다 (최대 ' + maxSizeMB + 'MB)');
                continue;
            }

            // Basic extension/type check if acceptFormats is provided
            if (acceptFormats) {
                // Implementation of full accept check is complex, simpler check:
                // acceptFormats like "image/png, .jpg"
                // We can skip customized accept check and rely on input accept for browser,
                // and for DnD we might want to be strict.
                // For now let's trust the browser/user or let parent handle strict validation if needed.
                // Or implement simple check:
                const accepts = acceptFormats.split(',').map(s => s.trim().toLowerCase());
                const ext = '.' + file.name.split('.').pop()?.toLowerCase();
                const type = file.type.toLowerCase();

                const isValid = accepts.some(a => {
                    if (a.startsWith('.')) return ext === a;
                    if (a.includes('/')) return type === a || (a.endsWith('/*') && type.startsWith(a.replace('/*', '')));
                    return false;
                });

                if (!isValid) {
                    alert('지원하지 않는 파일 형식입니다: ' + file.name);
                    continue;
                }
            }

            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            onFilesSelected(validFiles);
        }
    };

    return (
        <div
            className={`
        h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
        ${isDragging
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50'
                }
      `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            {icon}
            <p className="text-base font-medium text-gray-700 mb-1">
                {finalUploadText}
            </p>
            <p className="text-sm text-gray-400 text-center px-4">
                {hintText || description}
            </p>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={acceptFormats}
                multiple
                onChange={handleFileInput}
            />
        </div>
    );
};

export default FileUploader;
