import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auditService } from "@/services/audit.service";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user || user.status !== "ACTIVE") return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        try {
          await auditService.log({
            actorId: user.id,
            action: "LOGIN",
            entityType: "USER",
            entityId: user.id,
          });
        } catch {
          // Login tetap berhasil meski audit log gagal
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessUnitId: user.businessUnitId,
          businessGroupId: user.businessGroupId,
        };
      },
    }),
  ],
});
