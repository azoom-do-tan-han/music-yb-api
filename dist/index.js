"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const youtube_1 = require("./youtube");
const cache = __importStar(require("./cache"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use((0, cors_1.default)({ origin: FRONTEND_ORIGIN }));
app.use(express_1.default.json());
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.get('/api/search', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q)
        return res.status(400).json({ error: 'Missing query parameter q' });
    const cacheKey = `search:${q}`;
    const cached = cache.get(cacheKey);
    if (cached)
        return res.json(cached);
    try {
        const items = await (0, youtube_1.searchVideos)(q);
        const payload = { items };
        cache.set(cacheKey, payload, 1000 * 60 * 5);
        return res.json(payload);
    }
    catch (err) {
        console.error('Search error', err);
        return res.status(500).json({ error: 'Failed to fetch search results' });
    }
});
app.get('/api/trending', async (req, res) => {
    const region = String(req.query.region || 'US').toUpperCase();
    const cacheKey = `trending:${region}`;
    const cached = cache.get(cacheKey);
    if (cached)
        return res.json(cached);
    try {
        const items = await (0, youtube_1.getTrendingVideos)(region);
        const payload = { items };
        cache.set(cacheKey, payload, 1000 * 60 * 5);
        return res.json(payload);
    }
    catch (err) {
        console.error('Trending error', err);
        return res.status(500).json({ error: 'Failed to fetch trending videos' });
    }
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend listening on http://0.0.0.0:${PORT}`);
});
//# sourceMappingURL=index.js.map