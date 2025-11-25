/* eslint-disable no-console */
/* eslint-disable no-undef */
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import bodyParser from 'body-parser';

const _log = (...args: any[]) => console.log('[mock agent]', ...args);

// Manage timeouts for graceful shutdown
const timeouts: any[] = [];
const _clearTimeout = (t: any) => {
  clearTimeout(t);
  const index = timeouts.indexOf(t);

  if (index !== -1) {
    timeouts.splice(index, 1);
  }
};
const _waitFor = (ms: number) => new Promise((resolve) => {
  timeouts.push(setTimeout(resolve, ms));
});

process.on('SIGINT', () => {
  _log('Shutting down...');
  timeouts.forEach(_clearTimeout);
  process.exit();
});

interface MessageRequest {
  content: string;
  chunkSize?: number;
}

const PORT = 8000;
const WS_PATH = '/ws/agent';

const app = express();

app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocketServer({
  server,
  path: WS_PATH
});

// broadcast helper
function broadcast(obj: any) {
  const data = JSON.stringify(obj);

  for (const c of wss.clients) {
    if (c.readyState === c.OPEN) {
      c.send(data);
    }
  }
}

// control API: push arbitrary payload to all connected WS clients
app.post('/control/push', (req, res) => {
  const payload = req.body || {};

  broadcast(payload);
  res.json({
    ok:   true,
    sent: payload
  });
});

// Enqueue items for next "send" action
const queue: any[] = [];

app.post('/control/enqueue', (req, res) => {
  const payload = req.body || {};

  _log('enqueuing response for sending:', req.body);

  queue.push(payload);
  res.json({
    ok:          true,
    queueLength: queue.length
  });
});

// Clear the queue
app.post('/control/clear-queue', (req, res) => {
  queue.length = 0;
  res.json({ ok: true });
});

wss.on('connection', (ws) => {
  _log('Client connected');

  ws.on('message', async(raw) => {
    try {
      const msg = JSON.parse(String(raw));

      _log('Received message:', msg);

      // Simulate agent processing delay
      await _waitFor(1000);

      // Stop processing if socket is no longer open
      if (ws.readyState !== ws.OPEN) {
        _log('Aborting message handling: socket not open');

        return;
      }

      // If tests enqueued responses for the next "send", deliver them now (in order)
      if (queue.length) {
        const nextItem = queue.shift() as MessageRequest;

        _log('dequeued response for sending:', nextItem);

        const content = nextItem.content || '';
        const chunkSize = nextItem.chunkSize || 20;

        ws.send('<message>');

        for (let i = 0; i < content.length; i += chunkSize) {
          const chunk = content.slice(i, i + chunkSize);

          ws.send(chunk);
          // Simulate slight delay between chunks
          await _waitFor(100);
        }

        ws.send('</message>');
      }
    } catch (e) {
      console.error('[mock agent] Invalid message received', e);
    }
  });

  ws.on('close', () => {
    queue.length = 0;
    timeouts.forEach(_clearTimeout);
    _log('Client disconnected');
  });
});

server.listen(PORT, () => {
  _log(`WS connection open at:   ws://localhost:${ PORT }${ WS_PATH }`);
  _log(`Control API available at: http://localhost:${ PORT }/control`);
});