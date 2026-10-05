declare const chrome: any;

import { WidgetBase, registerWidget } from "./widgets.js";

let blockInterval: number | null = null;
let keyboardBlockInstalled = false;

function parseTimeString(str: string): number {
  const clean = str.replace(/[^0-9:]/g, "").trim();
  if (!clean) return 50 * 60;
  if (clean.includes(":")) {
    const parts = clean.split(":");
    const mins = parseInt(parts[0] || "0", 10) || 0;
    const secs = parseInt(parts[1] || "0", 10) || 0;
    return Math.max(1, Math.min(7200, mins * 60 + secs));
  }
  const val = parseInt(clean, 10);
  if (isNaN(val) || val <= 0) return 50 * 60;
  if (clean.length === 3 || clean.length === 4) {
    const mins = Math.floor(val / 100);
    const secs = val % 100;
    return Math.max(1, Math.min(7200, mins * 60 + secs));
  }
  return Math.max(1, Math.min(7200, val * 60));
}

function formatSeconds(totalSecs: number): string {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function syncCheckBlock(): boolean {
  try {
    const raw = localStorage.getItem("pomoEndTime");
    if (raw) {
      const endTime = parseInt(raw, 10);
      if (endTime > Date.now()) {
        document.body.classList.add("smpp-pomodoro-active");
        return true;
      } else {
        localStorage.removeItem("pomoEndTime");
      }
    }
  } catch {}
  document.body.classList.remove("smpp-pomodoro-active");
  return false;
}

export function initPomodoroBlock(): void {
  syncCheckBlock();

  const check = async () => {
    try {
      const { pomoEndTime } = await chrome.storage.local.get("pomoEndTime");
      if (pomoEndTime && pomoEndTime > Date.now()) {
        localStorage.setItem("pomoEndTime", String(pomoEndTime));
        document.body.classList.add("smpp-pomodoro-active");
      } else if (pomoEndTime && pomoEndTime <= Date.now()) {
        localStorage.removeItem("pomoEndTime");
        await chrome.storage.local.remove(["pomoEndTime", "pomoTotal"]);
        document.body.classList.remove("smpp-pomodoro-active");
        alert("Klaar! Goed gewerkt.");
      } else {
        localStorage.removeItem("pomoEndTime");
        document.body.classList.remove("smpp-pomodoro-active");
      }
    } catch {}

    if (document.body.classList.contains("smpp-pomodoro-active")) {
      const elements = document.querySelectorAll(
        ".smpp-settings-window, .smpp-settings-modal, [class*='settings-window'], [class*='settings-modal']"
      );
      elements.forEach((el) => el.remove());
    }
  };

  if (!keyboardBlockInstalled) {
    keyboardBlockInstalled = true;

    const blockHandler = (event: KeyboardEvent) => {
      if (!document.body.classList.contains("smpp-pomodoro-active")) return;

      const target = event.target as HTMLElement | null;
      const typing = !!target?.closest(
        "input, textarea, select, [contenteditable='true'], [contenteditable=''], [role='textbox']"
      );

      if (typing) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    window.addEventListener("keydown", blockHandler, true);
    window.addEventListener("keyup", blockHandler, true);
    window.addEventListener("keypress", blockHandler, true);
    document.addEventListener("keydown", blockHandler, true);
    document.addEventListener("keyup", blockHandler, true);
    document.addEventListener("keypress", blockHandler, true);
  }

  check();

  if (blockInterval) clearInterval(blockInterval);
  blockInterval = window.setInterval(check, 1000);
}

export class PomodoroWidget extends WidgetBase {
  private timer: number | null = null;
  private timeLeft = 0;
  private totalTime = 0;
  private isRunning = false;
<<<<<<< HEAD
  private timerInput!: HTMLInputElement;
=======
  private minutes = 50;
  private display!: HTMLElement;
  private hoursSeg!: HTMLElement;
  private minutesSeg!: HTMLElement;
>>>>>>> 47a40dd4fc15e39ae4a778396bc7316a7ab96279
  private label!: HTMLElement;
  private startBtn!: HTMLButtonElement;
  private ring!: SVGCircleElement;
  private circumference = 2 * Math.PI * 54;

  override get name() {
    return "PomodoroWidget";
  }

  override get category() {
    return "other";
  }

  override defaultSettings() {
    return { focusMinutes: 50 };
  }

  override async createContent(): Promise<HTMLElement> {
    const el = document.createElement("div");
    el.className = "smpp-pomodoro";
    el.innerHTML = `
      <div class="smpp-pomo-ring-wrap">
        <svg class="smpp-pomo-ring" viewBox="0 0 120 120">
          <circle class="smpp-pomo-ring-bg" cx="60" cy="60" r="54"/>
          <circle class="smpp-pomo-ring-fg" id="pomo-ring" cx="60" cy="60" r="54"/>
        </svg>
        <div class="smpp-pomo-center">
<<<<<<< HEAD
          <input type="text" class="smpp-pomo-timer-input" id="pomo-timer-input" value="50:00" spellcheck="false" autocomplete="off"/>
=======
          <div class="smpp-pomo-timer" id="pomo-timer">
            <span class="pomo-seg" data-part="h">00</span>:<span class="pomo-seg" data-part="m">50</span>
          </div>
>>>>>>> 47a40dd4fc15e39ae4a778396bc7316a7ab96279
          <div class="smpp-pomo-label" id="pomo-label">Focus</div>
        </div>
      </div>
      <div class="smpp-pomo-controls">
        <button id="pomo-start-btn" class="smpp-pomo-btn">Start</button>
      </div>`;

<<<<<<< HEAD
    this.timerInput = el.querySelector("#pomo-timer-input")!;
=======
    this.display = el.querySelector("#pomo-timer")!;
    this.hoursSeg = el.querySelector('[data-part="h"]')!;
    this.minutesSeg = el.querySelector('[data-part="m"]')!;
>>>>>>> 47a40dd4fc15e39ae4a778396bc7316a7ab96279
    this.label = el.querySelector("#pomo-label")!;
    this.startBtn = el.querySelector("#pomo-start-btn")!;
    this.ring = el.querySelector("#pomo-ring")!;

    this.ring.style.strokeDasharray = String(this.circumference);
    this.ring.style.strokeDashoffset = "0";

<<<<<<< HEAD
    const savedMins = await this.getSetting("focusMinutes");
    this.totalTime =
      (typeof savedMins === "number" && savedMins > 0 ? savedMins : 50) * 60;
    this.timeLeft = this.totalTime;
=======
    this.minutes = await this.getSetting("focusMinutes");
    this.render();
>>>>>>> 47a40dd4fc15e39ae4a778396bc7316a7ab96279

    const { pomoEndTime, pomoTotal } = await chrome.storage.local.get([
      "pomoEndTime",
      "pomoTotal",
    ]);

    const now = Date.now();

    if (pomoEndTime && pomoEndTime > now) {
      localStorage.setItem("pomoEndTime", String(pomoEndTime));
      this.totalTime = pomoTotal || this.totalTime;
      this.timeLeft = Math.round((pomoEndTime - now) / 1000);
      this.lockUI(true);
      this.render();
      this.tick();
    } else {
      localStorage.removeItem("pomoEndTime");
      this.render();
      document.body.classList.remove("smpp-pomodoro-active");
    }

<<<<<<< HEAD
    const applyTimeInput = () => {
      if (this.isRunning) return;
      const parsed = parseTimeString(this.timerInput.value);
      this.totalTime = parsed;
      this.timeLeft = parsed;
      this.setSetting("focusMinutes", Math.round(parsed / 60));
      this.render();
    };

    this.timerInput.addEventListener("focus", () => {
      if (!this.isRunning) {
        setTimeout(() => this.timerInput.select(), 10);
      }
    });

    this.timerInput.addEventListener("change", applyTimeInput);
    this.timerInput.addEventListener("blur", applyTimeInput);
    this.timerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        applyTimeInput();
        this.timerInput.blur();
      }
    });

=======
    this.hoursSeg.addEventListener("click", () => this.startEdit("h"));
    this.minutesSeg.addEventListener("click", () => this.startEdit("m"));
>>>>>>> 47a40dd4fc15e39ae4a778396bc7316a7ab96279
    this.startBtn.addEventListener("click", () => this.start());

    return el;
  }

