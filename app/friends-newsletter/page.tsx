"use client";

import { useEffect, useState } from "react";
import NewsletterModal from "@/components/NewsletterModal";
import MailingListModal from "@/components/MailingListModal";
import Link from "next/link";

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

const getMonthName = () => new Date().toLocaleString("default", { month: "long" });

function getSecondsUntilMonthEnd(): number {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
  return Math.floor((endOfMonth.getTime() - now.getTime()) / 1000);
}

export default function FriendsNewsletterPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMailingListOpen, setIsMailingListOpen] = useState(false);
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(getSecondsUntilMonthEnd());

  const currentMonth = getMonthName();

  // Countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadOrCreateNewsletter() {
      try {
        const res = await fetch("/api/newsletters");
        const allNewsletters = await res.json();

        let current = allNewsletters.find((n: Newsletter) => n.month === currentMonth);

        if (!current) {
          const createRes = await fetch("/api/newsletters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Draft" }),
          });

          current = await createRes.json();
        }

        const entriesRes = await fetch(`/api/newsletters/${current.id}/entries`);
        const entries = await entriesRes.json();

        setNewsletter({ ...current, entries: Array.isArray(entries) ? entries : [] });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadOrCreateNewsletter();
  }, [currentMonth]);

  const handleSaveEntry = async (entry: {
    title: string;
    content: string;
    image: string | null;
    date: string;
  }) => {
    if (!newsletter) return;

    await fetch(`/api/newsletters/${newsletter.id}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: entry.title,
        content: entry.content,
        images: entry.image ? [entry.image] : [],
      }),
    });

    const updated = await fetch(`/api/newsletters/${newsletter.id}/entries`);
    const fresh = await updated.json();
    setNewsletter((prev) => prev ? { ...prev, entries: fresh } : prev);
  };

  const sendNewsletter = async () => {
    if (!newsletter) return;

    const res = await fetch(`/api/newsletters/${newsletter.id}/send`, { method: "POST" });
    if (res.ok) {
      alert("Newsletter sent!");
      setNewsletter((prev) => prev ? { ...prev, status: "Sent" } : prev);
    } 
  };

  const formatCountdown = (seconds: number) => {
    const d = Math.floor(seconds / (60 * 60 * 24));
    const h = Math.floor((seconds % (60 * 60 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  if (!newsletter) return <p className="text-center text-red-600 mt-10">Newsletter not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-900">{newsletter.month} Newsletter</h2>
          <button
            onClick={() => setIsMailingListOpen(true)}
            className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            View Mailing List
          </button>
        </div>

        {/* Countdown */}
        {newsletter.status === "Draft" && (
          <div className="mb-4 text-sm text-gray-700 bg-yellow-50 p-3 rounded-md border border-yellow-300">
            <strong>Auto-send in:</strong> {formatCountdown(secondsRemaining)}
            <button
              onClick={sendNewsletter}
              className="ml-4 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
            >
              Send Now
            </button>
          </div>
        )}

        {/* Newsletter Card */}
        <div className="bg-white shadow-md rounded-lg p-5 border border-gray-300">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{newsletter.month} Newsletter</h3>
            <span className={`text-sm px-3 py-1 rounded-full ${
              newsletter.status === "Sent"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {newsletter.status}
            </span>
          </div>

          {/* Entries */}
          <div className="mt-4 space-y-3">
            {newsletter.entries.length === 0 ? (
              <p className="text-gray-500 text-sm">No entries yet.</p>
            ) : (
              newsletter.entries.slice(0, 2).map((entry) => (
                <div key={entry.id} className="p-3 bg-gray-100 rounded-md">
                  <p className="text-sm text-gray-600">{new Date(entry.created_at).toLocaleDateString()}</p>
                  <h4 className="text-md font-bold text-gray-800">{entry.title}</h4>
                  <p className="text-gray-700 text-sm">{entry.content.slice(0, 80)}...</p>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          {newsletter.status !== "Sent" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Add Entry
            </button>
          )}

          <Link
            href={`/friends-newsletter/${newsletter.id}`}
            className="mt-3 inline-block text-center w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition"
          >
            View Full Newsletter →
          </Link>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && newsletter && (
        <NewsletterModal
          newsletterId={newsletter.id}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEntry}
        />
      )}
      {isMailingListOpen && <MailingListModal onClose={() => setIsMailingListOpen(false)} />}
    </div>
  );
}
