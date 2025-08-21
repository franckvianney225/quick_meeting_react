'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BaseFormData, type ExistingParticipant } from './types';
import { apiUrl } from '@/lib/api';
import LegalStep from './LegalStep';
import EmailStep from './EmailStep';
import FormStep from './FormStep';
import SignatureStep from './SignatureStep';
import ValidationStep from './ValidationStep';
import AlreadyRegisteredStep from './AlreadyRegisteredStep';
import MeetingNotStartedStep from './MeetingNotStartedStep';
import MeetingCompletedStep from './MeetingCompletedStep';
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
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState<'active' | 'inactive' | 'completed' | 'loading' | 'error'>('loading');
  const [meetingTitle, setMeetingTitle] = useState('');

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

    // Vérifier le statut de la réunion
    const checkMeetingStatus = async () => {
      try {
        const response = await fetch(apiUrl(`/meetings/status/${code}`), {
          credentials: 'include'
        });
        
        if (response.ok) {
          const { status, title } = await response.json();
          setMeetingStatus(status);
          setMeetingTitle(title);
          setIsValidLink(status === 'active');
        } else {
          setMeetingStatus('error');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du statut:', err);
        setMeetingStatus('error');
      }
    };

    checkMeetingStatus();
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

  const handleEmailNext = (existingParticipant?: ExistingParticipant, isAlreadyRegistered?: boolean) => {
    if (isAlreadyRegistered) {
      // Le participant est déjà inscrit à cette réunion
      setIsAlreadyRegistered(true);
      return;
    }
    
    if (existingParticipant) {
      // Pré-remplir les données avec les informations du participant existant
      setFormData(prev => ({
        ...prev,
        email: existingParticipant.email,
        firstName: existingParticipant.prenom,
        lastName: existingParticipant.name,
        company: existingParticipant.organisation,
        position: existingParticipant.fonction
      }));
    }
    setCurrentStep(prev => prev + 1);
  };

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

  if (meetingStatus === 'loading') {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Vérification du statut de la réunion...</p>
      </div>
    );
  }

  if (meetingStatus === 'error') {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
        <p className="text-gray-600 mb-4">Impossible de vérifier le statut de la réunion.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  if (meetingStatus === 'inactive') {
    return (
      <MeetingNotStartedStep
        meetingName={meetingTitle}
        onBackToHome={() => window.location.href = '/'}
      />
    );
  }

  if (meetingStatus === 'completed') {
    return (
      <MeetingCompletedStep
        meetingName={meetingTitle}
        onBackToHome={() => window.location.href = '/'}
      />
    );
  }

  if (!isValidLink) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {isAlreadyRegistered ? (
        <AlreadyRegisteredStep
          email={formData.email}
          onBackToHome={() => {
            setIsAlreadyRegistered(false);
            window.location.href = '/';
          }}
        />
      ) : (
        <>
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
              onNext={handleEmailNext}
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
        </>
      )}
    </div>
  );
}