'use client';

import React from 'react';
import { ExternalHeader, ExternalFooter } from '@/external';
import '@/styles/external-header-footer.css';

interface ExternalLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout principal avec Header/Footer externes récupérés depuis odisse.santepubliquefrance.fr
 * 
 * Ce composant :
 * - Intègre automatiquement le header/footer du site principal
 * - Maintient la cohérence visuelle avec le portail ODISSE
 * - Se met à jour automatiquement lors des builds
 * 
 * Usage:
 * ```tsx
 * <ExternalLayout>
 *   <YourAppContent />
 * </ExternalLayout>
 * ```
 */
export default function ExternalLayout({ children, className }: ExternalLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className || ''}`}>
      {/* Header externe - récupéré automatiquement depuis le site principal */}
      <div className="external-header-container">
        <ExternalHeader />
      </div>
      
      {/* Contenu principal de l'application */}
      <main className="flex-1 relative">
        {children}
      </main>
      
      {/* Footer externe - récupéré automatiquement depuis le site principal */}
      <div className="external-footer-container">
        <ExternalFooter />
      </div>
    </div>
  );
}

/**
 * Hook pour vérifier si les composants externes sont disponibles
 * Utile pour afficher un fallback ou un loading state
 */
export function useExternalComponents() {
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Vérifier si les composants externes ont été générés
    const checkAvailability = async () => {
      try {
        // Tentative d'import dynamique pour vérifier la disponibilité
        await import('@/external');
        setIsAvailable(true);
      } catch (error) {
        console.warn('⚠️ Composants externes non disponibles - Mode développement sans build:external');
        console.info('💡 Exécutez "npm run build:external" pour récupérer le header/footer');
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAvailability();
  }, []);
  
  return { isAvailable, isLoading };
}

/**
 * Composant de fallback si les composants externes ne sont pas disponibles
 */
export function ExternalLayoutFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header de fallback */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-semibold text-gray-800">
            SPF ODISSE
          </h1>
          <p className="text-sm text-gray-600">
            Header externe en cours de chargement...
          </p>
        </div>
      </header>
      
      {/* Contenu */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer de fallback */}
      <footer className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="container mx-auto text-center text-sm text-gray-600">
          <p>© 2024 Santé Publique France - Footer externe en cours de chargement...</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Layout adaptatif qui utilise les composants externes s'ils sont disponibles,
 * sinon affiche un fallback
 */
export function AdaptiveExternalLayout({ children }: { children: React.ReactNode }) {
  const { isAvailable, isLoading } = useExternalComponents();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'interface...</p>
        </div>
      </div>
    );
  }
  
  if (!isAvailable) {
    return <ExternalLayoutFallback>{children}</ExternalLayoutFallback>;
  }
  
  return <ExternalLayout>{children}</ExternalLayout>;
}