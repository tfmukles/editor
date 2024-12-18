'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Avatar } from '../components/plate-ui/avatar';

const Header = () => {
  const { data: session } = useSession();
  const { email, image, userName } = session?.user || {};

  return (
    <header className="py-4">
      <div className="container">
        <div className="flex justify-between">
          <h1>
            <Link href="/">Sitepins</Link>
          </h1>
          <div className="flex items-center group relative">
            <Avatar
              className="size-6 rounded-full"
              alt="Avatar"
              email={email!}
              height={36}
              src={image!}
              width={36}
            />
            <div className="cursor-pointer">
              <p className="inline-block ml-1">
                {userName ? userName : 'Anonymous'}
              </p>
            </div>
            <Button
              className="absolute top-full left-6 w-full opacity-0 group-hover:opacity-100 invisible group-hover:visible"
              onClick={() => signOut()}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
