import express from 'express';
import dotenv from 'dotenv';
import { Eureka } from 'eureka-js-client';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import cookieParser from "cookie-parser";

dotenv.config();

const EUREKA_HOST = process.env.EUREKA_HOST || 'eureka';
const EUREKA_PORT = process.env.EUREKA_PORT || 8761;
const EUREKA_USER = process.env.EUREKA_USER || 'admin';
const EUREKA_PASS = process.env.EUREKA_PASS || 'admin';
const SERVICE_NAME = process.env.SERVICE_NAME || 'auth-service';
const SERVICE_PORT = process.env.PORT || 5000;

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
eurekaClient.start(err => { if (err) console.error(err); else console.log('Auth Service registered with Eureka'); });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.get('/health', (req, res) => res.json({ status: 'UP' }));

connectDB();

app.listen(SERVICE_PORT, () => console.log(`Auth Service running on port ${SERVICE_PORT}`));
