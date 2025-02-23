setTimeout(function () {
  if (window.location.pathname.startsWith('/results/main/results/')) {
    const getSubdomain = () => {
      const host = window.location.hostname;
      const subdomain = host.split('.')[0];
      return subdomain;
    };

    const subdomain = getSubdomain();
    const url = `https://${subdomain}.smartschool.be/results/api/v1/evaluations/?itemsOnPage=1000`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const categories = {
          buis: 0,
          voldoende: 0
        };

        data.forEach(evaluation => {
          if (evaluation.graphic && evaluation.graphic.value !== undefined) {
            const value = evaluation.graphic.value;
            if (value < 50) {
              categories.buis++;
            } else {
              categories.voldoende++;
            }
          }
        });
        newElement = document.createElement("div")
        newElement.id = "buis-stats"
        document.getElementsByClassName("results-evaluations__filters")[0].appendChild(newElement)
        newElement.innerHTML = `<div class="buis-stats" id="buis_amount"></div><div class="buis-stats" id="voldoende_amount"></div>`
        document.getElementById("buis_amount").innerHTML = `<div class="buis-stats-box"><p class="buis-stats-title">Onvoldoendes:</p><p class="buis-stats-value">${categories.buis}</p></div>`
        document.getElementById("voldoende_amount").innerHTML = `<div class="buis-stats-box"><p class="buis-stats-title">Voldoendes:</p><p class="buis-stats-value">${categories.voldoende}</p></div>`

      })
      .catch(error => console.error('Error fetching:', error));
  }
}, 1500);
