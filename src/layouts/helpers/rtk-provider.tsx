"use client";
import config from "@/config/config.json";
import { POSTHOG_KEY } from "@/lib/constant";
import countryDetector from "@/lib/utils/countryDetector";
import { store } from "@/redux/store";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { useEffect } from "react";
import { Provider } from "react-redux";
import Posthog from "./Posthog";

export function RtkProviders({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const country = countryDetector();
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV !== "development" &&
      session?.user?.accessToken &&
      config.posthog.enable &&
      country &&
      !config.posthog.disabled_countries.includes(country!)
    ) {
      posthog.init(POSTHOG_KEY!, {
        api_host: "https://app.posthog.com",
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") {
            posthog.startSessionRecording();

            posthog.debug();
          }
        },
      });
    }
  }, [status]);

  return (
    <Provider store={store}>
      <Posthog />
      {children}
    </Provider>
  );
}
