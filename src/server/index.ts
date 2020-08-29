import * as express from 'express';
import { router as v1 } from './api';
import { JsonFS } from './JsonFS';
import * as path from 'path';

const app = express();
const apis: Record<string, express.Router> = { v1 } as const;

const files = {
  index: path.join(__dirname, 'index.html'),
  view: path.join(__dirname, 'view.html'),
} as const;

app.use('/api', apis.v1);
app.use('/v1', apis.v1);

app.use(express.static(path.join(__dirname, 'client')));

app.listen(process.env.PORT ?? 8000, () => console.log('[BACKEND]: Ready'));

JsonFS.create({
  elements: [],
  height: Math.ceil(Math.random() * 1000),
  width: Math.ceil(Math.random() * 1000),
});
