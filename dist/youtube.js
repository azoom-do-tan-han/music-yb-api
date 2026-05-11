"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchVideos = searchVideos;
exports.getTrendingVideos = getTrendingVideos;
const axios_1 = __importDefault(require("axios"));
function getApiKey() {
    return process.env.YOUTUBE_API_KEY;
}
async function safeGet(url, params) {
    const res = await axios_1.default.get(url, { params });
    return res.data;
}
async function searchVideos(q, maxResults = 25) {
    const API_KEY = getApiKey();
    if (!API_KEY)
        throw new Error('Missing YOUTUBE_API_KEY');
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
    const items = (data.items || []).map((it) => {
        const vid = it.id?.videoId || it.id;
        const snip = it.snippet || {};
        const thumb = (snip.thumbnails && (snip.thumbnails.high?.url || snip.thumbnails.medium?.url || snip.thumbnails.default?.url)) ||
            '';
        return {
            id: vid,
            title: snip.title || '',
            thumbnail: thumb,
            channelTitle: snip.channelTitle || ''
        };
    }).filter((i) => Boolean(i.id));
    return items;
}
async function getTrendingVideos(region = 'US', maxResults = 25) {
    const API_KEY = getApiKey();
    if (!API_KEY)
        throw new Error('Missing YOUTUBE_API_KEY');
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
    const items = (data.items || []).map((it) => {
        const snip = it.snippet || {};
        const thumb = (snip.thumbnails && (snip.thumbnails.high?.url || snip.thumbnails.medium?.url || snip.thumbnails.default?.url)) ||
            '';
        return {
            id: it.id,
            title: snip.title || '',
            thumbnail: thumb,
            channelTitle: snip.channelTitle || ''
        };
    });
    return items;
}
//# sourceMappingURL=youtube.js.map