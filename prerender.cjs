const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const routes = [
    '/',
    '/compress',
    '/convert',
    '/resize',
    '/pdf-merge',
    '/pdf-split',
    '/pdf-compress',
    '/remove-bg',
    '/upscale',
    '/qr-code',
    '/password-generator',
    '/video-to-gif',
    '/ocr',
    '/watermark',
    '/watermark-remove'
];

const DIST = path.join(__dirname, 'dist');
const PORT = 4173;

async function prerender() {
    console.log('Starting preview server...');
    const server = require('child_process').spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
        cwd: __dirname,
        shell: true,
        stdio: 'pipe'
    });

    // Wait for server
    await new Promise(r => setTimeout(r, 3000));

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

    for (const route of routes) {
        console.log(`Prerendering: ${route}`);
        const page = await browser.newPage();
        try {
            await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 15000 });
            const html = await page.content();

            const dir = path.join(DIST, route === '/' ? '' : route);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const filePath = route === '/' ? path.join(DIST, 'index.html') : path.join(dir, 'index.html');
            fs.writeFileSync(filePath, html, 'utf8');
            console.log(`  -> ${filePath}`);
        } catch (err) {
            console.error(`  Error on ${route}:`, err.message);
        }
        await page.close();
    }

    await browser.close();
    server.kill();
    console.log('Prerendering complete!');
}

prerender().catch(console.error);