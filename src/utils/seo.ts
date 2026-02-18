export interface SEOMeta {
    title: string;
    description: string;
}

const seoData: Record<string, Record<string, SEOMeta>> = {
    ko: {
        home: {
            title: "뚝딱 - 무료 온라인 이미지 압축, 변환, PDF 도구 | TookTak",
            description: "이미지 압축, 포맷 변환, 리사이즈, PDF 편집까지. 100% 무료, 브라우저에서 바로 처리."
        },
        compress: {
            title: "이미지 압축 - 뚝딱 | 무료 온라인 이미지 용량 줄이기",
            description: "JPG, PNG, WEBP, HEIC 이미지를 무료로 압축하세요. 서버 업로드 없이 브라우저에서 바로 처리."
        },
        convert: {
            title: "이미지 변환 - 뚝딱 | PNG JPG WEBP HEIC 포맷 변환",
            description: "PNG, JPG, WEBP, HEIC, TIFF 등 이미지 포맷을 무료로 변환. 아이폰 HEIC 사진도 지원."
        },
        resize: {
            title: '이미지 크기 조절 - 뚝딱 | 무료 온라인 이미지 리사이즈',
            description: '이미지를 원하는 크기로 줄이거나 늘리세요. 픽셀 및 비율 지정 가능. 100% 무료.'
        },
        pdfMerge: {
            title: 'PDF 합치기 - 뚝딱 | 무료 온라인 PDF 병합',
            description: '여러 PDF를 하나로 합치세요. 드래그로 순서 변경. 100% 무료, 브라우저 처리.'
        },
        pdfSplit: {
            title: 'PDF 나누기 - 뚝딱 | 무료 온라인 PDF 페이지 추출',
            description: 'PDF에서 원하는 페이지만 추출. 범위 지정 가능. 100% 무료.'
        },
        pdfCompress: {
            title: "PDF 압축 - 뚝딱 | 무료 온라인 PDF 용량 줄이기",
            description: "PDF 파일 용량을 줄이세요. 이미지 최적화로 문서 품질 유지. 100% 무료 브라우저 처리."
        },
        qrCode: {
            title: "QR코드 생성 - 뚝딱 | 무료 온라인 QR코드 만들기",
            description: "URL, 텍스트, Wi-Fi 등 QR코드 무료 생성. 색상 커스텀, PNG/SVG 다운로드."
        },
        removeBg: {
            title: "AI 배경 제거 - 뚝딱 | 무료 온라인 사진 배경 지우기",
            description: "AI로 사진 배경을 자동 제거. 브라우저에서 처리, 서버 업로드 없음. 투명 PNG 다운로드."
        },
        upscale: {
            title: "AI 화질 개선 - 뚝딱 | 무료 온라인 이미지 업스케일링",
            description: "저화질 이미지를 AI로 2배~4배 선명하게. 100% 무료 브라우저 처리."
        }
    },
    en: {
        home: {
            title: "TookTak - Free Online Image Compression, Conversion & PDF Tools",
            description: "Compress, convert, resize images and edit PDFs. 100% free, browser-based. No server upload."
        },
        compress: {
            title: "Image Compression - TookTak | Free Online Image Compressor",
            description: "Compress JPG, PNG, WEBP, HEIC images for free. 100% browser-based, no server upload."
        },
        convert: {
            title: "Image Conversion - TookTak | Free PNG JPG WEBP HEIC Converter",
            description: "Convert between PNG, JPG, WEBP, HEIC, TIFF formats for free. iPhone HEIC supported."
        },
        resize: {
            title: 'Image Resize - TookTak | Free Online Image Resizer',
            description: 'Resize images to any dimension. Presets for Instagram, YouTube, etc. 100% free, browser-based.'
        },
        pdfMerge: {
            title: 'Merge PDF - TookTak | Free Online PDF Merger',
            description: 'Combine multiple PDFs into one. Drag to reorder. 100% free, browser-based.'
        },
        pdfSplit: {
            title: 'Split PDF - TookTak | Free Online PDF Page Extractor',
            description: 'Extract specific pages from PDF. Range selection supported. 100% free.'
        },
        pdfCompress: {
            title: "Compress PDF - TookTak | Free Online PDF Compressor",
            description: "Reduce PDF file size with image optimization. Quality preserved. 100% free."
        },
        qrCode: {
            title: "QR Code Generator - TookTak | Free Online QR Code Maker",
            description: "Generate QR codes for URLs, text, Wi-Fi and more. Custom colors, PNG/SVG download."
        },
        removeBg: {
            title: "AI Background Removal - TookTak | Free Online Background Remover",
            description: "Remove photo backgrounds with AI. Browser-based, no upload. Download transparent PNG."
        },
        upscale: {
            title: "AI Image Upscale - TookTak | Free Online Image Enhancer",
            description: "Upscale low-res images 2x-4x with AI. 100% free, browser-based."
        }
    },
    zh: {
        home: {
            title: 'TookTak - 免费在线图片工具 | 压缩、转换、调整大小',
            description: '免费在线图片工具。压缩JPG/PNG/WEBP，转换格式，调整大小。100%在浏览器中处理，无服务器上传，安全快速。'
        },
        compress: {
            title: '图片压缩 - TookTak | 免费在线图片压缩',
            description: '减少JPG, PNG, WEBP文件大小。保持画质，批量压缩。100%免费，浏览器处理。'
        },
        convert: {
            title: '图片转换 - TookTak | 免费在线格式转换',
            description: '转换图片格式。支持JPG, PNG, WEBP, HEIC, TIFF等。100%免费，浏览器处理。'
        },
        resize: {
            title: '调整图片大小 - TookTak | 免费在线图片尺寸调整',
            description: '将图片调整为任意尺寸。提供社交媒体预设。100%免费，浏览器处理。'
        },
        pdfMerge: {
            title: '合并PDF - TookTak | 免费在线PDF合并工具',
            description: '将多个PDF合为一个。拖拽调整顺序。100%免费。'
        },
        pdfSplit: {
            title: '拆分PDF - TookTak | 免费在线PDF页面提取',
            description: '从PDF中提取指定页面。支持范围选择。100%免费。'
        },
        pdfCompress: {
            title: "压缩PDF - TookTak | 免费在线PDF压缩工具",
            description: "减小PDF文件大小。图片优化，保持质量。100%免费。"
        },
        qrCode: {
            title: "二维码生成 - TookTak | 免费在线二维码生成器",
            description: "生成URL、文本、Wi-Fi等二维码。自定义颜色，PNG/SVG下载。"
        },
        removeBg: {
            title: "AI去背景 - TookTak | 免费在线照片去背景",
            description: "AI自动去除照片背景。浏览器处理，无需上传。下载透明PNG。"
        },
        upscale: {
            title: "AI画质增强 - TookTak | 免费在线图片放大工具",
            description: "用AI将低分辨率图片放大2-4倍。100%免费浏览器处理。"
        }
    },
    ja: {
        home: {
            title: 'TookTak - 無料オンライン画像ツール | 圧縮、変換、リサイズ',
            description: '無料のオンライン画像ツール。JPG/PNG/WEBPの圧縮、フォーマット変換、サイズ変更。100%ブラウザ処理、サーバーアップロードなし、安全で高速。'
        },
        compress: {
            title: '画像圧縮 - TookTak | 無料オンライン画像圧縮',
            description: 'JPG、PNG、WEBPのファイルサイズを削減。画質を維持して一括圧縮。100%無料、ブラウザ処理。'
        },
        convert: {
            title: '画像変換 - TookTak | 無料オンラインフォーマット変換',
            description: '画像フォーマットを変換。JPG、PNG、WEBP、HEIC、TIFFなどに対応。100%無料、ブラウザ処理。'
        },
        resize: {
            title: '画像リサイズ - TookTak | 無料オンライン画像サイズ変更',
            description: '画像を任意のサイズにリサイズ。SNS用プリセットあり。100%無料、ブラウザ処理。'
        },
        pdfMerge: {
            title: 'PDF結合 - TookTak | 無料オンラインPDF結合ツール',
            description: '複数のPDFを一つに結合。ドラッグで順序変更。100%無料。'
        },
        pdfSplit: {
            title: 'PDF分割 - TookTak | 無料オンラインPDFページ抽出',
            description: 'PDFから特定ページを抽出。範囲指定可能。100%無料。'
        },
        pdfCompress: {
            title: "PDF圧縮 - TookTak | 無料オンラインPDF圧縮ツール",
            description: "PDFファイルサイズを縮小。画像最適化で品質維持。100%無料。"
        },
        qrCode: {
            title: "QRコード生成 - TookTak | 無料オンラインQRコードメーカー",
            description: "URL、テキスト、Wi-FiなどのQRコードを生成。カスタムカラー、PNG/SVGダウンロード。"
        },
        removeBg: {
            title: "AI背景除去 - TookTak | 無料オンライン背景除去ツール",
            description: "AIで写真の背景を自動除去。ブラウザ処理、アップロード不要。透明PNGダウンロード。"
        },
        upscale: {
            title: "AI画質向上 - TookTak | 無料オンライン画像アップスケーリング",
            description: "低解像度画像をAIで2〜4倍鮮明に。100%無料ブラウザ処理。"
        }
    }
};

export function updateSEO(page: string, locale: string) {
    // Fallback to 'ko' if locale or page data is missing
    const meta = seoData[locale]?.[page] || seoData['ko'][page];

    if (meta) {
        document.title = meta.title;

        const descTag = document.querySelector('meta[name="description"]');
        if (descTag) descTag.setAttribute('content', meta.description);

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', meta.title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', meta.description);

        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) twitterTitle.setAttribute('content', meta.title);

        const twitterDesc = document.querySelector('meta[name="twitter:description"]');
        if (twitterDesc) twitterDesc.setAttribute('content', meta.description);
    }
}
