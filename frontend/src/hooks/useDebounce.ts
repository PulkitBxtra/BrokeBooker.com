import * as React from "react";

export function useDebounce<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const h = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(h);
  }, [value, delayMs]);
  return debounced;
}
