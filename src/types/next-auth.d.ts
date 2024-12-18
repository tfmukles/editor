// types/next-auth.d.ts
import type { DefaultUser } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accessToken: string | null;
      email: string;
      image?: string;
      userName: string;
      verified: boolean;
      country: string;
      profession: string;
      provider: "Google" | "Github" | "Credentials";
    };
  }

  interface User extends DefaultUser {
    id: string;
    accessToken: string | null;
    userName: string;
    verified: boolean;
    country: string;
    profession: string;
    provider: "Google" | "Github" | "Credentials";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string | null;
    userName: string;
    verified: boolean;
    country: string;
    profession: string;
    image: string;
    provider: "Google" | "Github" | "Credentials";
  }
}
