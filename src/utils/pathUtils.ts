/**
 * Utilities pour gérer les chemins avec basePath et assetPrefix
 */

// Récupère le basePath depuis la configuration Next.js
export const getBasePath = (): string => {
  return process.env.NEXT_PUBLIC_BASE_PATH || "";
};

// Récupère l'assetPrefix depuis la configuration Next.js  
export const getAssetPrefix = (): string => {
  return process.env.NEXT_PUBLIC_ASSET_PREFIX || "";
};

// Préfixe un chemin avec le basePath pour les liens internes
export const withBasePath = (path: string): string => {
  const basePath = getBasePath();
  
  // Si pas de basePath, chemin externe, ancre ou déjà préfixé, retourner tel quel
  if (!basePath || 
      path.startsWith('http') || 
      path.startsWith('//') || 
      path.startsWith('#') ||
      path.startsWith(basePath)) {
    return path;
  }
  
  // Normaliser les slashes pour les liens internes commençant par /
  if (path.startsWith('/')) {
    const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    return `${cleanBasePath}${path}`;
  }
  
  return path;
};

// Préfixe un chemin d'asset avec l'assetPrefix pour les ressources statiques
export const withAssetPrefix = (assetPath: string): string => {
  const assetPrefix = getAssetPrefix();
  
  // Si pas d'assetPrefix, chemin externe ou déjà préfixé, retourner tel quel
  if (!assetPrefix || 
      assetPath.startsWith('http') || 
      assetPath.startsWith('//') || 
      assetPath.startsWith(assetPrefix)) {
    return assetPath;
  }
  
  // Normaliser les slashes pour les assets commençant par /
  if (assetPath.startsWith('/')) {
    const cleanAssetPrefix = assetPrefix.endsWith('/') ? assetPrefix.slice(0, -1) : assetPrefix;
    return `${cleanAssetPrefix}${assetPath}`;
  }
  
  return assetPath;
};