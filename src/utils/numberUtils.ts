/**
 * Utilitaires pour le formatage et la manipulation des nombres
 * Usage: formatage des valeurs numériques pour l'affichage dans l'interface utilisateur
 */

/**
 * Formate un nombre selon les conventions françaises
 * - Arrondit à l'entier le plus proche
 * - Utilise l'espace comme séparateur des milliers
 * - Aucune décimale affichée
 * 
 * @param num - Nombre à formater
 * @returns Nombre formaté selon les conventions françaises
 * 
 * @example
 * formatNumber(1234.56) // "1 235"
 * formatNumber(999) // "999"
 * formatNumber(1000000.789) // "1 000 001"
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  return Math.round(num).toLocaleString('fr-FR');
}

/**
 * Formate un nombre avec un nombre spécifique de décimales selon les conventions françaises
 * - Utilise l'espace comme séparateur des milliers
 * - Utilise la virgule comme séparateur décimal
 * 
 * @param num - Nombre à formater
 * @param decimals - Nombre de décimales à afficher (défaut: 1)
 * @returns Nombre formaté avec décimales selon les conventions françaises
 * 
 * @example
 * formatNumberWithDecimals(1234.56) // "1 234,6"
 * formatNumberWithDecimals(1234.56, 2) // "1 234,56"
 * formatNumberWithDecimals(999, 0) // "999"
 */
export function formatNumberWithDecimals(num: number | null | undefined, decimals: number = 1): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  return num.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formate un pourcentage selon les conventions françaises
 * - Arrondit à une décimale
 * - Utilise la virgule comme séparateur décimal
 * - Ajoute le symbole % à la fin
 * 
 * @param num - Nombre représentant un pourcentage (ex: 25.67 pour 25,67%)
 * @param decimals - Nombre de décimales à afficher (défaut: 1)
 * @returns Pourcentage formaté selon les conventions françaises
 * 
 * @example
 * formatPercentage(25.67) // "25,7 %"
 * formatPercentage(100) // "100,0 %"
 * formatPercentage(-5.234, 2) // "-5,23 %"
 */
export function formatPercentage(num: number | null | undefined, decimals: number = 1): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0,0 %';
  }
  
  return `${num.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} %`;
}

/**
 * Formate un taux ou une valeur numérique avec une logique adaptive
 * - Arrondit à l'entier le plus proche pour les valeurs > 100
 * - Garde une décimale pour les valeurs <= 100
 * - Utilise les conventions françaises
 * 
 * @param value - Valeur numérique à formater
 * @returns Valeur formatée selon une logique adaptive
 * 
 * @example
 * formatAdaptiveNumber(1234.56) // "1 235" (grande valeur -> entier)
 * formatAdaptiveNumber(12.345) // "12,3" (petite valeur -> 1 décimale)
 * formatAdaptiveNumber(0.123) // "0,1" (très petite valeur -> 1 décimale)
 */
export function formatAdaptiveNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  // Pour les grandes valeurs (> 100), on affiche des entiers
  if (Math.abs(value) > 100) {
    return formatNumber(value);
  }
  
  // Pour les petites valeurs, on garde une décimale
  return formatNumberWithDecimals(value, 1);
}