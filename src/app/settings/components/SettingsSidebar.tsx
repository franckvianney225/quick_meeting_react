'use client';
import {
  UserGroupIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  CogIcon,
  InformationCircleIcon
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
  { id: 'system', label: 'Système', icon: CogIcon, color: 'gray' },
  { id: 'credits', label: 'Credits', icon: InformationCircleIcon, color: 'indigo' }
];

export const SettingsSidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  return (
    <nav className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sticky top-4">
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900 mb-6 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
          Paramètres
        </h3>
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          const getColors = () => {
            if (isActive) {
              return {
                bg: 'bg-gradient-to-r from-orange-50 to-green-50',
                text: 'text-orange-700',
                border: 'border-orange-200',
                icon: 'text-orange-600'
              };
            }
            return {
              bg: 'hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-green-50/50',
              text: 'text-gray-600 hover:text-gray-900',
              border: '',
              icon: 'text-gray-500 group-hover:text-orange-500'
            };
          };

          const colors = getColors();

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`group w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 text-left border ${colors.bg} ${colors.text} ${colors.border} hover:scale-105 active:scale-95 shadow-sm hover:shadow-md`}
            >
              <Icon className={`w-5 h-5 mr-4 transition-all duration-300 ${colors.icon}`} />
              <span className="font-medium text-sm">{section.label}</span>
              {isActive && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-green-600 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};