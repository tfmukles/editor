"use client";

import { useSession } from "next-auth/react";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

const Posthog = () => {
  const { data: session, status } = useSession();
  const posthog = usePostHog();
  // Identify logged in user
  useEffect(() => {
    if (session) {
      posthog.identify(session?.user?.email!);
    }
  }, [status]);

  return null;
};

export default Posthog;
