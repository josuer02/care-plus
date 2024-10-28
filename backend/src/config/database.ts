import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add query logging for profiling
prisma.$use(async (params: any, next: any) => {
    const start = Date.now();
    const result = await next(params);
    const end = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${end - start}ms`);
    return result;
});

export default prisma;