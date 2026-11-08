'use strict';
/**
 * scripts/render-icons.js
 *
 * Renders the app icon PNG from the logo SVG with Electron's own renderer,
 * so no image library is needed:
 *
 *   npx electron scripts/render-icons.js
 *
 * assets/logos/stereopticon-icon-dark.svg → assets/icon.png (512×512).
 * electron-builder makes the Windows .ico for the exe and installer from it.
 */

const { app, BrowserWindow } = require('electron');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC  = path.join(ROOT, 'assets', 'logos', 'stereopticon-icon-dark.svg');
const OUT  = path.join(ROOT, 'assets', 'icon.png');
const SIZE = 512;

app.disableHardwareAcceleration();
app.whenReady().then(async () => {
    const win = new BrowserWindow({
        width: SIZE, height: SIZE, show: false, transparent: true, frame: false,
        useContentSize: true,
        webPreferences: { offscreen: true },
    });
    const svg = fs.readFileSync(SRC, 'utf8');
    const html = `<!doctype html><html><body style="margin:0;background:transparent;overflow:hidden">
        <img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${SIZE}" height="${SIZE}" style="display:block">
        </body></html>`;
    await win.loadURL('data:text/html;base64,' + Buffer.from(html).toString('base64'));
    await new Promise(r => setTimeout(r, 300));
    const img = await win.webContents.capturePage({ x: 0, y: 0, width: SIZE, height: SIZE });
    fs.writeFileSync(OUT, img.resize({ width: SIZE, height: SIZE, quality: 'best' }).toPNG());
    console.log(`Wrote ${OUT}`);
    app.quit();
});