<<<<<<< HEAD
=======
  private startEdit(part: "h" | "m"): void {
    if (this.isRunning) return;

    const seg = part === "h" ? this.hoursSeg : this.minutesSeg;
    const currentValue = seg.textContent || "0";
    const maxValue = part === "h" ? 24 : 59;

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 2;
    input.value = currentValue;
    input.className = "pomo-edit-input";
    input.style.width = "2ch";
    input.style.background = "transparent";
    input.style.border = "none";
    input.style.color = "inherit";
    input.style.font = "inherit";
    input.style.fontWeight = "800";
    input.style.textAlign = "center";
    input.style.outline = "none";
    input.style.padding = "0";

    seg.textContent = "";
    seg.appendChild(input);
    input.focus();
    input.select();

    const finish = async (save: boolean) => {
      if (save) {
        const raw = input.value;
        const num = parseInt(raw, 10);
        if (!isNaN(num) && num >= 0) {
          if (part === "h") {
            const hours = Math.min(num, 24);
            this.minutes = hours * 60 + (this.minutes % 60);
          } else {
            const minutes = Math.min(num, 59);
            this.minutes = Math.floor(this.minutes / 60) * 60 + minutes;
          }
          this.minutes = Math.max(1, Math.min(1440, this.minutes));
          await this.setSetting("focusMinutes", this.minutes);
          this.totalTime = this.minutes * 60;
          this.timeLeft = this.totalTime;
          this.render();
        } else {
          this.render();
        }
      } else {
        this.render();
      }
    };

    const onBlur = () => finish(true);
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        input.removeEventListener("blur", onBlur);
        finish(true);
      } else if (e.key === "Escape") {
        input.removeEventListener("blur", onBlur);
        finish(false);
      }
    };

    input.addEventListener("blur", onBlur, { once: true });
    input.addEventListener("keydown", onKeydown);
  }

