/**
 * PropertySortIndicator Component
 * Banner showing current sort state with reset option
 */

interface PropertySortIndicatorProps {
  sortLabel: string;
  onReset: () => void;
}

export const PropertySortIndicator = ({
  sortLabel,
  onReset
}: PropertySortIndicatorProps) => {
  return (
    <>
      {/* Mobile: Compact version */}
      <div className="sm:hidden bg-primary-light border-b border-primary/20 px-3 py-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-700 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span className="font-semibold text-primary truncate">
              {sortLabel}
            </span>
          </span>
          <button
            onClick={onReset}
            className="flex-shrink-0 p-1 text-primary hover:text-primary-hover hover:bg-primary/10 rounded transition-colors"
            title="Restablecer orden"
            aria-label="Restablecer orden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop: Full version */}
      <div className="hidden sm:block bg-primary-light border-b border-primary/20 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span className="text-gray-700 font-medium">
              Ordenado por:
            </span>
            <span className="text-primary font-semibold">
              {sortLabel}
            </span>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:text-primary-hover hover:bg-primary/10 rounded-lg transition-colors font-medium"
            title="Volver al orden predeterminado (Fecha, más reciente primero)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Restablecer orden
          </button>
        </div>
      </div>
    </>
  );
};
