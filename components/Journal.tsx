"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Cloudinary Upload
const uploadImageToServer = async (image: File) => {
  const formData = new FormData();
  formData.append("file", image);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Image upload failed");

    return data.secure_url;
  } catch (error) {
    return null;
  }
};

// Daily Prompts
const prompts = [
  "What are you grateful for today?",
  "Describe a moment that made you smile.",
  "Write about a challenge you faced today.",
  "If you could give your past self one piece of advice, what would it be?",
  "What is something new you learned today?",
  "What is one goal you want to accomplish this week?",
];

export function Journal() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [usePrompt, setUsePrompt] = useState(true);
  const [title, setTitle] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dailyPrompt, setDailyPrompt] = useState("");

  useEffect(() => {
    const today = new Date();
    const promptIndex = today.getDate() % prompts.length;
    setDailyPrompt(prompts[promptIndex]);
  }, []);

  // Handle Image Upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsUploading(true);
      const uploadedUrl = await uploadImageToServer(event.target.files[0]);
      if (uploadedUrl) setImageUrls((prev) => [...prev, uploadedUrl]);
      setIsUploading(false);
    }
  };

  // Save Journal Entry to Database
  const handleSave = async () => {
    if (!session?.user?.id) {
      alert("You must be logged in to save a journal.");
      return;
    }
  
    const newEntry = {
      user_id: session.user.id,
      title: usePrompt ? dailyPrompt : title,
      content: journalEntry,
      images: imageUrls,
    };
  
    try {
      const response = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });
  
      if (!response.ok) throw new Error("Failed to save journal");
  
      setIsOpen(false);
    } catch (error) {
    }
  };
  

  return (
    <>
      <div className="bg-white p-5 rounded-lg shadow-md w-full max-w-md mx-auto border border-gray-300">
        <h3 className="text-lg font-bold text-gray-800">Write a Journal Entry</h3>
        <p className="text-gray-600 text-sm mt-1">Capture your thoughts and memories.</p>
        <button
          className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
          onClick={() => setIsOpen(true)}
        >
          Write Journal
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 text-gray-900">Daily Journal</h2>
            <p className="text-gray-600 mb-4">Write about your day and thoughts.</p>

            <div className="mb-4">
              <label className="block font-semibold text-left text-gray-700">Use Daily Prompt?</label>
              <div className="flex items-center space-x-3">
                <button
                  className={`px-4 py-2 rounded-md ${usePrompt ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  onClick={() => setUsePrompt(true)}
                >
                  Use Prompt
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${!usePrompt ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  onClick={() => setUsePrompt(false)}
                >
                  Custom Title
                </button>
              </div>
            </div>

            {!usePrompt && (
              <div className="mb-4">
                <label className="block font-semibold text-left text-gray-700">Title</label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            )}

            {usePrompt && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <h4 className="text-md font-semibold text-gray-800">{dailyPrompt}</h4>
              </div>
            )}

            <div className="mb-4">
              <label className="block font-semibold text-left text-gray-700">Your Journal</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                placeholder="Write about your day..."
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-left text-gray-700">Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {isUploading && <p className="text-gray-500 text-sm mt-2">Uploading...</p>}

              {/* Show multiple images */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {imageUrls.map((img, index) => (
                  <img key={index} src={img} alt={`Uploaded ${index}`} className="rounded-lg w-full max-h-40" />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition" onClick={handleSave}>
                Save Journal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
