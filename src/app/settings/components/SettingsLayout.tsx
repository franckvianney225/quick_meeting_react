'use client';
import { ReactNode } from 'react';
import { Title } from '@/components/ui/Title';

interface SettingsLayoutProps {
  children: ReactNode;
}

export const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </div>
    </div>
  );
};
