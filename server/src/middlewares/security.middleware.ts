import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { Request, Response, NextFunction } from "express";

// Helmet security headers
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// CORS configuration
export const corsMiddleware = cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count", "X-Page", "X-Per-Page"],
  maxAge: 600, // 10 minutes
});

// Compression middleware
export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req: Request, res: Response) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// Request sanitization middleware
export const sanitizeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = (req.query[key] as string).trim();
      }
    });
  }

  // Sanitize body
  if (req.body && typeof req.body === "object") {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
};

// Security headers middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Remove sensitive headers
  res.removeHeader("X-Powered-By");

  // Add custom security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  next();
};

// API key validation middleware (for production)
export const apiKeyValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip in development
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  const apiKey = req.headers["x-api-key"] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key is required",
    });
  }

  // Validate API key (implement your own logic)
  const validApiKey = process.env.API_KEY;

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      message: "Invalid API key",
    });
  }

  next();
};
