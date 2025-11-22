import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cartRoutes from './routes/cart.routes.js';
import { Eureka } from 'eureka-js-client';

dotenv.config();

const EUREKA_HOST = process.env.EUREKA_HOST || 'eureka';
const EUREKA_PORT = process.env.EUREKA_PORT || 8761;
const EUREKA_USER = process.env.EUREKA_USER || 'admin';
const EUREKA_PASS = process.env.EUREKA_PASS || 'admin';
const SERVICE_NAME = process.env.SERVICE_NAME || 'cart-service';
const SERVICE_PORT = process.env.PORT || 3001;

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
eurekaClient.start(err => { if (err) console.error(err); else console.log('Cart Service registered with Eureka'); });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', cartRoutes);
app.get('/health', (req, res) => res.json({ status: 'UP' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(SERVICE_PORT, () => console.log(`Cart Service running on port ${SERVICE_PORT}`));
  })
  .catch(err => console.error(err));
