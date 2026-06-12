@echo off
cd /d "%~dp0"
echo VoiceDraw 启动中...
start http://localhost:8080
python -m http.server 8080
