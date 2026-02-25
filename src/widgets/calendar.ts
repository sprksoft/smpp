// @ts-nocheck
import { getExtensionImage } from "../common/utils.js";
import { chevronLeftSvg } from "../fixes-utils/svgs.js";
import { WidgetBase, registerWidget } from "./widgets.js";

class CalendarWidget extends WidgetBase {
  get category() {
    return "other";
  }

  get name() {
    return "CalendarWidget";
  }

  defaultSettings() {
    return {};
  }

  private currentDate = new Date();

  private generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthName = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(this.currentDate);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const container = document.createElement("div");
    container.className = "calendar-widget";

    const header = document.createElement("div");
    header.className = "calendar-header";

    const prevBtn = document.createElement("button");
    prevBtn.className = "calendar-prev";
    prevBtn.innerHTML = chevronLeftSvg;
    prevBtn.addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      const parent = container.parentElement;
      const newCalendar = this.generateCalendar();
      parent?.replaceChild(newCalendar, container);
    });

    const title = document.createElement("h3");
    title.textContent = `${monthName} ${year}`;

    const nextBtn = document.createElement("button");
    nextBtn.className = "calendar-next";
    nextBtn.innerHTML = chevronLeftSvg;
    nextBtn.addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      const parent = container.parentElement;
      const newCalendar = this.generateCalendar();
      parent?.replaceChild(newCalendar, container);
    });

    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);

    const weekdays = document.createElement("div");
    weekdays.className = "calendar-weekdays";
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
      const dayEl = document.createElement("div");
      dayEl.className = "calendar-weekday";
      dayEl.textContent = day;
      weekdays.appendChild(dayEl);
    });

    const days = document.createElement("div");
    days.className = "calendar-days";

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "calendar-day empty";
      days.appendChild(empty);
    }

    // Days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement("div");
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      dayEl.className = isToday ? "calendar-day today" : "calendar-day";
      dayEl.textContent = String(day);
      days.appendChild(dayEl);
    }

    container.appendChild(header);
    container.appendChild(weekdays);
    container.appendChild(days);

    return container;
  }

  async createContent() {
    return this.generateCalendar();
  }

  async createPreview() {
    const preview = document.createElement("div");
    preview.className = "calendar-widget-preview";
    preview.style.background = "none";
    preview.style.display = "flex";
    preview.style.flexDirection = "column";
    preview.style.alignItems = "center";
    preview.style.justifyContent = "center";
    preview.style.gap = "12px";
    preview.style.padding = "12px";
    preview.style.minHeight = "auto";

    // Calendar text label
    const label = document.createElement("div");
    label.style.fontSize = "2rem";
    label.style.fontWeight = "700";
    label.style.color = "var(--color-base05)";
    label.style.marginBottom = "0.5rem";
    label.textContent = "Calendar";

    let image = document.createElement("img");
    image.src = getExtensionImage("icons/widgets/kalender_512x512.png");
    image.classList = "calendar-image";
    preview.appendChild(label);
    preview.appendChild(image);

    return preview;
  }
}

registerWidget(new CalendarWidget());
