import { WidgetBase, registerWidget } from "./widgets.js";

const pixelsPerMinute = 1.46;

type PlannerUser = {
  name: { startingWithFirstName: string };
};

type PlannerCourse = {
  name: string;
};

type PlannerLocation = {
  title?: string;
  name?: string;
};

type PlannerPeriod = {
  dateTimeFrom: string;
  dateTimeTo: string;
  wholeDay?: boolean;
};

type PlannedElement = {
  color?: string;
  name?: string;
  period: PlannerPeriod;
  courses?: PlannerCourse[];
  organisers?: { users: PlannerUser[] };
  locations?: PlannerLocation[];
};

type TimeSlot = {
  from: Date;
  to: Date;
  elements: PlannedElement[];
};

async function fetchPlannerData(
  date: string,
  user: string
): Promise<PlannedElement[] | null> {
  try {
    const currentUrl = window.location.href;
    const school_name = currentUrl.split("/")[2];
    const url = `https://${school_name}/planner/api/v1/planned-elements/user/${user}?from=${date}&to=${date}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch planner data`);
    }
    return (await response.json()) as PlannedElement[];
  } catch (error) {
    console.error(`Failed to fetch:`, error);
    return null;
  }
}

function calculateElementHeight(startTime: Date, endTime: Date): number {
  const durationInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
  const durationInMinutes = durationInSeconds / 60;
  return durationInMinutes * pixelsPerMinute;
}

