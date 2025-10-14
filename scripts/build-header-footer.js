#!/usr/bin/env node

/**
 * Script de build pour récupérer le header et footer depuis le domaine Huwise
 * et générer des composants React automatiquement
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const postcss = require('postcss');
const safeParser = require('postcss-safe-parser');
const CleanCSS = require('clean-css');
const {PurgeCSS} = require('purgecss');
const discardUnused = require('postcss-discard');
const https = require('https');
const http = require('http');

// Charger la configuration depuis .env
require('dotenv').config();

// Construire l'URL depuis la variable d'environnement
const BASE_DOMAIN_URL = process.env.NEXT_PUBLIC_HUWISE_API_URL || '';
const DOMAIN_URL = `${BASE_DOMAIN_URL}/?flg=fr`;
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'external');

// Créer le répertoire de sortie s'il n'existe pas
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, {recursive: true});
}

/**
 * Remplace les icônes Font Awesome par des SVG en ligne
 */
function replaceFontAwesomeIcons(html) {
    if (!html) return { html, usedIcons: [] };

    const iconMappings = [
        {
            fa: /<i\s+class="fa\s+fa-bars"[^>]*><\/i>/g,
            replacement: `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bars" class="svg-inline--fa fa-bars fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width: 20px; height: 20px; color: white;"><path fill="currentColor" d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path></svg>`,
            iconName: 'FaBars'
        },
        {
            fa: /<i\s+class="fa\s+fa-(close|times)"[^>]*><\/i>/g,
            replacement: `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times" class="svg-inline--fa fa-times fa-w-11" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512" style="width: 20px; height: 20px; color: white;"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.19 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.19 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>`,
            iconName: 'FaTimes'
        }
    ];

    let processedHTML = html;
    const usedIcons = new Set();

    iconMappings.forEach(mapping => {
        if (mapping.fa.test(processedHTML)) {
            processedHTML = processedHTML.replace(mapping.fa, mapping.replacement);
            usedIcons.add(mapping.iconName);
        }
    });

    return {
        html: processedHTML,
        usedIcons: Array.from(usedIcons)
    };
}

/**
 * Génère un composant React avec le HTML
 */
function generateComponent(name, html, timestamp) {
    const sanitizedHTML = html;
    if (!sanitizedHTML) {
        console.log(`⚠️ Pas de HTML pour ${name}, création d'un composant vide`);
        return `'use client';

/**
 * ${name} Component - Auto-generated from ${DOMAIN_URL}
 * Generated on: ${timestamp}
 * Status: No content found
 */

export default function External${name}() {
  return null;
}
`;
    }

    // Pour le Header, ajouter la logique de menu mobile + remplacement des icônes
    if (name === 'Header') {
        // Remplacer les icônes Font Awesome par des SVG en ligne
        let { html: processedHTML, usedIcons } = replaceFontAwesomeIcons(sanitizedHTML);
        
        console.log('🔧 Menu en mode normal - fermé par défaut');
        console.log(`✅ Icônes Font Awesome remplacées par des SVG en ligne: ${usedIcons.join(', ') || 'aucune'}`);

        return `'use client';

import { useEffect, useRef } from 'react';
import { 
  initializeResponsiveMenu, 
  setupMenuToggle,
  attachMenuListeners 
} from '@/utils/externalHeaderUtils';

/**
 * ${name} Component - Auto-generated from ${DOMAIN_URL}
 * Generated on: ${timestamp}
 * 
 * ⚠️ WARNING: This component is auto-generated during build.
 * Do not edit manually - changes will be overwritten.
 * 
 * Structure HTML préservée intacte depuis le site original.
 * Le responsive design est géré par les utilitaires externes.
 */

export default function External${name}() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nav = containerRef.current.querySelector('.ods-front-header');
    const collapsible = containerRef.current.querySelector('.ods-responsive-menu-collapsible');
    const placeholder = containerRef.current.querySelector('.ods-responsive-menu-placeholder');

    // Initialiser le système de breakpoint responsive
    const cleanupResize = initializeResponsiveMenu(nav, collapsible, placeholder);
    
    // Configurer le toggle menu mobile
    const toggleMenu = setupMenuToggle(nav, collapsible, placeholder);
    
    // Attacher les listeners après un délai pour React
    setTimeout(() => {
      attachMenuListeners(containerRef, toggleMenu);
    }, 100);
    
    // Cleanup function
    return () => {
      if (cleanupResize) cleanupResize();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="external-${name.toLowerCase()}-container"
      dangerouslySetInnerHTML={{
        __html: \`${processedHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`
      }}
    />
  );
}
`;
    }

    // Pour les autres composants (Footer, etc.), utiliser le template standard
    return `'use client';

