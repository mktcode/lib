import express from 'express';
import { db } from './db';
import { sync } from './sync';

const app: ReturnType<typeof express> = express();

app.get('/', async (_req, res) => {
  const cached = await db.hGetAll('orgs');

  if (cached) {
    Object.keys(cached).forEach((key) => {
      cached[key] = JSON.parse(cached[key]);
    });
  }

  res.send(cached || {});
});

export {
  app,
  sync,
}