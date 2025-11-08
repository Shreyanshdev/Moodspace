interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

export function rateLimit(options: RateLimitOptions) {
  return {
    check: (identifier: string): { limit: number; remaining: number; reset: number } => {
      const now = Date.now();
      const key = identifier;

      if (!store[key] || now > store[key].resetTime) {
        store[key] = {
          count: 1,
          resetTime: now + options.interval,
        };
        return {
          limit: options.uniqueTokenPerInterval,
          remaining: options.uniqueTokenPerInterval - 1,
          reset: store[key].resetTime,
        };
      }

      if (store[key].count >= options.uniqueTokenPerInterval) {
        return {
          limit: options.uniqueTokenPerInterval,
          remaining: 0,
          reset: store[key].resetTime,
        };
      }

      store[key].count += 1;
      return {
        limit: options.uniqueTokenPerInterval,
        remaining: options.uniqueTokenPerInterval - store[key].count,
        reset: store[key].resetTime,
      };
    },
  };
}

// Clean up old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (now > store[key].resetTime) {
        delete store[key];
      }
    });
  }, 60000); // Clean up every minute
}

