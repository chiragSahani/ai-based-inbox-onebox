import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
      retryAfter: req.rateLimit?.resetTime
        ? Math.ceil(req.rateLimit.resetTime.getTime() / 1000)
        : undefined,
    });
  },
});

// Strict rate limiter for AI operations (expensive)
export const aiOperationsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 AI requests per hour
  message: {
    success: false,
    message: "AI operation limit exceeded, please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "AI operation limit exceeded. Please try again later.",
      retryAfter: req.rateLimit?.resetTime
        ? Math.ceil(req.rateLimit.resetTime.getTime() / 1000)
        : undefined,
    });
  },
});

// Search rate limiter
export const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 search requests per 5 minutes
  message: {
    success: false,
    message: "Too many search requests, please try again after 5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (if implementing authentication)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Create account limiter
export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 account creations per hour
  message: {
    success: false,
    message:
      "Too many accounts created from this IP, please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
