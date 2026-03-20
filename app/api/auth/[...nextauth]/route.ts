import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { ensureDefaultAdminUser } from "@/lib/auth/bootstrap-admin";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    // GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // EMAIL + PASSWORD LOGIN
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          console.warn("[auth] Missing credentials payload");
          return null;
        }

        const botCheck = await verifyTurnstileToken({
          token: credentials.turnstileToken,
        });

        if (!botCheck.success) {
          console.warn("[auth] Turnstile verification failed", {
            reason: botCheck.message,
          });
          throw new Error("BOT_VERIFICATION_FAILED");
        }

        try {
          await connectDB();
          await ensureDefaultAdminUser();
        } catch (error) {
          console.error("[auth] DB connection failed during authorize", error);
          throw new Error("DB_CONNECTION_FAILED");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const normalizedPassword = credentials.password.trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user || !user.password) {
          console.warn("[auth] User not found or password missing", {
            email: normalizedEmail,
            hasUser: Boolean(user),
          });
          return null;
        }

        let isValid = false;

        // Default behavior: hashed password validation.
        try {
          isValid = await bcrypt.compare(normalizedPassword, user.password);
        } catch {
          isValid = false;
        }

        // Backward-safe fallback for legacy plaintext records.
        if (!isValid && user.password === normalizedPassword) {
          isValid = true;
          const rehashedPassword = await bcrypt.hash(normalizedPassword, 10);
          await User.updateOne(
            { _id: user._id },
            { $set: { password: rehashedPassword } },
          );
        }

        if (!isValid) {
          console.warn("[auth] Password mismatch", { email: normalizedEmail });
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const target = new URL(url);
        if (target.origin === baseUrl) {
          return url;
        }
      } catch {
        // Fall through to safe default.
      }

      return `${baseUrl}/home`;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
