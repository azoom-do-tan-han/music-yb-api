"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = set;
exports.get = get;
exports.del = del;
exports.clear = clear;
const store = new Map();
function set(key, value, ttlMs) {
    const expiresAt = ttlMs ? Date.now() + ttlMs : null;
    store.set(key, { value, expiresAt });
}
function get(key) {
    const entry = store.get(key);
    if (!entry)
        return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.value;
}
function del(key) {
    store.delete(key);
}
function clear() {
    store.clear();
}
setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) {
        if (v.expiresAt && now > v.expiresAt)
            store.delete(k);
    }
}, 1000 * 60);
//# sourceMappingURL=cache.js.map