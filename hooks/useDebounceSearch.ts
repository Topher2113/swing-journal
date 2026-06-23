import { useEffect, useRef, useState } from 'react';

export function useDebounceSearch<T>(
  onSearch: (query: string) => Promise<T[]>,
  delay = 400
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (text.trim()) {
      timerRef.current = setTimeout(async () => {
        setResults(await onSearch(text));
      }, delay);
    } else {
      setResults([]);
    }
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { query, results, setResults, setQuery, handleChange };
}