/**
 * ${name} Component - Auto-generated from ${DOMAIN_URL}
 * Generated on: ${timestamp}
 * 
 * ⚠️ WARNING: This component is auto-generated during build.
 * Do not edit manually - changes will be overwritten.
 */

export default function External${name}() {
  return (
    <div 
      className="external-${name.toLowerCase()}-container"
      dangerouslySetInnerHTML={{
        __html: \`${sanitizedHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`
      }}
    />
  );
}
`;
}

/**
 * Crée des composants placeholder vides pour éviter les erreurs d'import
 */
function createPlaceholderComponents() {
    const timestamp = new Date().toISOString();
    
    const headerPlaceholder = generateComponent('Header', null, timestamp);
    const footerPlaceholder = generateComponent('Footer', null, timestamp);
    
    const headerPath = path.join(OUTPUT_DIR, 'ExternalHeader.tsx');
    const footerPath = path.join(OUTPUT_DIR, 'ExternalFooter.tsx');
    
    // Créer seulement s'ils n'existent pas déjà
    if (!fs.existsSync(headerPath)) {
        fs.writeFileSync(headerPath, headerPlaceholder, 'utf8');
        console.log(`✅ Placeholder Header créé: ${headerPath}`);
    }
    
    if (!fs.existsSync(footerPath)) {
        fs.writeFileSync(footerPath, footerPlaceholder, 'utf8');
        console.log(`✅ Placeholder Footer créé: ${footerPath}`);
    }
    
    const indexPath = path.join(OUTPUT_DIR, 'index.ts');
    if (!fs.existsSync(indexPath)) {
        const indexContent = `// Auto-generated exports for external components
