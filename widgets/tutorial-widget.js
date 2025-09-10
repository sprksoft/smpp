class TutorialWidget extends WidgetBase {
  constructor() {
    super();
    this.lang;
  }
  async createContent() {
    this.container = document.createElement("div");
    this.container.id = "tutorial-widget";

    let title = document.createElement("h1");
    title.className = "tutorial-widget-title";
    title.textContent = "Widgets Tutorial";
    title.style.textAlign = "center";
    this.container.appendChild(title);

    let intro = document.createElement("p");
    intro.style.textAlign = "center";
    intro.textContent = "This widget will guide your experience!";
    this.container.appendChild(intro);

    let langTitle = document.createElement("p");
    langTitle.className = "tutorial-lang-title";
    langTitle.textContent = "Choose a language / Kies je taal";
    this.container.appendChild(langTitle);

    let langButtons = document.createElement("div");
    langButtons.className = "lang-buttons";

    let englishButton = document.createElement("button");
    englishButton.id = "english-tutorial-lang";

    let englishIcon = document.createElement("div");
    englishIcon.id = "english-tutorial-lang-icon";
    englishButton.appendChild(englishIcon);

    englishButton.appendChild(document.createTextNode(" English"));
    langButtons.appendChild(englishButton);

    let dutchButton = document.createElement("button");
    dutchButton.id = "dutch-tutorial-lang";

    let dutchIcon = document.createElement("div");
    dutchIcon.id = "dutch-tutorial-lang-icon";
    dutchButton.appendChild(dutchIcon);

    dutchButton.appendChild(document.createTextNode("Nederlands"));
    langButtons.appendChild(dutchButton);

    this.container.appendChild(langButtons);

    dutchButton.addEventListener("click", (e) => {
      this.lang = "dutch";
      this.displayWidgetTutorial(1);
    });
    englishButton.addEventListener("click", () => {
      this.lang = "english";
      this.displayWidgetTutorial(1);
    });

    return this.container;
  }
  editTutorial() {
    this.displayWidgetTutorial(2);
    const editBtn = document.getElementById("smpp-widget-edit-mode-btn");
    if (editBtn) {
      editBtn.removeEventListener("click", this.boundEditTutorial);
    }
  }

  moveTutorial() {
    this.displayWidgetTutorial(3);

    if (this.boundMoveTutorial) {
      this.element.removeEventListener("mousedown", this.boundMoveTutorial);
      this.boundMoveTutorial = null;
    }
  }

  bagTutorial() {
    this.displayWidgetTutorial(4);
  }

  displayWidgetTutorial(stage) {
    console.log(stage);
    this.container.innerHTML = "";

    const title = document.createElement("h1");
    title.className = "tutorial-widget-title";
    const description = document.createElement("p");
    description.className = "tutorial-widget-description";

    switch (stage) {
      case 1:
        title.textContent =
          this.lang === "dutch" ? "1. Bewerken📝" : "1. Edit📝";
        description.innerHTML =
          this.lang === "dutch"
            ? `Pas je widgets aan door op de <button class="topnav__btn smpp-button" style="display:inline-flex !important; pointer-events: none"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" class="edit_button" height="18px" width="18px" viewBox="0 0 24 24" xml:space="preserve">
<g><g><path xmlns="http://www.w3.org/2000/svg" class="st1" stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none"="" d="m 19.792969,1.2089844 c -0.773047,0 -1.546203,0.290977 -2.134766,0.8730469 -6.69e-4,6.478e-4 -0.0013,0.0013 -0.002,0.00195 L 8.4119915,11.389897 c -0.5321594,0.536333 -1.9587661,2.040145 -2.9061791,5.334709 -0.1062793,0.369579 -0.1650107,0.570623 -0.2207032,0.85994 -0.046789,0.243065 -0.1295961,0.724628 0.2070338,1.013107 0.3909805,0.335056 1.0440816,0.133455 1.3847656,0.03125 C 7.387553,18.47571 7.9834625,18.287442 8.5897993,18.031247 11.103423,16.969168 12.593117,15.70399 12.985931,15.188066 l 8.93985,-8.8697066 C 23.11495,5.1606353 23.105005,3.2461646 21.927734,2.0820313 21.339171,1.4999614 20.566016,1.2089844 19.792969,1.2089844 Z" id="path5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="scccssssscccs"></path><path xmlns="http://www.w3.org/2000/svg" d="M 10.273212,2.8358152 H 5.5822718 c -1.3827164,0 -2.0740869,0 -2.6022128,0.2661137 C 2.5154954,3.3360099 2.1378007,3.709514 1.9011058,4.1689107 1.6320062,4.6911889 1.6320062,5.3748762 1.6320062,6.7422506 V 18.461557 c 0,1.367374 0,2.051122 0.2690996,2.573363 0.2366949,0.459374 0.6143896,0.832926 1.0789532,1.066946 0.5281259,0.266126 1.2194964,0.266126 2.6022128,0.266126 H 17.433068 c 1.382716,0 2.074137,0 2.602237,-0.266126 0.464527,-0.23402 0.842271,-0.607572 1.078917,-1.066946 0.269112,-0.522241 0.269112,-1.205989 0.269112,-2.573363 v -5.249273" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:3.25435;stroke-dasharray:none" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csccssccssccsccc"></path> </g></g>
</svg></button> knop <strong><i>linksboven</i></strong> te drukken`
            : `Edit your widgets using the <button class="topnav__btn smpp-button"  style="display:inline-flex !important; pointer-events: none"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" class="edit_button" height="18px" width="18px" viewBox="0 0 24 24" xml:space="preserve">
<g><g><path xmlns="http://www.w3.org/2000/svg" class="st1" stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none"="" d="m 19.792969,1.2089844 c -0.773047,0 -1.546203,0.290977 -2.134766,0.8730469 -6.69e-4,6.478e-4 -0.0013,0.0013 -0.002,0.00195 L 8.4119915,11.389897 c -0.5321594,0.536333 -1.9587661,2.040145 -2.9061791,5.334709 -0.1062793,0.369579 -0.1650107,0.570623 -0.2207032,0.85994 -0.046789,0.243065 -0.1295961,0.724628 0.2070338,1.013107 0.3909805,0.335056 1.0440816,0.133455 1.3847656,0.03125 C 7.387553,18.47571 7.9834625,18.287442 8.5897993,18.031247 11.103423,16.969168 12.593117,15.70399 12.985931,15.188066 l 8.93985,-8.8697066 C 23.11495,5.1606353 23.105005,3.2461646 21.927734,2.0820313 21.339171,1.4999614 20.566016,1.2089844 19.792969,1.2089844 Z" id="path5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="scccssssscccs"></path><path xmlns="http://www.w3.org/2000/svg" d="M 10.273212,2.8358152 H 5.5822718 c -1.3827164,0 -2.0740869,0 -2.6022128,0.2661137 C 2.5154954,3.3360099 2.1378007,3.709514 1.9011058,4.1689107 1.6320062,4.6911889 1.6320062,5.3748762 1.6320062,6.7422506 V 18.461557 c 0,1.367374 0,2.051122 0.2690996,2.573363 0.2366949,0.459374 0.6143896,0.832926 1.0789532,1.066946 0.5281259,0.266126 1.2194964,0.266126 2.6022128,0.266126 H 17.433068 c 1.382716,0 2.074137,0 2.602237,-0.266126 0.464527,-0.23402 0.842271,-0.607572 1.078917,-1.066946 0.269112,-0.522241 0.269112,-1.205989 0.269112,-2.573363 v -5.249273" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:3.25435;stroke-dasharray:none" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csccssccssccsccc"></path> </g></g>
</svg></button> button in the <strong><i> top left </i></strong> corner`;
        this.container.appendChild(title);
        this.container.appendChild(description);

        const editBtn = document.getElementById("smpp-widget-edit-mode-btn");
        if (editBtn) {
          this.boundEditTutorial = this.editTutorial.bind(this);
          editBtn.addEventListener("click", this.boundEditTutorial);
        }
        break;

      case 2:
        title.textContent =
          this.lang === "dutch" ? "2. Verplaatsen📍" : "2. Move📍";
        description.innerHTML =
          this.lang === "dutch"
            ? "Sleep <strong><i>deze widget</i></strong> naar de gewenste locatie en laat los om ze te verplaatsen."
            : "Move <strong><i>this widget</i></strong> by dragging and dropping it";
        this.container.appendChild(title);
        this.container.appendChild(description);

        if (this.boundMoveTutorial) {
          this.element.removeEventListener("mousedown", this.boundMoveTutorial);
        }

        this.boundMoveTutorial = this.moveTutorial.bind(this);
        this.element.addEventListener("mousedown", this.boundMoveTutorial);
        break;
      case 3:
        title.innerHTML =
          this.lang === "dutch"
            ? `3. Widgets toevoegen <svg class="smpp-widget-bag-handle-icon" style="pointer-events: none; height: 1em; width: 1.2em; display:inline" version="1.1" viewBox="0 0 448 448" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-.898 -124.01)"><path d="m26.458 288.48 198.44 119.06 198.44-119.06" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="100px"></path></g></svg>`
            : `3. Add widgets <svg class="smpp-widget-bag-handle-icon" style="pointer-events: none; height: 1em; width: 1.2em; display:inline" version="1.1" viewBox="0 0 448 448" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-.898 -124.01)"><path d="m26.458 288.48 198.44 119.06 198.44-119.06" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="100px"></path></g></svg>`;
        description.innerHTML =
          this.lang === "dutch"
            ? "Klik bovenaan op de <strong><i>balk met het pijltje</i></strong> om widgets te kiezen en toe te voegen. "
            : "Click the <strong><i>bar with the arrow</i></strong> at the top to pick and add widgets.";
        this.container.appendChild(title);
        this.container.appendChild(description);

        const bagHandle = document.querySelector(".smpp-widget-bag-handle");
        if (bagHandle) {
          this.boundBagTutorial = this.bagTutorial.bind(this);
          bagHandle.addEventListener("click", this.boundBagTutorial);
        }
        break;

      case 4:
        title.textContent =
          this.lang === "dutch" ? "4. Verwijderen❌" : "4. Removing❌";
        description.innerHTML =
          this.lang === "dutch"
            ? "Sleep <strong><i>deze widget</i></strong> naar diezelfde balk om hem te verwijderen."
            : "Drag <strong><i>this widget</i></strong> back to that same bar to remove it.";
        this.container.appendChild(title);
        this.container.appendChild(description);
        break;
    }
  }

  get category() {
    return undefined;
  }
}
registerWidget(new TutorialWidget());
