@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo === VoiceDraw 推送到 GitHub ===
echo.

git status -sb
echo.

where gh >nul 2>&1
if %errorlevel%==0 (
  echo 尝试用 gh 创建仓库并推送...
  gh repo create Teku715/ai-voice-draw --public --source=. --remote=origin --push --description "XEngineer第四批 题目二 AI语音绘图 VoiceDraw"
  if %errorlevel%==0 goto ok
)

echo 若仓库尚未创建，请先在 GitHub 网页 New repository: ai-voice-draw
echo 然后执行:
echo   git remote add origin https://github.com/Teku715/ai-voice-draw.git
echo   git push -u origin main
echo.

git remote remove origin 2>nul
git remote add origin https://github.com/Teku715/ai-voice-draw.git
git branch -M main
git push -u origin main
if %errorlevel%==0 goto ok

echo.
echo 推送失败。请检查:
echo 1. 网络能否打开 github.com
echo 2. 是否已 gh auth login 或配置 Git 凭据
echo 3. GitHub 上是否已创建 Teku715/ai-voice-draw 仓库
pause
exit /b 1

:ok
echo.
echo 成功! 仓库: https://github.com/Teku715/ai-voice-draw
pause
