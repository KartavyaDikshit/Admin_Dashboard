
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import fs from 'fs';
import path from 'path';

// Manually load .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, ''); // Remove quotes
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
}

// Handle Prisma Accelerate protocol requirement
const url = process.env.DATABASE_URL?.replace('postgresql://', 'prisma://').replace('postgres://', 'prisma://');

const prisma = new PrismaClient({
    datasourceUrl: url
}).$extends(withAccelerate());

async function main() {
  console.log('🗑️ Starting cleanup of Reports, Orders, and Customizations...');

  try {
    // 1. Delete dependent relations first (Foreign Keys)
    console.log('   - Deleting OrderItems...');
    await prisma.orderItem.deleteMany({});

    console.log('   - Deleting CustomizationRequests...');
    await prisma.customizationRequest.deleteMany({});

    console.log('   - Deleting ReportTranslations...');
    await prisma.reportTranslation.deleteMany({});
    
    console.log('   - Deleting ReportReviews...');
    await prisma.reportReview.deleteMany({});

    console.log('   - Deleting Enquiries (linked to reports)...');
    await prisma.enquiry.deleteMany({});
    
    // 2. Delete Orders
    console.log('   - Deleting Orders...');
    await prisma.order.deleteMany({});

    // 3. Delete Reports
    console.log('   - Deleting Reports...');
    const deletedReports = await prisma.report.deleteMany({});
    console.log(`   ✅ Deleted ${deletedReports.count} reports.`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🏁 Cleanup complete.');
  }
}

main();
