import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { nextCookies } from "better-auth/next-js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter });
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: { 
        enabled: true, 
    },
    user: {
        additionalFields: {
            role: {
                type: ['ADMIN', 'USER'],
                required: false,
                defaultValue: 'USER',
                input: false
            }
        }
    },
    plugins: [
        nextCookies()
    ],
    rateLimit: {
        window: 60,
        max: 50
    }
});