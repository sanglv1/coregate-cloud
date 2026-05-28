@echo off
setlocal

where mvn >nul 2>nul
if %errorlevel%==0 (
  mvn %*
  exit /b %errorlevel%
)

echo [INFO] Maven not found locally. Falling back to Dockerized Maven...
docker run --rm ^
  -v "%cd%":/workspace ^
  -w /workspace ^
  maven:3.9.9-eclipse-temurin-21 ^
  mvn %*
exit /b %errorlevel%
