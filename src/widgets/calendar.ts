// @ts-nocheck
import { chevronLeftSvg } from "../fixes-utils/svgs.js";
import { registerWidget, WidgetBase } from "./widgets.js";

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
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

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

    // Calendar Icon SVG - colorful style
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 120");
    svg.setAttribute("width", "52");
    svg.setAttribute("height", "65");

    // Main body background (yellow)
    const body = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    body.setAttribute("x", "8");
    body.setAttribute("y", "28");
    body.setAttribute("width", "84");
    body.setAttribute("height", "84");
    body.setAttribute("rx", "6");
    body.setAttribute("fill", "#FFE55C");
    body.setAttribute("stroke", "#000");
    body.setAttribute("stroke-width", "3");

    // Header (red/pink)
    const header = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    header.setAttribute("x", "8");
    header.setAttribute("y", "8");
    header.setAttribute("width", "84");
    header.setAttribute("height", "24");
    header.setAttribute("rx", "6");
    header.setAttribute("fill", "#FF5C6D");
    header.setAttribute("stroke", "#000");
    header.setAttribute("stroke-width", "3");

    // Rings (blue circles at top)
    const ringPositions = [20, 50, 80];
    ringPositions.forEach((x) => {
      const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      ring.setAttribute("cx", String(x));
      ring.setAttribute("cy", "6");
      ring.setAttribute("r", "6");
      ring.setAttribute("fill", "#1E90FF");
      ring.setAttribute("stroke", "#000");
      ring.setAttribute("stroke-width", "2");
      svg.appendChild(ring);
    });

    // Checkboxes (cyan squares on left)
    const checkboxes = [45, 65, 85];
    checkboxes.forEach((y) => {
      const checkbox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      checkbox.setAttribute("x", "20");
      checkbox.setAttribute("y", String(y));
      checkbox.setAttribute("width", "10");
      checkbox.setAttribute("height", "10");
      checkbox.setAttribute("rx", "2");
      checkbox.setAttribute("fill", "#00D9FF");
      checkbox.setAttribute("stroke", "#000");
      checkbox.setAttribute("stroke-width", "2");
      svg.appendChild(checkbox);
    });

    // Text lines
    const lines = [45, 65, 85];
    lines.forEach((y) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "35");
      line.setAttribute("y1", String(y + 5));
      line.setAttribute("x2", "75");
      line.setAttribute("y2", String(y + 5));
      line.setAttribute("stroke", "#000");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("stroke-linecap", "round");
      svg.appendChild(line);
    });

    svg.appendChild(body);
    svg.appendChild(header);

    preview.appendChild(label);
    preview.appendChild(svg);

    return preview;
  }
}

registerWidget(new CalendarWidget());
