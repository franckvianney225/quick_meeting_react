'use client';
import { ReactNode } from 'react';
import { Title } from '@/components/ui/Title';

interface SettingsLayoutProps {
  children: ReactNode;
}

export const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-left">
          <Title className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2 text-left">
            Paramètres Système
          </Title>
          <p className="text-gray-600">Configuration et administration de l&apos;application</p>
        </div>
        {children}
      </div>
    </div>
  );
};
