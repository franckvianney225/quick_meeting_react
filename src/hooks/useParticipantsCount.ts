import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

export const useParticipantsCount = (meetingId: number, initialCount?: number) => {
  const [participantsCount, setParticipantsCount] = useState(initialCount || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadParticipantsCount = async () => {
      // Si le count initial est déjà fourni, on ne recharge pas
      if (initialCount !== undefined) return;
      
      try {
        setLoading(true);
        const response = await fetch(apiUrl(`/meetings/${meetingId}/participants`), {
          headers: AuthService.getAuthHeaders()
        });
        
        if (response.ok) {
          const participants = await response.json();
          setParticipantsCount(participants.length || 0);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du nombre de participants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadParticipantsCount();
  }, [meetingId, initialCount]);

  return { participantsCount, loading };
};