/**
 * UserTable Component
 * Displays users in a table layout (similar to PropertyTable but simplified)
 * Optimized with React.memo and useMemo for better performance
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import { LoadingSpinner, Pagination } from '@/components/ui';
import { UserTableRow } from './UserTableRow';
import { UserTableHeader } from './UserTableHeader';

interface UserTableProps {
  onEditUser: (userId: number) => void;
}

export const UserTable = ({ onEditUser }: UserTableProps) => {
  // Get state from Zustand store
  const {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    perPage,
    loadUsers,
    setPage,
    setPerPage
  } = useUserStore();

  const [initialLoad, setInitialLoad] = useState(true);

  // Ref to table container for scrolling
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Load users on mount and when pagination changes
  useEffect(() => {
    loadUsers().finally(() => setInitialLoad(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage]);

  const handlePageChange = useCallback((page: number) => {
    setPage(page);

    // Scroll to top after page change
    requestAnimationFrame(() => {
      if (tableContainerRef.current) {
        const scrollableParent = tableContainerRef.current.closest('.overflow-auto');

        if (scrollableParent) {
          scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }, [setPage]);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
  }, [setPerPage]);

  // Loading state on initial load
  if (initialLoad && loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando usuarios..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-danger-light border border-danger rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-danger mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-base font-semibold text-danger mb-2">Error al cargar usuarios</h3>
        <p className="text-sm text-danger-dark">{error}</p>
        <button
          onClick={() => loadUsers()}
          className="mt-4 px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>

        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No hay usuarios disponibles
        </h3>
        <p className="text-sm text-gray-500">
          No se encontraron usuarios en el sistema
        </p>
      </div>
    );
  }

  return (
    <div ref={tableContainerRef} className="h-full flex flex-col">
      {/* Table Container - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto sm:px-0">
        <table className="w-full">
          <UserTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onEditUser={onEditUser}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Fixed at bottom */}
      {total > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-2.5 sm:px-6 sm:py-4 bg-gray-50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            perPage={perPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            itemLabel="usuarios"
            perPageOptions={[10, 20]}
          />
        </div>
      )}

      {/* Loading Overlay */}
      {loading && !initialLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      )}
    </div>
  );
};
