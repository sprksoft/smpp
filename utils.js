
function open_url(url) {
  let a = document.createElement("a");
  a.href = url;
  a.rel = 'noopener noreferrer';
  a.target= '_blank';
  a.click();
}
