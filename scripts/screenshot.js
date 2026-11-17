#!/usr/bin/env node

/**
 * Capture d'écran d'une page de l'app + relevé des erreurs console, pour la Definition of Done
 * de docs/PROMPT_DEV_ECRAN.md (étapes 2 et 4).
 *
 * Usage : npm run screenshot -- <url-ou-chemin> <fichier.png> [--selector <css>] [--wait <ms>] [--width <px>]
 *   <url-ou-chemin> : URL complète, ou chemin relatif à NEXT_PUBLIC_APP_URL (ex. /ma-page)
 *   --selector      : ne capturer que cet élément (sinon page entière)
 *   --wait          : attente après chargement, en ms (défaut 1500 : laisse finir les animations Recharts)
 *   --width         : largeur de la fenêtre, en px (défaut 1440)
 *
 * Code de sortie 1 si la page émet une erreur console ou une exception.
 * Prérequis : l'app tourne (npm run dev) et Chromium est installé (npx playwright install chromium).
 */

const path = require('path');
const { chromium } = require('playwright');

require('dotenv').config();

const args = process.argv.slice(2);
const positional = [];
const options = { selector: null, wait: 1500, width: 1440 };
for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
        options[args[i].slice(2)] = args[++i];
    } else {
        positional.push(args[i]);
    }
}

const [target, output] = positional;
if (!target || !output) {
    console.error('Usage : npm run screenshot -- <url-ou-chemin> <fichier.png> [--selector <css>] [--wait <ms>] [--width <px>]');
    process.exit(2);
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const url = /^https?:\/\//.test(target) ? target : new URL(target, baseUrl).toString();

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: Number(options.width), height: 900 } });

    const errors = [];
    page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console : ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`exception : ${err.message}`));

    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(Number(options.wait));

        const file = path.resolve(output);
        if (options.selector) {
            await page.locator(options.selector).first().screenshot({ path: file });
        } else {
            await page.screenshot({ path: file, fullPage: true });
        }
        console.log(`Capture : ${file} (${url})`);
    } finally {
        await browser.close();
    }

    if (errors.length > 0) {
        console.error(`${errors.length} erreur(s) sur la page :`);
        errors.forEach((e) => console.error(`  - ${e}`));
        process.exit(1);
    }
    console.log('Aucune erreur console.');
})().catch((err) => {
    console.error(err.message);
    process.exit(2);
});
