// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from "next-auth"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt"
import { AdminRole, Prisma } from "@prisma/client" // Import Prisma

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AdminRole;
      permissions: Prisma.JsonValue; // Use Prisma.JsonValue
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role: AdminRole;
    permissions: Prisma.JsonValue; // Use Prisma.JsonValue
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
    permissions: Prisma.JsonValue; // Use Prisma.JsonValue
  }
}
