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

  // État pour suivre les champs touchés et les erreurs de validation
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    // Marquer le champ comme touché
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({ ...prev, [name]: true }));
    }

    // Valider le champ immédiatement
    validateField(name, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (fieldName: string, value: string) => {
    let error = '';
    
    if (!value.trim()) {
      error = 'Ce champ est requis';
    } else if (fieldName === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      error = 'Format d\'email invalide';
    } else if (fieldName === 'phone' && !/^[+\d\s\-()]{10,20}$/.test(value)) {
      error = 'Format de téléphone invalide';
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Valider tous les champs requis
    const requiredFields: (keyof FormData)[] = ['firstName', 'lastName', 'position', 'company', 'email', 'phone'];
    
    requiredFields.forEach(field => {
      const value = localFormData[field];
      if (!value.trim()) {
        newErrors[field] = 'Ce champ est requis';
        isValid = false;
      } else if (field === 'email' && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field] = 'Format d\'email invalide';
        isValid = false;
      } else if (field === 'phone' && !/^[+\d\s\-()]{10,20}$/.test(value)) {
        newErrors[field] = 'Format de téléphone invalide';
        isValid = false;
      }
    });

    setErrors(newErrors);
    
    // Marquer tous les champs comme touchés pour afficher les erreurs
    const allFieldsTouched = requiredFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouchedFields(prev => ({ ...prev, ...allFieldsTouched }));

    return isValid;
  };

  const formData = localFormData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Empêcher la navigation si le formulaire est invalide
      return;
    }
    
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
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    touchedFields.firstName && errors.firstName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-black'
                  }`}
                  placeholder="Votre nom"
                  required
                />
              </div>
              {touchedFields.firstName && errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
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
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    touchedFields.lastName && errors.lastName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-black'
                  }`}
                  placeholder="Votre prénom"
                  required
                />
              </div>
              {touchedFields.lastName && errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
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
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    touchedFields.position && errors.position
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-black'
                  }`}
                  placeholder="Votre fonction"
                  required
                />
              </div>
              {touchedFields.position && errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
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
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    touchedFields.company && errors.company
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-black'
                  }`}
                  placeholder="Votre organisation"
                  required
                />
              </div>
              {touchedFields.company && errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
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
                readOnly
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
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
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    touchedFields.phone && errors.phone
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-black'
                  }`}
                  placeholder="Votre numéro de téléphone"
                  required
                />
              </div>
            </div>
            {touchedFields.phone && errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            {/* <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center border border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </button> */}
            
            <button
              onClick={handleSubmit}
              className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center"
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