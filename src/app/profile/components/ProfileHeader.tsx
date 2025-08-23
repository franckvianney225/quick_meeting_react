'use client';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface ProfileHeaderProps {
  title: string;
  description: string;
  isRefreshing?: boolean;
}

export const ProfileHeader = ({ title, description, isRefreshing = false }: ProfileHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-black mb-2">
        {title}
      </h1>
      <p className="text-gray-600">{description}</p>
      
      {isRefreshing && (
        <div className="absolute top-4 right-4 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </div>
      )}
    </div>
  );
};