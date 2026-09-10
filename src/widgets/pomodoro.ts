import { WidgetBase, registerWidget } from "./widgets.js";
import { settingsIconSvg } from "../fixes-utils/svgs.js";

export type PomodoroMode = "study" | "short_break" | "long_break";
export type PomodoroTimerState = "idle" | "running" | "paused";

export interface PomodoroSettings {
  studyDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  soundEnabled: boolean;
}

export type StudyStateListener = (active: boolean) => void;

let activeStudyState = false;
const studyStateListeners = new Set<StudyStateListener>();

export function isStudySessionActive(): boolean {
  return activeStudyState;
}

export function onStudySessionChange(listener: StudyStateListener): () => void {
  studyStateListeners.add(listener);
  return () => {
    studyStateListeners.delete(listener);
  };
}

function setStudySessionActive(active: boolean): void {
  if (activeStudyState !== active) {
    activeStudyState = active;
    for (const listener of studyStateListeners) {
      try {
        listener(active);
      } catch (err) {
        console.error("Error in study state listener:", err);
      }
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("smpp:study-session-change", {
          detail: { active },
        })
      );
    }
  }
}

if (typeof window !== "undefined") {
  (window as unknown as { smppIsStudyActive?: () => boolean }).smppIsStudyActive =
    isStudySessionActive;
  (
    window as unknown as {
      smppOnStudyStateChange?: (listener: StudyStateListener) => () => void;
    }
  ).smppOnStudyStateChange = onStudySessionChange;
}

function playCycleFinishSound(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    let isClosed = false;
    const cleanup = () => {
      if (!isClosed) {
        isClosed = true;
        try {
          if (ctx.state !== "closed") {
            ctx.close().catch(() => {});
          }
        } catch {}
      }
    };

    osc.onended = cleanup;
    setTimeout(cleanup, 1000);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Web Audio may be restricted by autoplay policy
  }
}

class PomodoroWidget extends WidgetBase {
  #root: HTMLElement | null = null;
  #timerDisplayEl: HTMLElement | null = null;
  #progressBarEl: HTMLElement | null = null;
  #feedbackEl: HTMLElement | null = null;
  #cycleDotsEl: HTMLElement | null = null;
  #cycleTextEl: HTMLElement | null = null;
  #primaryBtn: HTMLButtonElement | null = null;
  #tabButtons: Map<PomodoroMode, HTMLButtonElement> = new Map();

  #mode: PomodoroMode = "study";
  #timerState: PomodoroTimerState = "idle";
  #remainingSeconds = 25 * 60;
  #targetEndTime: number | null = null;
  #completedSessions = 0;
  #intervalTimer: ReturnType<typeof setInterval> | undefined;
  #isEditingSettings = false;
  #visibilityHandler: (() => void) | null = null;

  override get category(): string {
    return "other";
  }

  override get name(): string {
    return "PomodoroWidget";
  }

  override defaultSettings(): PomodoroSettings {
    return {
      studyDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      soundEnabled: false,
    };
  }

  private get validatedSettings(): PomodoroSettings {
    const defaults = this.defaultSettings();
    if (!this.isActive) {
      return defaults;
    }
    const raw = (this.settings as Partial<PomodoroSettings>) || {};
    const studyNum = Number(raw.studyDuration);
    const studyDuration =
      !isNaN(studyNum) && studyNum > 0 ? Math.round(studyNum) : defaults.studyDuration;
    const shortNum = Number(raw.shortBreakDuration);
    const shortBreakDuration =
      !isNaN(shortNum) && shortNum > 0 ? Math.round(shortNum) : defaults.shortBreakDuration;
    const longNum = Number(raw.longBreakDuration);
    const longBreakDuration =
      !isNaN(longNum) && longNum > 0 ? Math.round(longNum) : defaults.longBreakDuration;
    const intervalNum = Number(raw.longBreakInterval);
    const longBreakInterval =
      !isNaN(intervalNum) && intervalNum > 0 ? Math.round(intervalNum) : defaults.longBreakInterval;
    const soundEnabled = raw.soundEnabled === true;

    return {
      studyDuration,
      shortBreakDuration,
      longBreakDuration,
      longBreakInterval,
      soundEnabled,
    };
  }

