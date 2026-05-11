type CacheEntry = {
  value: any;
  expiresAt: number | null;
};

const store = new Map<string, CacheEntry>();

export function set(key: string, value: any, ttlMs?: number) {
  const expiresAt = ttlMs ? Date.now() + ttlMs : null;
  store.set(key, { value, expiresAt });
}

export function get<T = any>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function del(key: string) {
  store.delete(key);
}

export function clear() {
  store.clear();
}

// periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.expiresAt && now > v.expiresAt) store.delete(k);
  }
}, 1000 * 60);