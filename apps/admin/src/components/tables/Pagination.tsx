"use client";
import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= itemsPerPage)) {
    return null;
  }

  // Calculate page number range to display (e.g. up to 5 surrounding pages)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const startItem = totalItems !== undefined ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const endItem =
    totalItems !== undefined
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : undefined;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
      {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{startItem}</span> to{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{endItem}</span> of{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{totalItems}</span> results
        </p>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Page <span className="font-semibold text-gray-700 dark:text-gray-200">{currentPage}</span> of{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{totalPages}</span>
        </p>
      )}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] transition"
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                  currentPage === page
                    ? "bg-brand-500 text-white shadow-theme-xs"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={`dots-${idx}`} className="px-1.5 text-xs text-gray-400">
                ...
              </span>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
