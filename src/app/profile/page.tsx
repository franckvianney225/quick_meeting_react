'use client';
import { useState, useEffect } from 'react';
import {
  UserCircleIcon, 
  Cog6ToothIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LockClosedIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  BellIcon,
  MoonIcon,
  CameraIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    role: 'Administrateur',
    department: 'Ministère de l\'Intérieur',
    avatar: '/default-avatar.jpg',
    joinedDate: '15 janvier 2023',
    lastLogin: '2 heures'
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsRefreshing(true);
      setRefreshError(null);
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Erreur de chargement');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        setRefreshError(error instanceof Error ? error.message : 'Erreur inconnue');
        console.error('Erreur:', error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    fetchUserData();
  }, [refreshKey]);

  const handleSave = async () => {
    try {
      // Enregistrer les modifications
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }
      
      setIsEditing(false);
      setRefreshKey(prev => prev + 1); // Force le rafraîchissement
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset des changements si nécessaire
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: UserCircleIcon },
    { id: 'security', label: 'Sécurité', icon: LockClosedIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'settings', label: 'Paramètres', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        {isRefreshing && (
          <div className="absolute top-4 right-4 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Chargement...
          </div>
        )}
        {/* Header avec accent orange */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Mon Profil
          </h1>
          <p className="text-gray-600">Gérez vos informations personnelles et préférences</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar Profile Card avec accents orange */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center sticky top-8 relative overflow-hidden">
              {/* Accent orange en arrière-plan */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-orange-500 to-orange-400"></div>
              
              <div className="relative z-10">
                <div className="relative inline-block mb-6 mt-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center overflow-hidden mx-auto border-4 border-white shadow-lg">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircleIcon className="w-20 h-20 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 rounded-full p-2 shadow-lg border-2 border-white transition-colors">
                    <CameraIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
                <p className="text-orange-600 font-medium mb-1">{user.role}</p>
                <p className="text-gray-500 text-sm mb-6">{user.department}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 px-3 bg-orange-50 border border-orange-100 rounded-lg">
                    <span className="text-gray-600">Membre depuis</span>
                    <span className="font-medium text-orange-700">{user.joinedDate}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Dernière connexion</span>
                    <span className="font-medium text-gray-900">Il y a {user.lastLogin}</span>
                  </div>
                </div>

                {/* Navigation Tabs avec accent orange */}
                <nav className="mt-8 space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations personnelles</h2>
                      <p className="text-gray-600">Gérez vos informations de profil</p>
                    </div>
                    <div className="flex space-x-3">
                      {isEditing ? (
                        <>
                          <button 
                            onClick={handleCancel}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            <span>Annuler</span>
                          </button>
                          <button 
                            onClick={handleSave}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            <CheckIcon className="w-4 h-4" />
                            <span>Enregistrer</span>
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Modifier</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Nom complet */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Nom complet</label>
                      <div className="relative">
                        <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={user.name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          />
                        ) : (
                          <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                            {user.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Adresse email</label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          />
                        ) : (
                          <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Numéro de téléphone</label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={user.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          />
                        ) : (
                          <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Département */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Département</label>
                      <div className="relative">
                        <Cog6ToothIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="department"
                            value={user.department}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          />
                        ) : (
                          <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                            {user.department}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-8">
                  {refreshError && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{refreshError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sécurité du compte</h2>
                    <p className="text-gray-600">Protégez votre compte avec des paramètres de sécurité avancés</p>
                  </div>

                  <div className="space-y-8">
                    {/* Changer mot de passe avec accent orange */}
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                          <KeyIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Changer le mot de passe</h3>
                          <p className="text-sm text-gray-600">Mettez à jour votre mot de passe régulièrement</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                          <input
                            type="password"
                            name="current"
                            value={passwords.current}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                          <input
                            type="password"
                            name="new"
                            value={passwords.new}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                          <input
                            type="password"
                            name="confirm"
                            value={passwords.confirm}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      
                      <button className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                        Mettre à jour le mot de passe
                      </button>
                    </div>

                    {/* Authentification 2FA */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Authentification à deux facteurs</h3>
                            <p className="text-sm text-gray-600">Ajoutez une couche de sécurité supplémentaire</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Non activée</span>
                          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            Activer
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sessions actives */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <ComputerDesktopIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Sessions actives</h3>
                          <p className="text-sm text-gray-600">Gérez vos appareils connectés</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-orange-200">
                          <div className="flex items-center">
                            <ComputerDesktopIcon className="w-5 h-5 text-orange-500 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">Chrome sur Windows</p>
                              <p className="text-sm text-gray-500">Paris, France • Session actuelle</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">Actif</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border">
                          <div className="flex items-center">
                            <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">Safari sur iPhone</p>
                              <p className="text-sm text-gray-500">Paris, France • Il y a 2 heures</p>
                            </div>
                          </div>
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">Déconnecter</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Préférences de notification</h2>
                    <p className="text-gray-600">Choisissez comment vous souhaitez être informé</p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { title: 'Notifications par email', desc: 'Recevez des notifications par email', enabled: true },
                      { title: 'Notifications push', desc: 'Recevez des notifications sur votre navigateur', enabled: true },
                      { title: 'Nouvelles réunions', desc: 'Être notifié des nouvelles réunions', enabled: false },
                      { title: 'Rappels de réunions', desc: 'Rappels 15 minutes avant les réunions', enabled: true },
                      { title: 'Mises à jour système', desc: 'Notifications sur les mises à jour', enabled: false }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-4 px-6 bg-gray-50 rounded-xl">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Paramètres généraux</h2>
                    <p className="text-gray-600">Personnalisez votre expérience utilisateur</p>
                  </div>

                  <div className="space-y-8">
                    {/* Apparence */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                          <MoonIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Apparence</h3>
                          <p className="text-sm text-gray-600">Personnalisez lapparence de interface</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Clair', 'Sombre', 'Auto'].map((theme) => (
                          <label key={theme} className="relative">
                            <input type="radio" name="theme" className="sr-only peer" defaultChecked={theme === 'Clair'} />
                            <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-gray-50 transition-all">
                              <div className="text-center">
                                <div className={`w-12 h-8 mx-auto mb-2 rounded ${theme === 'Clair' ? 'bg-white border-2 border-gray-300' : theme === 'Sombre' ? 'bg-gray-800' : 'bg-gradient-to-r from-white to-gray-800'}`}></div>
                                <span className="text-sm font-medium">{theme}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Langue */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Langue et région</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                            <option>Français</option>
                            <option>English</option>
                            <option>Español</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                            <option>Europe/Paris (UTC+1)</option>
                            <option>Europe/London (UTC+0)</option>
                            <option>America/New_York (UTC-5)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
