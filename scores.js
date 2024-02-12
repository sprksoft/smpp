async function fetchEvaluationDetails(identifier) {
    try {
      const response = await fetch(`https://takeerbergen.smartschool.be/results/api/v1/evaluations/${identifier}`);
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching evaluation details for identifier ${identifier}:`, error);
      return null;
    }
  }
  // Function to extract identifiers from HTML
  function extractIdentifiersFromHTML(html) {
    const identifierRegex = /"identifier"\s*:\s*"([^"]+)"/g;
    const identifiers = [];
    let match;
    while ((match = identifierRegex.exec(html)) !== null) {
      identifiers.push(match[1]);
    }
    return identifiers;
  }
  
  // Function to fetch evaluation details for an identifier
  async function fetchEvaluationDetails(identifier) {
    const url = `https://takeerbergen.smartschool.be/results/api/v1/evaluations/${identifier}`;
    try {
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
  
  // Function to extract data-rowids from the DOM and assign colors
  function extractDataRowIdsAndAssignColors(colors, dataRowIds) {
    const elementsWithDataLevelZero = document.querySelectorAll('[data-level="0"]');
    elementsWithDataLevelZero.forEach((element, index) => {
      const dataRowId = dataRowIds[index]; // Retrieve data-rowid from the array
      const color = colors[index] || 'default-color'; // Use default color if not enough colors fetched
      console.log(`Data row ID: ${dataRowId}, Color: ${color}`); // Log the data-rowid and color
      const button = element.querySelector('button'); // Find the button element inside the row
      if (button) {
        button.style.backgroundColor = color; // Assign color to the button background
      }
    });
  }
  
  // Function to observe changes in the DOM
  function observeDOMChanges(colors) {
    const listviewRows = document.querySelector('.listview__rows');
    if (listviewRows) {
      const elementsWithDataLevelZero = listviewRows.querySelectorAll('[data-level="0"]');
      console.log("it should work also")
      elementsWithDataLevelZero.forEach(element => {
          const dataRowId = element.dataset.rowid;
          dataRowIds.push(dataRowId);
  
          // Apply inline style to set background color
          element.style.backgroundColor = "green"; // Replace "green" with your dynamically set color
      });
  }}
  
  // Function to extract data-rowids from the DOM
  function extractDataRowIds() {
    console.log("it should work")
    const listviewRows = document.querySelector('.listview__rows');
    const dataRowIds = [];
    if (listviewRows) {
      const elementsWithDataLevelZero = listviewRows.querySelectorAll('[data-level="0"]');
      console.log("it should work also")
      elementsWithDataLevelZero.forEach(element => {
        const dataRowId = element.dataset.rowid;
        dataRowIds.push(dataRowId);
      });
    }
    return dataRowIds;
  }
  
  // Fetch HTML content and process it
  fetch('https://takeerbergen.smartschool.be/results/api/v1/evaluations/?pageNumber=1&itemsOnPage=100')
    .then(async response => {
      if (!response.ok) {
        throw new Error('Failed to fetch HTML content');
      }
      const html = await response.text();
      const identifiers = extractIdentifiersFromHTML(html);
      const projectIdentifiers = identifiers.filter(identifier => identifier.includes('_project_'));
      const fetchPromises = projectIdentifiers.map(identifier => fetchEvaluationDetails(identifier));
      return Promise.all(fetchPromises);
    })
    .then(colors => {
      console.log('Fetched colors:', colors); // Check if colors are fetched correctly
      const validColors = colors.filter(color => color !== null);
      console.log('Valid colors:', validColors); // Check if valid colors are filtered correctly
      // Call the function to extract data-rowids from the DOM and assign colors
      const dataRowIds = extractDataRowIds();
      extractDataRowIdsAndAssignColors(validColors, dataRowIds);
      // Observe DOM changes to update the list dynamically
      observeDOMChanges(validColors);
    })
    .catch(error => {
      console.error('Error:', error);
    });