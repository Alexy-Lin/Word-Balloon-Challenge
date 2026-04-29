@echo off
cd /d %~dp0

set PY_CMD=
if exist C:\anaconda3\python.exe set PY_CMD=C:\anaconda3\python.exe
if "%PY_CMD%"=="" (
	where py >nul 2>nul
	if %errorlevel%==0 set PY_CMD=py -3
)
if "%PY_CMD%"=="" (
	where python >nul 2>nul
	if %errorlevel%==0 set PY_CMD=python
)

if "%PY_CMD%"=="" (
	echo [ERROR] 没有找到 Python 解释器。
	pause
	exit /b 1
)

start "Word Balloon Web Server" cmd /k %PY_CMD% server.py

timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8765/
