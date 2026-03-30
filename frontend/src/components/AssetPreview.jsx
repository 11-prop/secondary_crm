function isPdfAsset(src) {
    return /\.pdf(?:$|[?#])/i.test(src);
}

export default function AssetPreview({ title, src }) {
    if (!src) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-400">
                No asset uploaded
            </div>
        );
    }

    if (isPdfAsset(src)) {
        return (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="aspect-video bg-gray-50">
                    <iframe src={src} title={title} className="h-full w-full border-0" />
                </div>
                <div className="border-t border-gray-100 px-4 py-3">
                    <a
                        href={src}
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

    return <img src={src} alt={title} className="aspect-video w-full rounded-2xl border border-gray-200 object-cover" />;
}
