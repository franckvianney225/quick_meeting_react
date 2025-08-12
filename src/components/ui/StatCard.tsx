import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: number;
}

export const StatCard = ({ title, value, icon: Icon, color = "blue", trend }: StatCardProps) => {
  return (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-6 border border-${color}-200 hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% ce mois
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-500`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );
};