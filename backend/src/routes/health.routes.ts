// src/routes/health.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import os from 'os';

const router = Router();

const healthCheck = async (req: Request, res: Response) => {
    try {
        const startTime = process.hrtime();
        
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        
        const diff = process.hrtime(startTime);
        const dbResponseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        
        if (!res.headersSent) {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                dbResponseTime: `${dbResponseTime}ms`,
                memory: {
                    free: os.freemem(),
                    total: os.totalmem(),
                    used: os.totalmem() - os.freemem()
                },
                cpu: os.loadavg()
            });
        }
    } catch (error: unknown) {
        if (!res.headersSent) {
            res.status(503).json({
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
};

router.get('/', healthCheck);

export default router;