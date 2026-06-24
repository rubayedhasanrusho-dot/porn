const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cheerio = require('cheerio');
const Video = require('../models/Video');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(header.split(' ')[1], JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

const requireAuth = [auth];

router.get('/', async (req, res) => {
  try {
    const { search, category, creator, sort, page = 1, limit = 30 } = req.query;
    const query = { status: 'approved' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (creator) query.creator = { $regex: creator, $options: 'i' };

    let sortOption;
    if (sort === 'trending') {
      // YouTube-style: recent high-views videos ranked by views/age
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: sevenDaysAgo };
      sortOption = { views: -1, createdAt: -1 };
    } else if (sort === 'popular') {
      sortOption = { views: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const total = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('category', 'name slug');

    res.json({ videos, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getCreatorFromUrl(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/users\/([^/]+)/);
    if (m) return { creator: decodeURIComponent(m[1]), creatorUrl: `https://${u.hostname}/users/${m[1]}/videos` };
  } catch {}
  return { creator: '', creatorUrl: '' };
}

// Merged search: DB + xhamster live
router.get('/merged-search', async (req, res) => {
  try {
    const { q, page = 1, limit = 24 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    // 1. Search local DB
    const dbQuery = {
      status: 'approved',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
    };
    const dbVideos = await Video.find(dbQuery)
      .sort({ views: -1 })
      .limit(Number(limit))
      .populate('category', 'name slug');

    const dbMap = new Set(dbVideos.map(v => v.url));
    let liveVideos = [];

    // 2. Scrape xhamster for more results
    try {
      const searchUrl = `https://xhamster.com/search?q=${encodeURIComponent(q)}`;
      const resp = await axios.get(searchUrl, { headers: BROWSER_HEADERS, timeout: 15000 });
      if (resp.data && resp.data.length > 100) {
        const $ = cheerio.load(resp.data);
        // extractVideos from scraper module
        const { extractVideos, dedupe } = require('./scraper');
        liveVideos = dedupe(extractVideos($, searchUrl))
          .filter(v => !dbMap.has(v.url))
          .map(v => ({ ...v, _id: null, _source: 'xhamster' }));
      }
    } catch {}

    // 3. Merge: DB first, then live results
    const merged = [
      ...dbVideos.map(v => ({ ...v.toObject(), _source: 'db' })),
      ...liveVideos,
    ];

    res.json({ videos: merged, total: merged.length, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    ).populate('category', 'name slug');
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', ...requireAuth, async (req, res) => {
  try {
    const video = await Video.create({ ...req.body, uploadedBy: req.user.id });
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

