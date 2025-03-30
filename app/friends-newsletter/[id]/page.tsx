"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type NewsletterEntry = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  images: string[];
};

type Newsletter = {
  id: string;
  month: string;
  status: string;
  created_at: string;
  entries: NewsletterEntry[];
};

export default function NewsletterPage() {
  const params = useParams();
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    const fetchNewsletter = async () => {
      try {
        const res = await fetch(`/api/newsletters`);
        const newsletters = await res.json();
        const current = newsletters.find((n: Newsletter) => n.id.toString() === params.id);

        if (!current) {
          setNewsletter(null);
          return;
        }

        const entriesRes = await fetch(`/api/newsletters/${params.id}/entries`);
        const entries = await entriesRes.json();

        setNewsletter({
          ...current,
          entries: Array.isArray(entries) ? entries : [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletter();
  }, [params?.id]);

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading newsletter...</p>;
  if (!newsletter) return <p className="text-center text-red-600 mt-10">Newsletter not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-300">
      
      <Link href="/friends-newsletter" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
        ← Back to All Newsletters
      </Link>

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">{newsletter.month} Newsletter</h1>
      <p className="text-gray-500 mt-1">
        Created on: {new Date(newsletter.created_at).toLocaleDateString()}
      </p>
      <p className={`mt-2 px-3 py-1 rounded-md inline-block text-sm ${
        newsletter.status === "Sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
      }`}>
        Status: {newsletter.status}
      </p>

      {/* Entries */}
      <div className="mt-6 space-y-6">
        {newsletter.entries.map((entry) => (
          <div key={entry.id} className="p-5 bg-blue-50 border-l-4 border-blue-500 rounded-md">
            <p className="text-sm text-gray-500 mb-1">{new Date(entry.created_at).toDateString()}</p>
            <h3 className="text-lg font-semibold text-gray-800">{entry.title}</h3>
            <p className="text-gray-700 mt-2">{entry.content}</p>

            {entry.images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {entry.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Entry ${entry.id} Image ${i}`}
                    className="rounded-md w-full max-h-64 object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
