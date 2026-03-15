import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

/* ─── Spinner ───────────────────────────────────────────────── */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-2' };
  return (
    <div className={`${sizes[size]} border-gray-200 border-t-primary-600 rounded-full animate-spin ${className}`} />
  );
}

/* ─── Pagination ────────────────────────────────────────────── */
export function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;

  const delta = 2;
  const range = [];
  for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
    range.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>

      {range[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">1</button>
          {range[0] > 2 && <span className="text-gray-400 px-1">…</span>}
        </>
      )}

      {range.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 text-sm rounded-xl transition-colors ${p === page ? 'bg-primary-600 text-white border border-primary-600 font-semibold' : 'border border-gray-200 hover:bg-gray-50'}`}
        >
          {p}
        </button>
      ))}

      {range[range.length - 1] < pages && (
        <>
          {range[range.length - 1] < pages - 1 && <span className="text-gray-400 px-1">…</span>}
          <button onClick={() => onPageChange(pages)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">{pages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}

/* ─── StarRating ────────────────────────────────────────────── */
export function StarRating({ rating = 0, max = 5, size = 14 }) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    const filled = i <= Math.floor(rating);
    const partial = !filled && i - 1 < rating && rating < i;
    const pct = partial ? Math.round((rating - Math.floor(rating)) * 100) : 0;

    stars.push(
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
        {partial && (
          <defs>
            <linearGradient id={`partial-${i}-${size}`}>
              <stop offset={`${pct}%`} stopColor="#f59e0b" />
              <stop offset={`${pct}%`} stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
        )}
        <polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          fill={filled ? '#f59e0b' : partial ? `url(#partial-${i}-${size})` : '#e5e7eb'}
          stroke="none"
        />
      </svg>
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

/* ─── EmptyState ────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, message, actionLabel, actionHref }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {Icon
        ? <Icon size={56} className="text-gray-200 mb-4" />
        : <ShoppingBag size={56} className="text-gray-200 mb-4" />
      }
      <h3 className="text-lg font-bold text-gray-700">{title}</h3>
      {message && <p className="text-gray-400 text-sm mt-1 max-w-xs">{message}</p>}
      {actionLabel && actionHref && (
        <button onClick={() => navigate(actionHref)} className="btn-primary mt-5 px-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ─── ProductSkeleton ───────────────────────────────────────── */
export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="aspect-square bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-gray-100 rounded-full w-16 animate-pulse" />
        <div className="h-3.5 bg-gray-100 rounded-full w-full animate-pulse" />
        <div className="h-3.5 bg-gray-100 rounded-full w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded-full w-20 animate-pulse mt-1" />
      </div>
    </div>
  );
}
