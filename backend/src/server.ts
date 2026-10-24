import app from './app';
import { config } from './config';
import prisma from './config/prisma';

const server = app.listen(config.port, async () => {
  try {
    await prisma.$connect();
    console.log(`===============================================`);
    console.log(`🚀 NewsPortal API Server running on port ${config.port}`);
    console.log(`📖 Swagger API Docs: http://localhost:${config.port}/api-docs`);
    console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`===============================================`);
  } catch (error) {
    console.error('Failed to connect to database during startup:', error);
    process.exit(1);
  }
});

// Graceful shutdown
const handleShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Process exited safely.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
