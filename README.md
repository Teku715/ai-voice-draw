# VoiceDraw · AI 语音绘图工具

> 七牛云 XEngineer 新工科计划 · **第四批 · 题目二**

用户**不使用鼠标和键盘绘图**，通过**语音指令**在画布上创作。支持连续语音模式，适合 Demo 演示。

## 快速运行

1. 用 **Chrome 或 Edge** 打开 `index.html`（或本地服务）
2. 允许麦克风
3. 点 **「开启连续语音」** 或说 **「开始监听」**
4. 直接说指令，例如：**画一个红色的圆** → **大一点** → **右移** → **导出图片**

```bash
cd C:\Users\Lenovo\Projects\ai-voice-draw
python -m http.server 8080
# 打开 http://localhost:8080
```

## 功能

| 功能 | 说明 |
|------|------|
| 连续语音 | 说「开始监听」，免按住按钮 |
| 图元 | 圆、椭圆、矩形、正方形、三角形、五角星、直线 |
| 颜色/位置 | 红色、在左边画圆、中间 |
| 变换 | 大一点、左移、右移等 |
| 编辑 | 撤销、清空、导出 PNG |
| 语音反馈 | 操作结果 TTS 播报 |

## 技术栈

- HTML5 Canvas
- Web Speech API（识别 + 合成，**零 API 费用**）
- 纯前端，无后端

## 项目结构

```
ai-voice-draw/
├── index.html
├── style.css
├── js/
│   ├── canvas-engine.js
│   ├── commands.js
│   └── app.js
├── DESIGN.md    ← 赛题要求的设计文档
└── README.md
```

## Demo 视频（待上传）

标题示例：`【XEngineer第四批】VoiceDraw AI语音绘图 | 纯语音控制Canvas`

## 作者

- 特列努尔·叶克布
- 南京邮电大学 · 网络工程 · B25090602

## 许可证

MIT
