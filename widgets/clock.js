// gemaakt door Lou (Flying_dinonugget) analog clock gestolen van Lukaz.vb
class ClockWidget extends WidgetBase {
  #interval;

  get category() {
    return "other";
  }

  get name() {
    return "ClockWidget";
  }

  async createContent() {
    this.element.classList.add("smpp-widget-transparent");
    let clockContainer = document.createElement("div");
    clockContainer.classList.add("clock-widget");

    let container = document.createElement("div");
    container.classList.add("clock-container");
    clockContainer.appendChild(container);

    let clockFace = document.createElement("div");
    clockFace.classList.add("clock-face");
    container.appendChild(clockFace);

    let minuteHand = document.createElement("div");
    minuteHand.classList.add("clock-hand", "minute-hand");
    clockFace.appendChild(minuteHand);

    let hourHand = document.createElement("div");
    hourHand.classList.add("clock-hand", "hour-hand");
    clockFace.appendChild(hourHand);

    let secondHand = document.createElement("div");
    secondHand.classList.add("clock-hand", "second-hand");
    clockFace.appendChild(secondHand);

    let bottomContainer = document.createElement("div");
    bottomContainer.classList.add("clock-bottom");
    container.appendChild(bottomContainer);

    let timeEl = document.createElement("div");
    timeEl.classList.add("digital-time");
    timeEl.innerText = "00:00";
    bottomContainer.appendChild(timeEl);

    const update = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();
      timeEl.innerText =
        (hours < 10 ? "0" : "") +
        hours +
        ":" +
        (minutes < 10 ? "0" : "") +
        minutes;

      const totalSeconds =
        hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
      const totalMinutes = hours * 60 + minutes;
      const totalHours = hours + minutes / 60;

      let secondsAngle = totalSeconds * 6;
      let minutesAngle = totalMinutes * 6;
      let hoursAngle = totalHours * 30;

      if (secondsAngle > 270) secondsAngle -= 360;
      if (minutesAngle > 270) minutesAngle -= 360;
      if (hoursAngle > 270) hoursAngle -= 360;

      secondHand.style.transform = `translate(-50%, -100%) rotate(${secondsAngle}deg)`;
      minuteHand.style.transform = `translate(-50%, -100%) rotate(${minutesAngle}deg)`;
      hourHand.style.transform = `translate(-50%, -100%) rotate(${hoursAngle}deg)`;
    };

    update();
    this.#interval = setInterval(update, 100);

    return clockContainer;
  }

  async createPreview() {
    let div = document.createElement("div");
    div.classList.add("clock-widget-preview");

    let title = document.createElement("div");
    title.classList.add("clock-preview-title");
    title.innerText = "Clock";
    div.appendChild(title);

    let container = document.createElement("div");
    container.classList.add("clock-container");
    div.appendChild(container);

    let clockFace = document.createElement("div");
    clockFace.classList.add("clock-face");
    container.appendChild(clockFace);

    let minuteHand = document.createElement("div");
    minuteHand.classList.add("clock-hand", "minute-hand");
    minuteHand.style.transform = "rotate(0deg)";
    clockFace.appendChild(minuteHand);

    let hourHand = document.createElement("div");
    hourHand.classList.add("clock-hand", "hour-hand");
    hourHand.style.transform = "rotate(0deg)";
    clockFace.appendChild(hourHand);

    let secondHand = document.createElement("div");
    secondHand.classList.add("clock-hand", "second-hand");
    secondHand.style.transform = "rotate(0deg)";
    clockFace.appendChild(secondHand);

    let secondsAngle = 50;
    let minutesAngle = 120;
    let hoursAngle = 240;

    secondHand.style.transform = `translate(-50%, -100%) rotate(${secondsAngle}deg)`;
    minuteHand.style.transform = `translate(-50%, -100%) rotate(${minutesAngle}deg)`;
    hourHand.style.transform = `translate(-50%, -100%) rotate(${hoursAngle}deg)`;

    return div;
  }

  async onThemeChange() {}
}

registerWidget(new ClockWidget());
