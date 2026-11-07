import { useCallback, useEffect, useRef, useState } from 'react';

export interface Resource<T> {
  data: T | undefined;
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
}

/**
 * Loads data when the page opens and whenever `deps` change. An answer that arrives after a newer
 * request was made is dropped, so a slow first page cannot overwrite the second.
 */
export function useResource<T>(load: () => Promise<T>, deps: readonly unknown[]): Resource<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const latest = useRef(0);
  const loader = useRef(load);
  loader.current = load;

  const reload = useCallback(async () => {
    const request = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const result = await loader.current();
      if (request === latest.current) setData(result);
    } catch (failure) {
      if (request === latest.current) setError(failure);
    } finally {
      if (request === latest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller lists what the loader depends on
  }, deps);

  return { data, loading, error, reload };
}
