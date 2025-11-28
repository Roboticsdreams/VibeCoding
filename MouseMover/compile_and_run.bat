@echo off
cd /d "%~dp0"
if not exist "bin" mkdir bin
javac -d bin src/MouseMover.java
if %errorlevel% neq 0 (
    echo Compilation failed!
    pause
    exit /b %errorlevel%
)
echo Compilation successful. Running Mouse Mover...
java -cp bin MouseMover
