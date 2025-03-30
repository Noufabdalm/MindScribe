"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";



type Reflection = {
  id: string;
  title: string;
  date: string;
  content: string;
  emotion: string;
};

export default function ReflectionPage() {
  const { id } = useParams();
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReflection() {
      try {
        const response = await fetch(`/api/reflections/${id}`);
        if (!response.ok) {
          throw new Error("Reflection not found");
        }
        const data = await response.json();
        setReflection(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchReflection();
    }
  }, [id]);

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading reflection...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  if (!reflection) {
    return <p className="text-center text-gray-600 mt-10">Reflection not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-300">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">{reflection.title}</h1>

      {/* Date & Emotion */}
      <p className="text-gray-500 text-sm mt-1">
        {reflection.date} - Feeling: <span className="font-semibold">{reflection.emotion}</span>
      </p>

      {/* Reflection Content */}
      <p className="mt-4 text-gray-800 leading-relaxed">{reflection.content}</p>

      <div className="mt-6">
        <Link href="/reflections" className="text-blue-500 hover:text-blue-700">
          ← Back to Reflections
        </Link>
      </div>
    </div>
  );
}
