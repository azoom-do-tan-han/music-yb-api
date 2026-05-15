import fs from 'fs';
import path from 'path';
import { VideoItem } from './youtube';

const DATA_FILE = path.resolve(__dirname, '../../data/favorites.json');

export function readFavorites(): VideoItem[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function writeFavorites(list: VideoItem[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

export function addFavorite(video: VideoItem): VideoItem[] {
  const list = readFavorites();
  if (!list.find(v => v.id === video.id)) {
    list.push(video);
    writeFavorites(list);
  }
  return list;
}

export function removeFavorite(id: string): VideoItem[] {
  const list = readFavorites().filter(v => v.id !== id);
  writeFavorites(list);
  return list;
}
