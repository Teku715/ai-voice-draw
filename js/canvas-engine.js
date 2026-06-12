(function (global) {
  const COLORS = {
    红: "#ef4444", 红色: "#ef4444",
    蓝: "#3b82f6", 蓝色: "#3b82f6",
    绿: "#22c55e", 绿色: "#22c55e",
    黑: "#111827", 黑色: "#111827",
    黄: "#eab308", 黄色: "#eab308",
    紫: "#a855f7", 紫色: "#a855f7",
    白: "#f8fafc", 白色: "#f8fafc",
    橙: "#f97316", 橙色: "#f97316",
  };

  function uid() {
    return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  class CanvasEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.shapes = [];
      this.defaultColor = "#2563eb";
      this.currentColor = this.defaultColor;
    }

    setColor(nameOrHex) {
      if (COLORS[nameOrHex]) {
        this.currentColor = COLORS[nameOrHex];
        return this.currentColor;
      }
      if (/^#[0-9a-f]{3,8}$/i.test(nameOrHex)) {
        this.currentColor = nameOrHex;
        return this.currentColor;
      }
      return null;
    }

    _last() {
      return this.shapes[this.shapes.length - 1] || null;
    }

    addCircle(opts = {}) {
      const s = {
        id: uid(),
        type: "circle",
        x: opts.x ?? this.canvas.width / 2,
        y: opts.y ?? this.canvas.height / 2,
        r: opts.r ?? 60,
        color: opts.color ?? this.currentColor,
      };
      this.shapes.push(s);
      this.render();
      return s;
    }

    addEllipse(opts = {}) {
      const s = {
        id: uid(),
        type: "ellipse",
        x: opts.x ?? this.canvas.width / 2,
        y: opts.y ?? this.canvas.height / 2,
        rx: opts.rx ?? 80,
        ry: opts.ry ?? 45,
        color: opts.color ?? this.currentColor,
      };
      this.shapes.push(s);
      this.render();
      return s;
    }

    addRect(opts = {}) {
      const w = opts.w ?? 120;
      const h = opts.h ?? (opts.square ? w : 80);
      const s = {
        id: uid(),
        type: "rect",
        x: opts.x ?? this.canvas.width / 2 - w / 2,
        y: opts.y ?? this.canvas.height / 2 - h / 2,
        w,
        h,
        color: opts.color ?? this.currentColor,
      };
      this.shapes.push(s);
      this.render();
      return s;
    }

    addLine(opts = {}) {
      const s = {
        id: uid(),
        type: "line",
        x1: opts.x1 ?? 100,
        y1: opts.y1 ?? this.canvas.height / 2,
        x2: opts.x2 ?? this.canvas.width - 100,
        y2: opts.y2 ?? this.canvas.height / 2,
        color: opts.color ?? this.currentColor,
        width: opts.width ?? 4,
      };
      this.shapes.push(s);
      this.render();
      return s;
    }

    addTriangle(opts = {}) {
      const size = opts.size ?? 100;
      const cx = opts.x ?? this.canvas.width / 2;
      const cy = opts.y ?? this.canvas.height / 2;
      const s = {
        id: uid(),
        type: "triangle",
        points: [
          [cx, cy - size / 2],
          [cx - size / 2, cy + size / 2],
          [cx + size / 2, cy + size / 2],
        ],
        color: opts.color ?? this.currentColor,
      };
      this.shapes.push(s);
      this.render();
      return s;
    }

    addStar(opts = {}) {
      const cx = opts.x ?? this.canvas.width / 2;
      const cy = opts.y ?? this.canvas.height / 2;
      const outer = opts.outer ?? 55;
      const inner = opts.inner ?? 24;
      const points = [];
      for (let i = 0; i < 10; i += 1) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? outer : inner;
        points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
      }
      const s = {
        id: uid(),
        type: "star",
        points,
        color: opts.color ?? this.currentColor,
      };
      this.shapes.push(s);
      this.render();
      return s;
    }

    undo() {
      if (!this.shapes.length) return false;
      this.shapes.pop();
      this.render();
      return true;
    }

    clear() {
      this.shapes = [];
      this.render();
    }

    scaleLast(factor) {
      const s = this._last();
      if (!s) return false;
      if (s.type === "circle") s.r = Math.max(8, s.r * factor);
      else if (s.type === "ellipse") {
        s.rx = Math.max(10, s.rx * factor);
        s.ry = Math.max(10, s.ry * factor);
      } else if (s.type === "rect") {
        s.w = Math.max(10, s.w * factor);
        s.h = Math.max(10, s.h * factor);
      } else if (s.type === "triangle" || s.type === "star") {
        s.points = this._scalePoints(s.points, factor);
      } else if (s.type === "line") {
        const mx = (s.x1 + s.x2) / 2;
        const my = (s.y1 + s.y2) / 2;
        s.x1 = mx + (s.x1 - mx) * factor;
        s.y1 = my + (s.y1 - my) * factor;
        s.x2 = mx + (s.x2 - mx) * factor;
        s.y2 = my + (s.y2 - my) * factor;
      }
      this.render();
      return true;
    }

    _scalePoints(points, factor) {
      const cx = points.reduce((a, p) => a + p[0], 0) / points.length;
      const cy = points.reduce((a, p) => a + p[1], 0) / points.length;
      return points.map(([x, y]) => [cx + (x - cx) * factor, cy + (y - cy) * factor]);
    }

    moveLast(dx, dy) {
      const s = this._last();
      if (!s) return false;
      if (s.type === "circle" || s.type === "ellipse" || s.type === "rect") {
        s.x += dx;
        s.y += dy;
      } else if (s.type === "line") {
        s.x1 += dx; s.y1 += dy; s.x2 += dx; s.y2 += dy;
      } else if (s.type === "triangle" || s.type === "star") {
        s.points = s.points.map(([x, y]) => [x + dx, y + dy]);
      }
      this.render();
      return true;
    }

    recolorLast(colorName) {
      const c = this.setColor(colorName);
      const s = this._last();
      if (!s || !c) return false;
      s.color = c;
      this.render();
      return true;
    }

    exportPng(filename) {
      const link = document.createElement("a");
      link.download = filename || "voicedraw.png";
      link.href = this.canvas.toDataURL("image/png");
      link.click();
      return true;
    }

    render() {
      const { ctx, canvas } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const s of this.shapes) {
        ctx.fillStyle = s.color;
        ctx.strokeStyle = s.color;
        if (s.type === "circle") {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.type === "ellipse") {
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.type === "rect") {
          ctx.fillRect(s.x, s.y, s.w, s.h);
        } else if (s.type === "line") {
          ctx.lineWidth = s.width;
          ctx.beginPath();
          ctx.moveTo(s.x1, s.y1);
          ctx.lineTo(s.x2, s.y2);
          ctx.stroke();
        } else if (s.type === "triangle" || s.type === "star") {
          ctx.beginPath();
          ctx.moveTo(s.points[0][0], s.points[0][1]);
          for (let i = 1; i < s.points.length; i += 1) {
            ctx.lineTo(s.points[i][0], s.points[i][1]);
          }
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  global.CanvasEngine = CanvasEngine;
  global.VoiceDrawColors = COLORS;
})(window);
