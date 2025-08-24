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
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Signature électronique</h2>
      
      <div className="mb-6">
        <p className="text-sm mb-4">Veuillez signer dans la zone ci-dessous :</p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg touch-none">
          <canvas
            ref={canvasRef}
            className="w-full h-48 bg-gray-50 cursor-crosshair touch-none"
          />
        </div>
        <button
          type="button"
          onClick={clearSignature}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Effacer la signature
        </button>
        {showSignatureError && (
          <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            La signature est obligatoire pour confirmer votre présence.
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Signer et valider
        </button>
      </div>
    </div>
  );
}