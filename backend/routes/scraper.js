const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const Video = require('../models/Video');
const Source = require('../models/Source');

const router = express.Router();

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
};

async function fetchHtml(url) {
  const response = await axios.get(url, {
    headers: BROWSER_HEADERS,
    timeout: 20000,
    maxRedirects: 5,
    responseType: 'text',
  });
  return response.data;
}

function getCreatorFromUrl(url) {
  try {
    const u = new URL(url);
    // xhamster /users/NAME/videos/...
    const m = u.pathname.match(/\/users\/([^/]+)/);
    if (m) return { creator: decodeURIComponent(m[1]), creatorUrl: `https://${u.hostname}/users/${m[1]}/videos` };
  } catch {}
  return { creator: '', creatorUrl: '' };
}

function getPageCreator($, baseUrl) {
  // Try common creator selectors
  const sel = '.video-creator a, .logged-out-video-creator a, .channel-link a, [class*="uploader"] a, [class*="creator"] a';
  const el = $(sel).first();
  if (el.length) {
    const name = el.text().trim();
    const href = el.attr('href') || '';
    if (name && href) {
      const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
      return { creator: name, creatorUrl: fullUrl };
    }
  }
  return null;
}

function extractVideos($, baseUrl) {
  const pageCreator = getPageCreator($, baseUrl);
  const videos = [];

  const pushVideo = (v) => {
    if (videos.some(x => x.url === v.url)) return;
    // Merge page-level creator if available
    if (pageCreator) {
      v.creator = pageCreator.creator;
      v.creatorUrl = pageCreator.creatorUrl;
    } else {
      const fromUrl = getCreatorFromUrl(v.url);
      v.creator = fromUrl.creator;
      v.creatorUrl = fromUrl.creatorUrl;
    }
    videos.push(v);
  };

  $('meta[property="og:video"], meta[property="og:video:url"], meta[name="twitter:player"]').each((_, el) => {
    const videoUrl = $(el).attr('content');
    if (videoUrl) pushVideo({
      url: videoUrl,
      title: $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || $('title').text().trim() || '',
      source: baseUrl,
      thumbnail: $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '',
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
    });
  });

  $('video').each((_, el) => {
    const videoUrl = $(el).attr('src') || $(el).find('source').first().attr('src');
    if (videoUrl && !videoUrl.startsWith('blob:')) pushVideo({
      url: videoUrl.startsWith('http') ? videoUrl : new URL(videoUrl, baseUrl).href,
      title: $(el).attr('title') || $('title').text().trim() || 'Untitled Video',
      source: baseUrl,
      thumbnail: $(el).attr('poster') || '',
      description: $(el).attr('alt') || '',
    });
  });

  $('iframe').each((_, el) => {
    const src = $(el).attr('src') || '';
    const matched = src.match(/(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|pornhub\.com|xhamster\.com|xvideos\.com)/);
    if (matched) pushVideo({
      url: src.startsWith('http') ? src : `https:${src}`,
      title: $(el).attr('title') || $('title').text().trim() || '',
      source: baseUrl,
      thumbnail: $(el).attr('data-thumbnail') || '',
      description: '',
    });
  });

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    const img = $(el).find('img').first();
    const imgSrc = img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || '';
    if (!href || href === '#' || href.startsWith('javascript:')) return;
    const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    if (videos.some(v => v.url === fullUrl)) return;
    const title = $(el).attr('title') || img.attr('alt') || $(el).text().trim();
    if (!title) return;
    const isVideoLink = /watch|video|embed|player|clip|\.mp4|\.webm/i.test(href);
    const hasVideoThumb = /thumb|video|poster|hqdefault|preview/i.test(imgSrc);
    if ((imgSrc && (isVideoLink || hasVideoThumb)) || isVideoLink) {
      pushVideo({ url: fullUrl, title: title.trim(), source: baseUrl, thumbnail: imgSrc, description: '' });
    }
  });

  $('[class*="video"] [class*="thumb"] a, [class*="video"] a[class*="thumb"], [class*="video"] a img[class*="thumb"]').parent().each((_, el) => {
    const href = $(el).attr('href');
    const img = $(el).find('img').first();
    const imgSrc = img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || '';
    const title = $(el).attr('title') || img.attr('alt') || img.attr('title') || '';
    if (!href || !title || href.startsWith('javascript:') || href === '#') return;
    const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    if (videos.some(v => v.url === fullUrl)) return;
    pushVideo({ url: fullUrl, title: title.trim(), source: baseUrl, thumbnail: imgSrc, description: '' });
  });

  // xhamster specific
  $('.video-holder a, .thumb-list a[href*="xhamster"], .xh-paginator-video-item a').each((_, el) => {
    const href = $(el).attr('href');
    const img = $(el).find('img').first();
    const imgSrc = img.attr('src') || img.attr('data-src') || '';
    const title = $(el).attr('title') || img.attr('alt') || '';
    if (!href || !title) return;
    const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    if (videos.some(v => v.url === fullUrl)) return;
    pushVideo({ url: fullUrl, title: title.trim(), source: baseUrl, thumbnail: imgSrc, description: '' });
  });

  $('.video-card a[href*="xhamster"]').each((_, el) => {
    const href = $(el).attr('href');
    const img = $(el).find('img').first();
    const imgSrc = img.attr('src') || img.attr('data-src') || '';
    const title = $(el).attr('title') || img.attr('alt') || '';
    if (!href || !title) return;
    const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    if (videos.some(v => v.url === fullUrl)) return;
    pushVideo({ url: fullUrl, title: title.trim(), source: baseUrl, thumbnail: imgSrc, description: '' });
  });

  $('.xh-grid a[href*="xhamster"]').each((_, el) => {
    const href = $(el).attr('href');
    const img = $(el).find('img').first();
    const imgSrc = img.attr('src') || img.attr('data-src') || '';
    const title = $(el).attr('title') || img.attr('alt') || '';
    if (!href || !title) return;
    const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    if (videos.some(v => v.url === fullUrl)) return;
    pushVideo({ url: fullUrl, title: title.trim(), source: baseUrl, thumbnail: imgSrc, description: '' });
  });

  // xvideos selectors
  $('.thumb-block a, .mozaique .thumb a[href*="xvideos"], .video-thumb a[href*="xvideos"]').each((_, el) => {
    const href = $(el).attr('href');
    const img = $(el).find('img').first();
    const imgSrc = img.attr('src') || img.attr('data-src') || '';
    const title = $(el).attr('title') || img.attr('alt') || '';
    if (!href || !title) return;
    const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    if (videos.some(v => v.url === fullUrl)) return;
    pushVideo({ url: fullUrl, title: title.trim(), source: baseUrl, thumbnail: imgSrc, description: '' });
  });

  // pornhub selectors
  $('.video-wrapper a[href*="pornhub"], .phimage a[href*="pornhub"], .thumbnail-info-wrapper a').each((_, el) => {
    const href = $(el).attr('href');
    const img = $(el).find('img').first();
    const imgSrc = img.attr('src') || img.attr('data-mediumthumb') || img.attr('data-thumb') || img.attr('data-src') || '';
    const title = $(el).attr('title') || img.attr('alt') || '';
    if (!href || !title) return;
    const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    if (videos.some(v => v.url === fullUrl)) return;
    pushVideo({ url: fullUrl, title: title.trim(), source: baseUrl, thumbnail: imgSrc, description: '' });
  });

  return videos;
}

function dedupe(videos) {
  const seen = new Set();
  return videos.filter(v => {
    const key = v.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function saveVideos(videos, sourceUrl) {
  if (videos.length === 0) return;
  try {
    const docs = videos.map(v => ({
      title: v.title || 'Untitled',
      url: v.url,
      source: sourceUrl,
      thumbnail: v.thumbnail || '',
      description: v.description || '',
      creator: v.creator || '',
      creatorUrl: v.creatorUrl || '',
      status: 'approved',
    }));
    await Video.insertMany(docs, { ordered: false });
  } catch (dbErr) {
    // ignore duplicate key errors
  }
}

// POST /api/scrape — scrape a single URL
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    let html;
    try {
      html = await fetchHtml(url);
    } catch (fetchErr) {
      if (fetchErr.code === 'ECONNABORTED') return res.status(504).json({ error: 'Request timed out.' });
      if (fetchErr.response) return res.status(502).json({ error: `Site returned status ${fetchErr.response.status}.` });
      return res.status(502).json({ error: `Failed to fetch URL: ${fetchErr.message}` });
    }

    if (!html || html.length < 100) {
      return res.status(502).json({ error: 'Site returned empty or very short response.' });
    }

    const $ = cheerio.load(html);
    let videos = dedupe(extractVideos($, url));
    await saveVideos(videos, url);
    res.json({ videos, count: videos.length });
  } catch (error) {
    console.error('Scraper error:', error.message);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// GET /api/scrape/auto — scrape all active sources
router.get('/auto', async (req, res) => {
  try {
    const sources = await Source.find({ active: true });
    if (sources.length === 0) {
      return res.json({ videos: [], count: 0, message: 'No active sources configured' });
    }

    for (const source of sources) {
      try {
        const html = await fetchHtml(source.url);
        if (!html || html.length < 100) continue;
        const $ = cheerio.load(html);
        let videos = dedupe(extractVideos($, source.url));
        await saveVideos(videos, source.url);
        await Source.findByIdAndUpdate(source._id, { lastScraped: new Date() });
      } catch (err) {
        console.error(`Failed to scrape source ${source.url}:`, err.message);
      }
    }

    // Return latest 50 DB videos with _id
    const latest = await Video.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('category', 'name slug');

    res.json({ videos: latest, count: latest.length });
  } catch (error) {
    console.error('Auto-scrape error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scrape/search?q=... — search xhamster and return results
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });

    const searchUrl = `https://xhamster.com/search?q=${encodeURIComponent(q)}`;

    let html;
    try {
      html = await fetchHtml(searchUrl);
    } catch (fetchErr) {
      return res.status(502).json({ error: 'Failed to search xhamster: ' + fetchErr.message });
    }

    if (!html || html.length < 100) {
      return res.status(502).json({ error: 'xhamster returned empty response' });
    }

    const $$ = cheerio.load(html);
    const videos = dedupe(extractVideos($$, searchUrl));
    res.json({ videos, count: videos.length, query: q });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.fetchHtml = fetchHtml;
module.exports.extractVideos = extractVideos;
module.exports.dedupe = dedupe;

