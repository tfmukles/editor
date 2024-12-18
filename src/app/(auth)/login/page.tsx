'use client';

import { useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

import LoginWithPassword from './_components/login-with-password';

export default function Login() {
  const [showLoginForm, setShowLoginForm] = useState(false);

  function toggleForm() {
    setShowLoginForm(!showLoginForm);
  }

  return (
    <AnimatePresence>
      {showLoginForm ? (
        <LoginWithPassword toggleForm={toggleForm} />
      ) : (
        <>
          <CardHeader className="text-center pb-2">
            <CardTitle className="mb-6 font-semibold">
              Log into your account
            </CardTitle>
            <div className="space-y-2">
              <Button
                variant={'secondary'}
                className="w-full border border-border"
                onClick={() => signIn('github')}
                type="button"
              >
                <Icons.githubBlack className="size-5" />
                <span className="ml-2 ">Login with GitHub</span>
              </Button>
              <Button
                variant={'secondary'}
                className="w-full border-border border"
                onClick={() => {
                  signIn('google');
                }}
                type="button"
              >
                <Icons.google className="size-5" />
                <span className="ml-2">Login with Google</span>
              </Button>

              <Button
                variant={'secondary'}
                className="w-full border border-border"
                onClick={toggleForm}
                type="button"
              >
                <Icons.mail className="size-5" />
                <span className="ml-2">Login with Email</span>
              </Button>
            </div>
          </CardHeader>

          <CardFooter className="block text-center">
            <p className="text-center mt-3 text-popover-foreground">
              <span className="">Don't have an account?</span>{' '}
              <Button
                asChild
                variant={'link'}
                className="text-text-dark p-0 h-auto underline underline-offset-4"
              >
                <Link className="text-accent-foreground" href={'/register'}>
                  Create an account
                </Link>
              </Button>
            </p>
          </CardFooter>
        </>
      )}
    </AnimatePresence>
  );
}
