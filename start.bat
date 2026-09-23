@echo off
echo Starting Remainder App...

:: Start Backend in a new terminal window
start "Remainder App - Backend" cmd /k "cd backend && if exist .venv\Scripts\activate (call .venv\Scripts\activate) && uvicorn app.main:app --reload"

:: Start Frontend in a new terminal window
start "Remainder App - Frontend" cmd /k "cd frontend && npm run dev"

echo Services started successfully!
