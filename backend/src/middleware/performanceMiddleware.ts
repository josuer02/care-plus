// src/middleware/performanceMiddleware.ts
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            requestId?: string;
        }
    }
}

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    
    // Add request tracking
    const requestId = Math.random().toString(36).substring(7);
    req.requestId = requestId;
    
    // Set headers before any response is sent
    res.setHeader('X-Request-ID', requestId);
    
    // Use res.once instead of res.on to ensure the callback is only called once
    res.once('finish', () => {
        const diff = process.hrtime(start);
        const time = diff[0] * 1e3 + diff[1] * 1e-6;
        
        // Log for profiling
        console.log({
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${time.toFixed(2)}ms`
        });
    });
    
    next();
};