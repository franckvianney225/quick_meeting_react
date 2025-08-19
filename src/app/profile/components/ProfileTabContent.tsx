'use client';
import { ProfileForm } from './ProfileForm';
import { SecurityTab } from './SecurityTab';
import { NotificationsTab } from './NotificationsTab';
import { SettingsTab } from './SettingsTab';

interface ProfileTabContentProps {
  activeTab: string;
  user: any;
  isEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  refreshError?: string | null;
  onRefresh?: () => void;
}

export const ProfileTabContent = ({
  activeTab,
  user,
  isEditing,
  onInputChange,
  onEdit,
  onSave,
  onCancel,
  refreshError,
  onRefresh
}: ProfileTabContentProps) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileForm
            user={user}
            isEditing={isEditing}
            onInputChange={onInputChange}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      case 'security':
        return (
          <SecurityTab
            refreshError={refreshError}
            onRefresh={onRefresh}
          />
        );
      case 'notifications':
        return (
          <NotificationsTab
            refreshError={refreshError}
            onRefresh={onRefresh}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            refreshError={refreshError}
            onRefresh={onRefresh}
          />
        );
      default:
        return (
          <div className="p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contenu non disponible</h3>
              <p className="text-gray-500">Cette section est en cours de développement.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm">
      {renderTabContent()}
    </div>
  );
};