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

        function createPlantWidget() {
            getPlantData().then(data => { //avoiding async virus
                let plantData = data
                let outdated = checkIfOutdated(plantData.version)
                parent.innerHTML = ""
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

        function createPlantBottomUI(data) {

        }
        function updatePlantBottomUI(data) {

        }
        function createPlantStreak(data) {
            let plantStreak = document.createElement("h2")
            plantStreak.id = "plant_streak"
            plantStreak.innerText = `${data.daysSinceBirthday} ${data.daysSinceBirthday == 1 ? "Day" : "Days"}`
            return plantStreak
        }

        function checkIfOutdated(version) {
            return Boolean(!version || version != current_plant_version)
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
            createPlantWidget()
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
            getPlantData().then(data => {
                data.lastWaterTime = new Date();
                browser.runtime.sendMessage({ action: 'setPlantData', data: null });
                createPlantBottomUI(data)
            })
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
            createPlantWidget()
        }
        function createPlantThePlantVisual() {
            let plantThePlantButton = document.createElement("button")
            plantThePlantButton.classList.add("planttheplantbutton")
            plantThePlantButton.addEventListener("click", plantThePlant)
            plantThePlantButton.innerHTML = plantThePlantSvg
        }

        function getPlantHTML(age, isAlive) {
            return `get from the other file`
        }
    }
}