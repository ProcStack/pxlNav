@echo off
REM Quick setup script for pxlNav Next testing on Windows

echo  Setting up pxlNav Next Test Environment...

REM Navigate to this script's directory
pushd %~dp0

echo  Installing dependencies...
npm install

if %errorlevel% equ 0 (
    echo    Dependencies installed successfully!
    echo.
    echo    Ready to test! Run one of these commands:
    echo    npm run dev    REM Start Next dev server (http://localhost:3000)
    echo    npm run build  REM Build for production
    echo    npm start      REM Start production server after build
    echo.
) else (
    echo    Installation failed. Please check the errors above.
    popd
    exit /b 1
)

popd
pause
