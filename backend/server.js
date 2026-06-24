const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectDatabases } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend in production
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/scrape', require('./routes/scraper'));
app.use('/api/sources', require('./routes/sources'));
app.use('/api/admin', require('./routes/admin'));

// SPA fallback: serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

connectDatabases()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
