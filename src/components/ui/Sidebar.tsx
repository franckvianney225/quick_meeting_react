'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ClipboardDocumentIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';

export const Sidebar = () => {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-100 rounded-lg px-8 py-2">
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="p-3 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 group"
          >
            <HomeIcon className={`h-6 w-6 transition-colors ${pathname === '/' ? 'text-orange-500' : 'text-gray-700 group-hover:text-orange-500'}`} />
          </Link>

          <Link
            href="/tasks"
            className="p-3 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 group"
          >
            <ClipboardDocumentIcon className={`h-6 w-6 transition-colors ${pathname === '/tasks' ? 'text-orange-500' : 'text-gray-700 group-hover:text-orange-500'}`} />
          </Link>

          <Link
            href="/profile"
            className="p-3 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 group"
          >
            <UserIcon className={`h-6 w-6 transition-colors ${pathname === '/profile' ? 'text-orange-500' : 'text-gray-700 group-hover:text-orange-500'}`} />
          </Link>

          <Link
            href="/settings"
            className="p-3 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 group"
          >
            <CogIcon className={`h-6 w-6 transition-colors ${pathname === '/settings' ? 'text-orange-500' : 'text-gray-700 group-hover:text-orange-500'}`} />
          </Link>
        </div>
      </div>
    </nav>
  );
};
