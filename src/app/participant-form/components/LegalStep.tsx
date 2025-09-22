'use client';

import { Check } from 'lucide-react';

// Types pour les props
interface LegalStepProps {
  onAgree: () => void;
  onDisagree: () => void;
}

export default function LegalStep({ onAgree, onDisagree }: LegalStepProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Titre simple */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GESTION DE PRÉSENCE
          </h1>
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">
            Mention de Confidentialité et de Consentement
          </h2>

          <p className="text-gray-700 text-xl mb-10">
            En apposant ma signature ci-dessous, je reconnais et accepte ce qui suit :
          </p>
        </div>

        {/* Contenu directement sur la page */}
        <div className="text-gray-800 leading-relaxed text-xl space-y-6">
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <strong>Collecte des Données :</strong> Je comprends que mes informations personnelles, notamment mon nom, ma date de présence et l'heure d'arrivée et de départ, seront collectées et enregistrées électroniquement.
            </li>
            
            <li>
              <strong>Utilisation des Données :</strong> Je suis informé(e) que ces données seront utilisées uniquement à des fins de gestion de présence et de sécurité au sein du Ministère de la Transition Numérique et de la Digitalisation.
            </li>
            
            <li>
              <strong>Conservation et Sécurité :</strong> Je suis conscient(e) que mes données seront conservées de manière sécurisée et confidentielle, conformément à la politique de conservation des données du ministère, et ne seront accessibles qu'aux personnes autorisées.
            </li>
            
            <li>
              <strong>Droits :</strong> Je reconnais avoir le droit d'accéder à mes données personnelles, de demander leur rectification ou suppression, conformément à la législation en vigueur sur la protection des données personnelles.
            </li>
            
            <li>
              <strong>Consentement :</strong> Par ma signature, je donne mon consentement éclairé à la collecte et au traitement de mes données personnelles.
            </li>
          </ol>
        </div>

        <p className="text-blue-800 text-xl mb-10">
          En acceptant ces conditions, vous confirmez avoir lu et compris l'ensemble des dispositions relatives à la confidentialité et au consentement.
        </p>

        {/* Un seul bouton d'acceptation */}
        <div className="text-center">
          <button
            onClick={onAgree}
            className="bg-orange-500 text-white py-5 px-16 rounded-lg font-semibold text-xl hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center mx-auto shadow-md hover:shadow-lg"
          >
            <Check className="w-6 h-6 mr-3" />
            J'accepte
          </button>
        </div>

        {/* Footer très discret */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-500">
            Conforme à la législation ivoirienne sur la protection des données personnelles
          </p>
        </div>

      </div>
    </div>
  );
}