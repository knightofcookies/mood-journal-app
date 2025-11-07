@echo off
echo Starting Sentiment Analysis Server...
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

REM Start the server
echo Starting Flask server on http://localhost:5001
echo Press Ctrl+C to stop the server
echo.
python server.py
