'use client';

import { useEffect } from 'react';
import { initPianoAnalytics } from '@/utils/analytics';
import { isPianoAnalyticsAllowed } from '@/utils/cookieUtils';

export function PianoAnalytics() {
  useEffect(() => {
    // Initialiser Piano Analytics côté client uniquement
    if (typeof window !== 'undefined') {
      // Vérifier les préférences de cookies avant d'initialiser
      if (isPianoAnalyticsAllowed()) {
        initPianoAnalytics();
      } else {
        console.info('Piano Analytics: Désactivé par les préférences de cookies');
      }
    }
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}