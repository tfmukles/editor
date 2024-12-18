import React from 'react';

import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';

import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import config from '@/config/config.json';
import TwSizeIndicator from '@/helpers/TwSizeIndicator';
import { RtkProviders } from '@/helpers/rtk-provider';

import '@/styles/main.scss';

const primaryFont = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="overflow-hidden" lang="en" suppressHydrationWarning>
      <head>
        {/* responsive meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* favicon */}
        <link href={config.site.favicon} rel="shortcut icon" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="theme-color"
          content="#fff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#000"
          media="(prefers-color-scheme: dark)"
        />
        <title>{config.site.title}</title>
      </head>

      <body className={primaryFont.className} suppressHydrationWarning={true}>
        {/* <TwSizeIndicator /> */}
        <TooltipProvider
          delayDuration={500}
          skipDelayDuration={0}
          disableHoverableContent
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
