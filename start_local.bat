@echo off
title Reminder App Launcher
echo ========================================================
echo   Starting Reminder & Note App (FastAPI + React)
echo ========================================================

:: Navigate to root directory
cd /d "%~dp0"

:: 1. Backend Environment Setup
if not exist "backend\.venv" (
    echo [1/4] Creating Python virtual environment in backend\.venv ...
    python -m venv backend\.venv
)

echo [2/4] Verifying and installing Python dependencies...
call backend\.venv\Scripts\activate.bat
pip install -r backend\requirements.txt

:: 2. Frontend Dependencies Setup
echo [3/4] Verifying and installing Node dependencies...
cd frontend
call npm install
cd ..

:: 3. Launch Backend in a dedicated window
echo [4/4] Launching FastAPI Backend and React Frontend...
start "Reminder App - Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && call .venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: 4. Launch Frontend in a dedicated window
start "Reminder App - Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ========================================================
echo   Both servers launched successfully!
echo   ----------------------------------------------------
echo   Frontend App:    http://127.0.0.1:5173
echo   Backend API:     http://127.0.0.1:8000
echo   Interactive Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause
