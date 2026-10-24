@echo off
title NewsPortal Launcher
cd /d "%~dp0"

echo ====================================================
echo      KHOI DONG HE THONG NEWSPORTAL (MONGODB ATLAS)
echo ====================================================
echo.

:: Dam bao schema dang dung phien ban MongoDB
copy /Y "backend\prisma\schema.mongodb.prisma" "backend\prisma\schema.prisma" >nul

echo [1/2] Dang khoi dong Backend API (Port 5000)...
start "NewsPortal - Backend" cmd /k "cd backend && npm run dev"
echo      Backend dang ket noi MongoDB Atlas o port 5000...
echo.

echo [2/2] Dang khoi dong Frontend Web (Port 5173)...
start "NewsPortal - Frontend" cmd /k "cd frontend && npm run dev"
echo      Frontend dang chay o port 5173...
echo.

echo ====================================================
echo      DANG MO TRINH DUYET WEB (http://localhost:5173)...
echo ====================================================
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173
