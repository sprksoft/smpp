const pixelsPerMinute = 1.46;

async function fetchPlannerData(date, user) {
    try {
        const currentUrl = window.location.href;
        const school_name = currentUrl.split("/")[2];
        const url = `https://${school_name}/planner/api/v1/planned-elements/user/${user}?from=${date}&to=${date}`;
        console.log(url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch planner data`);
        }
        return await response.json();
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

function fancyfyTime(inputTime) {
    const [startTime, endTime] = inputTime.split(' - ');
    function convertTo24HourFormat(time) {
        let [hours, minutes, period] = time.split(':');
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        if (period.toLowerCase() === 'pm' && hours !== 12) {
            hours += 12;
        } else if (period.toLowerCase() === 'am' && hours === 12) {
            hours = 0;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    const formattedStartTime = convertTo24HourFormat(startTime);
    const formattedEndTime = convertTo24HourFormat(endTime);
    return `${formattedStartTime} - ${formattedEndTime}`;
}

async function getDateInCorrectFormat(isFancyFormat) {
    let currentDate = new Date();
    if (currentDate.getHours() >= 18) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(7);
        currentDate.setMinutes(30);
    } else if (currentDate.getDay() === 5 && currentDate.getHours() >= 18) {
        currentDate.setDate(currentDate.getDate() + 3);
        currentDate.setHours(7);
        currentDate.setMinutes(30);
    } else if (currentDate.getDay() === 6 || currentDate.getDay() === 0) {
        currentDate.setDate(currentDate.getDate() + (8 - currentDate.getDay()));
        currentDate.setHours(7);
        currentDate.setMinutes(30);
    }
    
    if (isFancyFormat) {
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();
        return `${year}-${month}-${day}`;
    } else {
        return currentDate;
    }
}

async function ShowPlanner() {
    const container = document.getElementById('leftcontainer');
    container.innerHTML = ''; 
    const plannerUrl = document.getElementById('datePickerMenu').getAttribute('plannerurl');
    const data = await fetchPlannerData(await getDateInCorrectFormat(true), plannerUrl.split("/")[4]);
    if (!data || data.length === 0) {
        document.getElementById('leftcontainer').innerHTML = 'No planner data available.';
        return;
    }

    let earliestStartTime = Infinity;
    data.forEach(element => {
        const dateTimeFrom = new Date(element.period.dateTimeFrom).getTime();
        if (dateTimeFrom < earliestStartTime) {
            earliestStartTime = dateTimeFrom;
        }
    });

    const beginTime = new Date(earliestStartTime);

    const timeSlots = [];
    data.forEach((element, index, array) => {
        const dateTimeFrom = new Date(element.period.dateTimeFrom);
        const dateTimeTo = new Date(element.period.dateTimeTo);
        const overlappingSlots = timeSlots.filter(slot => {
            return (slot.from < dateTimeTo && slot.to > dateTimeFrom);
        });

        if (overlappingSlots.length === 0) {
            const newSlot = {
                from: dateTimeFrom,
                to: dateTimeTo,
                elements: [element]
            };
            timeSlots.push(newSlot);
        } else {
            overlappingSlots.forEach(slot => {
                slot.elements.push(element);
            });
        }
    });

    timeSlots.forEach(slot => {
        const numElements = slot.elements.length;
        const elementWidthPercentage = 100 / numElements;

        slot.elements.forEach((element, index) => {
            const plannerElement = document.createElement('div');
            plannerElement.classList.add('planner-element'); 
            const colorParts = element.color.split('-');
            const cssVariableColor = `c-${colorParts[0]}-combo--${colorParts[1]}`;
            plannerElement.classList.add(cssVariableColor);

            const itemName = element.courses && element.courses.length > 0 ? element.courses[0].name : element.name;
            const itemNameElement = document.createElement('h3');
            itemNameElement.textContent = itemName;
            plannerElement.appendChild(itemNameElement);

            const timeElement = document.createElement('p');
            const dateTimeFrom = new Date(element.period.dateTimeFrom);
            const dateTimeTo = new Date(element.period.dateTimeTo);
            timeElement.textContent = fancyfyTime(`${dateTimeFrom.toLocaleTimeString()} - ${dateTimeTo.toLocaleTimeString()}`);
            plannerElement.appendChild(timeElement);

            const height = calculateElementHeight(dateTimeFrom, dateTimeTo);
            plannerElement.style.height = `${height}px`;
            const top = calculateElementHeight(beginTime, dateTimeFrom);
            plannerElement.style.top = `${top}px`;
            const left = index * elementWidthPercentage;
            plannerElement.style.left = `${left}%`;

            if (index < numElements - 1) {
                const nextStartTime = new Date(slot.elements[index + 1].period.dateTimeFrom);
                const marginBottom = (nextStartTime - dateTimeTo) / 60000;
                const marginBottomPixels = marginBottom * pixelsPerMinute;
                plannerElement.style.marginBottom = `${marginBottomPixels}px`;
            }

            plannerElement.style.width = `${elementWidthPercentage}%`;
            container.appendChild(plannerElement);
        });
    });
}
