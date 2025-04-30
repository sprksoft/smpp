let gc_is_open = false;
let gc_initialized = false;

function make_iframe() {
  const GlCHatplace = document.getElementById("global_chat_window");
  let current_profile = PLEASE_DELETE_ME_WHEN_FIXED().profile;
  let current_theme = get_theme(current_profile);

  const placeholderTextGlChat = username_override || orig_name;
  let query_string = get_theme_as_query_string(current_theme, [
    "color-base00",
    "color-base01",
    "color-base02",
    "color-base03",
    "color-accent",
    "color-text",
  ]);
  if (query_string.startsWith("&")) {
    query_string = query_string.substring(1);
  }

  const GlCHatplaceHTML = `
    <div class="gc-controls">
      <button class="gc-btn gc-fullscreen" title="Volledig scherm">
  <svg viewBox="0 0 16 16" class="contract-icon" stroke="currentColor" fill="none" stroke-width="1">
    <path fill-rule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707z"/>
  </svg>
  <svg viewBox="0 0 24 24" class="expand-icon" stroke="currentColor" fill="none" stroke-width="2.6">
    <path d="M3,14v6a1,1,0,0,0,1,1h6"/>
    <line x1="10" y1="14" x2="3.29" y2="20.71"/>
    <path d="M14,3h6a1,1,0,0,1,1,1v6"/>
    <line x1="20.71" y1="3.29" x2="14" y2="10"/>
  </svg>
</button>
      <button class="gc-btn gc-close" title="Sluiten">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <iframe style="width:100%; height:100%; border:none" src='https://gc.smartschoolplusplus.com/chat?${query_string}'></iframe>
  `;

  GlCHatplace.innerHTML = GlCHatplaceHTML;

  GlCHatplace.querySelector(".gc-fullscreen").addEventListener(
    "click",
    toggleFullscreen
  );
  GlCHatplace.querySelector(".gc-close").addEventListener(
    "click",
    remove_gcwin
  );
}

function toggleFullscreen() {
  const chatWindow = document.getElementById("global_chat_window");
  chatWindow.classList.toggle("gc-fullscreen");
  void chatWindow.offsetWidth;
}

function make_gcwin(is_hidden) {
  const global_chat_window_element = document.createElement("div");
  global_chat_window_element.id = "global_chat_window";
  global_chat_window_element.classList.add("global_chat_window", "lookChat");

  if (is_hidden) {
    global_chat_window_element.classList.add("gc-hidden");
  }

  document.body.appendChild(global_chat_window_element);
  gc_is_open = false;

  document.addEventListener("click", (e) => {
    if (
      gc_is_open &&
      !e.target.closest("#global_chat_button, .global_chat_window")
    ) {
      remove_gcwin();
    }
  });

  make_iframe();
}

function open_global_chat() {
  let win = document.getElementById("global_chat_window");
  if (win) {
    win.classList.remove("gc-hidden");
    win.style.display = "block";
  } else {
    make_gcwin(false);
  }
  gc_initialized = true;
  gc_is_open = true;
}
function gc_close() {
  gc_is_open = false;
  let global_chat_window = document.getElementById("global_chat_window");
  global_chat_window.classList.add("gc-hidden");
}
function remove_gcwin() {
  let win = document.getElementById("global_chat_window");
  if (win) {
    win.remove();
  }
}

