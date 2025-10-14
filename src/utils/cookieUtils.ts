/**
 * Interface pour les préférences de cookies
 */
interface CookiePreferences {
  functional_cookies?: boolean;
  ga?: boolean;
  matomo?: boolean;
  xiti?: boolean;
  at?: boolean;
  piano?: boolean;
  eulerian?: boolean;
  timestamp?: number;
}

/**
 * Lit et parse le cookie cookies_preferences
 * @returns Les préférences de cookies parsées ou null si le cookie n'existe pas
 */
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('cookies_preferences='));

    if (!cookieValue) {
      return null;
    }

    // Extraire la valeur du cookie après "cookies_preferences="
    const encodedValue = cookieValue.split('=')[1];
    
    // Décoder l'URI (pour gérer les caractères encodés comme %22)
    const decodedValue = decodeURIComponent(encodedValue);
    
    // Parser le JSON
    const preferences: CookiePreferences = JSON.parse(decodedValue);
    
    return preferences;
  } catch (error) {
    console.warn('Erreur lors du parsing du cookie cookies_preferences:', error);
    return null;
  }
}

/**
 * Vérifie si Piano Analytics est autorisé selon les préférences de cookies
 * @returns true si Piano Analytics est autorisé (opt-in ou pas de cookie), false sinon
 */
export function isPianoAnalyticsAllowed(): boolean {
  const preferences = getCookiePreferences();
  
  // Si pas de cookie, considérer comme opt-in par défaut
  if (!preferences) {
    return true;
  }
  
  // Si le cookie existe, vérifier la valeur de la clé 'piano'
  // undefined ou true = autorisé, false = non autorisé
  return preferences.piano !== false;
}