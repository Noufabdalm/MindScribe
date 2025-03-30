"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Reflection {
  id: string;
  title: string;
  date: string;
  datetime: string;
  description: string;
  emotion: string;
}

export default function ReflectionsPage() {
  const { data: session, status } = useSession();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchReflections();
    }
  }, [session, status]);

  async function fetchReflections() {
    try {
      setLoading(true);
      const res = await fetch("/api/reflections");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch reflections.");

      setReflections(data.reflections);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="">
      {/* Header */}
      <div className="p-6 top-0 z-10">
        <h2 className="text-4xl font-semibold dark:text-black">My Reflections</h2>
        <p className="mt-2 text-lg dark:text-black">
          A collection of thoughts and realizations throughout my journey.
        </p>
      </div>

      {/* Loading & Error Handling */}
      {loading && <p className="mt-4 text-gray-500 text-center">Loading reflections...</p>}
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {/* Timeline */}
      <div className="px-6 flex-grow">
        <ol className="relative border-l border-gray-300 dark:border-gray-700 mt-6 mx-auto max-w-2xl">
          {reflections.length > 0 ? (
            reflections.map((reflection) => (
              <li key={reflection.id} className="mb-10 ml-6">
                {/* Timeline Dot */}
                <div className="absolute w-3 h-3 bg-gray-300 rounded-full mt-2 -left-[5px] border border-white dark:border-gray-900 dark:bg-gray-700"></div>

                <div className="bg-indigo-50 p-5 rounded-lg shadow-md border hover:shadow-lg transition">
                  <time dateTime={reflection.datetime} className="block mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {reflection.date}
                  </time>

                  <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-black">
                    <Link href={`/reflections/${reflection.id}`} className="hover:underline">
                      {reflection.title}
                    </Link>
                  </h3>

                  <p className="mt-3 text-black">{reflection.description}</p>

                  <p className="mt-3 text-gray-700">
                    <strong>Feeling:</strong> {reflection.emotion}
                  </p>

                  <div className="mt-4">
                    <Link
                      href={`/reflections/${reflection.id}`}
                      className="inline-flex items-center text-blue-500 hover:text-blue-700"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </li>
            ))
          ) : (
            !loading && (
              <li className="mb-10 ml-6">
                <div className="absolute w-3 h-3 bg-gray-300 rounded-full mt-2 -left-[5px] border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <div className="p-5 bg-white border border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-500">You haven’t added any reflections yet. Let today be the first!</p>
                </div>
              </li>
            )
          )}
        </ol>
      </div>
    </div>
  );
}
