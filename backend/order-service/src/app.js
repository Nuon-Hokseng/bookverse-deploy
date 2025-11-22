import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import orderRoutes from './routes/order.routes.js';
import { Eureka } from 'eureka-js-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const EUREKA_HOST = process.env.EUREKA_HOST || 'eureka';
const EUREKA_PORT = process.env.EUREKA_PORT || 8761;
const EUREKA_USER = process.env.EUREKA_USER || 'admin';
const EUREKA_PASS = process.env.EUREKA_PASS || 'admin';
const SERVICE_NAME = process.env.SERVICE_NAME || 'order-service';
const SERVICE_PORT = process.env.PORT || 3002;

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
eurekaClient.start(err => { if (err) console.error(err); else console.log('Order Service registered with Eureka'); });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.get('/health', (req, res) => res.json({ status: 'UP' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(SERVICE_PORT, () => console.log(`Order Service running on port ${SERVICE_PORT}`));
  })
  .catch(err => console.error(err));
