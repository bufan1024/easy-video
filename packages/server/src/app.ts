import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRoutes } from './routes/index';
import { ensureDataDir } from './storage';

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: '*' });
  await registerRoutes(app);
  await ensureDataDir();

  const port = 3001;
  await app.listen({ port, host: 'localhost' });
  console.log(`🚀 Server running at http://localhost:${port}`);
}

start().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});