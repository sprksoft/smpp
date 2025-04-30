const pixelsPerMinute = 1.46;

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

const calculateElementHeight = (startTime, endTime) => {
  const durationInSeconds = (endTime - startTime) / 1000;
  const durationInMinutes = durationInSeconds / 60;
  return durationInMinutes * pixelsPerMinute;
};

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

  // Calculate the new date by adding the addend to the current date
  currentDate.setDate(currentDate.getDate() + addend);
  let month_names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
  ];
  if (isFancyFormat) {
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear();
    return `${year}-${month}-${day}`;
  } else {
    return currentDate;
  }
}
let days_added_on_top = 0;
function next_day_planner() {
  days_added_on_top += 1;
  ShowPlanner(days_added_on_top);
}
function previous_day_planner() {
  days_added_on_top -= 1;
  ShowPlanner(days_added_on_top);
}
async function ShowPlanner(addend) {
  const plannerContainer = document.createElement("div");
  plannerContainer.classList.add("planner-container");
  const container = document.getElementById("plannercontainer");

  const plannerUrl = document
    .getElementById("datePickerMenu")
    .getAttribute("plannerurl");
  const data = await fetchPlannerData(
    await getDateInCorrectFormat(true, addend),
    plannerUrl.split("/")[4]
  );
  if (!data || data.length === 0) {
    plannerContainer.innerHTML = `<p style="text-align: center">No planner data available for this date! \n Consider turning planner <strong>off</strong> if your school doesn't use planner yet</p>
        <a id="turn-off-planner" style="text-align: center">Click here to turn planner <strong>off</strong></a>`;
    var Title = document.createElement("div");
    let date_text = `${await getDateInCorrectFormat(false, addend)}`
      .split(" ")
      .slice(0, 4)
      .join(" ");
    Title.innerHTML =
      "<button style='width:15%' title='back' id=back_button_planner></button><h3 style='width:70%; font-weight:500; font-size:20px'>" +
      date_text +
      "</h3><button id=forward_button_planner title='forward' style='width:15%'></button>";
    Title.classList.add("planner-title-startpage");
    plannerContainer.prepend(Title);
    container.innerHTML = "";
    container.appendChild(plannerContainer);
    document
      .getElementById("turn-off-planner")
      .addEventListener("click", () => {
        settingsData = PLEASE_DELETE_ME_WHEN_FIXED();
        settingsData.showplanner = false;
        DELETE_ME_ASS_WELL_SAVE_FUNCTION(settingsData);
        apply();
      });
    let forward_button_planner = document.getElementById(
      "forward_button_planner"
    );
    let back_button_planner = document.getElementById("back_button_planner");
    forward_button_planner.addEventListener("click", next_day_planner);
    back_button_planner.addEventListener("click", previous_day_planner);
    return;
  }

  let earliestStartTime = Infinity;
  data.forEach((element) => {
    const dateTimeFrom = new Date(element.period.dateTimeFrom).getTime();
    if (dateTimeFrom < earliestStartTime) {
      earliestStartTime = dateTimeFrom;
    }
  });
  var Title = document.createElement("div");
  let date_text = `${await getDateInCorrectFormat(false, addend)}`
    .split(" ")
    .slice(0, 4)
    .join(" ");

  Title.innerHTML =
    "<button style='width:15%' title='back' id=back_button_planner></button><h3 style='width:70%; font-weight:500; font-size:20px'>" +
    date_text +
    "</h3><button id=forward_button_planner title='forward' style='width:15%'></button>";
  Title.classList.add("planner-title-startpage");
  plannerContainer.appendChild(Title);

  const beginTime = new Date(earliestStartTime);

  const timeSlots = [];
  data.forEach((element, index, array) => {
    const dateTimeFrom = new Date(element.period.dateTimeFrom);
    const dateTimeTo = new Date(element.period.dateTimeTo);
    if (element.period.wholeDay) {
      dateTimeFrom.setMinutes(30);
      dateTimeFrom.setHours(7);
      dateTimeTo.setMinutes(35);
      dateTimeTo.setHours(7);
      beginTime.setMinutes(30);
      beginTime.setHours(7);
    }

    const overlappingSlots = timeSlots.filter((slot) => {
      return slot.from < dateTimeTo && slot.to > dateTimeFrom;
    });

    if (overlappingSlots.length === 0) {
      const newSlot = {
        from: dateTimeFrom,
        to: dateTimeTo,
        elements: [element],
      };
      timeSlots.push(newSlot);
    } else {
      overlappingSlots.forEach((slot) => {
        slot.elements.push(element);
      });
    }
  });

  timeSlots.forEach((slot) => {
    const numElements = slot.elements.length;
    const elementWidthPercentage = 100 / numElements;

    slot.elements.forEach((element, index) => {
      const plannerElement = document.createElement("div");
      plannerElement.classList.add("planner-element");
      const colorParts = element.color.split("-");
      const cssVariableColor = `c-${colorParts[0]}-combo--${colorParts[1]}`;
      plannerElement.classList.add(cssVariableColor);

      const itemName =
        element.courses && element.courses.length > 0
          ? element.courses[0].name
          : element.name;
      var teachers = [];
      if (element.organisers) {
        element.organisers.users.forEach((element) => {
          teachers.push(element.name.startingWithFirstName);
        });
      }
      const itemNameElement = document.createElement("h3");
      itemNameElement.textContent = itemName + " - " + teachers;
      itemNameElement.classList.add("no-bottom-margin");
      plannerElement.appendChild(itemNameElement);

      const timeElement = document.createElement("p");
      const dateTimeFrom = new Date(element.period.dateTimeFrom);
      const dateTimeTo = new Date(element.period.dateTimeTo);
      timeElement.textContent = fancyfyTime(
        `${dateTimeFrom.toLocaleTimeString()} - ${dateTimeTo.toLocaleTimeString()}`
      );
      timeElement.classList.add("no-bottom-margin");
      plannerElement.appendChild(timeElement);
      if (element.name) {
        const itemDescription = element.name;
        const itemDescriptionElement = document.createElement("p");
        itemDescriptionElement.textContent = itemDescription;
        itemDescriptionElement.classList.add("no-bottom-margin");
        plannerElement.appendChild(itemDescriptionElement);
      }
      const height = calculateElementHeight(dateTimeFrom, dateTimeTo);
      plannerElement.style.height = `${height}px`;
      const top = calculateElementHeight(beginTime, dateTimeFrom);
      plannerElement.style.top = `${top}px`;
      const left = index * elementWidthPercentage;
      plannerElement.style.left = `${left}%`;

      if (index < numElements - 1) {
        const nextStartTime = new Date(
          slot.elements[index + 1].period.dateTimeFrom
        );
        const marginBottom = (nextStartTime - dateTimeTo) / 60000;
        const marginBottomPixels = marginBottom * pixelsPerMinute;
        plannerElement.style.marginBottom = `${marginBottomPixels}px`;
      }

      plannerElement.style.width = `${elementWidthPercentage}%`;
      plannerContainer.appendChild(plannerElement);
      function hoverPlannerElement() {
        plannerElement.style.width = "100%";
        if (height < 73) {
          plannerElement.style.height = "73px";
        }
        plannerElement.style.left = "0";
        plannerElement.style.zIndex = "100";
      }
      function noHoverPlannerElement() {
        plannerElement.style.left = `${left}%`;
        plannerElement.style.top = `${top}px`;
        plannerElement.style.height = `${height}px`;
        plannerElement.style.width = `${elementWidthPercentage}%`;
        plannerElement.style.zIndex = "99";
      }
      plannerElement.addEventListener("mouseover", hoverPlannerElement);
      plannerElement.addEventListener("mouseout", noHoverPlannerElement);
      if (element.period.wholeDay) {
        plannerElement.style.width = "100%";
        plannerElement.style.height = "24px";
        plannerElement.style.left = "0";
        plannerElement.style.top = "0";
        plannerElement.style.zIndex = "100";
        plannerElement.removeEventListener("mouseover", hoverPlannerElement);
        plannerElement.removeEventListener("mouseout", noHoverPlannerElement);
      }
    });
  });
  container.innerHTML = "";
  container.appendChild(plannerContainer);
  let forward_button_planner = document.getElementById(
    "forward_button_planner"
  );
  let back_button_planner = document.getElementById("back_button_planner");
  forward_button_planner.addEventListener("click", next_day_planner);
  back_button_planner.addEventListener("click", previous_day_planner);
}
