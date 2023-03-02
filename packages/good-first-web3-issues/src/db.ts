import { createClient } from 'redis';

export const db = createClient();

db.on('error', (err: any) => console.log('Redis Client Error', err));
db.connect();