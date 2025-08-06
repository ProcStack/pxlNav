@echo off
REM Quick setup script for pxlNav React testing on Windows

echo  Setting up pxlNav React Test Environment...

REM Navigate to the test directory
cd src\react-next-dev

REM Install dependencies
echo  Installing dependencies...
npm install

REM Check if installation was successful
if %errorlevel% equ 0 (
    echo    Dependencies installed successfully!
    echo.
    echo    Ready to test! Run one of these commands:
    echo    npm start    # Start development server
    echo    npm run dev  # Alternative start command
    echo.
    echo    The app will open at http://localhost:3000
    echo    Check the browser console for pxlNav loading status
) else (
    echo    Installation failed. Please check the errors above.
    exit /b 1
)

pause
