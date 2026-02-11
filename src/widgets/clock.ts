// @ts-nocheck
import { registerWidget, WidgetBase } from "./widgets.js";

// gemaakt door Lou (Flying_dinonugget) analog clock gestolen van Lukaz.vb
class ClockWidget extends WidgetBase {
  get category() {
    return "other";
  }

  get name() {
    return "ClockWidget";
  }

  async createContent() {
    this.element.classList.add("smpp-widget-transparent");
    const clockContainer = document.createElement("div");
    clockContainer.classList.add("clock-widget");

    const container = document.createElement("div");
    container.classList.add("clock-container");
    clockContainer.appendChild(container);

    const clockFace = document.createElement("div");
    clockFace.classList.add("clock-face");
    container.appendChild(clockFace);

    const minuteHand = document.createElement("div");
    minuteHand.classList.add("clock-hand", "minute-hand");
    clockFace.appendChild(minuteHand);

    const hourHand = document.createElement("div");
    hourHand.classList.add("clock-hand", "hour-hand");
    clockFace.appendChild(hourHand);

    const secondHand = document.createElement("div");
    secondHand.classList.add("clock-hand", "second-hand");
    clockFace.appendChild(secondHand);

    const centerCircle = document.createElement("div");
    centerCircle.classList.add("clock-center");
    clockFace.appendChild(centerCircle);

    const bottomContainer = document.createElement("div");
    bottomContainer.classList.add("clock-bottom");
    container.appendChild(bottomContainer);

    const timeEl = document.createElement("div");
    timeEl.classList.add("digital-time");
    timeEl.innerText = "00:00";
    bottomContainer.appendChild(timeEl);

    const update = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      const timeText = `${(hours < 10 ? "0" : "") + hours}:${minutes < 10 ? "0" : ""}${minutes}`;
      if (timeEl.innerText !== timeText) {
        // only update the time if it has changed. This allows the time text to be selected and has possibly better performance
        timeEl.innerText = timeText;
      }

      const totalSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
      const totalMinutes = hours * 60 + minutes + seconds / 60 + milliseconds / (1000 * 60);
      const totalHours =
        hours + minutes / 60 + seconds / (60 * 60) + milliseconds / (1000 * 60 * 60);

      let secondsAngle = totalSeconds * 6;
      let minutesAngle = totalMinutes * 6;
      let hoursAngle = totalHours * 30;

      if (secondsAngle > 270) secondsAngle -= 360;
      if (minutesAngle > 270) minutesAngle -= 360;
      if (hoursAngle > 270) hoursAngle -= 360;

      secondHand.style.transform = `translate(-50%, -100%) rotate(${secondsAngle}deg)`;
      minuteHand.style.transform = `translate(-50%, -100%) rotate(${minutesAngle}deg)`;
      hourHand.style.transform = `translate(-50%, -100%) rotate(${hoursAngle}deg)`;

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);

    return clockContainer;
  }

  async createPreview() {
    const div = document.createElement("div");
    div.classList.add("clock-widget-preview");

    const title = document.createElement("div");
    title.classList.add("clock-preview-title");
    title.innerText = "Clock";
    div.appendChild(title);

    const container = document.createElement("div");
    container.classList.add("clock-container");
    div.appendChild(container);

    const clockFace = document.createElement("div");
    clockFace.classList.add("clock-face");
    container.appendChild(clockFace);

    const minuteHand = document.createElement("div");
    minuteHand.classList.add("clock-hand", "minute-hand");
    minuteHand.style.transform = "rotate(0deg)";
    clockFace.appendChild(minuteHand);

    const hourHand = document.createElement("div");
    hourHand.classList.add("clock-hand", "hour-hand");
    hourHand.style.transform = "rotate(0deg)";
    clockFace.appendChild(hourHand);

    const secondHand = document.createElement("div");
    secondHand.classList.add("clock-hand", "second-hand");
    secondHand.style.transform = "rotate(0deg)";
    clockFace.appendChild(secondHand);

    const centerCircle = document.createElement("div");
    centerCircle.classList.add("clock-center");
    clockFace.appendChild(centerCircle);

    const secondsAngle = 50;
    const minutesAngle = 120;
    const hoursAngle = 240;

    secondHand.style.transform = `translate(-50%, -100%) rotate(${secondsAngle}deg)`;
    minuteHand.style.transform = `translate(-50%, -100%) rotate(${minutesAngle}deg)`;
    hourHand.style.transform = `translate(-50%, -100%) rotate(${hoursAngle}deg)`;

    return div;
  }

  async onThemeChange() {}
}

registerWidget(new ClockWidget());
