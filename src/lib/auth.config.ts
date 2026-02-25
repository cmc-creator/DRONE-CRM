import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { JWTPayload } from "jose";
import { SignJWT, jwtVerify } from "jose";

const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function getSecret(secret: string | string[]): Uint8Array {
  const s = Array.isArray(secret) ? secret[0] : secret;
  return new TextEncoder().encode(s);
}

// Lightweight auth config used by middleware (no bcrypt, no Prisma = edge-compatible)
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  jwt: {
    // Use signed JWTs (HS256) so edge middleware can verify them with jwtVerify
    async encode({ token, secret }) {
      return new SignJWT(token as JWTPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + MAX_AGE)
        .sign(getSecret(secret));
    },
    async decode({ token, secret }) {
      if (!token) return null;
      try {
        const { payload } = await jwtVerify(token, getSecret(secret));
        return payload as JWT;
      } catch {
        return null;
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as Record<string, unknown>).role = (user as { role: string }).role;
        (token as Record<string, unknown>).id = user.id ?? "";
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
