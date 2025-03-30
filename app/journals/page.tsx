"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Journal = {
  id: number;
  title: string;
  created_at: string;
  content: string;
  images: string[];
};

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJournals() {
      try {
        const response = await fetch("/api/journals");
        if (!response.ok) throw new Error("Failed to fetch journals");

        const data = await response.json();
        setJournals(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchJournals();
  }, []);

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading journals...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div>
      {/* Header */}
      <div className="p-6 top-0 z-10">
        <h2 className="text-4xl font-semibold dark:text-black">My Journals</h2>
        <p className="mt-2 text-lg dark:text-black">
          A timeline of my thoughts, challenges, and moments of growth.
        </p>
      </div>

      {/* Timeline */}
      <div className="px-6 flex-grow">
        <ol className="relative border-l border-gray-300 dark:border-gray-700 mt-6 mx-auto max-w-2xl">
          {journals.length > 0 ? (
            journals.map((journal) => (
              <li key={journal.id} className="mb-10 ml-6">
                {/* Timeline Dot */}
                <div className="absolute w-3 h-3 bg-gray-300 rounded-full mt-2 -left-[5px] border border-white dark:border-gray-900 dark:bg-gray-700"></div>

                {/* Journal Card */}
                <div className="bg-indigo-50 p-5 rounded-lg shadow-md border hover:shadow-lg transition">
                  {journal.images.length > 0 && (
                    <img
                      src={journal.images[0]}
                      alt={journal.title}
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  )}

                  <time dateTime={journal.created_at} className="block mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(journal.created_at).toLocaleDateString()}
                  </time>

                  <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-black">
                    <Link href={`/journals/${journal.id}`} className="hover:underline">
                      {journal.title}
                    </Link>
                  </h3>

                  <p className="mt-3 text-black">{journal.content.substring(0, 100)}...</p>

                  <div className="mt-4">
                    <Link
                      href={`/journals/${journal.id}`}
                      className="inline-flex items-center text-blue-500 hover:text-blue-700"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </li>
            ))
          ) : (
            // Empty state using same timeline format
            <li className="mb-10 ml-6">
              <div className="absolute w-3 h-3 bg-gray-300 rounded-full mt-2 -left-[5px] border border-white dark:border-gray-900 dark:bg-gray-700"></div>
              <div className="p-5 bg-white border border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-gray-500">You haven't written any journals yet. Start capturing your journey today!</p>
              </div>
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
