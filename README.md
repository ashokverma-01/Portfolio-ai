# STUDIO.DEV MERN portfolio

## Install and run from the server folder

PowerShell users can run the `.cmd` npm launcher without changing the execution policy:

```powershell
cd D:\Portfolio\server
npm.cmd --prefix .. install
npm.cmd --prefix .. run dev
```

The parent folder is the npm workspace root. `npm.cmd --prefix ..` runs the root workspace scripts while you stay in `server`.

Copy the root `.env.example` to `D:\Portfolio\.env` and set MongoDB, Cloudinary, and `ADMIN_API_KEY` values. The app also reads the existing `server\.env` if root `.env` is absent. Do not commit real credentials.

The frontend runs at `http://localhost:5173`, the gateway at `http://localhost:3000`, and the content, contact, and media services at ports `5001`, `5002`, and `5003`.

The old HTML pages are now React page trees. `frontend/index.html` remains the Vite entry point.
