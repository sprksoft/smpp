const plantVersion = 2
class PlantWidget extends WidgetBase {
    createContent(parent) {
        parent = document.createElement("div")
        parent.id = "plantdiv"
        async function getPlantData() {
            return await browser.runtime.sendMessage({
                action: 'getPlantAppData',
            });
        }

        function createPlantWindow() {
            getPlantData().then(data => { //avoiding async virus
                let plantData = data
                let outdated = checkIfOutdated(plantData.version)
                if (outdated) {
                    createUpdatePrompt()
                    return
                }
                if (plantData.age == 0) { // not born yet
                    createPlantThePlantVisual()
                    return
                }
                plantData = calculateGrowth(plantData) // calculate new data
                if (plantData.birthday != null) parent.appendChild(createPlantStreak(plantData));
                parent.appendChild(createPlantVisual(plantData))
                parent.appendChild(createPlantBottomUI(plantData))
            })
        }

        function createPlantVisual(data) {
            let plantVisualContainer = document.createElement("div")
            plantVisualContainer.id = "plant_image_container"
            plantVisualContainer.innerHTML = getPlantHTML(data.age, data.isAlive)
            return plantVisualContainer
        }

        function createPlantBottomUI() {

        }

        function createPlantStreak(data) {
            let plantStreak = document.createElement("h2")
            plantStreak.id = "plant_streak"
            plantStreak.innerText = `${data.daysSinceBirthday} ${data.daysSinceBirthday == 1 ? "Day" : "Days"}`
            return plantStreak
        }

        function checkIfOutdated(version) {
            if (!version || version != current_plant_version) {
                return true
            }
            return false
        }

        function createUpdatePrompt() {
            parent.innerHTML = `
                <h1>
                Update Required!
                </h1>
                <p>You must reset to be up to date</p>
                <p>Your version: <b>${current_conditions.plant_version}</b> is not the newest available</b>`
            let resetButton = document.createElement("button")
            resetButton.innerText = "Reset Plant"
            resetButton.id = "removeplantButton"
            resetButton.addEventListener("click", resetPlant)
            parent.appendChild(resetButton)
        }

        function resetPlant() {
            browser.runtime.sendMessage({ action: 'setPlantData', data: null });
        }
        function calculatePercentile(t) {
            const totalTime = 259200; // Total seconds in 3 days
            return Math.max(0, 100 * (1 - t / totalTime));
        }
        function createRemoveButton(isAlive) {

        }
        function createConfirmButton() {

        }
        //plant logic


        function userWateredPlant() {

        }

        function calculateGrowth(data) {
            const currentTime = new Date().getTime();
            const msIn1Day = (1000 * 60 * 60 * 24)
            const daysSinceLastGrow = currentTime - data.lastGrowTime / msIn1Day
            const daysSinceLastWater = currentTime - data.lastWaterTime / msIn1Day
            if (daysSinceLastGrow >= 2 && data.age != 8) { // check if plant should grow
                data.age += 1
                lastGrowTime = currentTime
            }
            if (data.age > 8) data.age = 8; // some bug in previous code
            if (daysSinceLastWater > 3 && data.age != 1) data.isAlive = false // check if plant should die
            if (data.age == 2 && data.birthday == null) data.birthday = currentTime // check if plant is no longer a seed
            if (data.birthday != null) { // update birthday
                data.daysSinceBirthday = (data.isAlive ? Math.round((currentTime - data.birthday) / (1000 * 60 * 60 * 24)) : current_conditions.time_since_birthday_days + 1) + 1
            }
            browser.runtime.sendMessage({ action: 'setPlantData', data: data });
            return data
        }
        function plantThePlant() {
            const colorArray = ["#fcb528", "#00adfe", "#f474d8", "#c9022b", "#ff6000", "#ff596e", "#6024c9", "#de51c1", "#d8d475", "#f5cb04"]
            let plantData = {
                age: 1,
                lastWaterTime: new Date(),
                lastGrowTime: new Date(),
                uniqueColor: colorArray[Math.floor(Math.random() * colorArray.length)],
                plantVersion: plantVersion,
                birthday: null,
                daysSinceBirthday: 0,
                isAlive: true
            }
            browser.runtime.sendMessage({ action: 'setPlantData', data: plantData });
            createPlantWindow()
        }
        function createPlantThePlantVisual() {
            let plantThePlantButton = document.createElement("button")
            plantThePlantButton.classList.add("planttheplantbutton")
            plantThePlantButton.addEventListener("click", plantThePlant)
            plantThePlantButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="plant_the_plant_svg" viewBox="0 0 50.16 37.5">
        <defs>
          <!-- Clip-path for the rising effect -->
          <clipPath id="riseClip">
            <rect id="riseMask" x="0" width="100%" height="100%" />
          </clipPath>
        </defs>
        <g id="Laag_1-2" data-name="Laag 1">
          <!-- Hand -->
          <path id="hand" d="M37.9,25.86c2.24-1.84,4.46-3.51,6.49-5.38,1.57-1.44,3.22-1.07,4.86-.54,1.07.34,1.12,1.48.58,2.21-2.73,3.64-4.62,8.04-9.33,9.89-2.34.93-4.56,2.24-6.72,3.56-2.61,1.59-5.29,1.7-8.12.9-2.57-.73-5.15-1.45-7.72-2.19-2.4-.7-4.72-.6-7.01.49-1.83.87-3.73,1.61-5.56,2.48-.82.39-1.41.26-1.95-.4C1.57,34.61.42,32.03.02,29.12c-.11-.84.18-1.37,1.02-1.7,2.88-1.15,5.54-2.61,8.02-4.54,3.43-2.67,7.51-3.01,11.44-1.45,4.87,1.94,9.81,3.47,14.99,4.29.96.15,1.97.58,1.98,1.79.02,1.18-.96,1.64-1.89,1.92-.64.19-1.37.23-2.03.13-2.15-.3-4.27-.82-6.42-1.01-1.67-.14-3.38.05-5.07.19-.35.03-.67.47-1.1.8.34.2.44.3.49.28,3.91-1.26,7.65.28,11.47.65,1.15.11,2.43.04,3.49-.35,2.12-.78,2.55-2.32,1.48-4.26Z" />
          <!-- Base layer -->
          <g id="plant-base">
            <path id="soil-base" d="m24.225089,22.317825c0.83-1.16,1.91-1.43,3.18-1.42,1.22,0.01,2.43-0.1,3.6-0.16l0.815625,-0.14875c0.259688,-0.09078,0.537085,-0.372564,1.034375,-0.03125,0.497285,0.341314,2.57,1.29,2.57,1.29,0.32,0.14,0.77,0.09,1.13,0,1.58-0.38,3-0.16,4.43,1.09-1.24,0.87-2.39,1.69-3.56,2.48-0.21,0.14-0.54,0.25-0.77,0.19-3.81-0.91-7.61-1.85-11.4-2.8-0.34-0.09-0.64-0.31-1.02-0.5z" fill="var(--color-base03)" />
            <path id="wood-base" d="m35.708097,21.989494c0.358125,-4.223436-2.914655,-7.323267-7.892862,-8.568891-1.348738,-0.337475,3.204784,-0.117303,4.590755,0.780337,1.385971,0.897639,2.382995,1.655288,2.822995,2.405288,1.6,-4.22,0.724749,-11.761929-1.07,-13.588125,2.677757,0.114623,2.618859,8.712593,2.62,11.948125,0.78,-0.32,1.521188,-1.122515,2.665175,-1.684349,1.143986,-0.561834,4.073575,-1.273776,4.073575,-1.273776,1.407048,0.11677-3.52875,1.788125-4.55875,2.448125-2.31,1.48-3,3.67-2.05,6.21,0.08,0.21-0.06107,1.282613-0.422272,1.295496z" fill="var(--color-base03)" />
            <g class="leaves-base" transform="translate(4.5187525,0.85580096)">
              <path d="m28.971165,15.089889c-9.708358,-5.5826936-1.103783,-2.20042-0.245054,-0.132915-1.78,1.79-4.468796,1.955165-6.038796,0.08516-0.82,-0.98-1.49,-2.09-2.25,-3.17,1.83,-1.17,3.79,-1.82,5.99,-1.54,1.88,0.24,2.83,2.125,2.95,3.06,0.127187,0.991001-0.40615,1.637511-0.40615,1.697755z" fill="var(--color-base03)" />
              <path d="m30.787204,6.3513591c-2.92,-0.08-3.52,-1.81-2.38,-6.48999995,1.72,0.38,3.18,1.16999995,4.24,2.59999995,0.96,1.3,0.92,2.23-0.1,3.48-0.322286,0.3350855-1.159736,0.366831-1.76,0.41z" fill="var(--color-base03)" />
              <path d="m33.560677,11.842939c-0.025,-0.72,0.84,-2.2799998,2.19,-2.6499998,2.41,-0.65,4.54,0.09,6.68,1.3699998-0.8,1.13-1.5,2.31-2.39,3.33-1.54,1.75-3.58,1.79-5.53,0.09l-0.518796,-0.674272c0,0-0.406204,-0.745728-0.431204,-1.465728z" fill="var(--color-base03)" />
            </g>
          </g>
          <!-- Animated layer (real colors, clipped) -->
          <g id="plant-animated" style="clip-path: url(#riseClip);">
            <path id="soil" d="m24.225089,22.317825c0.83-1.16,1.91-1.43,3.18-1.42,1.22,0.01,2.43-0.1,3.6-0.16l0.815625,-0.14875c0.259688,-0.09078,0.537085,-0.372564,1.034375,-0.03125,0.497285,0.341314,2.57,1.29,2.57,1.29,0.32,0.14,0.77,0.09,1.13,0,1.58-0.38,3-0.16,4.43,1.09-1.24,0.87-2.39,1.69-3.56,2.48-0.21,0.14-0.54,0.25-0.77,0.19-3.81-0.91-7.61-1.85-11.4-2.8-0.34-0.09-0.64-0.31-1.02-0.5z" fill="#9c9081" />
            <path id="wood" d="m35.708097,21.989494c0.358125,-4.223436-2.914655,-7.323267-7.892862,-8.568891-1.348738,-0.337475,3.204784,-0.117303,4.590755,0.780337,1.385971,0.897639,2.382995,1.655288,2.822995,2.405288,1.6,-4.22,0.724749,-11.761929-1.07,-13.588125,2.677757,0.114623,2.618859,8.712593,2.62,11.948125,0.78,-0.32,1.521188,-1.122515,2.665175,-1.684349,1.143986,-0.561834,4.073575,-1.273776,4.073575,-1.273776,1.407048,0.11677-3.52875,1.788125-4.55875,2.448125-2.31,1.48-3,3.67-2.05,6.21,0.08,0.21-0.06107,1.282613-0.422272,1.295496z" fill="#5b4511" />
            <g class="leaves" transform="translate(4.5187525,0.85580096)">
              <path d="m28.971165,15.089889c-9.708358,-5.5826936-1.103783,-2.20042-0.245054,-0.132915-1.78,1.79-4.468796,1.955165-6.038796,0.08516-0.82,-0.98-1.49,-2.09-2.25,-3.17,1.83,-1.17,3.79,-1.82,5.99,-1.54,1.88,0.24,2.83,2.125,2.95,3.06,0.127187,0.991001-0.40615,1.637511-0.40615,1.697755z" fill="#4b6f22" />
              <path d="m30.787204,6.3513591c-2.92,-0.08-3.52,-1.81-2.38,-6.48999995,1.72,0.38,3.18,1.16999995,4.24,2.59999995,0.96,1.3,0.92,2.23-0.1,3.48-0.322286,0.3350855-1.159736,0.366831-1.76,0.41z" fill="#4b6f22" />
              <path d="m33.560677,11.842939c-0.025,-0.72,0.84,-2.2799998,2.19,-2.6499998,2.41,-0.65,4.54,0.09,6.68,1.3699998-0.8,1.13-1.5,2.31-2.39,3.33-1.54,1.75-3.58,1.79-5.53,0.09l-0.518796,-0.674272c0,0-0.406204,-0.745728-0.431204,-1.465728z" fill="#4b6f22" />
            </g>
          </g>
        </g>
      </svg>`
        }

        function getPlantHTML(age, isAlive) {
            return `get from the other file`
        }
    }
}