import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { gemmy } from './gemmy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Available models
const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview',
];

// GET /api/models
app.get('/api/models', (req, res) => {
  res.json({ models: MODELS });
});

// GET /api/token-status
app.get('/api/token-status', (req, res) => {
  res.json(gemmy.getTokenStatus());
});

// POST /api/rotate-token
app.post('/api/rotate-token', async (req, res) => {
  try {
    const result = await gemmy.rotateToken();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, history, media, model } = req.body;
    const result = await gemmy.chat(prompt, history || [], media || null, model || null);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// GET /api/chat/stream?prompt=...&model=... (SSE)
app.get('/api/chat/stream', async (req, res) => {
  const { prompt, model } = req.query;
  const history = req.query.history ? JSON.parse(req.query.history) : [];

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const stream = gemmy.chatStream(prompt, history, model || null);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      if (chunk.done) break;
    }
    res.write('event: end\ndata: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message, done: true })}\n\n`);
    res.end();
  }
});

// POST /api/generate-image
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, msg: 'Prompt is required' });
    }
    const result = await gemmy.generateImage(prompt, options || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// POST /api/chat-with-image
app.post('/api/chat-with-image', async (req, res) => {
  try {
    const { prompt, history, imageBase64, mimeType, model } = req.body;
    const modelToUse = model || 'gemini-2.5-flash-lite';

    // Save image temporarily to disk so the existing toBase64 logic works
    const fs = await import('fs');
    const tmpPath = `/tmp/gemmy_upload_${Date.now()}.${mimeType?.includes('png') ? 'png' : 'jpg'}`;
    fs.writeFileSync(tmpPath, Buffer.from(imageBase64, 'base64'));

    const result = await gemmy.chat(prompt, history || [], tmpPath, modelToUse);

    // Cleanup temp file
    try { fs.unlinkSync(tmpPath); } catch (e) {}

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Gemmy Web running at http://localhost:${PORT}`);
  console.log(`📋 Models: ${MODELS.join(', ')}`);
});
