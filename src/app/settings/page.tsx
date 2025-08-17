'use client';
import { useState } from 'react';
import { SettingsLayout } from './components/SettingsLayout';
import { SettingsSidebar } from './components/SettingsSidebar';
import { UsersSection } from './components/UsersSection';
import { OrganizationSection } from './components/OrganizationSection';
import { EmailSection } from './components/EmailSection';
import { BackupSection } from './components/BackupSection';
import { UserProfile } from '../../components/ui/UserProfile';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

interface OrganizationSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
}

interface SMTPConfig {
  server: string;
  port: number;
  username: string;
  password: string;
  encryption: 'none' | 'tls' | 'ssl';
  from_email: string;
  from_name: string;
}

interface Backup {
  id: number;
  name: string;
  date: string;
  size: string;
  status: 'success' | 'failed';
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('users');
  
  // Données utilisateur connecté
  const currentUser = {
    id: "1",
    name: "Vianney Kouadio",
    role: "Développeur Full Stack",
    email: "vianney@gouvernement.ci",
    avatar: "/images/avatar.jpg" // optionnel
  };

  // Handlers pour le profil utilisateur
  const handleLogout = () => {
    console.log("Déconnexion...");
    // Logique de déconnexion
    // Exemple: router.push('/login');
  };

  const handleSettings = () => {
    console.log("Déjà dans les paramètres");
    // Peut-être scroll vers le haut ou afficher un message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // États pour les utilisateurs
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Jean Dupont', email: 'jean@ministere.gov', role: 'Administrateur', status: 'active', lastLogin: '2 heures' },
    { id: 2, name: 'Marie Martin', email: 'marie@ministere.gov', role: 'Gestionnaire', status: 'active', lastLogin: '1 jour' },
    { id: 3, name: 'Pierre Durand', email: 'pierre@ministere.gov', role: 'Utilisateur', status: 'inactive', lastLogin: '1 semaine' }
  ]);

  // États pour les paramètres de l'organisation
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    name: 'Ministère de l&apos;Intérieur',
    address: '11 Rue des Saussaies, 75008 Paris',
    phone: '+33 1 49 27 49 27',
    email: 'contact@ministere.gov',
    website: 'https://www.interieur.gouv.fr',
    logo: '/logo-ministere.png'
  });

  // États pour les paramètres SMTP
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    server: 'smtp.gmail.com',
    port: 587,
    username: 'noreply@ministere.gov',
    password: '',
    encryption: 'tls',
    from_email: 'noreply@ministere.gov',
    from_name: 'Ministère de l&apos;Intérieur'
  });

  // États pour les sauvegardes
  const [backups] = useState<Backup[]>([
    { id: 1, name: 'Sauvegarde complète - 15/08/2024', date: '2024-08-15T10:30:00', size: '2.5 GB', status: 'success' },
    { id: 2, name: 'Sauvegarde complète - 14/08/2024', date: '2024-08-14T10:30:00', size: '2.4 GB', status: 'success' },
    { id: 3, name: 'Sauvegarde complète - 13/08/2024', date: '2024-08-13T10:30:00', size: '2.3 GB', status: 'failed' }
  ]);

  const handleBackup = () => {
    alert('Sauvegarde en cours...');
  };

  const handleRestore = (backupId: number) => {
    if (confirm('Êtes-vous sûr de vouloir restaurer cette sauvegarde ?')) {
      alert('Restauration en cours...');
    }
  };

  // Fonction pour obtenir le titre de la section active
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'users':
        return 'Gestion des Utilisateurs';
      case 'organization':
        return 'Paramètres de l\'Organisation';
      case 'email':
        return 'Configuration Email';
      case 'backup':
        return 'Sauvegarde & Restauration';
      default:
        return 'Paramètres';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'users':
        return 'Gérez les utilisateurs et leurs permissions';
      case 'organization':
        return 'Configurez les informations de votre organisation';
      case 'email':
        return 'Paramètres de configuration SMTP et notifications';
      case 'backup':
        return 'Sauvegardez et restaurez vos données';
      default:
        return 'Configuration générale du système';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-8 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header avec profil utilisateur */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getSectionTitle()}
            </h1>
            <p className="text-gray-600">
              {getSectionDescription()}
            </p>
          </div>
          
          {/* Profil utilisateur en haut à droite */}
          <UserProfile 
            user={currentUser}
            onLogout={handleLogout}
            onSettings={handleSettings}
          />
        </div>

        {/* Contenu principal */}
        <SettingsLayout>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <SettingsSidebar 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />

            <div className="xl:col-span-4">
              {activeSection === 'users' && (
                <UsersSection users={users} setUsers={setUsers} />
              )}
              {activeSection === 'organization' && (
                <OrganizationSection 
                  settings={orgSettings}
                  setSettings={setOrgSettings}
                />
              )}
              {activeSection === 'email' && (
                <EmailSection 
                  config={smtpConfig}
                  setConfig={setSmtpConfig}
                />
              )}
              {activeSection === 'backup' && (
                <BackupSection
                  backups={backups}
                  onBackup={handleBackup}
                  onRestore={handleRestore}
                />
              )}
            </div>
          </div>
        </SettingsLayout>
      </div>
    </div>
  );
}
