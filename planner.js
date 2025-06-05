pixelsPerMinute = 1.46;
async function fetchPlannerData(date, user) {
  try {
    const currentUrl = window.location.href;
    const school_name = currentUrl.split("/")[2];
    const url = `https://${school_name}/planner/api/v1/planned-elements/user/${user}?from=${date}&to=${date}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch planner data`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch:`, error);
    return null;
  }
}

function calculateElementHeight(startTime, endTime) {
  const durationInSeconds = (endTime - startTime) / 1000;
  const durationInMinutes = durationInSeconds / 60;
  return durationInMinutes * pixelsPerMinute;
}

function fancyfyTime(inputTime) {
  const [startTime, endTime] = inputTime.split(" - ");

  function convertTo24HourFormat(time) {
    let [hours, minutes, period] = time.split(":");
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    if (period.toLowerCase().includes("pm") && hours !== 12) {
      hours += 12;
    } else if (period.toLowerCase().includes("am") && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  const formattedStartTime = convertTo24HourFormat(startTime);
  const formattedEndTime = convertTo24HourFormat(endTime);
  return `${formattedStartTime} - ${formattedEndTime}`;
}

async function getDateInCorrectFormat(isFancyFormat, addend) {
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + addend);

  if (isFancyFormat) {
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear();
    return `${year}-${month}-${day}`;
  }
  return currentDate;
}

function createTitleElement(dateText) {
  const title = document.createElement("div");
  title.innerHTML = `
      <button style='width:15%' title='back' id='back_button_planner'></button>
      <h3 style='width:70%; font-weight:500; font-size:20px'>${dateText}</h3>
      <button id='forward_button_planner' title='forward' style='width:15%'></button>
    `;
  title.classList.add("planner-title-startpage");
  return title;
}

function createEmptyPlannerMessage() {
  const message = document.createElement("div");
  message.innerHTML = `
      <p style="text-align: center">
        No planner data available for this date! <br>
        Consider turning planner <strong>off</strong> if your school doesn't use planner yet
      </p>
      <a id="turn-off-planner" style="text-align: center">
        Click here to turn planner <strong>off</strong>
      </a>
    `;
  return message;
}

class PlannerWidget extends WidgetBase {
  constructor() {
    super();
    this.daysAddedOnTop = 0;
    this.plannerContainer = null;
  }

  nextDayPlanner() {
    this.daysAddedOnTop += 1;
    this.updatePlanner(this.daysAddedOnTop);
  }

  previousDayPlanner() {
    this.daysAddedOnTop -= 1;
    this.updatePlanner(this.daysAddedOnTop);
  }

  createPlannerSubElement(
    element,
    index,
    numElements,
    elementWidthPercentage,
    beginTime,
    slot
  ) {
    const plannerElement = document.createElement("div");
    plannerElement.classList.add("planner-element");

    const colorParts = element.color.split("-");
    const cssVariableColor = `c-${colorParts[0]}-combo--${colorParts[1]}`;
    plannerElement.classList.add(cssVariableColor);

    const itemName = element.courses?.[0]?.name || element.name;
    const teachers =
      element.organisers?.users.map(
        (user) => user.name.startingWithFirstName
      ) || [];

    const itemNameElement = document.createElement("h3");
    itemNameElement.textContent = `${itemName} - ${teachers.join(", ")}`;
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

    if (index < numElements - 1) {
      const nextStartTime = new Date(
        slot.elements[index + 1].period.dateTimeFrom
      );
      const marginBottom = (nextStartTime - dateTimeTo) / 60000;
      plannerElement.style.marginBottom = `${
        marginBottom * this.pixelsPerMinute
      }px`;
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

  async updatePlanner(addend) {
    const plannerUrl = document
      .getElementById("datePickerMenu")
      .getAttribute("plannerurl");
    const date = await getDateInCorrectFormat(true, addend);
    const data = await fetchPlannerData(date, plannerUrl.split("/")[4]);

    this.plannerContainer.innerHTML = "";

    const dateText = `${await getDateInCorrectFormat(false, addend)}`
      .split(" ")
      .slice(0, 4)
      .join(" ");
    const title = createTitleElement(dateText);
    this.plannerContainer.appendChild(title);

    if (!data || data.length === 0) {
      const message = createEmptyPlannerMessage();
      this.plannerContainer.appendChild(message);

      document
        .getElementById("turn-off-planner")
        .addEventListener("click", () => {
          settingsData = PLEASE_DELETE_ME_WHEN_FIXED();
          settingsData.showplanner = false;
          DELETE_ME_ASS_WELL_SAVE_FUNCTION(settingsData);
          apply();
        });
    } else {
      // Process planner data
      const earliestStartTime = Math.min(
        ...data.map((element) =>
          new Date(element.period.dateTimeFrom).getTime()
        )
      );
      const beginTime = new Date(earliestStartTime);

      // Group elements into time slots
      const timeSlots = [];
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

      // Create elements for each time slot
      timeSlots.forEach((slot) => {
        const numElements = slot.elements.length;
        const elementWidthPercentage = 100 / numElements;

        slot.elements.forEach((element, index) => {
          const plannerElement = this.createPlannerSubElement(
            element,
            index,
            numElements,
            elementWidthPercentage,
            beginTime,
            slot
          );
          this.plannerContainer.appendChild(plannerElement);
        });
      });
    }

    document
      .getElementById("forward_button_planner")
      .addEventListener("click", () => this.nextDayPlanner());
    document
      .getElementById("back_button_planner")
      .addEventListener("click", () => this.previousDayPlanner());
  }

  async createContent() {
    const plannerContainer = document.createElement("div");
    plannerContainer.classList.add("smpp-widget-transparent");
    plannerContainer.classList.add("planner-container");
    this.plannerContainer = plannerContainer;
    this.updatePlanner(0); // Show current day by default
    return this.plannerContainer;
  }

  async createPreview() {
    return document.createElement("div");
  }
}

registerWidget(new PlannerWidget());
