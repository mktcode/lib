import express from 'express';

declare function sync(): Promise<void>;

declare const app: ReturnType<typeof express>;

export { app, sync };
