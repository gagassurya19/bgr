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
        token.role = user.role as string;
        token.businessUnitId = user.businessUnitId as string | null;
        token.businessGroupId = user.businessGroupId as string | null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.businessUnitId = (token.businessUnitId as string | null) ?? null;
        session.user.businessGroupId = (token.businessGroupId as string | null) ?? null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
