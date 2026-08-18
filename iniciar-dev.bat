@echo off
cd /d "%~dp0"

echo Encerrando qualquer processo nas portas 3000 e 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo Verificando dependencias (so demora se tiver algo novo)...
call pnpm install

echo.
echo Subindo o Comandai (API na 3001, site na 3000)...
echo Para parar depois: feche esta janela ou aperte Ctrl+C.
echo.
call pnpm turbo run dev

pause
