"use client";

import { useState, useEffect } from "react";

// API Calls
const fetchMailingList = async () => {
  const response = await fetch("/api/mailing-list");
  if (!response.ok) throw new Error("Failed to fetch mailing list");
  return response.json();
};

const addEmailToDB = async (email: string) => {
  const response = await fetch("/api/mailing-list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error("Failed to add email");
};

const removeEmailFromDB = async (email: string) => {
  const response = await fetch("/api/mailing-list", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error("Failed to remove email");
};

interface MailingListModalProps {
  onClose: () => void;
}

export default function MailingListModal({ onClose }: MailingListModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState<string>("");

  useEffect(() => {
    const loadEmails = async () => {
      try {
        const data = await fetchMailingList();
        setEmails(data);
      } catch (error) {
      }
    };
    loadEmails();
  }, []);

  const addEmail = async () => {
    if (!newEmail.trim()) return alert("Please enter an email.");

      await addEmailToDB(newEmail);
      setEmails((prev) => [...prev, newEmail]);
      setNewEmail("");
   
  };

  const removeEmail = async (email: string) => {

      await removeEmailFromDB(email);
      setEmails((prev) => prev.filter((e) => e !== email));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Mailing List</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Add New Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="example@email.com"
              className="flex-grow p-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={addEmail}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Add
            </button>
          </div>
        </div>

        <ul className="space-y-2 max-h-60 overflow-y-auto border-t pt-3">
          {emails.map((email, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{email}</span>
              <button
                className="text-red-500 hover:text-red-700 text-sm"
                onClick={() => removeEmail(email)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
