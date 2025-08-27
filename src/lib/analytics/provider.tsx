"use client";
import { useEffect, Suspense } from "react";
import Analytics from "analytics";
import { AnalyticsProvider } from "use-analytics";
import { usePathname, useSearchParams } from "next/navigation";
// @ts-expect-error: No types available for '@analytics/google-analytics'
import googleAnalytics from "@analytics/google-analytics";

const analyticsInstance = Analytics({
  app: "powerfilter",
  debug: true,
  plugins: [
    googleAnalytics({
      measurementIds: [process.env.NEXT_PUBLIC_GA_TRACKING_ID],
    }),
    {
      name: "logger",
      trackPageViews: true,
      page: (payload) => {
        console.log("Page view fired", payload);
      },
      track: (payload) => {
        console.log("Track fired", payload);
      },
    },
  ],
});

function AnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    analyticsInstance.page();
  }, [pathname, searchParams]);

  return null;
}

function AnalyticsProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider instance={analyticsInstance}>
      {children}
      <Suspense fallback={null}>
        <AnalyticsPageViews />
      </Suspense>
    </AnalyticsProvider>
  );
}
export { AnalyticsProviderWrapper };
