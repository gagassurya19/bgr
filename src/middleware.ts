import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/referrals/:path*",
    "/approvals/:path*",
    "/monitoring/:path*",
    "/analytics/:path*",
    "/documents/:path*",
    "/notifications/:path*",
    "/users/:path*",
    "/business-groups/:path*",
    "/settings/:path*",
    "/simulasi-kkb/:path*",
    "/simulasi-asuransi/:path*",
  ],
};

export default middleware;
