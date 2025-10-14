'use client';

interface HTMLContentProps {
  content: any; // Accepter tout type pour gérer les objets mal formatés de l'API
  className?: string;
}

/**
 * Composant atom pour afficher du contenu HTML de façon sécurisée
 * Utilisé pour le rendu des champs de méthodologie qui contiennent du HTML
 */
export default function HTMLContent({ content, className = '' }: HTMLContentProps) {
  if (!content) {
    return null;
  }

  // Convertir les objets en chaîne de caractères si nécessaire
  let htmlContent: string;
  if (typeof content === 'string') {
    htmlContent = content.trim();
  } else if (typeof content === 'object') {
    // Si c'est un objet, essayer de le sérialiser ou utiliser une propriété spécifique
    console.warn('HTMLContent received an object instead of a string:', content);
    htmlContent = JSON.stringify(content);
  } else {
    htmlContent = String(content);
  }

  if (htmlContent === '') {
    return null;
  }

  return (
    <div
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}