'use client';

import { Check } from 'lucide-react';

// Types pour les props
interface LegalStepProps {
  onAgree: () => void;
  onDisagree: () => void;
}

export default function LegalStep({ onAgree, onDisagree }: LegalStepProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* Titre simple */}
      <h1 className="text-4xl font-light text-gray-900 text-center mb-4 pt-12">
        Conditions Générales
      </h1>
      <p className="text-gray-600 text-center mb-12 text-lg max-w-4xl mx-auto">
        Veuillez lire et accepter nos conditions pour continuer
      </p>

      {/* Contenu directement sur la page */}
      <p className="text-gray-800 leading-relaxed text-lg mb-6 max-w-4xl mx-auto">
        <strong>Article 1 - Signature électronique :</strong> 
        Conformément au Règlement eIDAS (n°910/2014) et au Code Civil français, 
        la signature électronique a la même valeur juridique qu'une signature manuscrite.
      </p>
      
      <p className="text-gray-800 leading-relaxed text-lg mb-6 max-w-4xl mx-auto">
        <strong>Article 2 - Protection des données :</strong> 
        Vos données sont traitées conformément au RGPD. Elles sont chiffrées et 
        stockées de manière sécurisée. Vous disposez d'un droit d'accès, de rectification 
        et de suppression de vos données.
      </p>
      
      <p className="text-gray-800 leading-relaxed text-lg mb-6 max-w-4xl mx-auto">
        <strong>Article 3 - Sécurité :</strong> 
        Notre plateforme utilise un chiffrement de bout en bout et des protocoles 
        de sécurité bancaires pour protéger vos informations et documents.
      </p>
      
      <p className="text-gray-800 leading-relaxed text-lg mb-6 max-w-4xl mx-auto">
        <strong>Article 4 - Conservation :</strong> 
        Les documents signés sont conservés pendant la durée légale requise et 
        peuvent être consultés à tout moment depuis votre espace personnel.
      </p>

      <p className="text-blue-800 text-lg mb-8 max-w-4xl mx-auto">
        En acceptant ces conditions, vous confirmez avoir lu et compris 
        l'ensemble des dispositions relatives à la signature électronique.
      </p>

      {/* Un seul bouton d'acceptation */}
      <div className="text-center">
        <button
          onClick={onAgree}
          className="bg-black text-white py-4 px-12 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity flex items-center mx-auto"
        >
          <Check className="w-5 h-5 mr-3" />
          J'accepte les conditions
        </button>
      </div>

      {/* Footer très discret */}
      <div className="text-center mt-12 pb-8">
        <p className="text-xs text-gray-400">
          Conforme au droit français et européen
        </p>
      </div>

    </div>
  );
}