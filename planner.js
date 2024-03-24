const pixelsPerMinute = 1.46;
async function fetchPlannerData(){
    try {
        var currentUrl = window.location.href;
        school_name = currentUrl.split("/")[2]
        const url = `https://${school_name}/planner/api/v1/planned-elements/user/1045_6232_0?from=2024-03-25&to=2024-03-25`;
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

async function ShowPlanner() {
    const container = document.getElementById('leftcontainer');
    container.innerHTML = ''; 
    var data = await fetchPlannerData();
    console.log(data)
    if (!data || data.length === 0) {
        document.getElementById('leftcontainer').innerHTML = 'No planner data available.';
        return;
    }

    data.sort((a, b) => {
        return new Date(a.period.dateTimeFrom) - new Date(b.period.dateTimeFrom);
    });

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

        // Calculate height of the planner element
        const height = calculateElementHeight(dateTimeFrom, dateTimeTo);
        plannerElement.style.height = `${height}px`;

        // Calculate bottom margin for the planner element
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
