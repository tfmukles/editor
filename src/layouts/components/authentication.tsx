"use client";

import { getProviders } from "@/actions/provider";
import { Provider } from "@/actions/provider/types";
import { revalidateRefresh } from "@/actions/utils";
import { useFetch } from "@/hooks/useFetch";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";

export default function AuthenticationButton() {
  const router = useRouter();
  const ref = useRef<NodeJS.Timeout | null>(null);
  const [isClicked, setClicked] = useState(false);
  const prevProvider = useRef<Provider[] | null>(null);
  const {
    data: providers,
    refetch,
    isLoading,
  } = useFetch(getProviders, {
    skip: false,
    onSuccess: (data) => {
      const currentSelectedProvider = prevProvider.current?.find(
        (item) => item.provider === "Github",
      );
      const selectedProvider = data.find((item) => item.provider === "Github");
      if (
        currentSelectedProvider?.access_token !== selectedProvider?.access_token
      ) {
        revalidateRefresh([
          {
            originalPath: "/",
          },
        ]);
        prevProvider.current = data;
        setClicked(false);
      }
    },
  });

  useEffect(() => {
    if (isClicked) {
      ref.current = setInterval(() => {
        if (!isLoading) {
          refetch();
        }
      }, 1000);
    }

    return () => {
      clearInterval(ref.current!);
    };
  }, [isClicked, refetch, isLoading, providers]);

  return (
    <div className="h-[calc(100svh_-_80px)] flex items-center justify-center flex-col">
      <div className="border p-10 rounded-lg text-center">
        <h2 className="mb-9">Authentication</h2>
        <div className="space-y-4 flex flex-col ">
          <Button
            onClick={() => {
              setClicked(true);
              const width = 800;
              const height = 700;
              const screenWidth = window.screen.width;
              const screenHeight = window.screen.height;
              const left = (screenWidth - width) / 2;
              const top = (screenHeight - height) / 2;
              window.open(
                `https://github.com/login/oauth/authorize?scope=scope=repo,admin,user&client_id=${process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID}&allow_signup=true`,
                "_blank",
                `width=${width},height=${height},left=${left},top=${top}`,
              );
            }}
            variant={"outline"}
            className="py-6 px-14 group"
          >
            <Icons.githubBlack className="scale-[1.5] max-w-5 mr-2 block" />
            Authentication with github
          </Button>
          <Button disabled variant={"outline"} className="py-6 px-14">
            <Icons.gitlab className="mr-2 scale-150" />
            Authentication with Gitlab
          </Button>
        </div>
      </div>
      <Button
        variant={"link"}
        type="button"
        onClick={() => {
          Cookies.set("skip", "true");
          router.refresh();
        }}
      >
        Skip
      </Button>
    </div>
  );
}
