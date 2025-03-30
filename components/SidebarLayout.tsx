"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  CalendarIcon, 
  BookOpenIcon, 
  PencilSquareIcon, 
  NewspaperIcon, 
  UserIcon, 
  ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/outline";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex">
     
      <aside className="w-64 bg-indigo-50 border-r p-4 sticky top-0 h-screen flex flex-col justify-between">
        
        <div>
          <h2 className="text-lg font-semibold">MindScribe</h2>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-2">
            <SidebarItem href="/today" icon={CalendarIcon} label="Today" active={pathname === "/today"} />
            <SidebarItem href="/journals" icon={BookOpenIcon} label="Journals" active={pathname === "/journals"} />
            <SidebarItem href="/reflections" icon={PencilSquareIcon} label="Reflections" active={pathname === "/reflections"} />
            <SidebarItem href="/friends-newsletter" icon={NewspaperIcon} label="Friends Newsletter" active={pathname === "/friends-newsletter"} />
          </nav>
        </div>

        {/* User Actions */}
        <div className="mb-4">
          
          {/* Sign Out Button */}
          <button
            onClick={() => {
              document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              signOut({ callbackUrl: "/sign-in" }); 
            }}
            className="w-full flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:bg-gray-200 transition"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-h-screen">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

// Sidebar Item Component
function SidebarItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center space-x-2 p-2 rounded-md ${active ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"} transition`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}
