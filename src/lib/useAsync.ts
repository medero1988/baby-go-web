import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: readonly unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fnRef.current());
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const depsKey = deps.map(String).join('\0');

  useEffect(() => {
    void reload();
  }, [reload, depsKey]);

  return { data, error, loading, reload, setData };
}
