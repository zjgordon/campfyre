import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'web',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Health text endpoint
app.get('/health.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('ok');
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Campfyre</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <h1>Campfyre</h1>
        <p>Gather, play, and tell your story — anywhere.</p>
        <p>Web service is running!</p>
      </body>
    </html>
  `);
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Web server running on port ${port}`);
});

export default app;
