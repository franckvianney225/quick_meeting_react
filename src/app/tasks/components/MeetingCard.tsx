'use client';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserGroupIcon, 
  QrCodeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export interface Meeting {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'inactive';
  start_date?: string;
  location?: string;
  max_participants?: number;
  unique_code: string;
}

interface MeetingCardProps {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onView: (meeting: Meeting) => void;
  onGenerateQR: (meeting: Meeting) => void;
}

export const MeetingCard = ({ 
  meeting, 
  onEdit, 
  onDelete, 
  onView, 
  onGenerateQR 
}: MeetingCardProps) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{meeting.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{meeting.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
          {meeting.status === 'active' ? 'Active' : meeting.status === 'completed' ? 'Terminée' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2 text-gray-600">
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm">{formatDate(meeting.start_date)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPinIcon className="h-4 w-4" />
          <span className="text-sm">{meeting.location || 'Lieu non défini'}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600">
          <UserGroupIcon className="h-4 w-4" />
          <span className="text-sm">
            {meeting.max_participants ? `Max ${meeting.max_participants}` : 'Illimité'} participants
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="text-sm font-medium">Code: {meeting.unique_code}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <button 
            onClick={() => onView(meeting)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Voir détails"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => onEdit(meeting)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => onDelete(meeting)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        
        <button 
          onClick={() => onGenerateQR(meeting)}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <QrCodeIcon className="h-4 w-4" />
          <span className="text-sm font-medium">QR Code</span>
        </button>
      </div>
    </div>
  );
};