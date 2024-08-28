let gc_is_open = false
function globalChatTextBalk() {
    const GlCHatplace = document.getElementById("global_chat_window")
    let current_profile = get_config().profile
    let current_theme = get_theme(current_profile);
    console.log(current_theme)
    if (username_override == null){
      var placeholderTextGlChat = orig_name;
    }
    else {
      var placeholderTextGlChat = username_override;
    }
    const query_string=get_theme_as_query_string(current_theme, ["color_base00", "color_base01", "color_base02", "color_base03", "color_accent", "color_text"]);
    console.log(query_string)
    const GlCHatplaceHTML = `
  <iframe style="width:100%; height:100%; border:none "src = 'https://ldev.eu.org/smpp/gc/v1?placeholder=${placeholderTextGlChat}${query_string}'></iframe>
    `;
    console.log(`
  <iframe style="width:100%; height:100%; border:none "src = 'https://ldev.eu.org/smpp/gc/v1?placeholder=${placeholderTextGlChat}${query_string}'></iframe>
    `)
    GlCHatplace.innerHTML = GlCHatplaceHTML
  }
function open_global_chat(){
    document.getElementById("global_chat_window").classList.remove("gc-hidden")
    document.addEventListener
    gc_is_open = true
    console.log("opening gc")
}
function gc_close() {
    gc_is_open = false;
    let global_chat_window = document.getElementById("global_chat_window");
    global_chat_window.classList.add("gc-hidden");
  }
  
function init_gc(){
    global_chat_window_element =  document.createElement("div")
    global_chat_window_element.id = "global_chat_window"
    global_chat_window_element.classList.add("gc-hidden");
    global_chat_window_element.classList.add("global_chat_window");
    document.body.insertBefore(global_chat_window_element, document.body.childNodes[-1]);
    gc_is_open = false;
    document.addEventListener("click", function (e) {
        console.log(e)
        console.log(e.target)
        if (!gc_is_open){
          return
        }
        if (e.target.id == "global_chat_button"){
            return
        }
        console.log("closing gc")
        gc_close()
      })
    globalChatTextBalk()
}
init_gc()