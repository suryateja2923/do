import { useState, useEffect, useCallback } from 'react';

/**
 * 1. useDebounce hook
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * 2. usePagination hook
 */
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);
  const resetPage = useCallback(() => setPage(1), []);

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    resetPage,
  };
};

/**
 * 3. useFilters hook
 */
export const useFilters = <T extends Record<string, any>>(initialFilters: T) => {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = useCallback((key: keyof T, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
  };
};

/**
 * 4. useApi hook
 */
export const useApi = <T, Args extends any[]>(
  apiFunc: (...args: Args) => Promise<T>,
  immediate = false,
  ...immediateArgs: Args
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunc(...args);
        setData(response);
        setLoading(false);
        return response;
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        setLoading(false);
        throw err;
      }
    },
    [apiFunc]
  );

  useEffect(() => {
    if (immediate) {
      execute(...immediateArgs);
    }
  }, [immediate]);

  return {
    data,
    loading,
    error,
    execute,
    setData,
  };
};

/**
 * 5. useSearch hook
 */
export const useSearch = <T>(items: T[], keys: (keyof T)[]) => {
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    const q = debouncedQuery.toLowerCase();
    const filtered = items.filter((item) =>
      keys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
    setFilteredItems(filtered);
  }, [debouncedQuery, items]);

  return {
    query,
    setQuery,
    filteredItems,
  };
};
