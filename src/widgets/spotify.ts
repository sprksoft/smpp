// @ts-nocheck
import { browser } from "../common/utils.js";
import { WidgetBase, registerWidget } from "./widgets.js";

const spotifyLogoSvg = `
<svg class="smpp-spotify-logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
  <title>Spotify</title>
  <circle cx="12" cy="12" r="12" fill="#1DB954"></circle>
  <path d="M17.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z" fill="#191414"></path>
  <path d="M18.961 14.04c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2z" fill="#191414"></path>
  <path d="M19.081 10.68C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="#191414"></path>
</svg>
`;

class SpotifyWidget extends WidgetBase {
  #poll;
  #rafId;
  #els;

  get category() {
    return "other";
  }

  get name() {
    return "SpotifyWidget";
  }

  async createContent() {
    const root = document.createElement("div");
    root.classList.add("smpp-spotify-widget");

    const header = document.createElement("div");
    header.classList.add("smpp-spotify-header");
    root.appendChild(header);

    const headerLeft = document.createElement("div");
    headerLeft.classList.add("smpp-spotify-header-left");
    header.appendChild(headerLeft);

    const headerIcon = document.createElement("div");
    headerIcon.classList.add("smpp-spotify-icon", "smpp-spotify-icon-small");
    headerIcon.innerHTML = spotifyLogoSvg;
    headerLeft.appendChild(headerIcon);

    const title = document.createElement("div");
    title.classList.add("smpp-spotify-title");
    title.innerText = "Spotify";
    headerLeft.appendChild(title);

    const body = document.createElement("div");
    body.classList.add("smpp-spotify-body");
    root.appendChild(body);

    const cover = document.createElement("img");
    cover.classList.add("smpp-spotify-cover");
    cover.alt = "";
    cover.loading = "lazy";
    body.appendChild(cover);

    const meta = document.createElement("div");
    meta.classList.add("smpp-spotify-meta");
    body.appendChild(meta);

    const track = document.createElement("div");
    track.classList.add("smpp-spotify-track");
    track.innerText = "Open Spotify…";
    meta.appendChild(track);

    const artist = document.createElement("div");
    artist.classList.add("smpp-spotify-artist");
    artist.innerText = "";
    meta.appendChild(artist);

    const time = document.createElement("div");
    time.classList.add("smpp-spotify-time");
    time.innerText = "";
    meta.appendChild(time);

    const help = document.createElement("div");
    help.classList.add("smpp-spotify-help");
    help.innerHTML = `
      <div class="smpp-spotify-help-title">Spotify not showing up?</div>
      <ol class="smpp-spotify-help-list">
        <li>Open <span class="smpp-spotify-help-mono">open.spotify.com</span> in another tab and start playing a song.</li>
        <li>Try reloading the Spotify page.</li>
        <li>Make sure you didn't accidently open the tab in a different browser or window.</li>
        <li>Check if the Spotify tab isn't sleeping.</li>
      </ol>
    `;
    meta.appendChild(help);

    const progressWrap = document.createElement("div");
    progressWrap.classList.add("smpp-spotify-progress-wrap");
    meta.appendChild(progressWrap);

    const progressBar = document.createElement("div");
    progressBar.classList.add("smpp-spotify-progress");
    progressWrap.appendChild(progressBar);

    const progressFill = document.createElement("div");
    progressFill.classList.add("smpp-spotify-progress-fill");
    progressBar.appendChild(progressFill);

    const controls = document.createElement("div");
    controls.classList.add("smpp-spotify-controls");
    root.appendChild(controls);

    const prevBtn = document.createElement("button");
    prevBtn.classList.add("smpp-spotify-btn");
    prevBtn.type = "button";
    prevBtn.innerText = "⏮";
    prevBtn.title = "Previous";
    controls.appendChild(prevBtn);

    const playPauseBtn = document.createElement("button");
    playPauseBtn.classList.add("smpp-spotify-btn", "smpp-spotify-btn-primary");
    playPauseBtn.type = "button";
    playPauseBtn.innerText = "⏯";
    playPauseBtn.title = "Play/Pause";
    controls.appendChild(playPauseBtn);

    const nextBtn = document.createElement("button");
    nextBtn.classList.add("smpp-spotify-btn");
    nextBtn.type = "button";
    nextBtn.innerText = "⏭";
    nextBtn.title = "Next";
    controls.appendChild(nextBtn);

    const openBtn = document.createElement("button");
    openBtn.classList.add("smpp-spotify-open");
    openBtn.type = "button";
    openBtn.innerText = "Open Spotify for me";
    controls.appendChild(openBtn);

    const upgradeCoverUrl = (url?: string | null) => {
      if (!url) return null;
      // Spotify image URLs include a size segment like:
      // https://i.scdn.co/image/ab67616d00004851<hash>
      // Upgrade to 640x640 (0000b273) when possible.
      return url.replace(/(ab67616d|ab676161)[0-9a-f]{8}/i, "$10000b273");
    };

    const parseTimeToSeconds = (t?: string | null) => {
      if (!t) return null;
      const parts = t.trim().split(":").map((p) => Number(p));
      if (parts.some((p) => Number.isNaN(p))) return null;
      if (parts.length === 2) {
        const [m, s] = parts;
        return m * 60 + s;
      }
      if (parts.length === 3) {
        const [h, m, s] = parts;
        return h * 3600 + m * 60 + s;
      }
      return null;
    };

    const formatSeconds = (totalSeconds?: number | null) => {
      if (totalSeconds === null || totalSeconds === undefined) return "";
      const clamped = Math.max(0, Math.floor(totalSeconds));
      const h = Math.floor(clamped / 3600);
      const m = Math.floor((clamped % 3600) / 60);
      const s = clamped % 60;
      if (h > 0) {
        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }
      return `${m}:${String(s).padStart(2, "0")}`;
    };

    let playback: null | {
      basePositionSeconds: number;
      durationSeconds: number | null;
      isPlaying: boolean;
      syncedAtMs: number;
    } = null;

    let lastShownSecond: number | null = null;

    const updatePlaybackUI = () => {
      if (!playback) return;

      const now = Date.now();
      const elapsedSeconds = playback.isPlaying
        ? (now - playback.syncedAtMs) / 1000
        : 0;
      const positionSeconds = playback.basePositionSeconds + elapsedSeconds;

      if (playback.durationSeconds && playback.durationSeconds > 0) {
        const pct = Math.max(
          0,
          Math.min(1, positionSeconds / playback.durationSeconds)
        );
        progressFill.style.transform = `scaleX(${pct})`;
        progressBar.classList.remove("smpp-spotify-progress-unknown");
        const wholeSecond = Math.floor(positionSeconds);
        if (wholeSecond !== lastShownSecond) {
          lastShownSecond = wholeSecond;
          time.innerText = `${formatSeconds(positionSeconds)} / ${formatSeconds(
            playback.durationSeconds
          )}`;
        }
      } else {
        progressFill.style.transform = "scaleX(0)";
        progressBar.classList.add("smpp-spotify-progress-unknown");
        const wholeSecond = Math.floor(positionSeconds);
        if (wholeSecond !== lastShownSecond) {
          lastShownSecond = wholeSecond;
          time.innerText = formatSeconds(positionSeconds);
        }
      }
    };

    const applyState = (state: any) => {
      root.classList.remove("smpp-spotify-disconnected");
      help.classList.remove("show");
      track.innerText = state?.title || "Spotify";
      artist.innerText = state?.artist || "";
      if (state?.cover) {
        cover.src = upgradeCoverUrl(state.cover) || state.cover;
        cover.style.visibility = "visible";
      } else {
        cover.removeAttribute("src");
        cover.style.visibility = "hidden";
      }

      prevBtn.disabled = state?.canPrevious === false;
      nextBtn.disabled = state?.canNext === false;

      const pos = parseTimeToSeconds(state?.positionText);
      const dur = parseTimeToSeconds(state?.durationText);
      playback =
        pos !== null
          ? {
              basePositionSeconds: pos,
              durationSeconds: dur !== null ? dur : null,
              isPlaying: state?.isPlaying === true,
              syncedAtMs: Date.now(),
            }
          : null;

      lastShownSecond = null;
      updatePlaybackUI();
    };

    const setDisconnected = (msg?: string) => {
      root.classList.add("smpp-spotify-disconnected");
      help.classList.add("show");
      track.innerText = msg || "Open Spotify in another tab";
      artist.innerText = "";
      time.innerText = "";
      progressFill.style.transform = "scaleX(0)";
      progressBar.classList.add("smpp-spotify-progress-unknown");
      playback = null;
      lastShownSecond = null;
      cover.removeAttribute("src");
      cover.style.visibility = "hidden";
      prevBtn.disabled = true;
      playPauseBtn.disabled = true;
      nextBtn.disabled = true;
    };

    const refresh = async () => {
      try {
        const resp = await browser.runtime.sendMessage({
          action: "spotifyGetState",
        });
        if (!resp || resp.ok === false) {
          setDisconnected(resp?.humanError);
          return;
        }
        playPauseBtn.disabled = false;
        applyState(resp);
      } catch (e) {
        console.error("[smpp][spotify-widget] refresh failed", e);
        setDisconnected("Spotify not reachable");
      }
    };

    const run = async (command: "previous" | "playPause" | "next") => {
      // Optimistic UI updates so we don't keep progressing on stale state
      if (command === "playPause" && playback) {
        playback = {
          ...playback,
          isPlaying: !playback.isPlaying,
          syncedAtMs: Date.now(),
        };
        lastShownSecond = null;
        updatePlaybackUI();
      }
      if ((command === "next" || command === "previous") && playback) {
        playback = null;
        lastShownSecond = null;
        time.innerText = "";
        progressFill.style.transform = "scaleX(0)";
        progressBar.classList.add("smpp-spotify-progress-unknown");
      }

      try {
        const resp = await browser.runtime.sendMessage({
          action: "spotifyCommand",
          command,
        });
        if (!resp || resp.ok === false) {
          setDisconnected(resp?.humanError);
          return;
        }
        if (resp?.state?.ok) {
          playPauseBtn.disabled = false;
          applyState(resp.state);
        } else {
          await refresh();
        }
        // One extra quick resync, because Spotify UI sometimes updates slightly after the click.
        setTimeout(() => this.#els?.refresh?.(), 300);
      } catch (e) {
        console.error("[smpp][spotify-widget] command failed", e);
        setDisconnected("Spotify not reachable");
      }
    };

    prevBtn.addEventListener("click", () => run("previous"));
    playPauseBtn.addEventListener("click", () => run("playPause"));
    nextBtn.addEventListener("click", () => run("next"));
    openBtn.addEventListener("click", () => {
      window.open("https://open.spotify.com", "_blank", "noopener,noreferrer");
    });

    this.#els = { refresh };
    setDisconnected();
    await refresh();

    this.#poll = window.setInterval(refresh, 5000);
    const rafTick = () => {
      updatePlaybackUI();
      this.#rafId = requestAnimationFrame(rafTick);
    };
    this.#rafId = requestAnimationFrame(rafTick);

    return root;
  }

  async createPreview() {
    const div = document.createElement("div");
    div.classList.add("smpp-spotify-widget", "smpp-spotify-preview");

    div.style.background = "none";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.gap = "12px";
    div.style.padding = "12px";
    div.style.minHeight = "auto";

    const title = document.createElement("div");
    title.classList.add("smpp-spotify-preview-title");
    title.innerText = "Spotify";
    div.appendChild(title);

    const icon = document.createElement("div");
    icon.classList.add("smpp-spotify-icon", "smpp-spotify-icon-large");
    icon.innerHTML = spotifyLogoSvg;
    div.appendChild(icon);

    return div;
  }

  async onRemove() {
    if (this.#poll) {
      clearInterval(this.#poll);
      this.#poll = null;
    }
    if (this.#rafId) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }
}

registerWidget(new SpotifyWidget());
