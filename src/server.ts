import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';

const fastify = Fastify({
  logger: true,
});

// 1) Proxy /api/os → localhost:3001
fastify.register(fastifyHttpProxy, {
  upstream: 'http://localhost:3002',
  prefix: '/api/os', // only this path
  rewritePrefix: '/api/os', // keep same path on upstream (optional; can omit)
});

// 2) Proxy everything else → localhost:3002
fastify.register(fastifyHttpProxy, {
  upstream: 'http://localhost:3001',
  prefix: '/', // catch-all
  // You can tweak this if localhost:3002 expects paths without leading `/`
  // rewritePrefix: "/",
});

const start = async () => {
  try {
    await fastify.listen({ port: 3003, host: '0.0.0.0' });
    console.log('Proxy server running on http://localhost:3003');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
