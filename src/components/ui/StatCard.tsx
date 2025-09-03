import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: number;
}

export const StatCard = ({ title, value, icon: Icon, color = "blue", trend }: StatCardProps) => {
  // Définir les styles pour chaque couleur de manière explicite
  const colorStyles = {
    blue: {
      background: "bg-gradient-to-br from-blue-50 to-blue-100",
      border: "border-blue-200",
      text: "text-blue-600",
      iconBg: "bg-blue-500"
    },
    green: {
      background: "bg-gradient-to-br from-green-50 to-green-100",
      border: "border-green-200",
      text: "text-green-600",
      iconBg: "bg-green-500"
    },
    red: {
      background: "bg-gradient-to-br from-red-50 to-red-100",
      border: "border-red-200",
      text: "text-red-600",
      iconBg: "bg-red-500"
    },
    orange: {
      background: "bg-gradient-to-br from-orange-50 to-orange-100",
      border: "border-orange-200",
      text: "text-orange-600",
      iconBg: "bg-orange-500"
    },
    gray: {
      background: "bg-gradient-to-br from-gray-50 to-gray-100",
      border: "border-gray-200",
      text: "text-gray-600",
      iconBg: "bg-gray-500"
    },
    slate: {
      background: "bg-gradient-to-br from-slate-50 to-slate-100",
      border: "border-slate-200",
      text: "text-slate-600",
      iconBg: "bg-slate-500"
    }
  };

  const currentStyle = colorStyles[color as keyof typeof colorStyles] || colorStyles.blue;

  return (
    <div className={`${currentStyle.background} rounded-xl p-4 sm:p-6 border ${currentStyle.border} hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">{title}</p>
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${currentStyle.text} mt-1 sm:mt-2`}>{value}</p>
          {trend !== undefined && trend !== 0 && (
            <p className={`text-xs sm:text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% ce mois
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${currentStyle.iconBg} ml-2 sm:ml-3 flex-shrink-0`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
        </div>
      </div>
    </div>
  );
};