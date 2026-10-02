import type { NextAuthConfig } from "next-auth";

export default {
  pages: { signIn: "/" },
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      if (!isAdminRoute) return true;
      // Let the page render a clear login gate for anonymous users. The page
      // itself still checks ADMIN, while every admin API remains server-side
      // forbidden without an ADMIN session.
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
