'use client';
import { 
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { type Meeting } from './MeetingCard';

export const MeetingListItem = ({ meeting, onView, onEdit, onDelete, onGenerateQR }: {
  meeting: Meeting;
  onView: (meeting: Meeting) => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onGenerateQR: (meeting: Meeting) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-all duration-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-1">{meeting.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-1">{meeting.description}</p>
              <span className="text-xs text-gray-500 font-mono">{meeting.unique_code}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 flex-shrink-0" />
              <span>{formatDate(meeting.start_date)}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{meeting.location}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserGroupIcon className="h-4 w-4 flex-shrink-0" />
              <span>{meeting.max_participants || '∞'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
              {meeting.status === 'active' ? 'Active' : meeting.status === 'completed' ? 'Terminée' : 'Inactive'}
            </span>

            <div className="flex items-center space-x-1">
              <button 
                onClick={() => onView(meeting)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Voir"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              
              <button 
                onClick={() => onEdit(meeting)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Modifier"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              
              <button 
                onClick={() => onGenerateQR(meeting)}
                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="QR Code"
              >
                <QrCodeIcon className="h-4 w-4" />
              </button>
              
              <button 
                onClick={() => onDelete(meeting)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};