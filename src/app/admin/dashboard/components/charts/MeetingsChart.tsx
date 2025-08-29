'use client';

interface MeetingsChartProps {
  data: { month: string; count: number }[];
  title: string;
}

export const MeetingsChart = ({ data, title }: MeetingsChartProps) => {
  const maxCount = Math.max(...data.map(item => item.count), 0);
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      
      {data.length === 0 ? (
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Aucune donnée disponible</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item.month}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.count} réunion{item.count !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};