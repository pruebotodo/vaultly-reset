# Vaultly (paquete limpio para deploy)
Este paquete ya está listo para desplegar **sin parches**:
- Backend (Node + Express + SQLite) usando `youtube-dl-exec` + `ffmpeg-static`.
- Frontend (Vite + React) apuntando a la API vía `VITE_API_BASE`.

## Pasos rápidos (Render, manual)
1) **Web Service (backend)**
   - Name: `vaultly-api`
   - Language: Node
   - Branch: `main`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance: Free
   - Env Vars: `NODE_VERSION=20` (y opcional `OPENAI_API_KEY`)

2) Tras el deploy, copia la URL pública del backend (p.ej. `https://vaultly-api.onrender.com`).

3) **Static Site (frontend)**
   - Name: `vaultly-web`
   - Branch: `main`
   - Root Directory: `web`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Env Vars: `VITE_API_BASE=<URL del backend>`

4) Abre la URL del sitio y usa **Ingerir** para cargar enlaces.
