async function show_scoresfunc() {
    function detectScrolling(colors, dataRowIds) {
        const filterlistviewContainer = document.querySelector('.filterlistview-container');
        if (!filterlistviewContainer) return;

        filterlistviewContainer.addEventListener('scroll', function () {
            var isVerticalScrolling = filterlistviewContainer.scrollTop !== 0;
            var isHorizontalScrolling = filterlistviewContainer.scrollLeft !== 0;

            if (isVerticalScrolling || isHorizontalScrolling) {
                const validColors = colors.filter(color => color !== null);
                extractDataRowIdsAndAssignColors(validColors, dataRowIds);
            }
        });
    }

    async function fetchEvaluationDetails(identifier) {
        try {
            var currentUrl = window.location.href;
            school_name = currentUrl.split("/")[2]
            const url = `https://${school_name}/results/api/v1/evaluations/${identifier}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch evaluation details for identifier: ${identifier}`);
            }
            const data = await response.json();
            return data.details.projectGoals[0]?.graphic?.color || null;
        } catch (error) {
            console.error(`Error fetching evaluation details for identifier ${identifier}:`, error);
            return null;
        }
    }

    function extractDataRowIdsAndAssignColors(colors, dataRowIds) {
        const elementsWithDataLevelZero = document.querySelectorAll('[data-level="0"]');
        elementsWithDataLevelZero.forEach((element, index) => {
            const dataRowId = dataRowIds[index]; // Retrieve data-rowid from the array
            const color = colors[index] || 'default-color'; // Use default color if not enough colors fetched
            const button = element.querySelector('button'); // Find the button element inside the row
            if (button) {
                // Assign color to the button background
                switch (color) {
                    case 'blue':
                        button.style.setProperty('background-color', 'var(--color-blue)', 'important');
                        break;
                    case 'green':
                        button.style.setProperty('background-color', 'var(--color-green)', 'important');
                        break;
                    case 'orange':
                        button.style.setProperty('background-color', 'var(--color-orange)', 'important');
                        break;
                    case 'red':
                        button.style.setProperty('background-color', 'var(--color-red)', 'important');
                        break;
                    default:
                        console.error(`Invalid color: ${color}`);
                        button.style.setProperty('background-color', color, 'important');
                        break;
                }
            }
        });
    }

    function extractIdentifiersFromHTML(html) {
        const identifierRegex = /"identifier"\s*:\s*"([^"]+)"/g;
        const identifiers = [];
        let match;
        while ((match = identifierRegex.exec(html)) !== null) {
            identifiers.push(match[1]);
        }
        return identifiers;
    }

    function extractDataRowIds() {
        const listviewRows = document.querySelector('.listview__rows');
        const dataRowIds = [];
        if (listviewRows) {
            const elementsWithDataLevelZero = listviewRows.querySelectorAll('[data-level="0"]');
            elementsWithDataLevelZero.forEach(element => {
                const dataRowId = element.dataset.rowid;
                dataRowIds.push(dataRowId);
            });
        }
        return dataRowIds;
    }


    try {
        var currentUrl = window.location.href;
        school_name = currentUrl.split("/")[2]
        const response = await fetch(`https://${school_name}/results/api/v1/evaluations/?pageNumber=1&itemsOnPage=100`);
        if (!response.ok) {
            throw new Error('Failed to fetch HTML content');
        }
        const html = await response.text();
        const identifiers = extractIdentifiersFromHTML(html);
        const projectIdentifiers = identifiers.filter(identifier => identifier.includes('_project_'));
        const fetchPromises = projectIdentifiers.map(identifier => fetchEvaluationDetails(identifier));
        const colors = await Promise.all(fetchPromises);
        const validColors = colors.filter(color => color !== null);
        const dataRowIds = extractDataRowIds();
        extractDataRowIdsAndAssignColors(validColors, dataRowIds);
        detectScrolling(validColors, dataRowIds);

        // Additionally, observe DOM changes to detect dynamically loaded content
        const observer = new MutationObserver(() => {
            // When new content is added to the DOM, reapply color updates
            extractDataRowIdsAndAssignColors(validColors, dataRowIds);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    } catch (error) {
        console.error('Error:', error);
    }
}
