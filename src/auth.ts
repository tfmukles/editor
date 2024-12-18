export const runtime = 'dynamic';

import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

import { InsertionSuccess, fetchApi, mutate } from '@/actions/utils';
import { loginSchema } from '@/lib/validate';

import { updateUserProfile } from './actions/user';
import { UserLogin } from './actions/user/types';

export const authConfig = {
  callbacks: {
    async jwt({ session, token, trigger, user }) {
      if (trigger === 'update') {
        token.userName = session.fullName;
        token.profession = session.profession;
        token.country = session.country;
        token.image = session.image;
        return token;
      }

      if (user) {
        const { accessToken, country, image, profession, userName } = user;
        token.userName = userName;
        token.accessToken = accessToken!;
        token.image = image!;
        token.country = country;
        token.accessToken = accessToken;
        token.country = country;
        token.profession = profession;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        const { accessToken, country, image, profession, sub, userName } =
          token;
        session.user.accessToken = accessToken;
        session.user.userName = userName;
        session.user.country = country;
        session.user.image = image;
        session.user.userName = userName;
        session.user.id = sub!;
        session.user.country = country;
        session.user.profession = profession!;
      }
      return session;
    },

    async signIn({ account, user }) {
      if (account?.type !== 'credentials') {
        const { data, isSuccess } = await updateUserProfile({
          country: user.country,
          email: user.email!,
          fullName: user.userName,
          image: user.image!,
          profession: '',
          provider: user.provider,
          user_id: user.email!,
          verified: true,
        });

        if (isSuccess && data?.accessToken) {
          user.accessToken = data?.accessToken;
          user.id = data.id;
          user.country = data.country;
          user.profession = data.profession;
          // @ts-ignore
          user.userName = data.full_name || data.fullName;
        }

        return true;
      }

      if (account?.type === 'credentials' && user.verified) {
        return true;
      }

      return false;
    },
  },
  debug: false,
  jwt: {
    maxAge: 60 * 60 * 24 * 7, // 7 day
  },
  pages: {
    error: '/error',
    newUser: '/register',
    signIn: '/login',
  },
  providers: [
    Credentials({
      id: 'credentials',
      // @ts-ignore
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const data = validatedFields.data;
          const user = await mutate<UserLogin>(async () => {
            return await fetchApi<InsertionSuccess<UserLogin>>({
              body: { ...data, currentDate: Date.now() },
              cache: 'no-cache',
              endPoint: '/authentication/password-login',
              method: 'POST',
            });
          });

          if (user.data?.accessToken) {
            return {
              ...user.data,
              // @ts-ignore
              userName: user.data.fullName || user.data.full_name,
            };
          } else {
            return null;
          }
        }
        return null;
      },
      credentials: {
        password: { label: 'Password', type: 'password' },
        username: { label: 'Username', type: 'text' },
      },
      name: 'credentials',
      type: 'credentials',
    }),
    Google({
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
          response_type: 'code',
        },
      },
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        const { email, family_name, given_name, picture } = profile;
        profile.userName = `${given_name}  ${family_name}`;
        profile.email = email;
        profile.image = picture;
        profile.provider = 'Google';
        return profile;
      },
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      //@ts-ignore
      profile(profile) {
        profile.userName = profile.name;
        profile.image = profile.avatar_url;
        profile.provider = 'Github';
        return profile;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    maxAge: 60 * 60 * 24 * 7, // 2 min
    strategy: 'jwt',
  },
} satisfies NextAuthConfig;

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
