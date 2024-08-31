const themes = {
  "default": {
    "--color-accent": "#c9d2e6",
    "--color-splashtext": "#c9d2e6",
    "--color-text": "#C2BAB2",
    "--color-base00": "#191817",
    "--color-base01": "#232020",
    "--color-base02": "#3f3c3b",
    "--color-base03": "#5b5756",
    "--color-popup-border": "var(--color-accent)",
    "--color-hover-border": "var(--color-accent)",
    "--color-settings-bg": "var(--color-base02)",
    "--color-settings-border": "var(--color-base03)",
    "--color-settings-ui-bg": "var(--color-base01)",
    "--color-settings-ui-border": "var(--color-base02)",
    "--color-settings-ui-layer2": "var(--color-base03)",
    "--color-homepage-sidebars-bg": "#02020585",
    "--loginpage-image": "url(https://4kwallpapers.com/images/wallpapers/desert-doom-sand-dunes-dark-background-monochrome-landscape-2560x1080-6409.jpg)"
  },
  "white": {
    "--color-accent": "#3a4f6d",
    "--color-text": "#1a1e28",
    "--color-base00": "#eeebec",
    "--color-base01": "#e0dedf",
    "--color-base02": "#d2cfd0",
    "--color-base03": "#7b93b4",
    "--color-homepage-sidebars-bg": "#02020540",
    "--loginpage-image": "url(https://wallpaperaccess.com/full/1474688.jpg)",
    "--darken-background": "rgba(0,0,0,0.1)",
    "--color-splashtext": "#080a12"
  },
  "ldev": {
    "--color-accent": "#ffd5a0",
    "--color-text": "#C2BAB2",
    "--color-base00": "#191817",
    "--color-base01": "#232020",
    "--color-base02": "#3f3c3b",
    "--color-base03": "#5b5756",
    "--color-popup-border": "var(--color-base02)",
    "--color-hover-border": "var(--color-base03)",
    "--color-homepage-sidebars-bg": "var(--color-base00)",
    "--loginpage-image": "url(https://i.redd.it/yfssdsfosao11.png)",
    "--darken-background": "rgba(0,0,0,0.25)",
    "--color-splashtext": "#ffd5a0"
  },
  "purple": {
    "--color-accent": "#bd4fb3",
    "--color-text": "#d9cdff",
    "--color-base00": "#0b021d",
    "--color-base01": "#130332",
    "--color-base02": "#250654",
    "--color-base03": "#3f0a74",
    "--loginpage-image": "url(https://www.hdwallpapers.in/download/macos_monterey_shapes_hd_macos-2560x1440.jpg)",
    "--color-splashtext": "#dfdeff"
  },
  "stalker": {
    "--color-accent": "#d6574e",
    "--color-text": "#f8a99c",
    "--color-base00": "#1a1311",
    "--color-base01": "#371b19",
    "--color-base02": "#5c1c1a",
    "--color-base03": "#823530",
    "--loginpage-image": "url(https://media.timeout.com/images/102945740/image.jpg)",
    "--color-splashtext": "#efc2c3"
  },
  "chocolate": {
    "--color-accent": "#cdbcb4",
    "--color-text": "#dcdad0",
    "--color-base00": "#20181c",
    "--color-base01": "#2c2326",
    "--color-base02": "#3b2e2e",
    "--color-base03": "#4c3e3e",
    "--loginpage-image": "url(https://www.hdwallpapers.in/download/wet_brown_leaves_hd_dark_aesthetic-HD.jpg)",
    "--darken-background": "rgba(0,0,0,0.3)",
    "--color-splashtext": "#d3b199"
  },
  "fall": {
    "--color-accent": "#f8c791",
    "--color-text": "#d3cbc3",
    "--color-base00": "#231717",
    "--color-base01": "#3b1c16",
    "--color-base02": "#7b3f31",
    "--color-base03": "#bf6f51",
    "--loginpage-image": "url(https://wallpapercave.com/wp/wp7464660.jpg)",
    "--darken-background": "rgba(0,0,0,0.3)",
    "--color-splashtext": "#ffe5d3"
  },
  "winter": {
    "--color-accent": "#8aadb6",
    "--color-text": "#C2BAB2",
    "--color-base00": "#071b2c",
    "--color-base01": "#152f47",
    "--color-base02": "#345f7f",
    "--color-base03": "#5687b6",
    "--loginpage-image": "url(https://th.bing.com/th/id/R.fd4990dbff7b2d998a61b5a60b6b1949?rik=TkC2r3hdP1Ma9g&pid=ImgRaw&r=0)",
    "--color-splashtext": "#7bcfe2"
  },
  "birb": {
    "--color-accent": "#8590aacc",
    "--color-text": "#a8a9ab",
    "--color-base00": "#0e0e15",
    "--color-base01": "#18191d",
    "--color-base02": "#232428",
    "--color-base03": "#3a3c44",
    "--loginpage-image": "url(https://wallpapercave.com/wp/wp4673203.jpg)",
    "--color-splashtext": "#7089a4"
  },
  "matcha": {
    "--color-accent": "#d1f8e7",
    "--color-text": "#d1ebd2",
    "--color-base00": "#243926",
    "--color-base01": "#365138",
    "--color-base02": "#456046",
    "--color-base03": "#4f7a51",
    "--loginpage-image": "url(https://wallpapercave.com/wp/wp9313069.jpg)",
    "--darken-background": "rgba(0,0,0,0.15)",
    "--color-splashtext": "#8ab4a7"
  },
  "mountain": {
    "--color-accent": "#f8f8fa",
    "--color-text": "#f8f8fa",
    "--color-base00": "#121c28",
    "--color-base01": "#23364e",
    "--color-base02": "#52647c",
    "--color-base03": "#8294ac",
    "--loginpage-image": "url(https://hdqwalls.com/download/everest-3840x2160.jpg)",
    "--darken-background": "rgba(0,0,0,0.15)",
    "--color-splashtext": "#030c18"
  },
  "vax": {
    "--color-accent": "#7a1600",
    "--color-text": "bisque",
    "--color-base00": "#411900",
    "--color-base01": "#724021",
    "--color-base02": "#b9815d",
    "--color-base03": "#caa288",
    "--loginpage-image": "url(https://wallpapers.com/images/hd/star-wars-place-ztno3exzqff0m0ci.webp)",
    "--darken-background": "rgba(0,0,0,0.15)",
    "--color-splashtext": "#7a1600"
  },
  "sand": {
    "--color-accent": "#8097c5",
    "--color-text": "#c1a49c",
    "--color-base00": "#2e2526",
    "--color-base01": "#3d3434",
    "--color-base02": "#544848",
    "--color-base03": "#634f4e",
    "--loginpage-image": "url(https://hdqwalls.com/wallpapers/macos-mojave-dusk-mode-stock-el.jpg)",
    "--darken-background": "rgba(0,0,0,0.15)",
    "--color-splashtext": "#e0c7b5"
  },
  "galaxy": {
    "--color-accent": "#daa0ef",
    "--color-text": "#f0f0f0",
    "--color-base00": "#1e222c",
    "--color-base01": "#2e3440",
    "--color-base02": "#474e5f",
    "--color-base03": "#5c667d",
    "--loginpage-image": "url(https://i.redd.it/u80014ygsea51.png)",
    "--darken-background": "rgba(0,0,0,0.3)",
    "--color-splashtext": "#e1bbef"
  }
}

function get_theme(name) {
  return themes[name]
}

function get_theme_var(theme, var_name) {
  let tvar = theme[var_name];
    if (tvar == undefined){
      console.error(`Theme var '${var_name}' doesn't exist`);
      return undefined;
    }
    return tvar;
}
function apply_theme(theme, style){
    let keys = Object.keys(theme);
    for (let i = 0; i < keys.length; i++) {
      style.setProperty(keys[i], theme[keys[i]]);
    }
}
function get_theme_as_query_string(theme, qvars){
  let output = "";
  for (qvar of qvars){
    let tvar = get_theme_var(theme, "--"+qvar.replace("_", "-"));
    output+=`&${qvar}=${tvar.split("#")[1]}`;
  }
  
  return output;
}
