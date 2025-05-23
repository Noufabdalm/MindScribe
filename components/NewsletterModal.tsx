"use client";

import { useState } from "react";
import Image from "next/image";

const uploadImageToServer = async (image: File): Promise<string | null> => {
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
    console.error("Failed to upload:", error);
    return null;
  }
};

interface NewsletterModalProps {
  newsletterId: string;
  onClose: () => void;
  onSave: (entry: {
    title: string;
    content: string;
    image: string | null;
    date: string;
  }) => void;
}

export default function NewsletterModal({
  onClose,
  onSave,
}: NewsletterModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsUploading(true);
      const uploaded = await uploadImageToServer(event.target.files[0]);
      if (uploaded) setImageUrl(uploaded);
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!title || !content) {
      alert("Title and content are required.");
      return;
    }

    onClose();
    onSave({
      title,
      content,
      image: imageUrl,
      date: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Write Newsletter Entry</h2>

        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border border-gray-300 rounded-md mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Write here..."
          className="w-full p-2 border border-gray-300 rounded-md mb-3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="mb-4">
          <label className="block font-semibold text-left text-gray-700">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {isUploading && <p className="text-gray-500 text-sm mt-2">Uploading...</p>}
          {imageUrl && (
            <div className="relative mt-2 w-full h-40 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt="Preview"
                fill
                className="object-cover rounded-lg"
                sizes="100vw"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
            onClick={handleSave}
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}
