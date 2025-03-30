"use client";

import { useState } from "react";
import { useSession } from "next-auth/react"; 

interface ReflectionEntry {
  thought: string;
  reflection: string;
  emotion: string;
}

const saveReflectionToDB = async (reflection: ReflectionEntry) => {
  try {
    const response = await fetch("/api/reflections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reflection),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save reflection");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};

export function QuickReflection() {
  const { data: session } = useSession(); 
  const [isOpen, setIsOpen] = useState(false);
  const [thought, setThought] = useState("");
  const [reflection, setReflection] = useState("");
  const [emotion, setEmotion] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!thought || !reflection || !emotion) {
      alert("Please fill in all fields.");
      return;
    }

   

    setIsSaving(true);
    try {
      await saveReflectionToDB({ thought, reflection, emotion });
      console.log("Reflection saved successfully:", { thought, reflection, emotion });

      // Reset fields
      setThought("");
      setReflection("");
      setEmotion("");
      setIsOpen(false);
    } catch (error) {
      alert("Failed to save reflection. Check the console for more details.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {/* Reflection Card */}
      <div className="bg-white p-5 rounded-lg shadow-md w-full max-w-md mx-auto border border-gray-300">
        <h3 className="text-lg font-bold text-gray-800">Log a quick reflection</h3>
        <p className="text-gray-600 text-sm mt-1">Having some realization that you want to write?</p>
        <button
          className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
          onClick={() => setIsOpen(true)}
        >
          Reflect
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 text-gray-900">Quick Reflection</h2>
            <p className="text-gray-600 mb-4">Take a moment to reflect on your thoughts and emotions.</p>

            {/* Thought Input */}
            <div className="mb-4">
              <label className="block font-semibold text-left text-gray-700">Thought</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="What realization did you have?"
                value={thought}
                onChange={(e) => setThought(e.target.value)}
              />
            </div>

            {/* Reflection Input */}
            <div className="mb-4">
              <label className="block font-semibold text-left text-gray-700">Reflection</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Write your reflection..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
            </div>

            {/* Emotion Selector */}
            <div className="mb-4">
              <label className="block font-semibold text-left text-gray-700">Emotions Felt</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
              >
                <option value="">Select Emotion</option>
                <option value="Happy">Happy 😊</option>
                <option value="Calm">Calm 😌</option>
                <option value="Anxious">Anxious 😟</option>
                <option value="Sad">Sad 😢</option>
                <option value="Angry">Angry 😠</option>
                <option value="Excited">Excited 🤩</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Reflection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
