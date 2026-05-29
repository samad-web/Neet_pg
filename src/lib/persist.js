/* Tiny localStorage-backed state hook. SSR-safe (no-op if window absent). */
import { useState, useEffect, useRef } from "react";

const PREFIX = "ardent-mds:";

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  try {
    if (value === undefined) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled — silently ignore.
  }
}

export function usePersistentState(key, initial, { serialize, deserialize } = {}) {
  const [value, setValue] = useState(() => {
    const raw = read(key, undefined);
    if (raw === undefined) return typeof initial === "function" ? initial() : initial;
    return deserialize ? deserialize(raw) : raw;
  });
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    write(key, serialize ? serialize(value) : value);
  }, [key, value]);
  return [value, setValue];
}

export function hasPersistedValue(key) {
  return read(key, undefined) !== undefined;
}

export function clearPersisted(key) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PREFIX + key);
}
