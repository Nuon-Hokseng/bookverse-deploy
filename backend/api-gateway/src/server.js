import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import Redis from "ioredis";
import { RedisStore } from "rate-limit-redis";

import logger from "./utils/logger.js";
import { createProxy, requestIdMiddleware } from "./utils/proxyHelpers.js";
import { routeConfig } from "./config/services.js";
import { validateToken, optionalAuth } from "./middleware/authMiddleware.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ==================== Redis Setup ====================
let redisClient = null;
let rateLimiter = null;

// Only try to connect to Redis if explicitly enabled
const REDIS_ENABLED = process.env.REDIS_ENABLED === "true";

if (REDIS_ENABLED) {
  try {
    const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 5000,
      lazyConnect: true, // Don't connect immediately
      retryStrategy(times) {
        if (times > 3) {
          logger.warn(
            "Redis connection failed after 3 attempts, disabling Redis"
          );
          return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        logger.warn(
          `Redis connection retry attempt ${times}, delay: ${delay}ms`
        );
        return delay;
      },
    });

    // Try to connect
    redisClient
      .connect()
      .then(() => {
        logger.info("Redis connected successfully");

        // Rate limiter with Redis store
        rateLimiter = rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 100,
          standardHeaders: true,
          legacyHeaders: false,
          store: new RedisStore({
            sendCommand: (...args) => redisClient.call(...args),
          }),
          handler: (req, res) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
              error: "Too Many Requests",
              message:
                "You have exceeded the rate limit. Please try again later.",
              retryAfter: req.rateLimit.resetTime,
            });
          },
        });
      })
      .catch((err) => {
        logger.warn(
          `Redis connection failed: ${err.message}, continuing without Redis`
        );
        redisClient = null;
        // Use fallback rate limiter
        setupFallbackRateLimiter();
      });

    redisClient.on("error", (err) => {
      logger.warn(`Redis error (non-critical): ${err.message}`);
    });
  } catch (error) {
    logger.warn(
      `Failed to initialize Redis: ${error.message}, continuing without Redis`
    );
    redisClient = null;
    setupFallbackRateLimiter();
  }
} else {
  logger.info("Redis disabled, using in-memory rate limiting");
  setupFallbackRateLimiter();
}

function setupFallbackRateLimiter() {
  rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: "Too Many Requests",
        message: "You have exceeded the rate limit. Please try again later.",
      });
    },
  });
}

// ==================== Middleware Stack ====================

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:4200",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Cookie",
  ],
  exposedHeaders: ["Set-Cookie"],
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Request ID tracking
app.use(requestIdMiddleware);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// Rate limiting
if (rateLimiter) {
  app.use(rateLimiter);
}

// Trust proxy (important for rate limiting and IP detection)
app.set("trust proxy", 1);

// ==================== Health Check ====================
app.get("/health", (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    redis: redisClient
      ? redisClient.status === "ready"
        ? "connected"
        : "disconnected"
      : "not configured",
  };

  res.json(health);
});

// ==================== Root Route ====================
app.get("/", (req, res) => {
  res.json({
    service: "BookVerse API Gateway",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      auth: "/v1/auth",
      books: "/v1/books",
      cart: "/v1/cart",
      orders: "/v1/orders",
    },
  });
});

// ==================== Service Routes ====================

// Configure routes based on service registry
routeConfig.forEach((route) => {
  logger.info(
    `Configuring route: ${route.path} -> ${route.service.url} (Auth: ${route.requiresAuth})`
  );

  // Apply authentication middleware if required
  if (route.requiresAuth) {
    app.use(route.path, validateToken, createProxy(route.service.url));
  } else {
    // Use optional auth for routes that may benefit from user context
    app.use(route.path, optionalAuth, createProxy(route.service.url));
  }
});

// ==================== Error Handling ====================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==================== Server Startup ====================

const server = app.listen(PORT, () => {
  logger.info(`🚀 API Gateway started successfully`);
  logger.info(`📍 Environment: ${NODE_ENV}`);
  logger.info(`🌐 Port: ${PORT}`);
  logger.info(`🔒 CORS Origin: ${corsOptions.origin}`);
  logger.info(`📊 Redis: ${redisClient ? "Enabled" : "Disabled"}`);
  logger.info(`🛡️  Rate Limiting: ${rateLimiter ? "Enabled" : "Disabled"}`);
  logger.info(`✅ Ready to handle requests`);
});

// ==================== Graceful Shutdown ====================

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    logger.info("HTTP server closed");
  });

  // Close Redis connection
  if (redisClient && redisClient.status === "ready") {
    try {
      await redisClient.quit();
      logger.info("Redis connection closed");
    } catch (error) {
      logger.warn(`Error closing Redis connection: ${error.message}`);
    }
  }

  // Exit process
  setTimeout(() => {
    logger.info("Shutdown complete, exiting process");
    process.exit(0);
  }, 1000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors - but ignore Redis errors in development
process.on("uncaughtException", (error) => {
  // Ignore Redis connection errors in development
  if (
    error.message &&
    error.message.includes("Redis") &&
    NODE_ENV === "development"
  ) {
    logger.warn(`Redis error ignored in development: ${error.message}`);
    return;
  }
  logger.error(`Uncaught Exception: ${error.message}`, {
    error,
    stack: error.stack,
  });
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  // Ignore Redis connection errors in development
  if (
    reason &&
    reason.message &&
    reason.message.includes("Redis") &&
    NODE_ENV === "development"
  ) {
    logger.warn(`Redis rejection ignored in development: ${reason.message}`);
    return;
  }
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  gracefulShutdown("UNHANDLED_REJECTION");
});

export default app;