export { default as ExternalHeader } from './ExternalHeader';
export { default as ExternalFooter } from './ExternalFooter';
`;
        fs.writeFileSync(indexPath, indexContent, 'utf8');
        console.log(`✅ Placeholder Index créé: ${indexPath}`);
    }
}

// Créer les composants placeholder au démarrage du script
createPlaceholderComponents();

/**
 * Récupère le HTML rendu depuis l'URL en utilisant Puppeteer
 * Cela permet de récupérer le DOM après l'exécution de JavaScript (AngularJS, etc.)
 */
async function fetchRenderedHTML(url) {
    console.log(`🔍 Lancement du navigateur headless pour ${url}...`);

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });

    try {
        const page = await browser.newPage();

        // Configurer le user agent et la taille de viewport
        await page.setUserAgent('Mozilla/5.0 (compatible; Huwise-Builder/1.0)');
        await page.setViewport({width: 1920, height: 1080}); // Desktop pour capturer toutes les règles

        // Aller à la page et attendre que le contenu soit chargé
        console.log(`📡 Chargement de la page...`);
        await page.goto(url, {
            waitUntil: 'networkidle2', // Attendre que le réseau soit inactif (pas de requête depuis 500ms)
            timeout: 30000
        });

        // Attendre que les composants AngularJS soient potentiellement chargés
        console.log(`⏱️ Attente du rendu JavaScript...`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Récupérer le HTML final après l'exécution de JavaScript
        const html = await page.content();
        console.log(`✅ HTML rendu récupéré avec succès (${html.length} caractères)`);

        return html;

    } finally {
        await browser.close();
    }
}

/**
 * Télécharge le contenu CSS depuis une URL
 */
async function downloadCSS(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        const timeout = 10000; // 10 secondes

        const req = client.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                return;
            }

            let cssContent = '';
            res.on('data', (chunk) => {
                cssContent += chunk;
            });

            res.on('end', () => {
                resolve(cssContent);
            });

            res.on('error', (err) => {
                reject(err);
            });
        });

        req.setTimeout(timeout, () => {
            req.destroy();
            reject(new Error(`Timeout downloading ${url}`));
        });

        req.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Extrait le header et footer avec un viewport spécifique
 */
async function extractHeaderFooterWithViewport(page, url, viewport, label) {
    console.log(`📱 Extraction ${label}...`);
    
    await page.setViewport(viewport);
    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
    });
    
    // Attendre le rendu complet + interaction AngularJS
    await new Promise(resolve => setTimeout(resolve, 3000));

    return await page.evaluate(() => {
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        
        return {
            headerHTML: header ? header.outerHTML : null,
            footerHTML: footer ? footer.outerHTML : null
        };
    });
}

/**
 * Version simplifiée : utilise seulement le header desktop sans modification
 * Préserve la structure HTML originale intacte
 */
function preserveOriginalHeaderStructure(desktopHTML, mobileHTML) {
    console.log('🏗️ Préservation de la structure HTML originale (desktop)...');
    
    // Utiliser uniquement la version desktop pour préserver la structure
    // Le CSS responsive s'occupera de l'affichage mobile via les media queries
    return desktopHTML || mobileHTML;
}

/**
 * Parse le HTML rendu et extrait header/footer + CSS complet
 * Maintenant avec fusion intelligente desktop + mobile
 */
async function parseRenderedHeaderFooter(url) {
    console.log('🔍 Parsing du HTML rendu (Desktop + Mobile) et extraction du CSS...');

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (compatible; Huwise-Builder/1.0)');

        // 1. Extraction version DESKTOP
        const desktopResult = await extractHeaderFooterWithViewport(
            page, url, 
            {width: 1920, height: 1080}, 
            'DESKTOP'
        );
        
        // 2. Extraction version MOBILE
        const mobileResult = await extractHeaderFooterWithViewport(
            page, url, 
            {width: 375, height: 667}, 
            'MOBILE'
        );
        
        // 3. Préservation de la structure HTML originale
        const mergedHeaderHTML = preserveOriginalHeaderStructure(
            desktopResult.headerHTML, 
            mobileResult.headerHTML
        );
        
        // 4. Footer (prendre desktop, généralement identique)
        const finalFooterHTML = desktopResult.footerHTML || mobileResult.footerHTML;

        // 5. Récupération du CSS complet (en mode desktop pour avoir toutes les règles)
        console.log('📥 Récupération des URLs CSS...');
        await page.setViewport({width: 1920, height: 1080});
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const cssResult = await page.evaluate(() => {
            // Récupérer toutes les URLs des feuilles CSS externes
            const cssUrls = [];
            const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
            linkElements.forEach(link => {
                if (link.href) {
                    cssUrls.push(link.href);
                }
            });

            // Récupérer les imports CSS depuis les <style> (si besoin)
            const importUrls = [];
            const styleElements = document.querySelectorAll('style');
            styleElements.forEach(style => {
                if (style.textContent) {
                    const importMatches = style.textContent.match(/@import\s+(?:url\()?["']?([^"'\)]+)["']?\)?/g);
                    if (importMatches) {
                        importMatches.forEach(match => {
                            const urlMatch = match.match(/@import\s+(?:url\()?["']?([^"'\)]+)["']?\)?/);
                            if (urlMatch && urlMatch[1]) {
                                const url = urlMatch[1].startsWith('http') ? urlMatch[1] : new URL(urlMatch[1], window.location.href).href;
                                importUrls.push(url);
                            }
                        });
                    }
                }
            });

            return { cssUrls, importUrls };
        });

        console.log(`✅ Header fusionné: ${mergedHeaderHTML ? 'Oui' : 'Non'}`);
        console.log(`✅ Footer trouvé: ${finalFooterHTML ? 'Oui' : 'Non'}`);
        console.log(`✅ URLs CSS trouvées: ${cssResult.cssUrls.length}`);

        // Télécharger tous les fichiers CSS externes manuellement (contenu complet)
        console.log('📥 Téléchargement des CSS...');
        let allCSS = '';

        // CSS externes depuis les <link>
        for (const cssUrl of cssResult.cssUrls) {
            try {
                const cssContent = await downloadCSS(cssUrl);
                allCSS += `\n/* CSS from ${cssUrl} */\n${cssContent}\n`;
            } catch (error) {
                console.warn(`⚠️ Échec CSS: ${cssUrl}`);
            }
        }

        // CSS depuis les @import
        for (const importUrl of cssResult.importUrls) {
            try {
                const cssContent = await downloadCSS(importUrl);
                allCSS += `\n/* CSS from @import ${importUrl} */\n${cssContent}\n`;
            } catch (error) {
                console.warn(`⚠️ Échec @import: ${importUrl}`);
            }
        }

        console.log(`✅ CSS récupéré: ${allCSS.length} caractères`);

        return {
            headerHTML: mergedHeaderHTML,
            footerHTML: finalFooterHTML,
            allCSS: allCSS
        };

    } finally {
        await browser.close();
    }
}

/**
 * Préfixe tous les sélecteurs CSS avec un conteneur spécifique
 */
async function prefixCSSSelectors(css, prefix) {
  if (!css) return '';
  
  try {
    const result = await postcss([
      require('postcss-prefixwrap')(prefix)
    ]).process(css, { from: undefined });
    
    return result.css;
  } catch (error) {
    console.warn(`⚠️ Erreur préfixage CSS: ${error.message}`);
    return css; // Retourner le CSS original en cas d'erreur
  }
}

/**
 * Pipeline propre: Parse → Clean → Purge → Prefix
 */
async function processCSS(rawCSS, html, containerClass) {
    console.log(`🧹 Pipeline CSS: Parse → Clean → Purge → Prefix`);

    if (!rawCSS) return '';

    // const debugPath = path.join(__dirname, '..', 'debug');
    // if (!fs.existsSync(debugPath)) {
    //     fs.mkdirSync(debugPath, {recursive: true});
    // }

    try {
        // 0. Sauvegarder CSS brut
        // console.log(`💾 0. Sauvegarde CSS brut...`);
        // fs.writeFileSync(path.join(debugPath, '1-raw.css'), rawCSS, 'utf8');

        // 1. Parse avec PostCSS Safe Parser (corrige la syntaxe)
        console.log(`📋 1. Parsing avec PostCSS Safe Parser...`);
        const parseResult = await postcss().process(rawCSS, {
            parser: safeParser,
            from: undefined
        });

        // Sauvegarder CSS après PostCSS
        // fs.writeFileSync(path.join(debugPath, '2-postcss-parsed.css'), parseResult.css, 'utf8');

        // 2. Clean avec CleanCSS (optimise)
        console.log(`🧼 2. Nettoyage avec CleanCSS...`);
        const cleanResult = new CleanCSS({
            level: 1,
            format: 'beautify'
        }).minify(parseResult.css);

        if (cleanResult.errors.length > 0) {
            console.warn('⚠️ Erreurs CleanCSS:', cleanResult.errors);
        }

        // Sauvegarder CSS après CleanCSS
        // fs.writeFileSync(path.join(debugPath, '3-cleancss-cleaned.css'), cleanResult.styles, 'utf8');

        // 3. Purge avec PurgeCSS (garde seulement le nécessaire)
        console.log(`🔥 3. Purge avec PurgeCSS...`);

        const purgeResult = await new PurgeCSS().purge({
            content: [{raw: html, extension: 'html'}],
            css: [{raw: cleanResult.styles}],
            fontFace: true,
            keyframes: true,
            variables: true,
            blocklist: [
                'main'
            ],
            // Préserver les classes d'état responsive qui sont ajoutées dynamiquement par JavaScript
            safelist: [
                // Classes d'état du menu responsive
                'ods-responsive-menu--collapsed',
                'ods-responsive-menu--expanded', 
                'ods-responsive-menu-placeholder--active',
                'ods-responsive-menu-collapsible--collapsed',
                'ods-responsive-menu-collapsible--expanded',
                // Pattern pour toutes les classes responsive menu avec modificateurs
                /^ods-responsive-menu/,
                // Pattern pour les animations AOS qui peuvent être ajoutées dynamiquement
                /^aos-/,
                // Classes d'interaction et d'état qui peuvent être ajoutées par JS
                /--active$/,
                /--collapsed$/,
                /--expanded$/,
                /--visible$/,
                /--hidden$/
            ]
        });

        console.log(`   CSS rejeté: ${purgeResult[0]?.rejected?.length || 0} règles supprimées`);

        // Sauvegarder CSS après PurgeCSS
        // fs.writeFileSync(path.join(debugPath, '4-purgecss-purged.css'), purgeResult[0]?.css || '', 'utf8');

        // 4. Post-processing PostCSS pour éliminer définitivement @font-face et @keyframes
        console.log(`🧽 4. Post-processing avec PostCSS plugins...`);
        const beforePostCSS = (purgeResult[0]?.css || '').length;

        const postProcessResult = await postcss([
            discardUnused({
                atrule: ['@font-face'],
            })
        ]).process(purgeResult[0]?.css || '', {from: undefined});

        let finalCSS = postProcessResult.css;

        // 5. Préfixer tous les sélecteurs CSS avec la classe conteneur
        if (containerClass) {
            console.log(`🏷️ 5. Préfixage avec "${containerClass}"...`);
            finalCSS = await prefixCSSSelectors(finalCSS, containerClass);
        }

        // Sauvegarder CSS final
        // fs.writeFileSync(path.join(debugPath, '6-final-prefixed.css'), finalCSS, 'utf8');

        console.log(`   Post-processing: ${beforePostCSS} → ${finalCSS.length} (-${beforePostCSS - finalCSS.length} caractères)`);
        console.log(`✅ Pipeline terminé: ${rawCSS.length} → ${finalCSS.length} (${Math.round((1 - finalCSS.length / rawCSS.length) * 100)}% réduit)`);

        return finalCSS;

    } catch (error) {
        console.error('❌ Erreur pipeline CSS:', error.message);
        return '';
    }
}

/**
 * Fonction principale
 */
async function main() {
    try {
        console.log('🚀 Début de la récupération du header/footer depuis le domaine Huwise...\n');

        // Parser header/footer avec Puppeteer (rendu JavaScript complet) + CSS
        const {headerHTML, footerHTML, allCSS} = await parseRenderedHeaderFooter(DOMAIN_URL);

        // Process CSS avec pipeline propre + préfixage
        console.log('\n🧹 Pipeline CSS pour header et footer...');
        const headerCSS = await processCSS(allCSS, headerHTML, '.external-header-container');
        const footerCSS = await processCSS(allCSS, footerHTML, '.external-footer-container');

        // Timestamp pour les commentaires
        const timestamp = new Date().toISOString();

        // Générer le fichier CSS auto-généré
        console.log('\n🎨 Génération du fichier CSS auto-généré...');
        const cssContent = `/**
 * CSS auto-généré depuis le domaine Huwise
 * Généré le: ${timestamp}
 * 
 * ⚠️ WARNING: Ce fichier est auto-généré lors du build.
 * Ne pas éditer manuellement - les changements seront écrasés.
 * 
 * Pour personnaliser les styles, utilisez external-header-footer.css
 */

