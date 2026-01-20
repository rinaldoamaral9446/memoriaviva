# Implementation Plan - PWA Transformation

Goal: Transform "Memória Viva" into a Progressive Web App (PWA) with offline capabilities, installation support, and background sync for uploads.

## User Review Required
>
> [!NOTE]
> We will use `vite-plugin-pwa` with the `injectManifest` strategy to allow for custom Background Sync configuration via Workbox.
> Background Sync relies on the browser's ability to wake up the service worker. Support varies by browser/OS.

## Proposed Changes

### Configuration & Assets

#### [NEW] `frontend/public/manifest.json`

- **Manual Creation (Optional but requested)**: We will configure the plugin to generate or use this manifest.
- **Properties**:
  - `name`: "Memória Viva"
  - `short_name`: "Memória Viva"
  - `start_url`: "/"
  - `display`: "standalone"
  - `background_color`: "#ffffff"
  - `theme_color`: "#7e22ce"
  - `icons`: [192x192, 512x512]

#### [NEW] `frontend/public/pwa-icon-192.png` & `frontend/public/pwa-icon-512.png`

- **Done**: Icons generated and placed in `public`.

#### [MODIFY] `frontend/vite.config.js`

- Install `vite-plugin-pwa`.
- Configure `VitePWA` plugin:
  - `strategies`: 'injectManifest'
  - `srcDir`: 'src'
  - `filename`: 'sw.js'
  - `registerType`: 'prompt'
  - `manifest`: (Define all properties here to ensure generation/injection)

### Service Worker (The "Offline Brain")

#### [NEW] `frontend/src/sw.js`

- **Precache**: Use `precacheAndRoute(self.__WB_MANIFEST)` for static assets.
- **Runtime Caching**:
  - `NetworkFirst` for HTML navigations (App Shell).
  - `StaleWhileRevalidate` for CSS/JS/Images.
  - `CacheFirst` for Google Fonts.
- **Background Sync**:
  - Use `workbox-background-sync`.
  - Register a route for `POST /api/memories` (or relevant upload endpoints).
  - Strategy: `NetworkOnly` with `BackgroundSyncPlugin`.
  - Queue Name: `memory-upload-queue`.

### Frontend Logic & UI

#### [MODIFY] `frontend/src/main.jsx` (or `index.html`)

- Ensure service worker registration (handled by `vite-plugin-pwa/client` or `virtual:pwa-register`).

#### [NEW] `frontend/src/components/InstallPrompt.jsx`

- **Logic**: Listen for `beforeinstallprompt` event. Save event to state.
- **UI**:
  - If `installable` state is true: Show "📲 Instalar aplicativo".
  - `onClick`: Call `prompt()` on the saved event.
  - Handle `appinstalled` event to hide button.

#### [MODIFY] `frontend/src/pages/Login.jsx` & `frontend/src/pages/Dashboard.jsx`

- Import and render `<InstallPrompt />`.

## Verification Plan

### Automated

- Build process checks (`npm run build`).

### Manual

1. **Lighthouse Audit**: Run PWA audit in Chrome DevTools to verify Manifest and Service Worker.
2. **Installation**:
    - Open in Chrome (Desktop/Mobile).
    - Verify "Install" icon appears in address bar or triggers via our custom button.
    - Install and open in Standalone mode.
3. **Offline Mode**:
    - Go Offline (DevTools).
    - Refresh page. App should load (at least the shell).
4. **Background Sync**:
    - Go Offline.
    - Attempt to create/upload a memory.
    - Go Online.
    - Verify request is replayed and succeeds.
