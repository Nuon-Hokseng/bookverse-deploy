/**
 * Service Registry Configuration
 * Maps service names to their Docker network URLs and metadata
 */

const services = {
  auth: {
    name: "auth-service",
    url: process.env.AUTH_SERVICE_URL || "http://localhost:5000",
    healthCheck: "/health",
    requiresAuth: false, // Auth routes don't require authentication
    description: "Authentication and user management service",
  },
  books: {
    name: "book-service",
    url: process.env.BOOK_SERVICE_URL || "http://localhost:3004",
    healthCheck: "/health",
    requiresAuth: false, // Book browsing is public
    description: "Book catalog and management service",
  },
  cart: {
    name: "cart-service",
    url: process.env.CART_SERVICE_URL || "http://localhost:3001",
    healthCheck: "/health",
    requiresAuth: true, // Cart operations require authentication
    description: "Shopping cart service",
  },
  orders: {
    name: "order-service",
    url: process.env.ORDER_SERVICE_URL || "http://localhost:3002",
    healthCheck: "/health",
    requiresAuth: true, // Order operations require authentication
    description: "Order processing and management service",
  },
};

/**
 * Route mappings from gateway paths to services
 */
export const routeConfig = [
  {
    path: "/v1/auth",
    service: services.auth,
    requiresAuth: false,
    description: "Authentication endpoints (login, register, etc.)",
  },
  {
    path: "/v1/user",
    service: services.auth, // User endpoints are part of auth-service
    requiresAuth: true,
    description: "User profile management endpoints",
  },
  {
    path: "/v1/books",
    service: services.books,
    requiresAuth: false, // Some book routes are public (browse)
    description: "Book catalog endpoints",
  },
  {
    path: "/v1/cart",
    service: services.cart,
    requiresAuth: true,
    description: "Shopping cart endpoints",
  },
  {
    path: "/v1/orders",
    service: services.orders,
    requiresAuth: true,
    description: "Order management endpoints",
  },
];

/**
 * Get service by name
 * @param {string} name - Service name
 * @returns {object} Service configuration
 */
export const getService = (name) => {
  return services[name];
};

/**
 * Get all services
 * @returns {object} All service configurations
 */
export const getAllServices = () => {
  return services;
};

/**
 * Check if a route requires authentication
 * @param {string} path - Request path
 * @returns {boolean} True if authentication is required
 */
export const requiresAuthentication = (path) => {
  const route = routeConfig.find((r) => path.startsWith(r.path));
  return route ? route.requiresAuth : false;
};

export default services;
