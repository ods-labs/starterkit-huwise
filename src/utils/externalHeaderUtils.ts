/**
 * Utilitaires pour la gestion du header externe SPF ODISSE
 * Système de breakpoint responsive et gestion des interactions menu mobile
 */

import { createRoot } from 'react-dom/client';
import { FaBars, FaTimes } from 'react-icons/fa';

/**
 * Initialise le système de breakpoint responsive pour le menu
 */
export function initializeResponsiveMenu(
  nav: Element | null,
  collapsible: Element | null, 
  placeholder: Element | null
): () => void {
  // Breakpoint à partir duquel le menu devient responsive (détecté depuis l'attribut breakpoint="1280")
  const MOBILE_BREAKPOINT = 1280;

  const updateMenuState = () => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    if (isMobile) {
      // Mode mobile : ajouter les classes collapsed sur nav et collapsible
      if (nav) {
        nav.classList.add('ods-responsive-menu--collapsed');
      }

      if (collapsible) {
        collapsible.classList.add('ods-responsive-menu-collapsible--collapsed');
      }

      if (placeholder) {
        placeholder.classList.add('ods-responsive-menu-placeholder--active');
      }
    } else {
      // Mode desktop : enlever les classes collapsed
      if (nav) {
        nav.classList.remove('ods-responsive-menu--collapsed');
      }

      if (collapsible) {
        collapsible.classList.remove('ods-responsive-menu-collapsible--collapsed');
      }

      if (placeholder) {
        placeholder.classList.remove('ods-responsive-menu-placeholder--active');
      }
    }
  };

  // Appliquer l'état initial
  updateMenuState();

  // Écouter les changements de taille d'écran
  const resizeHandler = () => updateMenuState();
  window.addEventListener('resize', resizeHandler);

  // Cleanup function pour supprimer le listener
  return () => window.removeEventListener('resize', resizeHandler);
}

/**
 * Remplace les placeholders Font Awesome par des icônes React
 */
export function replaceIconPlaceholders(containerRef: React.RefObject<HTMLDivElement>): void {
  if (!containerRef.current) return;

  const barsPlaceholders = containerRef.current.querySelectorAll('[data-icon="FaBars"]:not([data-react-processed])');
  barsPlaceholders.forEach(placeholder => {
    placeholder.setAttribute('data-react-processed', 'true');
    const root = createRoot(placeholder as HTMLElement);
    root.render(FaBars({}));
  });

  const timesPlaceholders = containerRef.current.querySelectorAll('[data-icon="FaTimes"]:not([data-react-processed])');
  timesPlaceholders.forEach(placeholder => {
    placeholder.setAttribute('data-react-processed', 'true');
    const root = createRoot(placeholder as HTMLElement);
    root.render(FaTimes({}));
  });
}

/**
 * Gère le toggle du menu mobile avec protection contre les doubles clics
 */
export function setupMenuToggle(
  nav: Element | null,
  collapsible: Element | null,
  placeholder: Element | null
): () => boolean {
  let isToggling = false; // Protection contre les doubles clics

  return () => {
    if (isToggling) return false;

    isToggling = true;

    if (nav && placeholder && collapsible) {
      const isExpanded = collapsible.classList.contains('ods-responsive-menu-collapsible--expanded');

      if (isExpanded) {
        // Fermer le menu
        collapsible.classList.remove('ods-responsive-menu-collapsible--expanded');
      } else {
        // Ouvrir le menu
        collapsible.classList.add('ods-responsive-menu-collapsible--expanded');
      }
    }

    // Réinitialiser le flag après un délai court
    setTimeout(() => {
      isToggling = false;
    }, 100);

    return true;
  };
}

/**
 * Attache les event listeners aux boutons du menu mobile
 */
export function attachMenuListeners(
  containerRef: React.RefObject<HTMLDivElement>,
  toggleMenu: () => boolean
): void {
  if (!containerRef.current) return;

  // Nettoyer les listeners existants d'abord
  const allButtons = containerRef.current.querySelectorAll(
    '.ods-responsive-menu-placeholder__toggle, .ods-responsive-menu-collapsible__toggle-button, .ods-responsive-menu-collapsible__backdrop'
  );
  allButtons.forEach(button => {
    // Cloner l'élément pour supprimer tous les event listeners
    const newButton = button.cloneNode(true);
    button.parentNode?.replaceChild(newButton, button);
  });

  // Bouton d'ouverture du menu (hamburger)
  const openButton = containerRef.current.querySelector('.ods-responsive-menu-placeholder__toggle');
  if (openButton) {
    openButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  // Bouton de fermeture du menu (X)
  const closeButton = containerRef.current.querySelector('.ods-responsive-menu-collapsible__toggle-button');
  if (closeButton) {
    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  // Backdrop cliquable pour fermer le menu
  const backdrop = containerRef.current.querySelector('.ods-responsive-menu-collapsible__backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }
}