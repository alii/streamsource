import { Router } from 'express';
import { JsonFS } from '../JsonFS';

export const router = Router();

router.all('/', (req, res) => {
  res.json({
    hello: ['world'],
    timestamp: Date.now(),
    method: req.method,
    headers: req.headers,
    isFresh: req.fresh,
    isStale: req.stale,
    isSecure: req.secure,
  });
});

router.get('/streams/:id', (req, res) => {
  const { id } = req.params;
  const stream = JsonFS.find(id);

  if (!stream) {
    return res.status(404).json({
      error: true,
      data: {
        message: 'Could not find stream',
      },
    });
  }

  res.json({
    error: false,
    data: stream,
  });
});

router.post('/streams/:id', (req, res) => {
  const { id } = req.params;

  JsonFS.patch({ id }, req.body);
  res.status(200).end();
});
