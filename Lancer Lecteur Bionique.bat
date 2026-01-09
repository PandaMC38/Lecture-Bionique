@echo off
cd /d "%~dp0"
echo ============================================
echo   Lancement du Lecteur Bionique...
echo ============================================
echo.
if not exist "node_modules" (
    echo [Info] Premier lancement detecte. Installation des dependances...
    call npm install
)

npm start
if %errorlevel% neq 0 (
    echo.
    echo Une erreur est survenue. Assurez-vous d'avoir installe les dependances avec 'npm install'.
    pause
)
