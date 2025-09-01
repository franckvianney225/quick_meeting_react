'use client';
import { useRef, useState, useEffect } from 'react';
import type { SignatureStepProps } from './types';
import SignaturePad from 'signature_pad';

export default function SignatureStep({
  signature,
  onChange,
  onSubmit,
  onBack
}: SignatureStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [hasSigned, setHasSigned] = useState(!!signature);

  // Initialiser SignaturePad
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Ajuster la taille du canvas pour les écrans haute résolution
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d')?.scale(ratio, ratio);

      signaturePadRef.current = new SignaturePad(canvas, {
        minWidth: 1,
        maxWidth: 3,
        penColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(248, 250, 252)'
      });

      // Charger la signature existante si elle existe
      if (signature) {
        signaturePadRef.current.fromDataURL(signature);
      }

      // Écouter les changements de signature
      signaturePadRef.current.addEventListener('endStroke', () => {
        if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
          const signatureData = signaturePadRef.current.toDataURL();
          onChange(signatureData);
          setHasSigned(true);
        }
      });
    }

    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
    };
  }, [onChange]);

  // Mettre à jour la signature quand elle change depuis les props
  useEffect(() => {
    if (signature && signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      signaturePadRef.current.fromDataURL(signature);
      setHasSigned(true);
    }
  }, [signature]);

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      onChange('');
      setHasSigned(false);
    }
  };

  const [showSignatureError, setShowSignatureError] = useState(false);

  const handleSubmit = () => {
    if (!hasSigned) {
      setShowSignatureError(true);
      return;
    }
    setShowSignatureError(false);
    onSubmit();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Signature électronique</h2>
        <p className="text-gray-600 text-sm">
          Signez dans la zone ci-dessous pour confirmer votre présence
        </p>
      </div>

      <div className="mb-8">
        <div className="border-2 border-dashed border-gray-300 rounded-xl touch-none bg-white p-4">
          <canvas
            ref={canvasRef}
            className="w-full h-56 bg-gray-50 cursor-crosshair touch-none rounded-lg"
          />
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={clearSignature}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Effacer
          </button>
          
          <div className="text-xs text-gray-500">
            Faites glisser votre doigt ou votre souris pour signer
          </div>
        </div>

        {showSignatureError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm">La signature est obligatoire pour confirmer votre présence</span>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!hasSigned}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {hasSigned ? (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirmer la signature
          </div>
        ) : (
          'Signer et valider'
        )}
      </button>
    </div>
  );
}