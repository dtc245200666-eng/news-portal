@echo off
title Day du an len GitHub (Git Push)
cd /d "%~dp0"

echo ====================================================
echo             DAY DU AN NEWSPORTAL LEN GITHUB
echo ====================================================
echo.
echo Buoc 1: Ban vao trinh duyet mo https://github.com/new
echo Buoc 2: Dat Repository name (vi du: newsportal)
echo         (Luu y: KHONG tich chon Add README hay .gitignore)
echo Buoc 3: Bam "Create repository"
echo Buoc 4: Copy duong link HTTPS cua repo (co duoi .git)
echo.
echo ====================================================
set /p REPO_URL="Dan duong link GitHub cua ban vao day roi an Enter: "

if "%REPO_URL%"=="" (
    echo [LOI] Ban chua nhap link GitHub!
    pause
    exit /b 1
)

echo.
echo Dang ket noi toi: %REPO_URL% ...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo Dang day toan bo ma nguon len GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ====================================================
    echo        CHUC MUNG! DA DAY MA NGUON LEN GITHUB THANH CONG!
    echo ====================================================
) else (
    echo.
    echo [CHU Y] Neu trinh duyet yeu cau dang nhap GitHub hoac Token,
    echo hay lam theo huong dan tren man hinh de cap quyen cho Git.
)

pause
