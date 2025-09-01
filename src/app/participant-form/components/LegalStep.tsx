'use client';

import { Check } from 'lucide-react';

// Types pour les props
interface LegalStepProps {
  onAgree: () => void;
  onDisagree: () => void;
}

export default function LegalStep({ onAgree, onDisagree }: LegalStepProps) {
  return (
    <div className="min-h-screen bg-white p-6">
      
      {/* Titre simple */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-gray-600 text-lg">
            Veuillez prendre connaissance des conditions avant de continuer
          </p>
        </div>

      {/* Contenu directement sur la page */}
      <div className="text-gray-800 leading-relaxed text-lg mb-6 max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Mention de Confidentialité et de Consentement
        </h2>
        
        <p>
          En apposant ma signature ci-dessous, je reconnais et accepte ce qui suit :
        </p>
        
        <p>
          <strong>Collecte des Données</strong><br/>
          Je comprends que mes informations personnelles, notamment mon nom, ma date de présence et l&apos;heure d&apos;arrivée et de départ, seront collectées et enregistrées électroniquement.
        </p>
        
        <p>
          <strong>Utilisation des Données</strong><br/>
          Je suis informé(e) que ces données seront utilisées uniquement à des fins de gestion de présence et de sécurité au sein du Ministère de la Transition Numérique et de la Digitalisation.
        </p>
        
        <p>
          <strong>Conservation et Sécurité</strong><br/>
          Je suis conscient(e) que mes données seront conservées de manière sécurisée et confidentielle, conformément à la politique de conservation des données du ministère, et ne seront accessibles qu&apos;aux personnes autorisées.
        </p>
        
        <p>
          <strong>Droits</strong><br/>
          Je reconnais avoir le droit d&apos;accéder à mes données personnelles, de demander leur rectification ou suppression, conformément à la législation en vigueur sur la protection des données personnelles.
        </p>
        
        <p>
          <strong>Consentement</strong><br/>
          Par ma signature, je donne mon consentement éclairé à la collecte et au traitement de mes données personnelles.
        </p>
      </div>

      <p className="text-blue-800 text-lg mb-8 max-w-4xl mx-auto">
        En acceptant ces conditions, vous confirmez avoir lu et compris
        l&apos;ensemble des dispositions relatives à la confidentialité et au consentement.
      </p>

      {/* Un seul bouton d'acceptation */}
      <div className="text-center">
        <button
          onClick={onAgree}
          className="bg-orange-500 text-white py-4 px-12 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center mx-auto shadow-md hover:shadow-lg"
        >
          <Check className="w-5 h-5 mr-3" />
          J&apos;accepte les conditions
        </button>
      </div>

      {/* Footer très discret */}
        <div className="text-center mt-12 pb-8">
          <p className="text-xs text-gray-500">
            Conforme à la législation ivoirienne sur la protection des données personnelles
          </p>
        </div>
      </div>

    </div>
  );
}