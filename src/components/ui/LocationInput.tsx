'use client';

import { useState, useEffect, useRef } from 'react';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const LocationInput = ({ value, onChange, placeholder = "Entrez un lieu", required = false }: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Cache simple pour stocker les résultats précédents
  const cache = useRef<Map<string, LocationSuggestion[]>>(new Map());

  // Fonction pour récupérer les suggestions depuis OpenStreetMap Nominatim
  const fetchSuggestions = async (query: string | undefined) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Vérifier le cache d'abord
    const cached = cache.current.get(query.toLowerCase());
    if (cached) {
      setSuggestions(cached);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=fr`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Mettre en cache les résultats
        cache.current.set(query.toLowerCase(), data);
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer les changements de saisie avec délai pour éviter trop de requêtes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(value);
    }, 500); // Délai augmenté à 500ms pour respecter la limite

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    onChange(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  // Convertir undefined en chaîne vide pour l'input
  const inputValue = value || '';

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.lat}-${suggestion.lon}-${index}`}
              type="button"
              className="w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-100"
              onClick={() => handleSelectSuggestion(suggestion)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectSuggestion(suggestion);
                }
              }}
            >
              <div className="text-sm font-medium text-gray-900 truncate">
                {suggestion.display_name}
              </div>
              <div className="text-xs text-gray-500">
                Coordonnées: {suggestion.lat}, {suggestion.lon}
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && inputValue.length >= 3 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <div className="text-sm text-gray-500 text-center">
            Aucun résultat trouvé pour &ldquo;{inputValue}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
};