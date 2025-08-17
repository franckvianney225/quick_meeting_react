'use client';
import {
  UserGroupIcon,
  BuildingOffice2Icon, 
  EnvelopeIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const sections = [
  { id: 'users', label: 'Utilisateurs', icon: UserGroupIcon, color: 'orange' },
  { id: 'organization', label: 'Organisation', icon: BuildingOffice2Icon, color: 'blue' },
  { id: 'email', label: 'Configuration Email', icon: EnvelopeIcon, color: 'green' },
  { id: 'backup', label: 'Sauvegardes', icon: CloudArrowUpIcon, color: 'purple' },
  { id: 'security', label: 'Sécurité', icon: ShieldCheckIcon, color: 'red' },
  { id: 'system', label: 'Système', icon: CogIcon, color: 'gray' }
];

export const SettingsSidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  return (
    <nav className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-8">
      <div className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                activeSection === section.id
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{section.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};