import type { NextAuthConfig } from "next-auth";

export default {
  pages: { signIn: "/" },
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      if (!isAdminRoute) return true;
      return auth?.user?.role === "ADMIN";
    },
  },
  providers: [],
} satisfies NextAuthConfig;
