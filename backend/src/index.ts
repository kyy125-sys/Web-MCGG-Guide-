import 'dotenv/config';
import app from './app';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (e) {
    console.warn('⚠️ Database connection error, running server with fallback:', e);
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  }
}

main();
