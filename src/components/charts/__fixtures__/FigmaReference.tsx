import React from 'react';

interface IFigmaReferenceProps {
  /** ID du catalogue `docs/figma-inventory/visualizations.md`, sert de nom de fichier. */
  id: string;
  children: React.ReactNode;
}

/**
 * Enveloppe de story Storybook : affiche le composant rendu à côté de la capture
 * Figma de référence correspondante (servie via `staticDirs` dans `.storybook/main.ts`),
 * pour validation visuelle directe dans le canvas — pas seulement dans l'onglet docs.
 */
export function FigmaReference({ id, children }: IFigmaReferenceProps) {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 480px', minWidth: 320 }}>{children}</div>
      <figure style={{ flex: '0 0 320px', margin: 0 }}>
        <img
          src={`/figma-viz/${id}.png`}
          alt={`Référence Figma — ${id}`}
          style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8 }}
        />
        <figcaption style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Référence Figma : {id}</figcaption>
      </figure>
    </div>
  );
}
