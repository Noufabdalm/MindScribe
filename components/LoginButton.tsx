"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession(); 

  return (
    <div>
      {session ? (
        <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded-md">
          Sign Out
        </button>
      ) : (
        <button onClick={() => signIn("google")} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Sign In with Google
        </button>
      )}
    </div>
  );
}
