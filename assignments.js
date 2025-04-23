// i'm a true ✨ Vibe Coder ✨ - Jdev
// code for assignments list 📂
// THANK YOU LDEVVVV 🫂🫂🫂
  

class TakenWidget extends WidgetBase {
    createContent(parent) {
      const DEBUG = false;
      const foresight = 28; // dagen in de toekomst dat het zoekt voor taken
      let userId;
  
      // get UID
      try { // try get it from a magic element
        sendDebug("Trying to get plannerUrl from DOM...");
        const plannerUrl = document.getElementById('datePickerMenu').getAttribute('plannerurl');
        sendDebug("Found plannerUrl from DOM:", plannerUrl);
  
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        document.cookie = `plannerUrl=${plannerUrl};expires=${expirationDate.toUTCString()};path=/`;
        sendDebug("Stored plannerUrl in cookies with 30 day expiration.");
  
        userId = plannerUrl.split("/")[4];
        sendDebug("Extracted userId from plannerUrl:", userId);
  
      } catch (e) { // read it from a cookie cuz the magic is unreliable af
        sendDebug("Failed to get plannerUrl from DOM. Error:", e.message);
        sendDebug("Trying to get plannerUrl from cookies...");
  
        const cookies = document.cookie.split(';');
        const plannerUrlCookie = cookies.find(cookie => cookie.trim().startsWith('plannerUrl='));
  
        if (plannerUrlCookie) {
          sendDebug("Retrieved plannerUrl from cookies" + plannerUrlCookie);
          const plannerUrl = plannerUrlCookie.split('=')[1];
          sendDebug("Found plannerUrl in cookies:", plannerUrl);
  
          userId = plannerUrl.split("/")[4];
          sendDebug("Extracted userId from cookie plannerUrl:", userId);
        } else {
          console.error("taken is fucked, refresh 5 keer en als het dan niet werkt vraag hulp op discord @JJorne")
        }
      }
  
      if (DEBUG) {
        sendDebug("Debug mode enabled ✅");
        sendDebug("User ID:", userId);
        sendDebug("Current URL:", window.location.href);
        sendDebug("Today's Date:", getCurrentDate());
        sendDebug("Next Date:", getNextDate());
      }
  
      function sendDebug(...messages) {
        if (DEBUG) {
          console.log(...messages);
        }
      }
  
      function getSchoolName() {
        try {
          const schoolName = window.location.hostname.split(".")[0];
          if (!schoolName) {
            throw new Error("Failed to extract school name");
          }
          return schoolName;
        } catch (error) {
          console.error(error.message);
          return null;
        }
      }
  
      function getCurrentDate() {
        return new Date().toISOString().split("T")[0];
      }
  
      function getNextDate() {
        return new Date(Date.now() + foresight * 86400000).toISOString().split("T")[0];
      }
  
      async function fetchPlannerData() {
        try {
          const schoolName = getSchoolName();
          if (!schoolName) {throw new Error("School name could not be determined.");}

          const url = `https://${schoolName}.smartschool.be/planner/api/v1/planned-elements/user/${userId}?from=${getCurrentDate()}&to=${getNextDate()}&types=planned-assignments,planned-to-dos`;
          sendDebug("Fetching planner data from:", url);
          const response = await fetch(url);

          if (!response.ok) {throw new Error(`Failed to fetch planner data (Status: ${response.status})`);}
          const data = await response.json();
          sendDebug("Planner data:", data);
          return data;
        } catch (error) {
          console.error("Fetch error:", error);
          return null;
        }
      }
  
      function initTaskList() {
        const PlannerContainer = parent
        PlannerContainer.innerHTML = ""
        const TitleScreenDiv = document.createElement("div")
        const TitleScreenText = document.createElement("h2")
        TitleScreenText.style.textAlign = "center"
        TitleScreenText.innerText = "Assignments"
        TitleScreenText.style.marginBottom = "2px"
        TitleScreenText.style.tex
        TitleScreenDiv.append(TitleScreenText);
        PlannerContainer.append(TitleScreenDiv, document.createElement("br"));
  
  
        if (!userId) {return sendDebug("User ID not found.");}

        fetchPlannerData().then(data => {
          if (!data) {
            PlannerContainer.innerHTML = "Als je niet in een vakantie bent, is er iets ernstig misgegaan";
            return console.error('No planner data, Did something go wrong?');
          }else if (DEBUG) {
            sendDebug("Planner data fetched successfully.");
          }
  
          // sort based on day
          data.sort((a, b) => new Date(a.period.dateTimeFrom) - new Date(b.period.dateTimeFrom));
          let lastDate = "";
  
          data.forEach(element => {
            const taskDate = new Date(element.period.dateTimeFrom);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(today.getDate() + 2);

            let dateText = taskDate.toLocaleDateString("nl-NL", {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            });

            if (taskDate.toDateString() === today.toDateString()) {
              dateText = "Vandaag";
            } else if (taskDate.toDateString() === tomorrow.toDateString()) {
              dateText = "Morgen";
            } else if (taskDate.toDateString() === dayAfterTomorrow.toDateString()) {
              dateText = "Overmorgen";
            }

            if (dateText !== lastDate) {
              const dateHeader = document.createElement("h3");
              dateHeader.textContent = dateText;
              dateHeader.style.marginTop = "20px";
              dateHeader.style.marginBottom = "15px";
              dateHeader.style.textAlign = "center"
              dateHeader.style.borderBottom = "solid"
              PlannerContainer.appendChild(dateHeader);
              lastDate = dateText;
            }
  
            const rowDiv = document.createElement("div");
            rowDiv.classList.add("listview__row", "todo__row");
            rowDiv.setAttribute("data-id", element.id);
            rowDiv.style.cssText = "display:flex;align-items:stretch;font-family:Open Sans,sans-serif;";
            rowDiv.style.paddingBottom = "5px"
  
            const abbreviationDiv = document.createElement("div");
            abbreviationDiv.classList.add("listview__cell");
            abbreviationDiv.style.maxWidth = "fit-content";
            abbreviationDiv.style.paddingRight = "7.5px";
  
            const wrapperDiv = document.createElement("div");
            wrapperDiv.classList.add("todo-column__abbreviation-cell__wrapper");
            wrapperDiv.style.cssText = `display:flex;justify-content:center;align-items:center;width:2.667rem;height:2.667rem;border-radius:4px;background-color:var(--c-${element.color.split("-")[0]}--${element.color.split("-")[1]}) !important`;
            
            // make the litle icon cubes
            if (element.icon) {
              fetch(`https://${getSchoolName()}.smartschool.be/smsc/svg/${element.icon}/${element.icon}_16x16.svg`)
                .then(response => response.blob())
                .then(blob => {
                  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                  iconSvg.setAttribute('width', '16px');
                  iconSvg.setAttribute('height', '16px');
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    iconSvg.innerHTML = e.target.result;
                  };
                  reader.readAsText(blob);
                  wrapperDiv.appendChild(iconSvg);
                });
            } else {
              const abbreviationSpan = document.createElement("span");
              abbreviationSpan.classList.add("todo-column__abbreviation-cell__wrapper__abbreviation");
              abbreviationSpan.textContent = element.assignmentType.abbreviation || "?";
              abbreviationSpan.style.cssText = "font-size:14px;font-weight:700;";
              wrapperDiv.appendChild(abbreviationSpan);
            }
  
            abbreviationDiv.appendChild(wrapperDiv);
            const detailsDiv = document.createElement("div");
            detailsDiv.classList.add("listview__cell");
  
            const titleSpan = document.createElement("span");
            titleSpan.textContent = element.name;
            titleSpan.style.cssText = "color:inherit;text-align:inherit;width:fit-content;";
            titleSpan.style.paddingLeft = "5px"
  
            const metadataSpan = document.createElement("span");
            metadataSpan.textContent = `${new Date(element.period.dateTimeFrom).toLocaleTimeString("nl-NL",{hour:'2-digit',minute:'2-digit'})} • ${element.courses?.[0]?.name||"TODO"}`;
            metadataSpan.style.cssText = "color:#868686;font-size:.800rem;text-transform:uppercase;";
            metadataSpan.style.paddingLeft = "5px"
            metadataSpan.style.display = "block";
            metadataSpan.style.marginTop = "-2px"; // Adjust as needed 
  
            detailsDiv.append(titleSpan, metadataSpan);
            rowDiv.append(abbreviationDiv, detailsDiv);
            PlannerContainer.append(rowDiv);
          });
          return sendDebug("UI updated successfully.");
        });
      }
      initTaskList()
    }
  }
registerWidget(new TakenWidget()); // so easy
