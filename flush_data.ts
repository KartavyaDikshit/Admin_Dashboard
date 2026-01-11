import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data flush...');

  // 1. Delete Testimonials
  try {
    const { count } = await prisma.testimonial.deleteMany({});
    console.log(`Deleted ${count} testimonials.`);
  } catch (e) {
    console.error('Error deleting testimonials:', e);
  }

  // 2. Delete CustomizationRequests
  try {
    const { count } = await prisma.customizationRequest.deleteMany({});
    console.log(`Deleted ${count} customization requests.`);
  } catch (e) {
    console.error('Error deleting customization requests:', e);
  }

  // 3. Delete Orders (Cascades to OrderItems)
  try {
    const { count } = await prisma.order.deleteMany({});
    console.log(`Deleted ${count} orders (and associated order items).`);
  } catch (e) {
    console.error('Error deleting orders:', e);
  }

  // 4. Detach Enquiries from Reports (to avoid FK constraints)
  try {
    const { count } = await prisma.enquiry.updateMany({
      where: { reportId: { not: null } },
      data: { reportId: null },
    });
    console.log(`Updated ${count} enquiries to remove report associations.`);
  } catch (e) {
     // If this fails, it might be because Enquiry model/table doesn't exist or other issues, 
     // but based on schema it should work.
     console.warn('Warning: Could not detach enquiries (or none existed).', e);
  }

  // 5. Delete Reports (Cascades to Translations, Reviews, etc.)
  try {
    const { count } = await prisma.report.deleteMany({});
    console.log(`Deleted ${count} reports.`);
  } catch (e) {
    console.error('Error deleting reports:', e);
  }

  console.log('Data flush completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
