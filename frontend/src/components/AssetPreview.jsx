import { useEffect, useMemo, useState } from 'react';

function isPdfAsset(src, fileName, mimeType) {
    if ((mimeType || '').toLowerCase() === 'application/pdf') {
        return true;
    }

    if (/\.pdf$/i.test(fileName || '')) {
        return true;
    }

    return /\.pdf(?:$|[?#])/i.test(src);
}

function isProtectedAsset(src) {
    if (!src || typeof window === 'undefined') {
        return false;
    }

    try {
        const url = new URL(src, window.location.origin);
        return url.origin === window.location.origin && url.pathname.startsWith('/api/uploads/file/');
    } catch {
        return src.startsWith('/api/uploads/file/');
    }
}

export default function AssetPreview({ title, src, fileName = '', mimeType = '' }) {
    const pdfAsset = useMemo(() => isPdfAsset(src, fileName, mimeType), [src, fileName, mimeType]);
    const protectedAsset = useMemo(() => isProtectedAsset(src), [src]);
    const [objectUrl, setObjectUrl] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!protectedAsset || !src) {
            setObjectUrl(null);
            setLoadError('');
            setIsLoading(false);
            return undefined;
        }

        let active = true;
        let nextObjectUrl = null;
        setIsLoading(true);
        setLoadError('');

        const accessToken = localStorage.getItem('access_token');
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

        fetch(src, { headers })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Asset request failed.');
                }

                return response.blob();
            })
            .then((blob) => {
                if (!active) {
                    return;
                }

                nextObjectUrl = URL.createObjectURL(blob);
                setObjectUrl(nextObjectUrl);
            })
            .catch(() => {
                if (!active) {
                    return;
                }

                setLoadError('Unable to load this asset right now.');
                setObjectUrl(null);
            })
            .finally(() => {
                if (active) {
                    setIsLoading(false);
                }
            });

        return () => {
            active = false;
            if (nextObjectUrl) {
                URL.revokeObjectURL(nextObjectUrl);
            }
        };
    }, [protectedAsset, src]);

    if (!src) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-400">
                No asset uploaded
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-500">
                Loading asset...
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="space-y-3 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">{loadError}</p>
                <p className="text-xs text-amber-700">Please make sure you are still signed in and try again.</p>
            </div>
        );
    }

    const previewSrc = protectedAsset ? objectUrl : src;
    if (!previewSrc) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-400">
                Preparing asset preview...
            </div>
        );
    }

    if (pdfAsset) {
        return (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="aspect-video bg-gray-50">
                    <iframe src={previewSrc} title={title} className="h-full w-full border-0" />
                </div>
                <div className="border-t border-gray-100 px-4 py-3">
                    <a
                        href={previewSrc}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-brand-600 hover:text-brand-800"
                    >
                        Open PDF in a new tab
                    </a>
                </div>
            </div>
        );
    }

    return <img src={previewSrc} alt={title} className="aspect-video w-full rounded-2xl border border-gray-200 object-cover" />;
}
