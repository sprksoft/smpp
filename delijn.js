const leftcontainer = document.getElementById('homepage__block--datepicker')

async function fetchData() {
    const apiKey = 'ddb68605719d4bb8b6444b6871cefc7a'; // Replace 'YOUR_API_KEY' with your actual API key
    const apiUrl = 'https://api.delijn.be/DLKernOpenData/api/v1/haltes/0/303980/real-time?maxAantalDoorkomsten=10'; // Replace with your API endpoint
  
    try {
      const response = await fetch(apiUrl, {
        headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
        }
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
  
      const data = await response.json();
      console.log(data)
      createApplication(data); // Call function to create the application using fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
    }

  }
  function createApplication(data){
    
  }
  // Call the fetchData function to initiate the API request and populate the application
  fetchData();