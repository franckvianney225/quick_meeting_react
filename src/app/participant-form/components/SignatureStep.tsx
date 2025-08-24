'use client';
import { useRef, useState, useEffect } from 'react';
import type { SignatureStepProps } from './types';

export default function SignatureStep({
  signature,
  onChange,
  onSubmit,
  onBack
}: SignatureStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Effet pour charger la signature existante sur le canvas
  useEffect(() => {
    if (signature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = signature;
    }
  }, [signature]);

  const startDrawing = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsSigning(true);
    ctx.beginPath();
    ctx.moveTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
  };

  const draw = (e: React.MouseEvent) => {
    if (!isSigning || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsSigning(false);
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  const hasSigned = !!signature;

  const handleSubmit = () => {
    if (!hasSigned) {
      alert('Veuillez signer avant de soumettre');
      return;
    }
    onSubmit();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Signature électronique</h2>
      
      <div className="mb-6">
        <p className="text-sm mb-4">Veuillez signer dans la zone ci-dessous :</p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg">
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            className="w-full bg-gray-50 cursor-crosshair"
          />
        </div>
        <button
          type="button"
          onClick={clearSignature}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Effacer la signature
        </button>
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
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          disabled={!hasSigned}
        >
          Signer et valider
        </button>
      </div>
    </div>
  );
}