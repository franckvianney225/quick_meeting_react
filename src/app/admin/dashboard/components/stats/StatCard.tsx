'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'orange' | 'green' | 'blue' | 'purple' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  orange: 'from-orange-500 to-orange-600',
  green: 'from-green-500 to-green-600', 
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  red: 'from-red-500 to-red-600'
};

export const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {value}
          </div>
          <div className="text-gray-600 text-sm font-medium">
            {title}
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend.isPositive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};