function convertTo24HourFormat(time: string): string {
  const [hoursPart = "", minutesPart = "", periodPart = ""] = time.split(":");
  let hours = parseInt(hoursPart, 10);
  const minutes = parseInt(minutesPart, 10);
  if (periodPart.toLowerCase().includes("pm") && hours !== 12) {
    hours += 12;
  } else if (periodPart.toLowerCase().includes("am") && hours === 12) {
    hours = 0;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function fancyfyTime(inputTime: string): string {
  const [startTime = "", endTime = ""] = inputTime.split(" - ");
  return `${convertTo24HourFormat(startTime)} - ${convertTo24HourFormat(endTime)}`;
}

function dateWithOffset(addend: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + addend);
  return date;
}

function formatDateForApi(addend: number): string {
  const date = dateWithOffset(addend);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

class PlannerWidget extends WidgetBase {
  #daysAddedOnTop = 0;
  #plannerContainer: HTMLDivElement | null = null;
  #planningContainer: HTMLDivElement | null = null;

  #nextDayPlanner() {
    this.#daysAddedOnTop += 1;
    this.#updatePlanner(this.#daysAddedOnTop);
  }

  #previousDayPlanner() {
    this.#daysAddedOnTop -= 1;
    this.#updatePlanner(this.#daysAddedOnTop);
  }

  #createTitleElement(dateText: string): HTMLDivElement {
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("planner-title-startpage");

    const backButton = document.createElement("button");
    backButton.style.width = "15%";
    backButton.title = "back";
    backButton.id = "back_button_planner";
    backButton.addEventListener("click", () => this.#previousDayPlanner());

    const title = document.createElement("h3");
    title.style.width = "70%";
    title.style.fontWeight = "500";
    title.style.fontSize = "20px";
    title.textContent = dateText;

    const forwardButton = document.createElement("button");
    forwardButton.style.width = "15%";
    forwardButton.title = "forward";
    forwardButton.id = "forward_button_planner";
    forwardButton.addEventListener("click", () => this.#nextDayPlanner());

    titleContainer.appendChild(backButton);
    titleContainer.appendChild(title);
    titleContainer.appendChild(forwardButton);

    return titleContainer;
  }

  #createEmptyPlannerMessage(): HTMLDivElement {
    const messageContainer = document.createElement("div");

    const message = document.createElement("p");
    message.style.textAlign = "center";
    message.style.fontSize = "1.5rem";
    message.style.fontWeight = "600";
    message.textContent = "No planner data for this day";

    const ghostIcon = document.createElement("div");
    ghostIcon.classList.add("blue-ghost-96");

    messageContainer.appendChild(message);
    messageContainer.appendChild(ghostIcon);

    return messageContainer;
  }

  #createPlannerSubElement(
    element: PlannedElement,
    index: number,
    numElements: number,
    elementWidthPercentage: number,
    beginTime: Date,
    slot: TimeSlot
  ): HTMLDivElement {
    const plannerElement = document.createElement("div");
    plannerElement.classList.add("planner-element");

    if (element.color) {
      const [colorName, colorShade] = element.color.split("-");
      plannerElement.classList.add(`c-${colorName}-combo--${colorShade}`);
    }

    const itemName = element.courses?.[0]?.name || element.name || "Les";
    const teachers =
      element.organisers?.users.map(
        (user) => user.name.startingWithFirstName
      ) ?? [];
    const rooms = (element.locations ?? [])
      .map((location) => location.title || location.name)
      .filter((room): room is string => Boolean(room));

    const itemNameElement = document.createElement("h3");
    let itemNameText = `${itemName} - ${teachers.join(", ")}`;
    if (rooms.length > 0) {
      itemNameText += ` · ${rooms.join(", ")}`;
    }
    itemNameElement.textContent = itemNameText;
    itemNameElement.classList.add("no-bottom-margin");
    plannerElement.appendChild(itemNameElement);

    const dateTimeFrom = new Date(element.period.dateTimeFrom);
    const dateTimeTo = new Date(element.period.dateTimeTo);

    const timeElement = document.createElement("p");
    timeElement.textContent = fancyfyTime(
      `${dateTimeFrom.toLocaleTimeString()} - ${dateTimeTo.toLocaleTimeString()}`
    );
    timeElement.classList.add("no-bottom-margin");
    plannerElement.appendChild(timeElement);

    if (element.name) {
      const itemDescriptionElement = document.createElement("p");
      itemDescriptionElement.textContent = element.name;
      itemDescriptionElement.classList.add("no-bottom-margin");
      plannerElement.appendChild(itemDescriptionElement);
    }

    const height = calculateElementHeight(dateTimeFrom, dateTimeTo);
    const top = calculateElementHeight(beginTime, dateTimeFrom);
    const left = index * elementWidthPercentage;

    plannerElement.style.height = `${height}px`;
    plannerElement.style.top = `${top}px`;
    plannerElement.style.left = `${left}%`;
    plannerElement.style.width = `${elementWidthPercentage}%`;

    const nextElement = slot.elements[index + 1];
    if (index < numElements - 1 && nextElement) {
      const nextStartTime = new Date(nextElement.period.dateTimeFrom);
      const marginBottom =
        (nextStartTime.getTime() - dateTimeTo.getTime()) / 60000;
      plannerElement.style.marginBottom = `${marginBottom * pixelsPerMinute}px`;
    }

    const hoverPlannerElement = () => {
      plannerElement.style.width = "100%";
      if (height < 73) plannerElement.style.height = "73px";
      plannerElement.style.left = "0";
      plannerElement.style.zIndex = "100";
    };

    const noHoverPlannerElement = () => {
      plannerElement.style.left = `${left}%`;
      plannerElement.style.top = `${top}px`;
      plannerElement.style.height = `${height}px`;
      plannerElement.style.width = `${elementWidthPercentage}%`;
      plannerElement.style.zIndex = "99";
    };

    plannerElement.addEventListener("mouseover", hoverPlannerElement);
    plannerElement.addEventListener("mouseout", noHoverPlannerElement);

    if (element.period.wholeDay) {
      plannerElement.style.width = "100%";
      plannerElement.style.height = "24px";
      plannerElement.style.top = "0";
      plannerElement.style.zIndex = "100";
      plannerElement.removeEventListener("mouseover", hoverPlannerElement);
      plannerElement.removeEventListener("mouseout", noHoverPlannerElement);
    }

    return plannerElement;
  }

  async #updatePlanner(addend: number) {
    const plannerContainer = this.#plannerContainer;
    const planningContainer = this.#planningContainer;
    if (!plannerContainer || !planningContainer) {
      return;
    }

    const plannerUrl = document
      .getElementById("datePickerMenu")
      ?.getAttribute("plannerurl");
    const user = plannerUrl?.split("/")[4];
    if (!user) {
      throw new Error("Could not read the planner user from datePickerMenu");
    }

    const data = await fetchPlannerData(formatDateForApi(addend), user);

    plannerContainer.innerHTML = "";
    planningContainer.innerHTML = "";

    const dateText = dateWithOffset(addend)
      .toString()
      .split(" ")
      .slice(0, 4)
      .join(" ");
    plannerContainer.appendChild(this.#createTitleElement(dateText));

    if (!data || data.length === 0) {
      plannerContainer.appendChild(this.#createEmptyPlannerMessage());
      planningContainer.style.height = "initial";
    } else {
      const earliestStartTime = Math.min(
        ...data.map((element) =>
          new Date(element.period.dateTimeFrom).getTime()
        )
      );
      const beginTime = new Date(earliestStartTime);

      const timeSlots: TimeSlot[] = [];
      data.forEach((element) => {
        const dateTimeFrom = new Date(element.period.dateTimeFrom);
        const dateTimeTo = new Date(element.period.dateTimeTo);

        if (element.period.wholeDay) {
          dateTimeFrom.setHours(7, 30);
          dateTimeTo.setHours(7, 35);
          beginTime.setHours(7, 30);
        }

        const overlappingSlot = timeSlots.find(
          (slot) => slot.from < dateTimeTo && slot.to > dateTimeFrom
        );

        if (overlappingSlot) {
          overlappingSlot.elements.push(element);
        } else {
          timeSlots.push({
            from: dateTimeFrom,
            to: dateTimeTo,
            elements: [element],
          });
        }
      });

      const allHeights: number[] = [];
      timeSlots.forEach((slot) => {
        const numElements = slot.elements.length;
        const elementWidthPercentage = 100 / numElements;
        slot.elements.forEach((element, index) => {
          const plannerElement = this.#createPlannerSubElement(
            element,
            index,
            numElements,
            elementWidthPercentage,
            beginTime,
            slot
          );
          planningContainer.appendChild(plannerElement);
          allHeights.push(
            parseInt(plannerElement.style.height) +
              parseInt(plannerElement.style.top)
          );
        });
      });
      planningContainer.style.height = Math.max(...allHeights) + "px";
    }

    plannerContainer.appendChild(planningContainer);
  }

  override async createContent() {
    this.element.classList.add("smpp-widget-transparent");

    const plannerContainer = document.createElement("div");
    plannerContainer.classList.add("planner-container");
    this.#plannerContainer = plannerContainer;

    const planningContainer = document.createElement("div");
    planningContainer.classList.add("planning-container");
    this.#planningContainer = planningContainer;

    await this.#updatePlanner(0); // Show current day by default
    return plannerContainer;
  }

  override async createPreview() {
    const previewElement = document.createElement("div");

    const previewElementTitle = document.createElement("div");
    previewElementTitle.classList.add("planner-preview-title");
    previewElementTitle.innerText = "Planner";

    const previewElementIcon = document.createElement("div");
    previewElementIcon.classList.add("planner-icon-128");
    previewElementIcon.style.marginBottom = "1rem";

    previewElement.appendChild(previewElementTitle);
    previewElement.appendChild(previewElementIcon);

    return previewElement;
  }
}

registerWidget(new PlannerWidget());
