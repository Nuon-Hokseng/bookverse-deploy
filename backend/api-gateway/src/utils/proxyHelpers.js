import proxy from 'express-http-proxy';
import logger from './logger.js';

/**
 * Create a proxy middleware for routing requests to backend services
 * @param {string} serviceUrl - The target service URL
 * @param {object} options - Additional proxy options
 * @returns {Function} Express middleware
 */
export const createProxy = (serviceUrl, options = {}) => {
    return proxy(serviceUrl, {
        // Preserve host header
        preserveHostHdr: false,

        // Parse request body
        parseReqBody: true,

        // Rewrite path: /v1/books -> /api/books
        proxyReqPathResolver: (req) => {
            const originalPath = req.originalUrl || req.url;
            // Replace /v1/ with /api/
            const newPath = originalPath.replace(/^\/v1\//, '/api/');
            logger.debug(`Proxying: ${originalPath} -> ${serviceUrl}${newPath}`);
            return newPath;
        },

        // Forward request body
        proxyReqBodyDecorator: (bodyContent, srcReq) => {
            // Return the body as-is for the proxy to forward
            return bodyContent;
        },

        // Add custom headers and user context
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            // Forward original headers
            proxyReqOpts.headers = proxyReqOpts.headers || {};

            // Forward Authorization header if present
            if (srcReq.headers.authorization) {
                proxyReqOpts.headers['Authorization'] = srcReq.headers.authorization;
            }

            // Forward cookies if present
            if (srcReq.headers.cookie) {
                proxyReqOpts.headers['Cookie'] = srcReq.headers.cookie;
            }

            // Add user context from JWT (if available from auth middleware)
            if (srcReq.user) {
                proxyReqOpts.headers['x-user-id'] = srcReq.user.id || srcReq.user.userId;
                proxyReqOpts.headers['x-user-role'] = srcReq.user.role || 'user';
                proxyReqOpts.headers['x-user-email'] = srcReq.user.email || '';
            }

            // Add forwarding headers
            proxyReqOpts.headers['X-Forwarded-For'] = srcReq.ip || srcReq.connection.remoteAddress;
            proxyReqOpts.headers['X-Forwarded-Proto'] = srcReq.protocol;
            proxyReqOpts.headers['X-Forwarded-Host'] = srcReq.get('host');

            // Add request ID for tracing
            if (srcReq.id) {
                proxyReqOpts.headers['X-Request-ID'] = srcReq.id;
            }

            return proxyReqOpts;
        },

        // Handle errors
        proxyErrorHandler: (err, res, next) => {
            logger.error(`Proxy error to ${serviceUrl}: ${err.message}`, { error: err });

            if (res.headersSent) {
                return next(err);
            }

            res.status(502).json({
                error: 'Bad Gateway',
                message: 'Failed to connect to upstream service',
                service: serviceUrl
            });
        },

        // Log responses
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
            logger.debug(`Response from ${serviceUrl}: ${proxyRes.statusCode}`);
            return proxyResData;
        },

        // Timeout settings
        timeout: options.timeout || 30000, // 30 seconds default

        // Additional options
        ...options
    });
};

/**
 * Generate a unique request ID
 * @returns {string} Unique request ID
 */
export const generateRequestId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request ID middleware - adds unique ID to each request
 */
export const requestIdMiddleware = (req, res, next) => {
    req.id = req.headers['x-request-id'] || generateRequestId();
    res.setHeader('X-Request-ID', req.id);
    next();
};
