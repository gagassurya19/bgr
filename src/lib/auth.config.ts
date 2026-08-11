import type { UserRole } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ auth: session }) => !!session?.user,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.businessUnitId = user.businessUnitId;
        token.businessGroupId = user.businessGroupId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.businessUnitId = token.businessUnitId ?? null;
        session.user.businessGroupId = token.businessGroupId ?? null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
