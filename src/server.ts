import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true,
});

// Enable CORS for all routes
fastify.register(cors, {
  origin: '*', // allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'],
  credentials: true,
});

// Common list of HTTP methods WITHOUT OPTIONS

// 1) Proxy /api/os** → localhost:3001
fastify.register(fastifyHttpProxy, {
  upstream: 'https://revest-orders.onrender.com',
  prefix: '/api/os', // matches /api/os and subpaths
  rewritePrefix: '/api/os', // keep same path on upstream
  httpMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'], // IMPORTANT: no OPTIONS here
});

// 2) Proxy everything else → localhost:3002
fastify.register(fastifyHttpProxy, {
  upstream: 'https://revest-products.onrender.com',
  prefix: '/', // catch-all
  httpMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'], // IMPORTANT: no OPTIONS here either
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
