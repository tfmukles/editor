"use client";

import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 1.5, bounce: 0 },
        opacity: { duration: 0.01 },
      },
    };
  },
};

export default function GitHubInstalled() {
  const params = useSearchParams();
  const [isLoading, startTransition] = useTransition();
  const isAlreadyExit = useRef<boolean>(false);
  useEffect(() => {
    if (!isAlreadyExit.current) {
      startTransition(async () => {
        await fetch(`/api/auth/github?${params.toString()}`);
        window.close();
      });
      isAlreadyExit.current = true;
    }
  }, []);

  return (
    <div className="text-center w-full h-screen flex bg-blue-900">
      <div className="m-auto">
        <h2 className="text-white mb-5">Sitepins</h2>
        <Card className="max-w-md w-full px-4">
          <CardHeader>
            <CardDescription className="mb-3">
              {params.get("setup_action") === "request"
                ? "To access the organization's repositories, an installation request has been sent to the organization's owner. Once the owner approves the request, they will be able to see the organization's repositories and manage access."
                : "Authenticating with GitHub, please wait..."}
            </CardDescription>
            <CardContent className="pb-0">
              {isLoading && (
                <motion.svg
                  className="animate-spin mx-auto h-7 w-7 text-sky-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  animate={{ pathLength: 1 }}
                  initial={{ pathLength: 0 }}
                >
                  <motion.circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></motion.circle>
                  <motion.path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></motion.path>
                </motion.svg>
              )}

              {params.get("setup_action") === "request" && !isLoading && (
                <div className="border border-green-500 size-12 flex justify-center items-center rounded-full mx-auto">
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    pathLength={0}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    className="lucide lucide-check size-6 text-green-500 mx-auto"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </motion.svg>
                </div>
              )}
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