>>>>>>> 47a40dd4fc15e39ae4a778396bc7316a7ab96279
  private async start() {
    if (this.isRunning) return;

    const duration = this.totalTime;
    const endTime = Date.now() + duration * 1000;

    localStorage.setItem("pomoEndTime", String(endTime));
    await chrome.storage.local.set({
      pomoEndTime: endTime,
      pomoTotal: duration,
    });

    this.timeLeft = duration;
    this.lockUI(true);
    this.render();
    this.tick();
  }

  private lockUI(on: boolean) {
    this.isRunning = on;
    this.startBtn.disabled = on;
    this.startBtn.textContent = on ? "Bezig..." : "Start";
<<<<<<< HEAD
    this.timerInput.disabled = on;
=======
    this.hoursSeg.classList.toggle("disabled", on);
    this.minutesSeg.classList.toggle("disabled", on);
>>>>>>> 47a40dd4fc15e39ae4a778396bc7316a7ab96279
    this.label.textContent = on ? "Focus" : "Klaar";
    document.body.classList.toggle("smpp-pomodoro-active", on);
  }

  private tick() {
    if (this.timer) clearInterval(this.timer);

    this.timer = window.setInterval(async () => {
      const { pomoEndTime } = await chrome.storage.local.get("pomoEndTime");

      if (!pomoEndTime) {
        localStorage.removeItem("pomoEndTime");
        this.stop();
        return;
      }

      this.timeLeft = Math.max(
        0,
        Math.round((pomoEndTime - Date.now()) / 1000)
      );

      this.render();

      if (this.timeLeft <= 0) {
        this.stop();
      }
    }, 1000);
  }

  private stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.lockUI(false);
  }

  private render() {
<<<<<<< HEAD
    if (!this.isRunning && document.activeElement === this.timerInput) {
      return;
    }

    this.timerInput.value = formatSeconds(this.timeLeft);
=======
    const hours = String(Math.floor(this.timeLeft / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((this.timeLeft % 3600) / 60)).padStart(2, "0");

    this.hoursSeg.textContent = hours;
    this.minutesSeg.textContent = minutes;
>>>>>>> 47a40dd4fc15e39ae4a778396bc7316a7ab96279

    const progress = this.totalTime > 0 ? this.timeLeft / this.totalTime : 1;
    this.ring.style.strokeDashoffset = String(
      this.circumference * (1 - progress)
    );
  }
}

registerWidget(new PomodoroWidget());
