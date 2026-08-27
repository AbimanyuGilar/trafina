import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { nextCookies } from "better-auth/next-js";
import { waitUntil } from "@vercel/functions";
import { sendMail } from "./email";
import { getVerificationEmailHTML } from "./get-verification-email-html";
import { organization } from "better-auth/plugins";
import { getInvitationHTML } from "./get-invitation-html";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter });
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    onExistingUserSignUp: async ({ user }) => {
      waitUntil(                                                                                                   
        sendMail({
          from: 'Trafina <trafinaapp26@gmail.com>',
          to: user.email,
          subject: 'Verify your email address.',
          text: 'Seseorang mencoba mendaftar dengan email Anda. Jika ini adalah Anda, silahkan login.'
        })
      )
    }
  },
  user: {
    additionalFields: {
      role: {
        type: ['ADMIN', 'USER'],
        input: false,
        defaultValue: 'USER'
      },
    }
  },
  emailVerification: {                    
    autoSignInAfterVerification: true,                                                     
    sendVerificationEmail: async ({ user, url }) => {                                                              
      const verificationUrl = new URL(url);                                                                        
      verificationUrl.searchParams.set("callbackURL", "/dashboard");                                               

      waitUntil(                                                                                                   
        sendMail({
          from: 'Trafina <trafinaapp26@gmail.com>',
          to: user.email,
          subject: 'Verifikasi Alamat Email.',
          html: getVerificationEmailHTML(verificationUrl.toString(), user.name)
        })
      )
    }
  },
  plugins: [
    nextCookies(),
    organization({
      async sendInvitationEmail(data) {
        const url = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}/store/${data.organization.slug}`;
        sendMail({
          to: data.email,
          from: 'Trafina <trafinaapp26@gmail.com>',
          subject: 'Undangan Toko',
          html: getInvitationHTML({ url, org: data.organization.name })
        });
      },
    }),
  ]
});