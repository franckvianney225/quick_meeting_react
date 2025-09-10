'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsLayout } from './components/SettingsLayout';
import { SettingsSidebar } from './components/SettingsSidebar';
import { UsersSection } from './components/UsersSection';
import { OrganizationSection } from './components/OrganizationSection';
import { EmailSection } from './components/EmailSection';
import { BackupSection } from './components/BackupSection';
import { SystemSection } from './components/SystemSection';
import { CreditsSection } from './components/CreditsSection';
import { SecuritySection } from './components/SecuritySection';
import { UserProfile } from '../../components/ui/UserProfile';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

interface OrganizationSettings {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  allowedEmailDomains?: string[];
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
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('users');

  // Données utilisateur connecté
  const currentUser = {
    id: user?.id?.toString() || "1",
    name: user?.name || "Utilisateur",
    role: user?.role || "Utilisateur",
    email: user?.email || "",
    avatar: user?.avatar // Utiliser l'avatar réel de l'utilisateur
  };

  // Handlers pour le profil utilisateur
  const handleLogout = () => {
    logout();
  };

  const handleProfile = () => {
    router.push('/profile');
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
    name: "",
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    allowedEmailDomains: []
  });

  // Charger les paramètres d'organisation depuis le backend
  useEffect(() => {
    const loadOrganizationSettings = async () => {
      try {
        const token = AuthService.getToken();
        const response = await fetch(apiUrl('/organization'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Vérifier si la réponse a du contenu avant de parser le JSON
          const responseText = await response.text();
          if (responseText && responseText.trim() !== '') {
            try {
              const settings = JSON.parse(responseText);
              if (settings) {
                setOrgSettings(settings);
              }
            } catch (parseError) {
              console.error('Erreur lors du parsing JSON:', parseError);
              console.log('Contenu de la réponse:', responseText);
            }
          } else {
            console.log('Réponse vide de l\'API, utilisation des valeurs par défaut');
          }
        } else if (response.status === 404) {
          // Aucune configuration existante, on garde les valeurs par défaut
          console.log('Aucune configuration d\'organisation trouvée, utilisation des valeurs par défaut');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    };

    loadOrganizationSettings();
  }, []);

  // États pour les paramètres SMTP
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    server: 'smtp.gmail.com',
    port: 587,
    username: 'noreply@ministere.gov',
    password: '',
    encryption: 'tls',
    from_email: 'noreply@ministere.gov',
    from_name: "Ministère de l'a Transition Numérique et de la digitalisation"
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
      case 'system':
        return 'Système & Monitoring';
      case 'credits':
        return 'Crédits & Informations';
      case 'security':
        return 'Sécurité & Accès';
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
      case 'system':
        return 'Surveillance et monitoring du système';
      case 'credits':
        return 'Informations sur les technologies et contributeurs';
      case 'security':
        return 'Gestion de la sécurité et contrôle d\'accès';
      default:
        return 'Configuration générale du système';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pb-24 pt-2 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header avec profil utilisateur */}
          <div className="flex items-center justify-between mb-4">
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
              onProfile={handleProfile}
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
                  <BackupSection />
                )}
                {activeSection === 'system' && (
                  <SystemSection />
                )}
                {activeSection === 'credits' && (
                  <CreditsSection />
                )}
                {activeSection === 'security' && (
                  <SecuritySection />
                )}
              </div>
            </div>
          </SettingsLayout>
        </div>
      </div>
    </AuthGuard>
  );
}
