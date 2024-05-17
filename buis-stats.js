setTimeout(function() {
  if (window.location.pathname.startsWith('/results/main/results/')) {
    const getSubdomain = () => {
      const host = window.location.hostname;
      const subdomain = host.split('.')[0];
      return subdomain;
    };

    const subdomain = getSubdomain();
    const url = `https://${subdomain}.smartschool.be/results/api/v1/evaluations/?itemsOnPage=500`;

    const textColor = localStorage.getItem('smppCountColor') || 'white';

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

        const total = categories.buis + categories.voldoende;
        
        const createParagraph = (id, text, count) => {
          const paragraph = document.createElement("p");
          paragraph.innerHTML = `${text} <strong>${count}</strong>`;
          paragraph.id = id;
          paragraph.classList.add("customstatistieken");
          paragraph.style.color = textColor;
          return paragraph;
        };

        const buisParagraph = createParagraph("statsBuizen-custom", "Je hebt", categories.buis + " buizen.");
        const voldoendeParagraph = createParagraph("statsVoldoende-custom", "Je hebt", categories.voldoende + " voldoendes.");
        const totalParagraph = createParagraph("statsTotal-custom", "Je hebt in totaal", total + " punten.");

        const scoresSummaryContainer = document.getElementById("scores_summary");
        scoresSummaryContainer.appendChild(buisParagraph);
        scoresSummaryContainer.appendChild(voldoendeParagraph);
        scoresSummaryContainer.appendChild(totalParagraph);

      })
      .catch(error => console.error('Error fetching:', error));
  }
}, 1500);
