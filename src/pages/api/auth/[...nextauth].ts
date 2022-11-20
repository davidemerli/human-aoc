import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // from https://avatars.githubusercontent.com/u/[USER_ID]?v=4 obtain [USER_ID] from this url
        const githubId = user.image?.match(/u\/(\d+)/)?.[1] ?? "";

        session.user.githubUsername = await fetch(
          `https://api.github.com/user/${githubId}`
        )
          .then((res) => res.json())
          .then((res) => res.login as string);
      }

      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
};

export default NextAuth(authOptions);