function createGCButton() {
  const topNav = document.querySelector("nav.topnav");

  const goGlChatButton = document.createElement("button");
  goGlChatButton.title =
    "Global chat (chat met iedereen die de extensie gebruikt)";
  goGlChatButton.id = "global_chat_button";
  goGlChatButton.className = "topnav__btn";
  goGlChatButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="3009 50 450 450" class="st1">
  <g>
    <g id="Laag_1">
      <path d="M3436.9,158.5c0-3.6-.4-7-.9-10.8-2.6-20.6-12.9-39.8-29-53.9-16.3-14.2-37-22.1-58.4-22.1h-.3c-56,.2-112.9.2-168,.1-29.2,0-58.3,0-87.5,0-3.9,0-8.1.3-12.9.9-20.5,2.7-39.5,12.9-53.6,28.9-14.2,16.1-22,36.6-21.9,57.6,0,31.4,0,63.4,0,94.3,0,26.1,0,52.2,0,78.3,0,3.8.3,7.6.9,11.5,5.4,33.9,24.4,57.5,56.3,70,6.6,2.6,13.5,3.9,20.7,5.3,2.3.5,4.7.9,7.1,1.4v1.7c0,5.2,0,10.3,0,15.5,0,13.6-.1,27.8.3,41.6.2,5.9,2.4,12.3,5.8,16.7,4.2,5.5,10.2,8.8,16.7,9.2.5,0,1,0,1.5,0,6.7,0,13.2-2.9,18.6-8.3,26.5-26.4,50.9-50.9,74.5-74.7,1.9-1.9,3.5-2.5,6.2-2.5h0c51.1.1,93.2.1,132.5,0,6.7,0,13.5-.7,20.4-2,40.4-7.5,70.9-44.1,71-85.1,0-59.1,0-119.9,0-173.5h0ZM3203.6,344.5c-16.5,14.1-40.7,21.6-70,21.6s-51.3-6.3-66.1-15.2l-2.8-1.7,12.1-43,4.7,2.7c11.8,6.8,32.5,14,54.8,14s38.4-10.1,38.4-27-10.1-23.9-38.8-34c-44.9-15.6-66.8-38.7-66.8-70.6s8.6-37.8,24.1-50.4c15.9-12.9,37.9-19.8,63.7-19.8s34.1,2.6,48.1,7.7c1.2.4,2.4.9,3.9,1.5h.1c0,0,3.5,1.6,3.5,1.6l30.3,13.2,18.8-43.2,39.7,17.2-18.8,43.2,41.4,18-17.2,39.7-41.4-18-18.8,43.2-39.7-17.2,18.8-43.2-19.7-8.6v.5c-.1,0-4.8-2.3-4.8-2.3-9.4-4.8-24.9-10.4-45.3-10.4s-34.5,12.5-34.5,23.3,9.1,21.2,42.3,33.7c43.7,16,63.2,38.2,63.2,71.9s-8.3,38.7-23.4,51.6h0ZM3375.4,308.6c-3.8,11.3-8.8,22.3-14.8,32.6l-2,3.4-2-.9-34.7-15.1-19,43.7-40-17.4,19-43.7-41.9-18.2,17.4-40,41.9,18.2,19-43.7,40,17.4-19,43.7,37.4,16.2-1.3,3.7h0Z"/>
      <path style="fill: var(--color-base01)"d="M3227,292.9c0,20.4-8.3,38.7-23.4,51.6-16.5,14.1-40.7,21.6-70,21.6s-51.3-6.3-66.1-15.2l-2.8-1.7,12.1-43,4.7,2.7c11.8,6.8,32.5,14,54.8,14s38.4-10.1,38.4-27-10.1-23.9-38.8-34c-44.9-15.6-66.8-38.7-66.8-70.6s8.6-37.8,24.1-50.4c15.9-12.9,37.9-19.8,63.7-19.8s34.1,2.6,48.1,7.7c1.2.4,2.4.9,3.9,1.5h.1c0,0,3.5,1.6,3.5,1.6l30.3,13.2,18.8-43.2,39.7,17.2-18.8,43.2,41.4,18-17.2,39.7-41.4-18-18.8,43.2-39.7-17.2,18.8-43.2-19.7-8.6v.5c-.1,0-4.8-2.3-4.8-2.3-9.4-4.8-24.9-10.4-45.3-10.4s-34.5,12.5-34.5,23.3,9.1,21.2,42.3,33.7c43.7,16,63.2,38.2,63.2,71.9h0Z"/>
      <path style="fill: var(--color-base01)"d="M3376.6,304.9l-1.3,3.7c-3.8,11.3-8.8,22.3-14.8,32.6l-2,3.4-2-.9-34.7-15.1-19,43.7-40-17.4,19-43.7-41.9-18.2,17.4-40,41.9,18.2,19-43.7,40,17.4-19,43.7,37.4,16.2h0Z"/>
    </g>
  </g>
</svg>
`;
  goGlChatButton.addEventListener("click", open_global_chat);
  return goGlChatButton;
}
