@echo off
setlocal
cd /d "%~dp0"
set PORT=4173

where node >nul 2>nul
if %errorlevel%==0 (
  start "" cmd /c "timeout /t 1 >nul & start http://localhost:%PORT%"
  node serve.js
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" cmd /c "timeout /t 1 >nul & start http://localhost:%PORT%"
  python -m http.server %PORT% --bind 0.0.0.0
  goto :eof
)

echo Node/Python tidak ditemukan. Membuka index.html langsung secara offline...
start "" "index.html"
