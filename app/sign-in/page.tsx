"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  const handleLogin = async () => {
    await signIn("google");
    const response = await fetch("/api/auth/callback");

    if (response.ok) {
      router.push("/today");
    } else {
      console.error("Failed to store user in DB");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-10 max-w-md w-full text-center">
        {/* App Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mindscribe</h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 text-sm">
          Reflect deeply. Journal freely. Capture moments of clarity as they happen.
        </p>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-base font-medium transition duration-200"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
