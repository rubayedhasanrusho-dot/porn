const express = require('express');
const jwt = require('jsonwebtoken');
const Video = require('../models/Video');
const User = require('../models/User');
const Category = require('../models/Category');
const Ad = require('../models/Ad');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    const totalViews = await Video.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    const totalUsers = await User.countDocuments();
    const totalCategories = await Category.countDocuments();
    const pendingVideos = await Video.countDocuments({ status: 'pending' });

    const topVideos = await Video.find().sort({ views: -1 }).limit(10).populate('category', 'name slug');

    res.json({
      totalVideos,
      totalViews: totalViews[0]?.total || 0,
      totalUsers,
      totalCategories,
      pendingVideos,
      topVideos,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/videos', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 30, status } = req.query;
    const query = status ? { status } : {};
    const total = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('category', 'name slug');
    res.json({ videos, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/ads', requireAdmin, async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ads', requireAdmin, async (req, res) => {
  try {
    const ad = await Ad.create(req.body);
    res.status(201).json(ad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/ads/:id', requireAdmin, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    res.json(ad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/ads/:id', requireAdmin, async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ad deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

