const puppeteer = require('puppeteer');

const routes = [
    '/', '/compress', '/convert', '/resize',
    '/pdf-merge', '/pdf-split', '/pdf-compress',
    '/remove-bg', '/upscale', '/qr-code',
    '/password-generator', '/video-to-gif', '/ocr',
    '/watermark', '/watermark-remove'
];

const PORT = 4173;

async function check() {
    console.log('Starting preview server...');
    const server = require('child_process').spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
        cwd: __dirname, shell: true, stdio: 'pipe'
    });
    await new Promise(r => setTimeout(r, 3000));

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const results = [];

    for (const route of routes) {
        const page = await browser.newPage();
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });
        page.on('pageerror', err => errors.push(err.message));

        try {
            await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 15000 });
            const title = await page.title();
            const hasH1 = await page.$('h1') !== null;
            const status = errors.length === 0 ? 'OK' : 'ERROR';
            results.push({ route, status, title: title.substring(0, 50), hasH1, errors: errors.filter(e => !e.includes('creative-sbl') && !e.includes('coupang') && !e.includes('adsterra')).slice(0, 3) });
        } catch (err) {
            results.push({ route, status: 'FAIL', title: '', hasH1: false, errors: [err.message] });
        }
        await page.close();
    }

    await browser.close();
    server.kill();

    console.log('\n========== RESULTS ==========\n');
    for (const r of results) {
        const icon = r.status === 'OK' ? 'OK' : 'XX';
        console.log(`[${icon}] ${r.route}`);
        console.log(`     Title: ${r.title}`);
        console.log(`     H1: ${r.hasH1}`);
        if (r.errors.length > 0) {
            r.errors.forEach(e => console.log(`     ERROR: ${e.substring(0, 120)}`));
        }
        console.log('');
    }
}

check().catch(console.error);