/* ==========================================================================
   HEADER AUTO-GENERATED STYLES
   ========================================================================== */

${headerCSS}

/* ==========================================================================
   FOOTER AUTO-GENERATED STYLES
   ========================================================================== */

${footerCSS}
`;

        // Écrire le fichier CSS auto-généré
        const cssPath = path.join(__dirname, '..', 'src', 'styles', 'auto-generated.css');
        fs.writeFileSync(cssPath, cssContent, 'utf8');
        console.log(`✅ CSS auto-généré: ${cssPath}`);
        console.log(`   CSS Header: ${headerCSS.length} caractères`);
        console.log(`   CSS Footer: ${footerCSS.length} caractères`);

        // Générer les composants
        console.log('\n📝 Génération des composants React...');

        const headerComponent = generateComponent('Header', headerHTML, timestamp);
        const footerComponent = generateComponent('Footer', footerHTML, timestamp);

        // Écrire les fichiers
        const headerPath = path.join(OUTPUT_DIR, 'ExternalHeader.tsx');
        const footerPath = path.join(OUTPUT_DIR, 'ExternalFooter.tsx');

        fs.writeFileSync(headerPath, headerComponent, 'utf8');
        fs.writeFileSync(footerPath, footerComponent, 'utf8');

        console.log(`✅ Header généré: ${headerPath}`);
        console.log(`✅ Footer généré: ${footerPath}`);

        // Générer un fichier d'index pour faciliter les imports
        const indexContent = `// Auto-generated exports for external components
