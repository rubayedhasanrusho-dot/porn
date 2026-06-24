const express = require('express');
const jwt = require('jsonwebtoken');
const Source = require('../models/Source');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/', async (req, res) => {
  try {
    const sources = await Source.find().sort({ createdAt: -1 });
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const source = await Source.create(req.body);
    res.status(201).json(source);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const source = await Source.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!source) return res.status(404).json({ error: 'Source not found' });
    res.json(source);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Source.findByIdAndDelete(req.params.id);
    res.json({ message: 'Source deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

