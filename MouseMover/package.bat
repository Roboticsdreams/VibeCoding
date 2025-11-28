@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-25
set PATH=%JAVA_HOME%\bin;%PATH%

if not exist "bin" mkdir bin
javac -d bin src/MouseMover.java
jar cfm MouseMover.jar src/MANIFEST.MF -C bin .
echo JAR created: MouseMover.jar

if not exist "build" mkdir build
copy /Y MouseMover.jar build\

echo Creating EXE with jpackage...
jpackage --name MouseMover --input build --main-jar MouseMover.jar --type app-image --dest dist
echo EXE created in dist/MouseMover

