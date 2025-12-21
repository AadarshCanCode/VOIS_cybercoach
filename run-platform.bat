@echo off
setlocal
cd /d %~dp0

if not exist node_modules ( 
  echo Installing dependencies...
  npm install
)

echo Starting frontend (Vite) and backend (Express proxy)...
npm run dev:full

endlocal
