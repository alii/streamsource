import { Stream } from '../interfaces/Stream';
import { JsonFS } from '../JsonFS';
import { Router } from 'express';
import { fall } from '../util';

export const router = Router();

type ReqIDParams = { id: string };

router.all('/', (req, res) => {
  res.json({
    timestamp: Date.now(),
    method: req.method,
    headers: req.headers,
    isFresh: req.fresh,
    isStale: req.stale,
    isSecure: req.secure,
    protocol: req.protocol,
  });
});

router.get(
  '/streams/:id',
  fall<ReqIDParams, Stream>((req, res) => {
    const { id } = req.params;
    const stream = JsonFS.find(id);

    if (!stream) {
      return res.status(404).json({
        error: true,
        content: {
          message: 'Could not find stream',
        },
      });
    }

    res.json({
      error: false,
      content: stream,
    });
  }),
);

router.put(
  '/streams/:id',
  fall<ReqIDParams>((req, res) => {
    const { id } = req.params;

    JsonFS.patch({ id }, req.body);

    res.json({
      error: false,
      content: { message: 'Successfully updated' },
    });
  }),
);

router.delete(
  '/streams/:id',
  fall<ReqIDParams>((req, res) => {
    const { id } = req.params;

    JsonFS.delete(id);

    res.json({
      error: false,
      content: { message: 'Success' },
    });
  }),
);
