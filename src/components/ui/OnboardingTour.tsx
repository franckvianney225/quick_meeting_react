'use client';

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTour = ({ steps, isOpen, onClose, onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPositioned, setIsPositioned] = useState(false);

  const currentStepData = steps[currentStep];

  const goToNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  }, [currentStep, steps.length, onComplete]);

  const goToPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Positionner le popup près de l'élément cible
  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) {
      console.warn(`Element not found: ${currentStepData.target}`);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const popup = document.getElementById('onboarding-popup');
    if (!popup) return;

    const position = currentStepData.position || 'right';
    
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - popup.offsetHeight - 10;
        left = rect.left + rect.width / 2 - popup.offsetWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2 - popup.offsetWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - popup.offsetHeight / 2;
        left = rect.left - popup.offsetWidth - 10;
        break;
      case 'right':
      default:
        top = rect.top + rect.height / 2 - popup.offsetHeight / 2;
        left = rect.right + 10;
        break;
    }

    // S'assurer que le popup reste dans la fenêtre
    top = Math.max(10, Math.min(top, window.innerHeight - popup.offsetHeight - 10));
    left = Math.max(10, Math.min(left, window.innerWidth - popup.offsetWidth - 10));

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
    setIsPositioned(true);

    // Mettre en surbrillance l'élément cible
    targetElement.classList.add('ring-2', 'ring-orange-500', 'ring-offset-2');

    return () => {
      targetElement.classList.remove('ring-2', 'ring-orange-500', 'ring-offset-2');
    };
  }, [isOpen, currentStep, currentStepData]);

  if (!isOpen || !currentStepData) return null;

  return (
    <>
      {/* Overlay semi-transparent */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Popup de guide */}
      <div
        id="onboarding-popup"
        className="fixed z-50 bg-white rounded-xl shadow-2xl p-6 max-w-sm transition-all duration-300"
        style={{ opacity: isPositioned ? 1 : 0 }}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PlayIcon className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-500">
              Étape {currentStep + 1} sur {steps.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrev}
            disabled={currentStep === 0}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>Précédent</span>
          </button>

          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            <span>{currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}</span>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
};

// Hook pour gérer l'état du guide
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);

  const startTour = useCallback((tourId: string) => {
    setCurrentTour(tourId);
    setShowOnboarding(true);
  }, []);

  const completeTour = useCallback(() => {
    if (currentTour) {
      localStorage.setItem(`onboarding_${currentTour}_completed`, 'true');
    }
    setShowOnboarding(false);
    setCurrentTour(null);
  }, [currentTour]);

  const closeTour = useCallback(() => {
    setShowOnboarding(false);
    setCurrentTour(null);
  }, []);

  const shouldShowTour = useCallback((tourId: string) => {
    return !localStorage.getItem(`onboarding_${tourId}_completed`);
  }, []);

  return {
    showOnboarding,
    currentTour,
    startTour,
    completeTour,
    closeTour,
    shouldShowTour,
  };
};