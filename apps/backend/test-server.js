const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 9001;

app.use(cors());
app.use(express.json());

app.get('/api/config', (req, res) => {
  console.log('Config request received');
  res.json({ 
    webSocketUrl: `ws://localhost:${PORT}`,
    apiUrl: `http://localhost:${PORT}` 
  });
});

app.get('/api/projects', (req, res) => {
  console.log('Projects request received');
  res.json({ projects: [] });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});