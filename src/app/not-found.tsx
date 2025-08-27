"use client";

import { Text } from "@/components/ui/typography";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <Text variant="extraSmall" className="font-semibold text-primary">
          404
        </Text>
        <Text variant="h1" className="mt-4 text-5xl sm:text-7xl">
          Page not found
        </Text>
        <Text
          variant="p"
          className="mt-6 text-lg text-muted-foreground sm:text-xl/8"
        >
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </Text>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
