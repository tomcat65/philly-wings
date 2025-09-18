const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from dist
app.use('/assets', express.static(path.join(__dirname, 'dist/assets')));
app.use('/images', express.static(path.join(__dirname, 'dist/images')));
app.use('/data', express.static(path.join(__dirname, 'dist/data')));

// Serve admin pages directly
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/admin/index.html'));
});

app.get('/admin/platform-menu.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/admin/platform-menu.html'));
});

// Serve main app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Platform Menu Manager running at http://localhost:${PORT}/admin/platform-menu.html`);
});