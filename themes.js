// Nieuw theme systeem
// Dit is nog niet klaar dus hou oud systeem effen

const themes = {
  "default": {
    style: {
      "--color-accent": "#8f8f95",
      "--color-text": "#C2BAB2",
      "--color-base00": "#191817",
      "--color-base01": "#232020",
      "--color-base02": "#3f3c3b",
      "--color-base03": "#5b5756",
      "--color-popup-border": "var(--color-accent)",
      "--color-hover-border": "var(--color-accent)",
      "--color-homepage-sidebars-bg": "#02020585",
      "--loginpage-image": "url(https://images.hdqwalls.com/wallpapers/moon-astrophotography-4k-sc.jpg)",
    }
  },

  "ldev": {
    style: {
      "--color-accent": "#ffd5a0",
      "--color-popup-border": "var(--color-base02)",
      "--color-hover-border": "var(--color-base03)",
      "--color-homepage-sidebars-bg": "var(--color-base00)",
      "--loginpage-image": "url(https://i.redd.it/yfssdsfosao11.png)",
    }
  },
}

function get_all_themes_v2() {
  return Object.keys(themes);
}

function overlayTheme_v2(name) {
  let theme = themes[name];
  if (!theme) {
    return;
  }
  let style = document.documentElement.style;
  let keys = Object.keys(theme.style);
  for (let i = 0; i < keys; i++) {
    style.setProperty(keys[i], theme.style[keys[i]]);
  }
}

function set_theme_v2(name) {
  overlayTheme_v2("default");
  overlayTheme_v2(name);
}

