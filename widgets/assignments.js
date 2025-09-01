// i'm a true ✨ Vibe Coder ✨ - Jdev
// code for assignments list 📂
// THANK YOU LDEVVVV 🫂🫂🫂

class TakenWidget extends WidgetBase {
  createContent() {
    const foresight = 28; // dagen in de toekomst dat het zoekt voor taken
    let maxAssignments = 5;

    let userId = getUserId();

    if (DEBUG) {
      sendDebug("Debug mode enabled ✅");
      sendDebug("User ID:", userId);
      sendDebug("Current URL:", window.location.href);
      sendDebug("Today's Date:", getCurrentDate());
      sendDebug("Next Date:", getFutureDate(foresight));
    }

    async function fetchPlannerData() {
      try {
        const schoolName = getSchoolName();
        if (!schoolName) {
          throw new Error("School name could not be determined.");
        }

        const url = `https://${schoolName}.smartschool.be/planner/api/v1/planned-elements/user/${userId}?from=${getCurrentDate()}&to=${getFutureDate(foresight)}&types=planned-assignments,planned-to-dos`;
        sendDebug("Fetching planner data from:", url);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch planner data (Status: ${response.status})`
          );
        }
        const data = await response.json();
        sendDebug("Planner data:", data);
        return data;
      } catch (error) {
        console.error("Fetch error:", error);
        return null;
      }
    }

    function initTaskList() {
      const TasksContainer = document.createElement("div");
      const TitleScreenDiv = document.createElement("div");
      const TitleScreenText = document.createElement("h2");
      TitleScreenText.innerText = "Assignments";
      TitleScreenText.classList.add("assignments-title");
      TitleScreenDiv.append(TitleScreenText);
      TasksContainer.append(TitleScreenDiv);

      if (!userId) {
        return sendDebug("User ID not found.");
      }

      fetchPlannerData().then((data) => {
        if (!data) {
          TasksContainer.innerHTML =
            "Er is iets ernstig misgegaan :(";
          return console.error("No planner data, Did something go wrong?");
        } else if (DEBUG) {
          sendDebug("Planner data fetched successfully.");
        }
        if (!Array.isArray(data) || data.length === 0) {
          let noDataContainer = document.createElement("div");
          noDataContainer.classList.add("blue-ghost-96");
          let noDataContainerTextContainer = document.createElement("div");
          noDataContainerTextContainer.classList.add("no-data-text");
          noDataContainerTextContainer.innerText =
            "Er zijn geen opdrachten gepland in de komende 28 dagen.";
          noDataContainerTextContainer.style.textAlign = "center";
          noDataContainerTextContainer.style.padding = "1rem";
          noDataContainerTextContainer.style.fontSize = "1rem";
          noDataContainerTextContainer.style.fontWeight = "semibold";
          TasksContainer.appendChild(noDataContainer);
          TasksContainer.appendChild(noDataContainerTextContainer);
        }
        // sort based on day
        data.sort(
          (a, b) =>
            new Date(a.period.dateTimeFrom) - new Date(b.period.dateTimeFrom)
        );
        let lastDate = "";
        data = data.filter((element) => element.resolvedStatus !== "resolved");
        if (data.length > maxAssignments) {
          data = data.slice(0, maxAssignments);
        }
        const today = new Date();
        data.forEach((element) => {
          const taskDate = new Date(element.period.dateTimeFrom);
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          const dayAfterTomorrow = new Date(today);
          dayAfterTomorrow.setDate(today.getDate() + 2);

          let dateText = taskDate.toLocaleDateString("nl-NL", {
            weekday: "long",
            month: "long",
            day: "numeric",
          });

          if (taskDate.toDateString() === today.toDateString()) {
            dateText = "Vandaag";
          } else if (taskDate.toDateString() === tomorrow.toDateString()) {
            dateText = "Morgen";
          } else if (
            taskDate.toDateString() === dayAfterTomorrow.toDateString()
          ) {
            dateText = "Overmorgen";
          }

          if (dateText !== lastDate) {
            const dateHeader = document.createElement("h3");
            dateHeader.textContent = dateText;
            dateHeader.classList.add("date-header-assignments");
            TasksContainer.appendChild(dateHeader);
            lastDate = dateText;
          }

          const rowDiv = document.createElement("div");
          rowDiv.classList.add("listview__row", "todo__row", "assignment__item");
          rowDiv.setAttribute("data-id", element.id);

          const abbreviationDiv = document.createElement("div");
          abbreviationDiv.classList.add("listview__cell", "abvr__div");

          const wrapperDiv = document.createElement("div");
          wrapperDiv.classList.add("todo-column__abbreviation-cell__wrapper", "wrapperdiv");
          wrapperDiv.classList.add(`c-${element.color.split("-")[0]}-combo--${element.color.split("-")[1]}` // LET HIM COOK
          );

          // make the litle icon cubes
          if (element.icon) { // dont try to understand, i dont either
            fetch(
              `https://${getSchoolName()}.smartschool.be/smsc/svg/${
                element.icon
              }/${element.icon}_16x16.svg`
            )
              .then((response) => response.blob())
              .then((blob) => {
                const iconSvg = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "svg"
                );
                iconSvg.setAttribute("width", "16px");
                iconSvg.setAttribute("height", "16px");
                const reader = new FileReader();
                reader.onload = (e) => {
                  iconSvg.innerHTML = e.target.result;
                };
                reader.readAsText(blob);
                wrapperDiv.appendChild(iconSvg);
              });
          } else {
            const abbreviationSpan = document.createElement("span");
            abbreviationSpan.classList.add(
              "todo-column__abbreviation-cell__wrapper__abbreviation"
            );
            abbreviationSpan.textContent =
              element.assignmentType.abbreviation || "?";
            abbreviationSpan.style.cssText = "font-size:14px;font-weight:700;";
            wrapperDiv.appendChild(abbreviationSpan);
          }

          abbreviationDiv.appendChild(wrapperDiv);
          const detailsDiv = document.createElement("div");
          detailsDiv.classList.add("listview__cell");

          const titleSpan = document.createElement("span");
          titleSpan.textContent = element.name;
          titleSpan.classList.add("task-description");

          const metadataSpan = document.createElement("span");
          metadataSpan.textContent = `${new Date(
            element.period.dateTimeFrom
          ).toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit",
          })} • ${element.courses?.[0]?.name || "TODO"}`;
          metadataSpan.classList.add("task-description");

          detailsDiv.append(titleSpan, metadataSpan);
          rowDiv.append(abbreviationDiv, detailsDiv);
          TasksContainer.append(rowDiv);
        });

        return sendDebug("UI updated successfully.");
      });
      return TasksContainer;
    }
    return initTaskList();
  }
  async createPreview() {
    const previewElement = document.createElement("div");

    const previewElementTitle = document.createElement("div");
    previewElementTitle.classList.add("assignments-preview-title");
    previewElementTitle.innerText = "Assignments";

    const previewElementIcon = document.createElement("div");
    previewElementIcon.classList.add("assignments-icon-160-container");
    previewElementIcon.style.marginBottom = "1rem";
    previewElementIcon.innerHTML = assignmentsSvg;

    previewElement.appendChild(previewElementTitle);
    previewElement.appendChild(previewElementIcon);

    return previewElement;
  }
}



registerWidget(new TakenWidget()); // so easy
