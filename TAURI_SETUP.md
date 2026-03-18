# Tauri Desktop Setup

This project now supports both:
- `web` build (Vercel adapter)
- `desktop` build (Tauri + static adapter)

## Prerequisites for desktop build

1. Install Rust (MSVC toolchain on Windows):
```bash
winget install Rustlang.Rustup
rustup default stable
```
2. Install Microsoft C++ Build Tools (Visual Studio Build Tools, C++ workload).
3. Install WebView2 runtime (usually already installed on Windows 11).

## Commands

Web:
```bash
npm run dev
npm run build
```

Desktop (Tauri):
```bash
npm run tauri:dev
npm run tauri:build
```

## Build modes

- `npm run build` uses `@sveltejs/adapter-vercel`.
- `npm run build:tauri` uses `@sveltejs/adapter-static` and writes to `build/`.

Tauri config is in `src-tauri/tauri.conf.json`.

## Upload endpoint for desktop

By default image upload uses `/api/upload`.

For desktop use, set a full URL:
```bash
VITE_UPLOAD_API_URL=https://your-domain/api/upload
```

Without a reachable upload endpoint, image upload actions will fail in desktop mode.
