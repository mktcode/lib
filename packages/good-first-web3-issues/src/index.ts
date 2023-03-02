import express from 'express';
import { db } from './db';
import { sync } from './sync';

const app = express();

app.get('/', async (_req, res) => {
  const cached = await db.hGetAll('orgs');

  if (cached) {
    Object.keys(cached).forEach((key) => {
      cached[key] = JSON.parse(cached[key]);
    });
  }

  res.send(cached || {});
});

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000`)
});

sync();
setInterval(sync, 60 * 1e3);