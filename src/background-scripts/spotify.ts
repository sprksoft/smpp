import { browser, sendDebug } from "../common/utils.js";

type SpotifyCommand = "next" | "previous" | "playPause";

// Runs inside the Spotify tab (injected via browser.scripting.executeScript)
async function spotifyController(
  command: SpotifyCommand | null
): Promise<any> {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const nowPlayingRoot = () =>
    document.querySelector('aside[data-testid="now-playing-bar"]');

  const getButton = (testId: string) =>
    document.querySelector(`button[data-testid="${testId}"]`) as
      | HTMLButtonElement
      | null;

  const getText = (testId: string) => {
    const el = document.querySelector(`[data-testid="${testId}"]`) as
      | HTMLElement
      | null;
    const t = el?.innerText?.trim();
    return t ? t : null;
  };

  const inferIsPlayingFromLabel = (label: string | null) => {
    if (!label) return null;
    const l = label.toLowerCase();
    // aria-label describes the action of the button:
    // - "Pauze"/"Pause" => currently playing
    // - "Afspelen"/"Play" => currently paused
    if (l.includes("pause") || l.includes("pauze") || l.includes("pausa")) {
      return true;
    }
    if (l.includes("play") || l.includes("afspelen") || l.includes("lecture")) {
      return false;
    }
    return null;
  };

  const getState = () => {
    const root = nowPlayingRoot() as HTMLElement | null;
    if (!root) {
      return {
        ok: false,
        humanError: "Spotify player not found on this page.",
      };
    }

    const title =
      (root.querySelector('[data-testid="context-item-info-title"]')
        ?.textContent || "")
        .trim() || null;
    const artist =
      (root.querySelector('[data-testid="context-item-info-subtitles"]')
        ?.textContent || "")
        .trim() || null;
    const cover =
      (root.querySelector(
        'img[data-testid="cover-art-image"]'
      ) as HTMLImageElement | null)?.src || null;

    const nextBtn = getButton("control-button-skip-forward");
    const prevBtn = getButton("control-button-skip-back");
    const playPauseBtn = getButton("control-button-playpause");
    const playPauseLabel = playPauseBtn?.getAttribute("aria-label") || null;

    return {
      ok: true,
      title,
      artist,
      cover,
      canNext: nextBtn ? !nextBtn.disabled : null,
      canPrevious: prevBtn ? !prevBtn.disabled : null,
      playPauseLabel,
      isPlaying: inferIsPlayingFromLabel(playPauseLabel),
      positionText: getText("playback-position"),
      durationText: getText("playback-duration"),
    };
  };

  if (!command) {
    return getState();
  }

  const before: any = getState();
  if (!before || before.ok === false) {
    return before;
  }

  const testId =
    command === "next"
      ? "control-button-skip-forward"
      : command === "previous"
        ? "control-button-skip-back"
        : "control-button-playpause";

  const button = getButton(testId);
  if (!button) {
    return {
      ok: false,
      humanError: `Spotify control button not found (${command}).`,
    };
  }
  if (button.disabled) {
    return {
      ok: false,
      humanError: `Spotify control button is disabled (${command}).`,
    };
  }

  button.click();

  const changed = (after: any) => {
    if (!after || after.ok === false) return false;
    if (command === "playPause") {
      if (before.isPlaying !== null && after.isPlaying !== null) {
        return after.isPlaying !== before.isPlaying;
      }
      return after.playPauseLabel !== before.playPauseLabel;
    }
    return after.title !== before.title || after.cover !== before.cover;
  };

  for (let i = 0; i < 10; i++) {
    await delay(150);
    const after: any = getState();
    if (changed(after)) {
      return after;
    }
  }

  return getState();
}

async function runOnSpotifyTab(command: SpotifyCommand | null) {
  const tabs = await browser.tabs.query({ url: ["*://open.spotify.com/*"] });
  if (!tabs || tabs.length === 0) {
    return {
      ok: false,
      humanError: "No Spotify tab found. Open https://open.spotify.com in another tab.",
    };
  }

  const targetTab =
    tabs.find((t: any) => t.audible) || tabs.find((t: any) => t.active) || tabs[0];

  try {
    const results = await browser.scripting.executeScript({
      target: { tabId: targetTab.id },
      func: spotifyController as any,
      args: [command],
    });
    return results?.[0]?.result ?? { ok: false, humanError: "Spotify returned no data." };
  } catch (e) {
    sendDebug("[smpp][spotify] executeScript failed", e);
    return {
      ok: false,
      humanError:
        "Couldn't run the Spotify controller. Make sure the Spotify tab is open on open.spotify.com.",
    };
  }
}

export async function handleSpotifyMessage(message: any, sendResponse: (resp: any) => void) {
  if (message.action === "spotifyGetState") {
    const state = await runOnSpotifyTab(null);
    sendResponse(state);
    return true;
  }

  if (message.action === "spotifyCommand") {
    const state = await runOnSpotifyTab(message.command);
    if (!state || state.ok === false) {
      sendResponse(state);
      return true;
    }
    sendResponse({ ok: true, state });
    return true;
  }

  return false;
}
