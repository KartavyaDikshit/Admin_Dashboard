
import { prisma } from './src/lib/prisma';

async function checkCounts() {
  try {
    const reportCount = await prisma.report.count({ where: { status: 'PUBLISHED' } });
    const categoryCount = await prisma.category.count({ where: { status: 'PUBLISHED' } });
    const prCount = await prisma.pressRelease.count({ where: { published: true } });

    console.log('--- Counts ---');
    console.log(`Reports (PUBLISHED): ${reportCount}`);
    console.log(`Categories (PUBLISHED): ${categoryCount}`);
    console.log(`Press Releases (published=true): ${prCount}`);
    console.log('--------------');
  } catch (error) {
    console.error('Error counting:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();
