import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import cors from "cors";
import { Eureka } from 'eureka-js-client';

dotenv.config();

const EUREKA_HOST = process.env.EUREKA_HOST || 'eureka';
const EUREKA_PORT = process.env.EUREKA_PORT || 8761;
const EUREKA_USER = process.env.EUREKA_USER || 'admin';
const EUREKA_PASS = process.env.EUREKA_PASS || 'admin';
const SERVICE_NAME = process.env.SERVICE_NAME || 'api-gateway';
const SERVICE_PORT = process.env.PORT || 3000;

const eurekaClient = new Eureka({
  instance: {
    app: SERVICE_NAME.toUpperCase(),
    instanceId: `${SERVICE_NAME}:${SERVICE_PORT}`,
    hostName: SERVICE_NAME,
    ipAddr: SERVICE_NAME,
    port: { $: SERVICE_PORT, '@enabled': true },
    vipAddress: SERVICE_NAME,
    statusPageUrl: `http://${SERVICE_NAME}:${SERVICE_PORT}/health`,
    healthCheckUrl: `http://${SERVICE_NAME}:${SERVICE_PORT}/health`,
    dataCenterInfo: { '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo', name: 'MyOwn' }
  },
  eureka: {
    host: EUREKA_HOST,
    port: EUREKA_PORT,
    servicePath: '/eureka/apps/',
    auth: { user: EUREKA_USER, password: EUREKA_PASS }
  }
});

eurekaClient.logger.level('debug');
eurekaClient.start(error => {
  if (error) console.error('Eureka start error:', error);
  else console.log('API Gateway registered with Eureka');
});

const app = express();
app.use(cors());
app.use(express.json());

const PORT = SERVICE_PORT;

// Basic health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Service targets
const AUTH_TARGET = process.env.AUTH_SERVICE_URL || 'http://auth-service:5000';
const BOOK_TARGET = process.env.BOOK_SERVICE_URL || 'http://book-service:3000';
const CART_TARGET = process.env.CART_SERVICE_URL || 'http://cart-service:3001';
const ORDER_TARGET = process.env.ORDER_SERVICE_URL || 'http://order-service:3002';

const makeProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: (path, req) => req.originalUrl,
    onError: (err, req, res) => {
      console.error('Proxy error -> target:', target, 'path:', req.originalUrl, 'error:', err && err.message);
      if (!res.headersSent) res.status(502).json({ message: `Error connecting to upstream ${target}` });
    },
  });

// Proxy routes
app.use('/api/auth', makeProxy(AUTH_TARGET));
app.use('/api/books', makeProxy(BOOK_TARGET));
app.use('/api/cart', makeProxy(CART_TARGET));
app.use('/api/orders', makeProxy(ORDER_TARGET));

// Catch-all
app.use((req, res) => res.status(502).json({ message: 'No upstream service for this path' }));

app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