  #getDurationForMode(mode: PomodoroMode): number {
    const settings = this.validatedSettings;
    switch (mode) {
      case "study":
        return settings.studyDuration * 60;
      case "short_break":
        return settings.shortBreakDuration * 60;
      case "long_break":
        return settings.longBreakDuration * 60;
      default:
        return 25 * 60;
    }
  }

  #formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return (
      String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0")
    );
  }

  #updateDisplay(): void {
    if (this.#timerDisplayEl) {
      this.#timerDisplayEl.innerText = this.#formatTime(this.#remainingSeconds);
    }
    if (this.#progressBarEl) {
      const totalSeconds = this.#getDurationForMode(this.#mode);
      const percentage =
        totalSeconds > 0
          ? Math.max(0, Math.min(100, (this.#remainingSeconds / totalSeconds) * 100))
          : 0;
      this.#progressBarEl.style.width = percentage + "%";
    }
  }

  #updatePrimaryButton(): void {
    if (!this.#primaryBtn) {
      return;
    }
    if (this.#timerState === "running") {
      this.#primaryBtn.innerText = "Pauzeer";
      this.#primaryBtn.classList.add("pomodoro-btn-running");
    } else {
      this.#primaryBtn.innerText = "Start";
      this.#primaryBtn.classList.remove("pomodoro-btn-running");
    }
  }

  #updateTabs(): void {
    for (const [mode, button] of this.#tabButtons.entries()) {
      if (mode === this.#mode) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    }
  }

  #updateCycleIndicators(): void {
    const interval = this.validatedSettings.longBreakInterval;
    if (this.#cycleDotsEl) {
      this.#cycleDotsEl.replaceChildren();
      const completedInCycle = this.#completedSessions % interval;
      for (let i = 0; i < interval; i++) {
        const dot = document.createElement("div");
        dot.classList.add("pomodoro-cycle-dot");
        if (i < completedInCycle || this.#mode === "long_break") {
          dot.classList.add("completed");
        }
        this.#cycleDotsEl.appendChild(dot);
      }
    }
    if (this.#cycleTextEl) {
      if (this.#mode === "long_break") {
        this.#cycleTextEl.innerText =
          "Lange pauze (" + this.#completedSessions + " afgerond)";
      } else if (this.#mode === "short_break") {
        const lastSession = this.#completedSessions % interval;
        if (lastSession === 0) {
          this.#cycleTextEl.innerText =
            this.#completedSessions === 0
              ? "Korte pauze"
              : "Korte pauze (" + this.#completedSessions + " afgerond)";
        } else {
          this.#cycleTextEl.innerText =
            "Korte pauze (na sessie " + lastSession + " van " + interval + ")";
        }
      } else {
        const currentSession = (this.#completedSessions % interval) + 1;
        this.#cycleTextEl.innerText =
          "Sessie " + currentSession + " van " + interval;
      }
    }
  }

  #showFeedback(message: string): void {
    if (this.#feedbackEl) {
      this.#feedbackEl.innerText = message;
      this.#feedbackEl.style.display = "block";
    }
  }

  #clearFeedback(): void {
    if (this.#feedbackEl) {
      this.#feedbackEl.innerText = "";
      this.#feedbackEl.style.display = "none";
    }
  }

  #startTimer(): void {
    if (this.#timerState === "running") {
      return;
    }
    this.#timerState = "running";
    this.#clearFeedback();

    if (this.#remainingSeconds <= 0) {
      this.#remainingSeconds = this.#getDurationForMode(this.#mode);
    }
    this.#targetEndTime = Date.now() + this.#remainingSeconds * 1000;

    if (this.#mode === "study") {
      setStudySessionActive(true);
    } else {
      setStudySessionActive(false);
    }

    this.#updatePrimaryButton();
    this.#stopInterval();

    this.#intervalTimer = setInterval(() => {
      this.#tick();
    }, 1000);
  }

  #pauseTimer(): void {
    if (this.#timerState !== "running") {
      return;
    }
    this.#timerState = "paused";
    this.#stopInterval();

    if (this.#targetEndTime !== null) {
      const remaining = Math.ceil((this.#targetEndTime - Date.now()) / 1000);
      this.#remainingSeconds = Math.max(0, remaining);
      this.#targetEndTime = null;
    }

    if (this.#mode === "study") {
      setStudySessionActive(false);
    }

    this.#updatePrimaryButton();
    this.#updateDisplay();
  }

  #resetTimer(): void {
    this.#stopInterval();
    this.#timerState = "idle";
    this.#targetEndTime = null;
    this.#remainingSeconds = this.#getDurationForMode(this.#mode);

    if (this.#mode === "study") {
      setStudySessionActive(false);
    }

    this.#clearFeedback();
    this.#updateDisplay();
    this.#updatePrimaryButton();
    this.#updateCycleIndicators();
  }

  #skipCycle(): void {
    this.#stopInterval();
    this.#timerState = "idle";
    this.#targetEndTime = null;

    if (this.#mode === "study") {
      setStudySessionActive(false);
      this.#completedSessions++;
      const interval = this.validatedSettings.longBreakInterval;
      if (this.#completedSessions % interval === 0) {
        this.#mode = "long_break";
      } else {
        this.#mode = "short_break";
      }
    } else {
      this.#mode = "study";
    }

    this.#remainingSeconds = this.#getDurationForMode(this.#mode);
    this.#clearFeedback();
    this.#updateTabs();
    this.#updateDisplay();
    this.#updatePrimaryButton();
    this.#updateCycleIndicators();
  }

  #switchMode(newMode: PomodoroMode): void {
    if (this.#mode === newMode && this.#timerState !== "idle") {
      return;
    }
    this.#stopInterval();
    this.#timerState = "idle";
    this.#targetEndTime = null;
    setStudySessionActive(false);

    this.#mode = newMode;
    this.#remainingSeconds = this.#getDurationForMode(newMode);
    this.#clearFeedback();
    this.#updateTabs();
    this.#updateDisplay();
    this.#updatePrimaryButton();
    this.#updateCycleIndicators();
  }

  #tick(): void {
    if (this.#targetEndTime !== null) {
      const remaining = Math.ceil((this.#targetEndTime - Date.now()) / 1000);
      this.#remainingSeconds = Math.max(0, remaining);
    } else if (this.#remainingSeconds > 0) {
      this.#remainingSeconds--;
    }

    this.#updateDisplay();

    if (this.#remainingSeconds <= 0) {
      this.#onTimerFinished();
    }
  }

  #onTimerFinished(): void {
    this.#stopInterval();
    this.#timerState = "idle";
    this.#targetEndTime = null;

    if (this.validatedSettings.soundEnabled) {
      playCycleFinishSound();
    }

    const prevMode = this.#mode;
    if (prevMode === "study") {
      this.#completedSessions++;
      setStudySessionActive(false);
      const interval = this.validatedSettings.longBreakInterval;
      if (this.#completedSessions % interval === 0) {
        this.#mode = "long_break";
      } else {
        this.#mode = "short_break";
      }
      this.#showFeedback("Goed gewerkt! Tijd voor een pauze.");
    } else {
      this.#mode = "study";
      this.#showFeedback("Pauze voorbij! Tijd om te studeren.");
    }

    this.#remainingSeconds = this.#getDurationForMode(this.#mode);
    this.#updateTabs();
    this.#updateDisplay();
    this.#updatePrimaryButton();
    this.#updateCycleIndicators();
  }

  #stopInterval(): void {
    if (this.#intervalTimer !== undefined) {
      clearInterval(this.#intervalTimer);
      this.#intervalTimer = undefined;
    }
  }

  #renderSettingsView(): HTMLElement {
    const panel = document.createElement("div");
    panel.classList.add("pomodoro-settings-panel");

    const header = document.createElement("div");
    header.classList.add("pomodoro-header");
    const title = document.createElement("div");
    title.classList.add("pomodoro-title");
    title.innerText = "Instellingen";
    header.appendChild(title);
    panel.appendChild(header);

    const settings = this.validatedSettings;

    const fields: Array<{
      key: keyof PomodoroSettings;
      label: string;
      min: number;
      max: number;
    }> = [
      {
        key: "studyDuration",
        label: "Studietijd (minuten)",
        min: 1,
        max: 120,
      },
      {
        key: "shortBreakDuration",
        label: "Korte pauze (minuten)",
        min: 1,
        max: 60,
      },
      {
        key: "longBreakDuration",
        label: "Lange pauze (minuten)",
        min: 1,
        max: 60,
      },
      {
        key: "longBreakInterval",
        label: "Lange pauze na (sessies)",
        min: 1,
        max: 12,
      },
    ];

    const inputMap = new Map<keyof PomodoroSettings, HTMLInputElement>();

    for (const field of fields) {
      const group = document.createElement("div");
      group.classList.add("pomodoro-setting-group");

      const label = document.createElement("label");
      label.classList.add("pomodoro-setting-label");
      label.innerText = field.label;
      group.appendChild(label);

      const input = document.createElement("input");
      input.type = "number";
      input.classList.add("pomodoro-setting-input");
      input.min = String(field.min);
      input.max = String(field.max);
      input.value = String(settings[field.key]);
      group.appendChild(input);
      inputMap.set(field.key, input);

      panel.appendChild(group);
    }

    const soundGroup = document.createElement("div");
    soundGroup.classList.add("pomodoro-setting-group", "pomodoro-setting-checkbox");
    const soundLabel = document.createElement("label");
    soundLabel.classList.add("pomodoro-setting-label");
    const soundInput = document.createElement("input");
    soundInput.type = "checkbox";
    soundInput.checked = settings.soundEnabled;
    soundLabel.appendChild(soundInput);
    const soundText = document.createElement("span");
    soundText.innerText = "Geluid afspelen bij einde cyclus";
    soundLabel.appendChild(soundText);
    soundGroup.appendChild(soundLabel);
    inputMap.set("soundEnabled", soundInput);
    panel.appendChild(soundGroup);

    const actions = document.createElement("div");
    actions.classList.add("pomodoro-settings-actions");

    const cancelBtn = document.createElement("button");
    cancelBtn.classList.add("pomodoro-btn", "pomodoro-btn-secondary");
    cancelBtn.innerText = "Annuleren";
    cancelBtn.addEventListener("click", () => {
      this.#isEditingSettings = false;
      this.#renderMain();
    });
    actions.appendChild(cancelBtn);

    const saveBtn = document.createElement("button");
    saveBtn.classList.add("pomodoro-btn", "pomodoro-btn-primary");
    saveBtn.innerText = "Opslaan";
    saveBtn.addEventListener("click", async () => {
      const studyInput = inputMap.get("studyDuration");
      const shortInput = inputMap.get("shortBreakDuration");
      const longInput = inputMap.get("longBreakDuration");
      const intervalInput = inputMap.get("longBreakInterval");
      const soundIn = inputMap.get("soundEnabled");

      const newStudy = Math.max(
        1,
        Math.min(120, parseInt(studyInput?.value || "25", 10) || 25)
      );
      const newShort = Math.max(
        1,
        Math.min(60, parseInt(shortInput?.value || "5", 10) || 5)
      );
      const newLong = Math.max(
        1,
        Math.min(60, parseInt(longInput?.value || "15", 10) || 15)
      );
      const newInterval = Math.max(
        1,
        Math.min(12, parseInt(intervalInput?.value || "4", 10) || 4)
      );
      const newSound = soundIn ? soundIn.checked : true;

      await this.setSetting("studyDuration", newStudy);
      await this.setSetting("shortBreakDuration", newShort);
      await this.setSetting("longBreakDuration", newLong);
      await this.setSetting("longBreakInterval", newInterval);
      await this.setSetting("soundEnabled", newSound);

      if (this.#timerState === "idle") {
        this.#remainingSeconds = this.#getDurationForMode(this.#mode);
      }

      this.#isEditingSettings = false;
      this.#renderMain();
    });
    actions.appendChild(saveBtn);

    panel.appendChild(actions);
    return panel;
  }

  #renderTimerView(): HTMLElement {
    const container = document.createElement("div");
    container.classList.add("pomodoro-widget-inner");
    container.style.width = "100%";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    container.style.alignItems = "center";

    const header = document.createElement("div");
    header.classList.add("pomodoro-header");

    const title = document.createElement("div");
    title.classList.add("pomodoro-title");
    title.innerText = "Pomodoro";
    header.appendChild(title);

    const settingsBtn = document.createElement("button");
    settingsBtn.classList.add("pomodoro-settings-btn");
    settingsBtn.title = "Instellingen";
    settingsBtn.innerHTML = settingsIconSvg;
    settingsBtn.addEventListener("click", () => {
      this.#isEditingSettings = true;
      this.#renderMain();
    });
    header.appendChild(settingsBtn);
    container.appendChild(header);

    const tabs = document.createElement("div");
    tabs.classList.add("pomodoro-mode-tabs");

    this.#tabButtons.clear();
    const modes: Array<{ id: PomodoroMode; label: string }> = [
      { id: "study", label: "Studeren" },
      { id: "short_break", label: "Korte pauze" },
      { id: "long_break", label: "Lange pauze" },
    ];

    for (const item of modes) {
      const tab = document.createElement("button");
      tab.classList.add("pomodoro-mode-tab");
      tab.innerText = item.label;
      if (item.id === this.#mode) {
        tab.classList.add("active");
      }
      tab.addEventListener("click", () => {
        this.#switchMode(item.id);
      });
      tabs.appendChild(tab);
      this.#tabButtons.set(item.id, tab);
    }
    container.appendChild(tabs);

    const timerContainer = document.createElement("div");
    timerContainer.classList.add("pomodoro-timer-container");

    const display = document.createElement("div");
    display.classList.add("pomodoro-timer-display");
    display.innerText = this.#formatTime(this.#remainingSeconds);
    this.#timerDisplayEl = display;
    timerContainer.appendChild(display);

    const progressContainer = document.createElement("div");
    progressContainer.classList.add("pomodoro-progress-bar-container");
    const progressBar = document.createElement("div");
    progressBar.classList.add("pomodoro-progress-bar");
    const totalSeconds = this.#getDurationForMode(this.#mode);
    const percentage =
      totalSeconds > 0
        ? Math.max(
            0,
            Math.min(100, (this.#remainingSeconds / totalSeconds) * 100)
          )
        : 0;
    progressBar.style.width = percentage + "%";
    this.#progressBarEl = progressBar;
    progressContainer.appendChild(progressBar);
    timerContainer.appendChild(progressContainer);

    container.appendChild(timerContainer);

    const cycleInfo = document.createElement("div");
    cycleInfo.classList.add("pomodoro-cycle-info");

    const cycleDots = document.createElement("div");
    cycleDots.classList.add("pomodoro-cycle-dots");
    this.#cycleDotsEl = cycleDots;
    cycleInfo.appendChild(cycleDots);

    const cycleText = document.createElement("div");
    cycleText.classList.add("pomodoro-cycle-text");
    this.#cycleTextEl = cycleText;
    cycleInfo.appendChild(cycleText);

    this.#updateCycleIndicators();
    container.appendChild(cycleInfo);

    const feedback = document.createElement("div");
    feedback.classList.add("pomodoro-feedback-message");
    this.#feedbackEl = feedback;
    container.appendChild(feedback);

    const controls = document.createElement("div");
    controls.classList.add("pomodoro-controls");

    const primaryBtn = document.createElement("button");
    primaryBtn.classList.add("pomodoro-btn", "pomodoro-btn-primary");
    primaryBtn.innerText = this.#timerState === "running" ? "Pauzeer" : "Start";
    if (this.#timerState === "running") {
      primaryBtn.classList.add("pomodoro-btn-running");
    }
    primaryBtn.addEventListener("click", () => {
      if (this.#timerState === "running") {
        this.#pauseTimer();
      } else {
        this.#startTimer();
      }
    });
    this.#primaryBtn = primaryBtn;
    controls.appendChild(primaryBtn);

    const resetBtn = document.createElement("button");
    resetBtn.classList.add("pomodoro-btn", "pomodoro-btn-secondary");
    resetBtn.innerText = "Herstarten";
    resetBtn.addEventListener("click", () => {
      this.#resetTimer();
    });
    controls.appendChild(resetBtn);

    const skipBtn = document.createElement("button");
    skipBtn.classList.add("pomodoro-btn", "pomodoro-btn-secondary");
    skipBtn.innerText = "Overslaan";
    skipBtn.title = "Volgende cyclus";
    skipBtn.addEventListener("click", () => {
      this.#skipCycle();
    });
    controls.appendChild(skipBtn);

    container.appendChild(controls);

    return container;
  }

  #renderMain(): void {
    const root = this.#root;
    if (!root) {
      return;
    }
    root.replaceChildren();

    if (this.#isEditingSettings) {
      root.appendChild(this.#renderSettingsView());
    } else {
      root.appendChild(this.#renderTimerView());
    }
  }

  override async createContent(): Promise<HTMLElement> {
    const root = document.createElement("div");
    root.classList.add("pomodoro-widget");
    this.#root = root;

    if (this.#timerState === "idle") {
      this.#remainingSeconds = this.#getDurationForMode(this.#mode);
    } else if (this.#timerState === "running") {
      if (this.#targetEndTime !== null) {
        const remaining = Math.ceil((this.#targetEndTime - Date.now()) / 1000);
        this.#remainingSeconds = Math.max(0, remaining);
      }
      this.#stopInterval();
      if (this.#remainingSeconds <= 0) {
        this.#onTimerFinished();
      } else {
        if (this.#mode === "study") {
          setStudySessionActive(true);
        }
        this.#intervalTimer = setInterval(() => {
          this.#tick();
        }, 1000);
      }
    }

    if (!this.#visibilityHandler && typeof document !== "undefined") {
      this.#visibilityHandler = () => {
        if (!document.hidden && this.#timerState === "running") {
          this.#tick();
        }
      };
      document.addEventListener("visibilitychange", this.#visibilityHandler);
    }

    this.#renderMain();
    return root;
  }

  override async createPreview(): Promise<HTMLElement> {
    const container = document.createElement("div");
    container.classList.add("pomodoro-widget", "pomodoro-preview");

    const header = document.createElement("div");
    header.classList.add("pomodoro-header");
    const title = document.createElement("div");
    title.classList.add("pomodoro-title");
    title.innerText = "Pomodoro";
    header.appendChild(title);
    container.appendChild(header);

    const tabs = document.createElement("div");
    tabs.classList.add("pomodoro-mode-tabs");
    const tab = document.createElement("div");
    tab.classList.add("pomodoro-mode-tab", "active");
    tab.innerText = "Studeren";
    tabs.appendChild(tab);
    container.appendChild(tabs);

    const timer = document.createElement("div");
    timer.classList.add("pomodoro-timer-display");
    timer.innerText = "25:00";
    container.appendChild(timer);

    const sub = document.createElement("div");
    sub.classList.add("pomodoro-cycle-text");
    sub.innerText = "Sessie 1 van 4";
    container.appendChild(sub);

    return container;
  }

  override async onSettingsChange(): Promise<void> {
    if (this.#isEditingSettings) {
      return;
    }
    if (this.#timerState === "idle") {
      this.#remainingSeconds = this.#getDurationForMode(this.#mode);
      this.#updateDisplay();
      this.#updateCycleIndicators();
    }
  }

  override async onRemove(): Promise<void> {
    this.#stopInterval();
    if (this.#visibilityHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.#visibilityHandler);
      this.#visibilityHandler = null;
    }
    this.#timerState = "idle";
    this.#targetEndTime = null;
    this.#remainingSeconds = 25 * 60;
    setStudySessionActive(false);
  }
}

registerWidget(new PomodoroWidget());
