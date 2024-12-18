import { createProvider } from "@/actions/provider";
import { createAppAuth } from "@octokit/auth-app";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { App } from "octokit";

const app = new App({
  oauth: {
    clientId: process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID!,
    clientSecret: process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_SECRET!,
  },
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
});

async function handler(request: NextRequest, response: NextResponse) {
  const cookieStore = await cookies();
  let installation_token = "";

  try {
    const { searchParams } = new URL(request.url);
    const installationId = searchParams.get("installation_id");
    const code = searchParams.get("code");

    if (installationId) {
      const auth = createAppAuth({
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
        clientId: process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID!,
        clientSecret: process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_SECRET!,
        installationId: installationId,
      });

      const installationAuthentication = await auth({
        installationId: +installationId,
        type: "installation",
      });

      installation_token = installationAuthentication.token;
      cookieStore.set("app_token", installationAuthentication.token);
    }

    if (code) {
      const token = await app.oauth.createToken({
        code: searchParams.get("code")!,
      });
      await createProvider({
        provider: "Github",
        access_token: token.authentication.token,
        expires_in: +token.authentication.expiresAt!,
        refresh_token_expires_in: +token.authentication.refreshTokenExpiresAt!,
        token_type: token.authentication.tokenType,
        installation_access_token: installation_token,
        userId: "",
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}?window=close`,
      307,
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: JSON.stringify(error.message),
      },
      { status: 500 },
    );
  }
}

export { handler as GET, handler as POST };
