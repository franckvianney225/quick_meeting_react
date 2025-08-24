'use client';

import { useState } from 'react';
import { User, Building, Mail, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';

// Types pour les props
interface FormData {
  firstName: string;
  lastName: string;
  position: string;
  company: string;
  email: string;
  phone: string;
}

interface FormStepProps {
  formData?: FormData;
  onChange?: (data: FormData) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function FormStep({
  formData: propFormData,
  onChange,
  onNext = () => console.log('Suivant clicked'),
  onBack = () => console.log('Retour clicked')
}: FormStepProps) {

  // État local initialisé avec les props ou des valeurs par défaut
  const [localFormData, setLocalFormData] = useState<FormData>(
    propFormData || {
      firstName: '',
      lastName: '',
      position: '',
      company: '',
      email: '',
      phone: ''
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = {
      ...localFormData,
      [name]: value
    };
    
    setLocalFormData(updatedData);
    if (onChange) {
      onChange(updatedData);
    }
  };

  const formData = localFormData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    onNext();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Informations personnelles
          </h1>
          <p className="text-gray-600">
            Veuillez remplir vos informations pour continuer
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Champs du formulaire */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Nom */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Votre nom"
                  required
                />
              </div>
            </div>

            {/* Prénom */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Votre prénom"
                  required
                />
              </div>
            </div>

            {/* Fonction */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Fonction
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Votre fonction"
                  required
                />
              </div>
            </div>

            {/* Organisation */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Organisation
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Votre organisation"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email sur toute la largeur */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="votre.email@exemple.com"
                required
              />
            </div>
  
            {/* Téléphone sur toute la largeur */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Votre numéro de téléphone"
                  required
                />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center border border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </button>
            
            <button
              onClick={handleSubmit}
              className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center"
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

        </div>

        {/* Footer discret */}
        <div className="text-center mt-12">
          <p className="text-xs text-gray-400">
            Vos informations sont sécurisées et confidentielles
          </p>
        </div>

      </div>
    </div>
  );
}