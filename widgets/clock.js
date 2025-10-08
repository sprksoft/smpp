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
    let div = document.createElement("div");
    div.classList.add("clock-widget");

    const style = document.createElement('style');
    style.textContent = `
      .clock-widget {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0;
        background: transparent;
      }
      .clock-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      .clock-face {
        border-radius: 50%;
        aspect-ratio: 1;
        width: 120px;
        background-color: transparent;
        position: relative;
        margin: 0 auto;
      }
      .clock-hand {
        position: absolute;
        transform-origin: bottom center;
        left: calc(-0.5rem + 50%);
        top: calc(-0.5rem + 50%);
        background-color: #f0f3ff;
        width: 1rem;
        transform: rotate(0deg);
        border-radius: 0.5rem;
        transition: transform 0.75s cubic-bezier(0.58, 0.14, 0.44, 1.2);
        box-shadow: 0px 0px 30px 1px rgba(12, 12, 12, 0.709);
      }
      .hour-hand {
        height: 30%;
        top: 20%;
      }
      .minute-hand {
        height: 45%;
        top: 5%;
      }
      .second-hand {
        height: 50%;
        top: 0%;
        width: 0.5rem;
        background-color: #ff0000;
      }
      .clock-bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-top: 10px;
      }
      .digital-time {
        font-size: 18px;
        font-weight: 800;
        letter-spacing: 0.5rem;
        text-align: center;
      }
    `;
    div.appendChild(style);

    let container = document.createElement("div");
    container.classList.add("clock-container");
    div.appendChild(container);

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

      timeEl.innerText = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;

      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      const totalMinutes = hours * 60 + minutes;
      const totalHours = hours + minutes / 60;

      let secondsAngle = totalSeconds * 6;
      let minutesAngle = totalMinutes * 6;
      let hoursAngle = totalHours * 30;

      if (secondsAngle > 270) secondsAngle -= 360;
      if (minutesAngle > 270) minutesAngle -= 360;
      if (hoursAngle > 270) hoursAngle -= 360;

      secondHand.style.transform = `rotate(${secondsAngle}deg)`;
      minuteHand.style.transform = `rotate(${minutesAngle}deg)`;
      hourHand.style.transform = `rotate(${hoursAngle}deg)`;
    };

    update();
    this.#interval = setInterval(update, 1000);

    return div;
  }

  async createPreview() {
    let div = document.createElement("div");
    div.classList.add("clock-widget-preview");

    let title = document.createElement("div");
    title.classList.add("clock-preview-title");
    title.innerText = "Clock";
    title.style.fontSize = "28px";
    title.style.fontWeight = "bold";
    title.style.textAlign = "center";
    div.appendChild(title);

    const style = document.createElement('style');
    style.textContent = `
      .clock-widget-preview .clock-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      .clock-widget-preview .clock-face {
        border-radius: 50%;
        aspect-ratio: 1;
        width: 100px;
        background-color: transparent;
        position: relative;
        margin: 0 auto;
      }
      .clock-widget-preview .clock-hand {
        position: absolute;
        transform-origin: bottom center;
        left: calc(-0.5rem + 50%);
        top: calc(-0.5rem + 50%);
        background-color: #f0f3ff;
        width: 1rem;
        transform: rotate(0deg);
        border-radius: 0.5rem;
        box-shadow: 0px 0px 30px 1px rgba(12, 12, 12, 0.709);
      }
      .clock-widget-preview .hour-hand {
        height: 30%;
        top: 20%;
      }
      .clock-widget-preview .minute-hand {
        height: 45%;
        top: 5%;
      }
      .clock-widget-preview .second-hand {
        height: 50%;
        top: 0%;
        width: 0.5rem;
        background-color: #ff0000;
      }
      .clock-widget-preview .clock-bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-top: 10px;
      }
      .clock-widget-preview .digital-time {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 0.3rem;
        text-align: center;
      }
    `;
    div.appendChild(style);

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

      timeEl.innerText = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;

      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      const totalMinutes = hours * 60 + minutes;
      const totalHours = hours + minutes / 60;

      let secondsAngle = totalSeconds * 6;
      let minutesAngle = totalMinutes * 6;
      let hoursAngle = totalHours * 30;

      if (secondsAngle > 270) secondsAngle -= 360;
      if (minutesAngle > 270) minutesAngle -= 360;
      if (hoursAngle > 270) hoursAngle -= 360;

      secondHand.style.transform = `rotate(${secondsAngle}deg)`;
      minuteHand.style.transform = `rotate(${minutesAngle}deg)`;
      hourHand.style.transform = `rotate(${hoursAngle}deg)`;
    };

    update();

    return div;
  }

  async onThemeChange() {
  }
}

registerWidget(new ClockWidget());