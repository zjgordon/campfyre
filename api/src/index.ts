import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Ping endpoint
app.get('/ping', (req, res) => {
  res.json({
    ok: true,
    msg: 'pong',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Campfyre API',
    version: '0.1.0',
    status: 'running',
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`API server running on port ${port}`);
});

export default app;
