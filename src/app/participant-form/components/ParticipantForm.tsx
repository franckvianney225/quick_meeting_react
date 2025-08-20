'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BaseFormData } from './types';
import { apiUrl } from '@/lib/api';
import LegalStep from './LegalStep';
import EmailStep from './EmailStep';
import FormStep from './FormStep';
import SignatureStep from './SignatureStep';
import ValidationStep from './ValidationStep';
import type {
  LegalStepProps,
  EmailStepProps,
  FormStepProps,
  SignatureStepProps,
  ValidationStepProps
} from './types';

export function ParticipantForm() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidLink, setIsValidLink] = useState(false);

  useEffect(() => {
    const meetingId = searchParams.get('meetingId');
    const code = searchParams.get('code');
    
    // Validation stricte des paramètres
    if (typeof meetingId !== 'string' || typeof code !== 'string' ||
        !meetingId.match(/^\d+$/) || !code.match(/^[A-Z0-9]{8}$/)) {
      window.location.href = '/';
      return;
    }

    // Vérifier que meetingId est un nombre valide
    const meetingIdNum = parseInt(meetingId, 10);
    if (isNaN(meetingIdNum)) {
      window.location.href = '/';
      return;
    }

    setIsValidLink(true);
  }, [searchParams]);
  const [formData, setFormData] = useState<BaseFormData>({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    position: '',
    signature: '',
    agreedToTerms: false
  });

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);


  const handleSubmit = async () => {
    try {
      const uniqueCode = searchParams.get('code')?.toUpperCase();
      if (!uniqueCode) throw new Error('Code de réunion manquant');
      const response = await fetch(apiUrl(`/meetings/${uniqueCode}/participants`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission');
      }

      // Passer à l'étape de validation au lieu d'afficher une alerte
      setCurrentStep(5);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la soumission');
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  if (!isValidLink) {
    return null; // Ou un composant de chargement
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {currentStep === 1 && (
        <LegalStep 
          onAgree={nextStep}
          onDisagree={() => window.location.href = '/'}
        />
      )}
      {currentStep === 2 && (
        <EmailStep 
          email={formData.email}
          onChange={(email) => setFormData(prev => ({...prev, email}))}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 3 && (
        <FormStep
          formData={formData}
          onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 4 && (
        <SignatureStep 
          signature={formData.signature}
          onChange={(signature) => setFormData(prev => ({...prev, signature}))}
          onSubmit={handleSubmit}
          onBack={prevStep}
        />
      )}
      {currentStep === 5 && (
        <ValidationStep
          firstName={formData.firstName}
          lastName={formData.lastName}
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
}