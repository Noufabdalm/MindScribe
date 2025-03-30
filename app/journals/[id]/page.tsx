"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Journal = {
  id: string;
  title: string;
  created_at: string;
  content: string;
  images: string[]; 
};

export default function JournalPage() {
  const { id } = useParams();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJournal() {
      try {
        const response = await fetch(`/api/journals/${id}`);
        if (!response.ok) {
          throw new Error("Journal not found");
        }
        const data = await response.json();
        setJournal(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchJournal();
    }
  }, [id]);

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading journal...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  if (!journal) {
    return <p className="text-center text-gray-600 mt-10">Journal not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-300">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">{journal.title}</h1>

      {/* Date */}
      <p className="text-gray-500 text-sm mt-1">
        {new Date(journal.created_at).toLocaleDateString()}
      </p>

      {/* Content */}
      <p className="mt-4 text-gray-800 leading-relaxed">{journal.content}</p>

      {/* Images */}
      {journal.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {journal.images.map((image, index) => (
            <img key={index} src={image} alt={`Journal Image ${index + 1}`} className="rounded-lg w-full" />
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6">
        <a href="/journals" className="text-blue-500 hover:text-blue-700">
          ← Back to Journals
        </a>
      </div>
    </div>
  );
}
