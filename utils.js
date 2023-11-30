function open_url(url, new_window = false) {
  if (new_window) {
    let a = document.createElement("a");
    a.href = url;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    a.click();
    return;
  }
  window.location = url;
}


