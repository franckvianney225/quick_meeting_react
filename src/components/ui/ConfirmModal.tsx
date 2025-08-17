'use client';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
};

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Supprimer',
  cancelText = 'Annuler',
  type = 'danger'
}: ConfirmModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Empêcher le scroll du body quand le modal est ouvert
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onCancel, 150);
  };

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(onConfirm, 150);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          iconBg: 'bg-yellow-100'
        };
      default:
        return {
          icon: 'text-blue-600',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          iconBg: 'bg-blue-100'
        };
    }
  };

  if (!isOpen) return null;

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay avec flou d'arrière-plan */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          isVisible ? 'backdrop-blur-sm bg-opacity-50' : 'backdrop-blur-none bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal animé */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 border border-white/20 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          
          {/* Bouton fermer */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100/80 backdrop-blur-sm"
              aria-label="Fermer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 pt-8">
            {/* Icône */}
            <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full ${styles.iconBg} mb-4 backdrop-blur-sm`}>
              <ExclamationTriangleIcon className={`h-7 w-7 ${styles.icon}`} />
            </div>

            {/* Titre */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              {message}
            </p>

            {/* Boutons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300/50 hover:bg-gray-50/80 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl backdrop-blur-sm ${styles.confirmBtn}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
