import React, { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * 1. useApi Hook
 */
export function useApi<T, Args extends any[]>(
  apiFn: (...args: Args) => Promise<T>,
  immediate = false,
  initialArgs?: Args
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFn(...args);
        setData(response);
        return response;
      } catch (err: any) {
        const errMsg = err?.message || 'An error occurred';
        setError(errMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  useEffect(() => {
    if (immediate) {
      if (initialArgs) {
        execute(...initialArgs);
      } else {
        execute(...([] as unknown as Args));
      }
    }
  }, [immediate, execute, JSON.stringify(initialArgs)]);

  return { data, loading, error, execute, setData };
}

/**
 * 2. useFilters Hook
 */
export function useFilters<F extends Record<string, any>>(initialFilters: F) {
  const [filters, setFilters] = useState<F>(initialFilters);

  const updateFilter = useCallback((key: keyof F, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return { filters, updateFilter, resetFilters, setFilters };
}

/**
 * 3. useSearch Hook
 */
export function useSearch<T>(items: T[], searchKeys: (keyof T)[]) {
  const [query, setQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const lowerQuery = query.toLowerCase();

    return items.filter((item) =>
      searchKeys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lowerQuery);
      })
    );
  }, [items, searchKeys, query]);

  return { query, setQuery, filteredItems };
}

/**
 * 4. useDebounce Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
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
}
