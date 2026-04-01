import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function PaginationControls({
    currentPage = 1,
    totalPages = 1,
    totalRecords = 0,
    limit = 25,
    onPageChange,
    onLimitChange,
}) {
    const safeTotalPages = Math.max(totalPages || 1, 1);
    const safeCurrentPage = Math.min(Math.max(currentPage || 1, 1), safeTotalPages);
    const startRecord = totalRecords === 0 ? 0 : ((safeCurrentPage - 1) * limit) + 1;
    const endRecord = totalRecords === 0 ? 0 : Math.min(safeCurrentPage * limit, totalRecords);

    return (
        <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
                <span className="font-medium">
                    Showing {startRecord}-{endRecord} of {totalRecords}
                </span>
                {onLimitChange && (
                    <label className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Per page</span>
                        <select
                            value={limit}
                            onChange={(event) => onLimitChange(Number(event.target.value))}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none"
                        >
                            {PAGE_SIZE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(safeCurrentPage - 1, 1))}
                    disabled={safeCurrentPage <= 1}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-600 disabled:opacity-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                </button>
                <span className="min-w-[7rem] text-center font-semibold text-gray-700">
                    Page {safeCurrentPage} of {safeTotalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(safeCurrentPage + 1, safeTotalPages))}
                    disabled={safeCurrentPage >= safeTotalPages}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-600 disabled:opacity-50"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
