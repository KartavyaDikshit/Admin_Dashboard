import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Polyfill DATABASE_URL for the runtime if it's set to the Accelerate URL (which fails schema validation for 'postgresql' provider)
if (process.env.DATABASE_URL?.startsWith('prisma')) {
  if (process.env.DIRECT_URL?.startsWith('postgres')) {
    process.env.DATABASE_URL = process.env.DIRECT_URL;
  } else if (process.env.POSTGRES_URL?.startsWith('postgres')) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  }
}

const prismaClientSingleton = () => {
  // Use PRISMA_DATABASE_URL for the actual client connection (Accelerate)
  // Replace 'prisma+postgres://' with 'prisma://' as required by the extension
  const url = process.env.PRISMA_DATABASE_URL?.replace('prisma+postgres://', 'prisma://')
  
  return new PrismaClient({
    datasourceUrl: url,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends(withAccelerate())
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
