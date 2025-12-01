const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const mediaRoutes = require('./routes/media');
const apiKeyRoutes = require('./routes/apiKeys');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', postRoutes);
app.use('/media', mediaRoutes);
app.use('/api-keys', apiKeyRoutes);
app.use('/analytics', require('./routes/analytics'));
app.use('/ai', require('./routes/ai'));

app.get('/', (req, res) => {
  res.send('Headless CMS API is running');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
