import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchVideos, getTrendingVideos } from './youtube';
import * as cache from './cache';
import { readFavorites, addFavorite, removeFavorite } from './favorites';

dotenv.config();

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  const cacheKey = `search:${q}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const items = await searchVideos(q);
    const payload = { items };
    cache.set(cacheKey, payload, 1000 * 60 * 5); // cache 5 minutes
    return res.json(payload);
  } catch (err) {
    console.error('Search error', err);
    return res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

app.get('/api/trending', async (req, res) => {
  const region = String(req.query.region || 'US').toUpperCase();
  const cacheKey = `trending:${region}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const items = await getTrendingVideos(region);
    const payload = { items };
    cache.set(cacheKey, payload, 1000 * 60 * 5); // cache 5 minutes
    return res.json(payload);
  } catch (err) {
    console.error('Trending error', err);
    return res.status(500).json({ error: 'Failed to fetch trending videos' });
  }
});

app.get('/api/favorites', (_req, res) => {
  res.json(readFavorites());
});

app.post('/api/favorites', (req, res) => {
  const { id, title, thumbnail, channelTitle } = req.body;
  if (!id || !title) return res.status(400).json({ error: 'Missing required fields' });
  const updated = addFavorite({ id, title, thumbnail, channelTitle });
  return res.json(updated);
});

app.delete('/api/favorites/:id', (req, res) => {
  const updated = removeFavorite(req.params.id);
  res.json(updated);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${PORT}`);
});
