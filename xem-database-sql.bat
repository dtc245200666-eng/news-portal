@echo off
title Quan Ly Database SQL (Prisma Studio)
cd /d "%~dp0"

echo ====================================================
echo      MO GIAO DIEN QUAN TRI DATABASE SQL (PRISMA STUDIO)
echo ====================================================
echo.
echo Dang ket noi toi co so du lieu PostgreSQL (Port 5432)...
echo Giao dien truc quan se tu dong mo tai: http://localhost:5555
echo.
echo (De dong giao dien nay, ban chi can nhan Ctrl + C hoac tat cua so nay)
echo.

set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/newsportal?schema=public

:: Tu dong mo trinh duyet sau 3 giay
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5555"

cd backend
npx prisma studio --port 5555
