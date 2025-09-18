import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { title_en: 'Healthcare', shortcode: 'HC', description_en: 'Reports related to the healthcare industry.' },
    { title_en: 'Information Technology & Semiconductors', shortcode: 'ITS', description_en: 'Reports related to information technology and semiconductors.' },
    { title_en: 'Machinery & Equipment', shortcode: 'ME', description_en: 'Reports related to machinery and equipment.' },
    { title_en: 'Aerospace & Defence', shortcode: 'AD', description_en: 'Reports related to aerospace and defence.' },
    { title_en: 'Chemicals & Materials', shortcode: 'CM', description_en: 'Reports related to chemicals and materials.' },
    { title_en: 'Food & Beverages', shortcode: 'FB', description_en: 'Reports related to food and beverages.' },
    { title_en: 'Agriculture', shortcode: 'AG', description_en: 'Reports related to agriculture.' },
    { title_en: 'Energy & Power', shortcode: 'EP', description_en: 'Reports related to energy and power.' },
    { title_en: 'Consumer Goods', shortcode: 'CG', description_en: 'Reports related to consumer goods.' },
    { title_en: 'Automotive & Transportation', shortcode: 'AT', description_en: 'Reports related to automotive and transportation.' },
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { shortcode: categoryData.shortcode },
      update: categoryData,
      create: {
        ...categoryData,
        slug: categoryData.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      },
    });
  }

  console.log('Categories seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
