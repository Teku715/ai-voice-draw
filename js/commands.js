(function (global) {
  const COLOR_WORDS = ["红", "红色", "蓝", "蓝色", "绿", "绿色", "黑", "黑色", "黄", "黄色", "紫", "紫色", "白", "白色", "橙", "橙色"];

  function normalize(text) {
    return (text || "")
      .replace(/[，。！？、,.!?]/g, "")
      .replace(/\s+/g, "")
      .trim()
      .toLowerCase();
  }

  function pickColor(text) {
    for (const w of COLOR_WORDS) {
      if (text.includes(w)) return w;
    }
    return null;
  }

  function positionFromText(text, canvasW, canvasH) {
    if (/左边|左侧/.test(text)) return { x: canvasW * 0.25 };
    if (/右边|右侧/.test(text)) return { x: canvasW * 0.75 };
    if (/上面|上方|上边/.test(text)) return { y: canvasH * 0.25 };
    if (/下面|下方|下边/.test(text)) return { y: canvasH * 0.75 };
    if (/中间|居中/.test(text)) return { x: canvasW / 2, y: canvasH / 2 };
    return {};
  }

  function parseCommand(raw, canvasW, canvasH) {
    const text = normalize(raw);
    if (!text) return { ok: false, message: "没听清，请再说一次" };

    const color = pickColor(raw);

    if (/开始监听|开始绘图|开始画|启动/.test(text)) {
      return { ok: true, action: "listenOn", message: "已进入连续语音模式" };
    }
    if (/停止监听|停止绘图|暂停/.test(text)) {
      return { ok: true, action: "listenOff", message: "已暂停语音监听" };
    }
    if (/保存|导出|下载图片|导出图片/.test(text)) {
      return { ok: true, action: "export", message: "已导出 PNG 图片" };
    }
    if (/帮助|指令|怎么用/.test(text)) {
      return { ok: true, action: "help", message: "可说：画圆、红色、大一点、左移、撤销、清空" };
    }
    if (/清空|清除|擦除|全部删除/.test(text)) {
      return { ok: true, action: "clear", message: "已清空画布" };
    }
    if (/撤销|撤回|上一步/.test(text)) {
      return { ok: true, action: "undo", message: "已撤销上一步" };
    }
    if (/大一点|放大|变大/.test(text)) {
      return { ok: true, action: "scaleUp", message: "已放大图形" };
    }
    if (/小一点|缩小|变小/.test(text)) {
      return { ok: true, action: "scaleDown", message: "已缩小图形" };
    }
    if (/左移|往左|向左/.test(text)) {
      return { ok: true, action: "left", message: "已左移" };
    }
    if (/右移|往右|向右/.test(text)) {
      return { ok: true, action: "right", message: "已右移" };
    }
    if (/上移|往上|向上/.test(text)) {
      return { ok: true, action: "up", message: "已上移" };
    }
    if (/下移|往下|向下/.test(text)) {
      return { ok: true, action: "down", message: "已下移" };
    }

    if (/五角星|星星|星形/.test(text)) {
      const pos = positionFromText(raw, canvasW, canvasH);
      return { ok: true, action: "star", color, pos, message: "已画五角星" };
    }

    if (/椭圆|椭圆形/.test(text)) {
      const pos = positionFromText(raw, canvasW, canvasH);
      return { ok: true, action: "ellipse", color, pos, message: "已画椭圆" };
    }

    if (/圆|圆形/.test(text) && (/画|绘制|添加|来/.test(text) || text === "圆" || text === "画圆")) {
      const pos = positionFromText(raw, canvasW, canvasH);
      return { ok: true, action: "circle", color, pos, message: "已画圆" + (color ? "（" + color + "）" : "") };
    }

    if (/正方形/.test(text)) {
      const pos = positionFromText(raw, canvasW, canvasH);
      return { ok: true, action: "square", color, pos, message: "已画正方形" };
    }

    if (/矩形|长方形|方形/.test(text) && (/画|绘制|添加/.test(text) || text === "矩形" || text === "画矩形")) {
      const pos = positionFromText(raw, canvasW, canvasH);
      return { ok: true, action: "rect", color, pos, message: "已画矩形" };
    }

    if (/三角/.test(text)) {
      const pos = positionFromText(raw, canvasW, canvasH);
      return { ok: true, action: "triangle", color, pos, message: "已画三角形" };
    }

    if (/线|直线/.test(text) && (/画|绘制|添加/.test(text) || text === "画线" || text === "直线")) {
      return { ok: true, action: "line", color, message: "已画线" };
    }

    if (color && !/画/.test(text)) {
      return { ok: true, action: "setColor", color, message: "颜色设为 " + color };
    }

    if (text === "画圆" || text === "圆形" || text === "圆") {
      return { ok: true, action: "circle", message: "已画圆" };
    }
    if (text === "画矩形" || text === "矩形") {
      return { ok: true, action: "rect", message: "已画矩形" };
    }
    if (text === "画线" || text === "直线") {
      return { ok: true, action: "line", message: "已画线" };
    }

    return { ok: false, message: "暂不支持该指令：" + raw };
  }

  function executeCommand(engine, parsed, canvasW, canvasH, hooks) {
    if (!parsed.ok) return parsed.message;

    if (parsed.action === "listenOn") {
      hooks && hooks.onListenOn && hooks.onListenOn();
      return parsed.message;
    }
    if (parsed.action === "listenOff") {
      hooks && hooks.onListenOff && hooks.onListenOff();
      return parsed.message;
    }
    if (parsed.action === "help") {
      return parsed.message;
    }

    const color = parsed.color;
    if (color) engine.setColor(color.includes("色") ? color : color + "色");

    const pos = parsed.pos || {};
    const cx = pos.x ?? canvasW / 2;
    const cy = pos.y ?? canvasH / 2;

    switch (parsed.action) {
      case "clear":
        engine.clear();
        break;
      case "undo":
        if (!engine.undo()) return "没有可撤销的内容";
        break;
      case "scaleUp":
        if (!engine.scaleLast(1.25)) return "请先画一个图形";
        break;
      case "scaleDown":
        if (!engine.scaleLast(0.8)) return "请先画一个图形";
        break;
      case "left":
        if (!engine.moveLast(-40, 0)) return "请先画一个图形";
        break;
      case "right":
        if (!engine.moveLast(40, 0)) return "请先画一个图形";
        break;
      case "up":
        if (!engine.moveLast(0, -40)) return "请先画一个图形";
        break;
      case "down":
        if (!engine.moveLast(0, 40)) return "请先画一个图形";
        break;
      case "circle":
        engine.addCircle({ x: cx, y: cy, color: engine.currentColor });
        break;
      case "ellipse":
        engine.addEllipse({ x: cx, y: cy, color: engine.currentColor });
        break;
      case "square":
        engine.addRect({ x: cx - 50, y: cy - 50, w: 100, h: 100, square: true });
        break;
      case "rect":
        engine.addRect({ x: cx - 60, y: cy - 40 });
        break;
      case "triangle":
        engine.addTriangle({ x: cx, y: cy });
        break;
      case "star":
        engine.addStar({ x: cx, y: cy, color: engine.currentColor });
        break;
      case "line":
        engine.addLine();
        break;
      case "export":
        engine.exportPng("voicedraw-" + Date.now() + ".png");
        break;
      case "setColor":
        if (parsed.color) engine.recolorLast(parsed.color + (parsed.color.endsWith("色") ? "" : "色"));
        break;
      default:
        return "未知操作";
    }
    return parsed.message;
  }

  global.parseCommand = parseCommand;
  global.executeCommand = executeCommand;
})(window);