export { default as ExternalHeader } from './ExternalHeader';
export { default as ExternalFooter } from './ExternalFooter';
`;

        const indexPath = path.join(OUTPUT_DIR, 'index.ts');
        fs.writeFileSync(indexPath, indexContent, 'utf8');
        console.log(`✅ Index généré: ${indexPath}`);

        console.log('\n🎉 Header/Footer ET CSS récupérés et intégrés avec succès !');
        console.log('\n📋 Prochaines étapes:');
        console.log('   1. Le CSS auto-généré est dans: src/styles/auto-generated.css');
        console.log('   2. Importez-le dans globals.css si ce n\'est pas déjà fait');
        console.log('   3. Personnalisez dans external-header-footer.css si nécessaire');

    } catch (error) {
        console.error('\n❌ Erreur lors de la récupération du header/footer:');
        console.error(error.message);

        // En cas d'erreur, générer des composants de fallback
        console.log('\n🔄 Génération des composants de fallback...');

        const timestamp = new Date().toISOString();
        const fallbackHeader = generateComponent('Header', null, timestamp);
        const fallbackFooter = generateComponent('Footer', null, timestamp);

        const headerPath = path.join(OUTPUT_DIR, 'ExternalHeader.tsx');
        const footerPath = path.join(OUTPUT_DIR, 'ExternalFooter.tsx');

        fs.writeFileSync(headerPath, fallbackHeader, 'utf8');
        fs.writeFileSync(footerPath, fallbackFooter, 'utf8');

        console.log('⚠️ Composants de fallback générés (vides)');

        process.exit(1);
    }
}

// Lancer le script seulement si appelé directement
if (require.main === module) {
    main();
}

module.exports = {main};