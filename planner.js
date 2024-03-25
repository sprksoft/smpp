const pixelsPerMinute = 1.46;
async function fetchPlannerData(date, user){
    try {
        var currentUrl = window.location.href;
        school_name = currentUrl.split("/")[2]
        const url = `https://${school_name}/planner/api/v1/planned-elements/user/${user}?from=${date}&to=${date}`;
        console.log(url)
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch planner data`);
        }
        const data = await response.json();
        return data
    } catch (error) {
        console.error(`Failed to fetch:`, error);
        return null;
    }
}

const calculateElementHeight = (startTime, endTime) => {
    const durationInSeconds = (endTime - startTime) / 1000;
    const durationInMinutes = durationInSeconds / 60;
    return durationInMinutes * pixelsPerMinute;
};
async function getDateInCorrectFormat(isFancyFormat) {
    let currentDate = new Date();
    if (currentDate.getDay() === 5 && currentDate.getHours() >= 18) {
        currentDate.setDate(currentDate.getDate() + 3); // Set date to upcoming Monday
    } else if (currentDate.getDay() === 6 || currentDate.getDay() === 0) {
        currentDate.setDate(currentDate.getDate() + (8 - currentDate.getDay())); // Set date to upcoming Monday
    }
    if (isFancyFormat) {
    let day = currentDate.getDate().toString().padStart(2, '0');
    let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    let year = currentDate.getFullYear();
    return `${year}-${month}-${day}`;
    }else{
        currentDate.setHours(7);
currentDate.setMinutes(30);
        console.log(currentDate)
        return currentDate 
    }
}

async function ShowPlanner() {
    var container = document.getElementById('leftcontainer');
    var beginTime = await getDateInCorrectFormat(false)
    container.innerHTML = ''; 
    container = container.appendChild(document.createElement('div'));
    container.classList.add('planner-container');
    if (document.getElementById('datePickerMenu')) {
        var plannerUrl = document.getElementById('datePickerMenu').getAttribute('plannerurl');
        if (plannerUrl) {
            console.log("Planner URL:", plannerUrl);
        } else {
            console.error("Attribute 'plannerurl' not found in the element.");
        }
    } else {
        console.error("Element with id 'datePickerMenu' not found.");
    }
    plannerUrl = plannerUrl.split("/")
    var data = await fetchPlannerData(await getDateInCorrectFormat(true),plannerUrl[4])

    console.log(data)
    if (!data || data.length === 0) {
        document.getElementById('leftcontainer').innerHTML = 'No planner data available.';
        return;
    }

    data.sort((a, b) => {
        return new Date(a.period.dateTimeFrom) - new Date(b.period.dateTimeFrom);
    });
    await getDateInCorrectFormat(false)
    data.forEach((element, index, array) => {
        const plannerElement = document.createElement('div');
        plannerElement.classList.add('planner-element'); 
        const colorParts = element.color.split('-');
        const cssVariableColor = `c-${colorParts[0]}-combo--${colorParts[1]}`;

        plannerElement.classList.add(cssVariableColor)
        

        const itemName = element.courses && element.courses.length > 0 ? element.courses[0].name : element.name;

        const itemNameElement = document.createElement('h3');
        itemNameElement.textContent = itemName;
        plannerElement.appendChild(itemNameElement);

        const timeElement = document.createElement('p');
        const dateTimeFrom = new Date(element.period.dateTimeFrom);
        const dateTimeTo = new Date(element.period.dateTimeTo);
        timeElement.textContent = `${dateTimeFrom.toLocaleTimeString()} - ${dateTimeTo.toLocaleTimeString()}`;
        plannerElement.appendChild(timeElement);

        const height = calculateElementHeight(dateTimeFrom, dateTimeTo);
        plannerElement.style.height = `${height}px`;
        const top = calculateElementHeight(beginTime,dateTimeFrom);
        console.log(beginTime)
        console.log(top)
        plannerElement.style.top = `${top}px`;

        if (index < array.length - 1) {
            const nextStartTime = new Date(array[index + 1].period.dateTimeFrom);
            const marginBottom = (nextStartTime - dateTimeTo) / 60000;
            const marginBottomPixels = marginBottom * pixelsPerMinute; 
            if(marginBottomPixels == 0){
                plannerElement.style.marginBottom = `5px`
            }else{
                plannerElement.style.marginBottom = `${marginBottomPixels}px`;
            }
        }
        container.appendChild(plannerElement);
    });
}
