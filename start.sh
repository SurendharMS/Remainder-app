#!/bin/bash
echo "Starting Remainder App..."

# Start Backend in the background
cd backend
if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
fi
uvicorn app.main:app --reload &
BACKEND_PID=$!
cd ..

# Start Frontend in the background
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Services started successfully!"
echo "Press Ctrl+C to stop both services."

# Trap Ctrl+C to kill both background processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
