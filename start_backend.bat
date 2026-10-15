@echo off
call venv\Scripts\activate.bat
cd backend
uvicorn app.main:app --reload --port 8000
