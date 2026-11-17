import type { StorybookConfig } from '@storybook/nextjs-vite';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/nextjs-vite",
  "staticDirs": [
    "../public",
    // Captures Figma de référence (docs/figma-inventory/visualizations/, produites par le skill
    // figma-page-inventory), servies pour la comparaison côte à côte de FigmaReference.
    { "from": "../docs/figma-inventory/visualizations", "to": "/figma-viz" }
  ],
  async viteFinal(viteConfig) {
    // Next.js resout nativement l'import Tailwind v4 via son propre bundler ;
    // le Vite autonome de Storybook a besoin du plugin dedie pour le meme resultat.
    viteConfig.plugins = viteConfig.plugins ?? [];
    viteConfig.plugins.push(tailwindcss());
    return viteConfig;
  },
};
export default config;
