@echo off
setlocal enabledelayedexpansion
title NewsPortal Docker Launcher (PostgreSQL)
cd /d "%~dp0"

echo ====================================================
echo      KHOI DONG NEWSPORTAL BANG DOCKER + SQL (POSTGRESQL)
echo ====================================================
echo.

:: 1. Kiem tra Docker CLI
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [LOI] May cua ban chua cai dat Docker CLI!
    echo Vui long kiem tra Docker Desktop tai: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

:: 2. Kiem tra Docker Daemon da bat chua
echo [1/4] Dang kiem tra trang thai Docker Desktop...
docker info >nul 2>&1
if %errorlevel% equ 0 goto docker_ready

echo.
echo Docker Desktop chua chay. Dang thu tu dong mo Docker Desktop...
if exist "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe" (
    start "" "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
) else if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
)

echo Vui long doi Docker Engine khoi dong (khoang 30-45 giay)...

set attempt=0
:wait_docker
timeout /t 4 /nobreak >nul
set /a attempt+=1
docker info >nul 2>&1
if %errorlevel% equ 0 goto docker_ready
if !attempt! lss 20 (
    echo      Van dang cho Docker san sang (lan !attempt!/20)...
    goto wait_docker
)

echo.
echo [CHU Y] Docker khoi dong lau hon binh thuong.
echo Hay kiem tra ung dung Docker Desktop tren man hinh hoac taskbar da bat chua.
echo Khi thay Docker Desktop da chay, hay nhan phim bat ky de tiep tuc...
pause

:docker_ready
echo      Docker Desktop dang hoat dong tot!
echo.

:: 3. Chuyen schema sang PostgreSQL
echo [2/4] Dang thiet lap cau hinh Co so du lieu SQL (PostgreSQL)...
copy /Y "backend\prisma\schema.postgresql.prisma" "backend\prisma\schema.prisma" >nul
echo      Da chuyen Prisma schema sang PostgreSQL thanh cong!
echo.

:: 4. Build va khoi dong cac container
echo [3/4] Dang khoi dong cac container (PostgreSQL, Backend, Frontend)...
echo      Vui long cho trong giay lat...
echo.
docker compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo ====================================================
    echo [LOI] Docker Compose khong the khoi dong!
    echo ====================================================
    echo Vui long kiem tra lai Docker Desktop roi thu lai.
    pause
    exit /b 1
)

echo.
echo [4/4] Trang thai cac container Docker:
docker compose ps

echo.
echo ====================================================
echo      KHOI DONG DOCKER THANH CONG!
echo ====================================================
echo - Trang web Frontend: http://localhost
echo - API Backend:       http://localhost:5000/api/v1
echo - SQL Database:      PostgreSQL 16 (Port 5432)
echo.
echo Dang mo trinh duyet web (http://localhost)...
timeout /t 4 /nobreak >nul
start http://localhost

echo.
echo Nhan phim bat ky de dong cua so nay (Docker van tiep tuc chay ngam).
pause >nul
