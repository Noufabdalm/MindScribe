"use client";

import { useSession } from "next-auth/react";
import { QuickReflection } from "@/components/QuickReflection";
import { Journal } from "@/components/Journal";
import { Header } from "@/components/Header";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header name={session?.user?.name || "Guest"} />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Quick Reflection Section */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Quick Reflection</h2>
            <p className="text-gray-600 mt-2">
              If you have an idea that sparked in your mind — don't let it fade. Capture it now and reflect.
            </p>
          </div>
          <QuickReflection />
        </section>

        {/* Journal Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Journal Your Day</h2>
            <p className="text-gray-600 mt-2">
              Take a few minutes to log your experiences, thoughts, or lessons — your future self will thank you.
            </p>
          </div>
          <Journal />
        </section>
      </div>
    </div>
  );
}
