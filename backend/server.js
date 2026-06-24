const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDatabases } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/scrape', require('./routes/scraper'));
app.use('/api/sources', require('./routes/sources'));
app.use('/api/admin', require('./routes/admin'));

connectDatabases()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });