import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import config from "@/config/config.json";
import TwSizeIndicator from "@/helpers/TwSizeIndicator";
import { RtkProviders } from "@/helpers/rtk-provider";
import "@/styles/main.scss";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import React from "react";

const primaryFont = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en" className="overflow-hidden">
      <head>
        {/* responsive meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* favicon */}
        <link rel="shortcut icon" href={config.site.favicon} />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#fff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#000"
        />
        <title>{config.site.title}</title>
      </head>

      <body className={primaryFont.className} suppressHydrationWarning={true}>
        {/* <TwSizeIndicator /> */}
        <TooltipProvider
          disableHoverableContent
          delayDuration={500}
          skipDelayDuration={0}
        >
          <TwSizeIndicator />
          <SessionProvider>
            <RtkProviders>{children}</RtkProviders>
          </SessionProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
