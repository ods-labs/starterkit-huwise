import { pianoAnalytics } from 'piano-analytics-js';
import { isPianoAnalyticsAllowed } from './cookieUtils';

let isInitialized = false;

/**
 * Initialise Piano Analytics avec les paramètres d'environnement
 */
export function initPianoAnalytics(): void {
  const siteId = process.env.NEXT_PUBLIC_PIANO_ANALYTICS_SITE_ID;
  const collectDomain = process.env.NEXT_PUBLIC_PIANO_ANALYTICS_COLLECT_DOMAIN;

  if (!siteId || !collectDomain) {
    console.warn('Piano Analytics: Variables d\'environnement manquantes');
    return;
  }

  if (isInitialized) {
    return;
  }

  // Configuration Piano Analytics avec la librairie officielle
  pianoAnalytics.setConfigurations({
    site: parseInt(siteId, 10),
    collectDomain: collectDomain
  });

  isInitialized = true;

  // Pas d'envoi automatique du premier page view
  // Les pages se chargeront d'envoyer leur propre trackPageView
}

/**
 * Envoie un événement personnalisé à Piano Analytics
 * @param eventName - Nom de l'événement
 * @param data - Données additionnelles de l'événement
 */
export function trackEvent(eventName: string, data?: Record<string, any>): void {
  // Vérifier les préférences de cookies avant d'envoyer l'événement
  if (!isPianoAnalyticsAllowed()) {
    return;
  }

  if (!isInitialized) {
    console.warn('Piano Analytics: Non initialisé');
    return;
  }

  pianoAnalytics.sendEvents([{
    name: eventName,
    data: {
      ...data,
      timestamp: Date.now()
    }
  }]);
}

/**
 * Track une navigation de page
 * @param page - URL de la page
 */
export function trackPageView(page: string): void {
  trackEvent('page.display', {
    page,
    referrer: document.referrer
  });
}