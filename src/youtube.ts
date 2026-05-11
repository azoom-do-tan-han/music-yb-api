import axios from 'axios';

export type VideoItem = {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
};

function getApiKey(): string | undefined {
  return process.env.YOUTUBE_API_KEY;
}

async function safeGet(url: string, params: Record<string, any>) {
  const res = await axios.get(url, { params });
  return res.data;
}

export async function searchVideos(q: string, maxResults = 25): Promise<VideoItem[]> {
  const API_KEY = getApiKey();
  if (!API_KEY) throw new Error('Missing YOUTUBE_API_KEY');
  const url = 'https://www.googleapis.com/youtube/v3/search';
  const params = {
    part: 'snippet',
    q,
    type: 'video',
    maxResults,
    key: API_KEY,
    videoCategoryId: '10'
  };

  const data = await safeGet(url, params);
  const items = (data.items || []).map((it: any) => {
    const vid = it.id?.videoId || it.id;
    const snip = it.snippet || {};
    const thumb =
      (snip.thumbnails && (snip.thumbnails.high?.url || snip.thumbnails.medium?.url || snip.thumbnails.default?.url)) ||
      '';
    return {
      id: vid,
      title: snip.title || '',
      thumbnail: thumb,
      channelTitle: snip.channelTitle || ''
    } as VideoItem;
  }).filter((i: VideoItem) => Boolean(i.id));
  return items;
}

export async function getTrendingVideos(region = 'US', maxResults = 25): Promise<VideoItem[]> {
  const API_KEY = getApiKey();
  if (!API_KEY) throw new Error('Missing YOUTUBE_API_KEY');
  const url = 'https://www.googleapis.com/youtube/v3/videos';
  const params = {
    part: 'snippet',
    chart: 'mostPopular',
    regionCode: region,
    videoCategoryId: '10',
    maxResults,
    key: API_KEY
  };

  const data = await safeGet(url, params);
  const items = (data.items || []).map((it: any) => {
    const snip = it.snippet || {};
    const thumb =
      (snip.thumbnails && (snip.thumbnails.high?.url || snip.thumbnails.medium?.url || snip.thumbnails.default?.url)) ||
      '';
    return {
      id: it.id,
      title: snip.title || '',
      thumbnail: thumb,
      channelTitle: snip.channelTitle || ''
    } as VideoItem;
  });
  return items;
}