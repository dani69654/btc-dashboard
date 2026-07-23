import { useEffect, useRef } from "react";

/**
 * Runs `callback` every `delayMs`. Pass `null` to pause.
 * Always calls the latest callback, without resetting the timer on every render.
 */
export function useInterval(callback: () => void, delayMs: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => savedCallback.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}
