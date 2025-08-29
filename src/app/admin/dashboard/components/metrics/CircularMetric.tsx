'use client';

interface CircularMetricProps {
  title: string;
  value: number;
  max: number;
  color: 'orange' | 'green' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  orange: 'text-orange-500',
  green: 'text-green-500',
  blue: 'text-blue-500', 
  purple: 'text-purple-500'
};

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-20 h-20',
  lg: 'w-24 h-24'
};

export const CircularMetric = ({ title, value, max, color, size = 'md' }: CircularMetricProps) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const circumference = 2 * Math.PI * 36; // Rayon de 36 pour un cercle de 72px de diamètre
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-3 p-4">
      <div className="relative">
        <svg className={`${sizeClasses[size]} transform -rotate-90`} viewBox="0 0 100 100">
          {/* Cercle de fond */}
          <circle
            cx="50"
            cy="50"
            r="36"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          
          {/* Cercle de progression */}
          <circle
            cx="50"
            cy="50"
            r="36"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClasses[color]} transition-all duration-1000 ease-out`}
          />
        </svg>
        
        {/* Texte au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-center font-bold ${
            size === 'sm' ? 'text-sm' : 
            size === 'md' ? 'text-base' : 
            'text-lg'
          } ${colorClasses[color]}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      <div className="text-center">
        <div className={`font-semibold ${
          size === 'sm' ? 'text-sm' : 
          size === 'md' ? 'text-base' : 
          'text-lg'
        } text-gray-900`}>
          {value}/{max}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {title}
        </div>
      </div>
    </div>
  );
};