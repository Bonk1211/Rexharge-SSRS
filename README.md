# Rexharge — Frontend

A solar planning **UI showcase**. This branch is frontend-only: the landing page
plus the dashboard UI pages. There is no backend, no database, and no keys — all
data is static demo content, and the 3D reconstruction / panel-layout logic has
been removed.

## Stack

- React 18 + TypeScript 5.7
- Vite 6
- Tailwind 3.4
- TanStack Query — data fetching over static demo data
- Zustand — client state
- React Router 6
- Sonner — toasts
- Motion — animation
- Phosphor Icons

## Run

```bash
cd frontend
npm install
npm run dev       # vite dev server on :5174
npm run build     # tsc -b && vite build
npm run preview   # serve the built bundle
npm run lint      # tsc --noEmit type check
```

## Pages

- **Landing** (`/`) — marketing landing page
- **Monitoring** (`/app`) — portfolio dashboard
- **Clients** (`/app/clients`) — project gallery
- **Project detail** (`/app/projects/:id`) — metrics + dashboard
- **New project** (`/app/projects/new`) — multi-step intake form (demo, not persisted)
- **3D converter** (`/app/workspace/3d-converter`) — static UI mockup of the photo/drone → 3D flow

## Notes

This is a UI demo only. Creating projects, uploading files, and "generating" models
are non-functional mockups — nothing is sent to a server.
