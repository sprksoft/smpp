import { getSchoolName } from "./utils.js";

interface Evaluation {
  graphic?: { value?: number | string } | null;
}

export function buisStats(): void {
  setTimeout(() => {
    const school = getSchoolName();
    const url = `https://${school}.smartschool.be/results/api/v1/evaluations/?itemsOnPage=1000`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Evaluation[]>;
      })
      .then((data) => {
        const categories = { buis: 0, voldoende: 0 };

        if (!Array.isArray(data)) return;

        data.forEach((evaluation) => {
          const raw = evaluation?.graphic?.value;
          const value = typeof raw === "string" ? parseFloat(raw) : raw;
          if (typeof value === "number" && !Number.isNaN(value)) {
            if (value < 50) categories.buis++;
            else categories.voldoende++;
          }
        });

        const container = document.getElementsByClassName("results-evaluations__filters")[0] as HTMLElement | undefined;
        if (!container) return;

        const newElement = document.createElement("div");
        newElement.id = "buis-stats";
        container.appendChild(newElement);

        newElement.innerHTML = `<div class="buis-stats" id="buis_amount"></div><div class="buis-stats" id="voldoende_amount"></div>`;

        const buisEl = document.getElementById("buis_amount");
        const voldEl = document.getElementById("voldoende_amount");

        if (buisEl)
          buisEl.innerHTML = `<div class="buis-stats-box"><span class="buis-stats-title">Onvoldoendes:</span><span class="buis-stats-value">${categories.buis}</span></div>`;
        if (voldEl)
          voldEl.innerHTML = `<div class="buis-stats-box"><span class="buis-stats-title">Voldoendes:</span><span class="buis-stats-value">${categories.voldoende}</span></div>`;
      })
      .catch((error) => console.error("Error fetching:", error));
  }, 1000);
}
