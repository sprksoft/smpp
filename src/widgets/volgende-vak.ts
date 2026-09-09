import { WidgetBase, registerWidget } from "./widgets.js";

const UPDATE_INTERVAL_MS = 30_000;
const REFETCH_INTERVAL_MS = 5 * 60_000;

function formatTime(date: Date) {
  return (
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0")
  );
}

function todayDateString() {
  const now = new Date();
  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")
  );
}

async function fetchTodaysLessons(): Promise<any[] | null> {
  try {
    const plannerUrl = document
      .getElementById("datePickerMenu")
      ?.getAttribute("plannerurl");
    if (!plannerUrl) {
      return null;
    }
    const user = plannerUrl.split("/")[4];
    const schoolName = window.location.href.split("/")[2];
    const date = todayDateString();
    const url = `https://${schoolName}/planner/api/v1/planned-elements/user/${user}?from=${date}&to=${date}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch planner data");
    }
    const data = await response.json();
    return data
      .filter((element: any) => !element.period.wholeDay)
      .sort(
        (a: any, b: any) =>
          new Date(a.period.dateTimeFrom).getTime() -
          new Date(b.period.dateTimeFrom).getTime()
      );
  } catch (error) {
    console.error("Failed to fetch:", error);
    return null;
  }
}

class VolgendeVakWidget extends WidgetBase {
  #interval: ReturnType<typeof setInterval> | undefined;
  #lessons: any[] | null = null;
  #lastFetch = 0;
  #container: HTMLDivElement | null = null;

  override get name() {
    return "VolgendeVakWidget";
  }

  #createMessage(text: string) {
    const message = document.createElement("div");
    message.classList.add("volgende-vak-message");

    const messageText = document.createElement("p");
    messageText.innerText = text;
    message.appendChild(messageText);

    const ghostIcon = document.createElement("div");
    ghostIcon.classList.add("blue-ghost-96");
    message.appendChild(ghostIcon);

    return message;
  }

  #createLessonCard(lesson: any) {
    const card = document.createElement("div");
    card.classList.add("volgende-vak-card");

    if (lesson.color) {
      const colorParts = lesson.color.split("-");
      card.classList.add(`c-${colorParts[0]}-combo--${colorParts[1]}`);
    }

    const from = new Date(lesson.period.dateTimeFrom);
    const to = new Date(lesson.period.dateTimeTo);

    const teachers: string[] =
      lesson.organisers?.users.map(
        (user: any) => user.name.startingWithFirstName
      ) || [];
    const rooms: string[] = (lesson.locations || [])
      .map((location: any) => location?.title || location?.name)
      .filter((title: unknown): title is string => Boolean(title));

    const subject = document.createElement("h3");
    subject.classList.add("volgende-vak-subject");
    subject.innerText = [
      lesson.courses?.[0]?.name || lesson.name || "Les",
      teachers.join(", "),
      rooms.join(", "),
    ]
      .filter(Boolean)
      .join(" - ");
    card.appendChild(subject);

    const time = document.createElement("p");
    time.classList.add("volgende-vak-time");
    time.innerText = `${formatTime(from)} - ${formatTime(to)}`;
    card.appendChild(time);

    const minutesLeft = Math.ceil((from.getTime() - Date.now()) / 60_000);
    const countdown = document.createElement("p");
    countdown.classList.add("volgende-vak-countdown");
    if (minutesLeft >= 60) {
      countdown.innerText = `Begint over ${Math.floor(minutesLeft / 60)}u ${minutesLeft % 60}min`;
    } else {
      countdown.innerText = `Begint over ${minutesLeft}min`;
    }
    card.appendChild(countdown);

    return card;
  }

  async #update() {
    if (!this.#container) {
      return;
    }

    if (!this.#lessons || Date.now() - this.#lastFetch > REFETCH_INTERVAL_MS) {
      this.#lessons = await fetchTodaysLessons();
      this.#lastFetch = Date.now();
    }

    const title = document.createElement("h3");
    title.classList.add("volgende-vak-title");
    title.innerText = "Volgende vak";

    this.#container.innerHTML = "";
    this.#container.appendChild(title);

    if (!this.#lessons) {
      this.#container.appendChild(
        this.#createMessage("Kon de planner niet laden")
      );
      return;
    }

    const now = Date.now();
    const nextLesson = this.#lessons.find(
      (lesson) => new Date(lesson.period.dateTimeFrom).getTime() > now
    );

    if (!nextLesson) {
      this.#container.appendChild(
        this.#createMessage("Geen lessen meer vandaag")
      );
      return;
    }

    this.#container.appendChild(this.#createLessonCard(nextLesson));
  }

  override async createContent() {
    this.#container = document.createElement("div");
    this.#container.classList.add("volgende-vak-widget");

    await this.#update();
    this.#interval = setInterval(() => this.#update(), UPDATE_INTERVAL_MS);

    return this.#container;
  }

  override async createPreview() {
    const container = document.createElement("div");
    container.classList.add("volgende-vak-widget", "volgende-vak-preview");

    const title = document.createElement("h3");
    title.classList.add("volgende-vak-title");
    title.innerText = "Volgende vak";
    container.appendChild(title);

    const card = document.createElement("div");
    card.classList.add("volgende-vak-card");

    const subject = document.createElement("h3");
    subject.classList.add("volgende-vak-subject");
    subject.innerText = "volgende les";
    card.appendChild(subject);



    container.appendChild(card);
    return container;
  }

  override async onRemove() {
    clearInterval(this.#interval);
    this.#lessons = null;
    this.#container = null;
  }
}

registerWidget(new VolgendeVakWidget());
