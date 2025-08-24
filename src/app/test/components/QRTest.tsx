'use client';
import { useState } from 'react';
import { generateMeetingQRPDF } from '@/app/tasks/components/MeetingQRPDF';

interface TestConfig {
  name: string;
  config?: {
    backgroundColor?: string;
    foregroundColor?: string;
    size?: number;
    includeMargin?: boolean;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    includeText?: boolean;
    customText?: string;
  };
}

const testConfigs: TestConfig[] = [
  {
    name: 'Configuration par défaut',
    config: undefined
  },
  {
    name: 'Couleurs personnalisées',
    config: {
      backgroundColor: '#FF5733',
      foregroundColor: '#33FF57',
      size: 300,
      includeMargin: false,
      errorCorrectionLevel: 'H',
      includeText: true,
      customText: 'Test de configuration personnalisée'
    }
  },
  {
    name: 'Configuration minimaliste',
    config: {
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000',
      size: 200,
      includeMargin: true,
      errorCorrectionLevel: 'L',
      includeText: false
    }
  },
  {
    name: 'Texte personnalisé seulement',
    config: {
      includeText: true,
      customText: 'Réunion importante - Veuillez scanner'
    }
  }
];

export const QRTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const runTests = async () => {
    setIsTesting(true);
    setResults([]);
    
    const newResults: string[] = [];
    
    for (const test of testConfigs) {
      try {
        newResults.push(`🧪 Début du test: ${test.name}`);
        
        await generateMeetingQRPDF({
          meetingId: 999,
          meetingTitle: 'Réunion de Test',
          qrValue: 'https://example.com/test',
          qrConfig: test.config,
          fileName: `test_${test.name.replace(/\s+/g, '_')}.pdf`,
          onSuccess: () => {
            newResults.push(`✅ ${test.name}: PDF généré avec succès`);
          },
          onError: (error) => {
            newResults.push(`❌ ${test.name}: Erreur - ${error.message}`);
          }
        });
        
      } catch (error) {
        newResults.push(`❌ ${test.name}: Erreur inattendue - ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
      
      // Petit délai entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setResults(newResults);
    setIsTesting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test de génération QR Code</h1>
      
      <button
        onClick={runTests}
        disabled={isTesting}
        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {isTesting ? 'Tests en cours...' : 'Lancer les tests'}
      </button>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Configurations de test:</h2>
        <div className="grid gap-3">
          {testConfigs.map((test, index) => (
            <div key={index} className="p-3 bg-gray-100 rounded-lg">
              <h3 className="font-medium">{test.name}</h3>
              {test.config && (
                <pre className="text-sm text-gray-600 mt-2">
                  {JSON.stringify(test.config, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Résultats:</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            {results.map((result, index) => (
              <div key={index} className="py-1">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};