import Link from 'next/link';
import { ReactNode } from 'react';

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

export const QuickActionCard = ({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  color = "blue" 
}: QuickActionCardProps) => {
  return (
    <Link href={href} className="group">
      <div className={`bg-white rounded-xl p-6 border-2 border-${color}-100 hover:border-${color}-300 hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full bg-${color}-500 group-hover:bg-${color}-600 transition-colors`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};