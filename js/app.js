(function () {
  const canvas = document.getElementById("board");
  const micBtn = document.getElementById("micBtn");
  const statusEl = document.getElementById("status");
  const lastTextEl = document.getElementById("lastText");
  const logEl = document.getElementById("log");
  const hintEl = document.getElementById("hint");
  const modeEl = document.getElementById("modeBadge");

  const engine = new CanvasEngine(canvas);
  engine.render();

  let continuousMode = false;
  let voiceFeedback = true;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent = "当前浏览器不支持语音识别，请用 Chrome/Edge";
    statusEl.classList.add("error");
    micBtn.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  function log(msg) {
    const li = document.createElement("li");
    li.textContent = new Date().toLocaleTimeString() + " · " + msg;
    logEl.prepend(li);
    while (logEl.children.length > 25) logEl.removeChild(logEl.lastChild);
  }

  function setStatus(text, cls) {
    statusEl.textContent = text;
    statusEl.className = "status" + (cls ? " " + cls : "");
  }

  function updateModeBadge() {
    if (!modeEl) return;
    modeEl.textContent = continuousMode ? "连续语音：开" : "连续语音：关";
    modeEl.classList.toggle("on", continuousMode);
  }

  function speak(text) {
    if (!voiceFeedback || !text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/（.*?）/g, ""));
    utterance.lang = "zh-CN";
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  const hooks = {
    onListenOn() {
      continuousMode = true;
      updateModeBadge();
      startListen();
    },
    onListenOff() {
      continuousMode = false;
      updateModeBadge();
      stopListen();
    },
  };

  function handleText(raw) {
    lastTextEl.textContent = "最近识别：" + raw;
    const parsed = parseCommand(raw, canvas.width, canvas.height);
    const result = executeCommand(engine, parsed, canvas.width, canvas.height, hooks);
    hintEl.textContent = result;
    log(raw + " → " + result);
    if (parsed.action !== "listenOn" && parsed.action !== "listenOff") {
      speak(result);
    }
  }

  recognition.onstart = () => {
    setStatus(continuousMode ? "连续聆听中…" : "正在听…", "listening");
    micBtn.classList.add("active");
  };

  recognition.onend = () => {
    micBtn.classList.remove("active");
    if (continuousMode) {
      setStatus("连续聆听中…", "listening");
      window.setTimeout(startListen, 300);
    } else {
      setStatus("准备就绪 — 说「开始监听」进入纯语音模式");
    }
  };

  recognition.onerror = (e) => {
    if (e.error === "no-speech" && continuousMode) {
      window.setTimeout(startListen, 400);
      return;
    }
    setStatus("识别失败：" + (e.error || "unknown"), "error");
    micBtn.classList.remove("active");
    if (continuousMode && e.error !== "not-allowed") {
      window.setTimeout(startListen, 800);
    }
  };

  recognition.onresult = (e) => {
    const text = e.results[e.results.length - 1][0].transcript;
    handleText(text);
  };

  function startListen() {
    try {
      recognition.start();
    } catch (_) {
      /* already started */
    }
  }

  function stopListen() {
    try {
      recognition.stop();
    } catch (_) {}
  }

  micBtn.addEventListener("mousedown", startListen);
  micBtn.addEventListener("mouseup", stopListen);
  micBtn.addEventListener("mouseleave", stopListen);
  micBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startListen();
  });
  micBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopListen();
  });

  document.getElementById("toggleVoiceBtn").addEventListener("click", () => {
    voiceFeedback = !voiceFeedback;
    document.getElementById("toggleVoiceBtn").textContent = "语音反馈：" + (voiceFeedback ? "开" : "关");
  });

  document.getElementById("startListenBtn").addEventListener("click", () => {
    continuousMode = true;
    updateModeBadge();
    startListen();
    log("手动开启连续语音模式");
    speak("已进入连续语音模式");
  });

  updateModeBadge();
  log("VoiceDraw 已启动");
  log("说「开始监听」或点「开启连续语音」后，可纯语音绘图");
  setStatus("说「开始监听」进入纯语音模式，或按住麦克风");
  hintEl.textContent = "Demo：开始监听 → 画一个红色的圆 → 大一点 → 右移 → 画蓝色矩形 → 导出";
})();
