'use client';

import Image from 'next/image';

import { Card } from '@/components/ui/card';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh py-10 flex flex-col bg-light justify-center items-center">
      <Image
        className="mb-10"
        alt="sitepins"
        height={40}
        src={'/images/logo.png'}
        width={136}
      />
      <Card className=" max-w-xs sm:max-w-md w-full border-0">{children}</Card>
    </div>
  );
}
