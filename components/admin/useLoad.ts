"use client";

import { useCallback, useEffect, useState } from "react";
import { useCms } from "@/components/admin/CmsProvider";

/** Loads async data, reloading when deps or the global revision counter change. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const { revision } = useCms();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // The dependency list is supplied by the caller (fixed length per call site).
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const run = useCallback(fn, deps);

  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading external data
    setLoading(true);
    run()
      .then((d) => {
        if (!alive) return;
        // Wrapped so a loaded function is stored, not treated as a state updater.
        setData(() => d);
        setError(null);
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [run, revision, tick]);

  return { data, error, loading, reload: () => setTick((t) => t + 1), setData };
}
