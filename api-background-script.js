export async function fetchWeatherData(location) {
  const apiKey = atob("MmI2ZjliNmRiZTUwNjRkZDc3MGYyOWQ0YjIyOWEyMmM="); // only realy stops bots but who cares?
  try {
    console.log("Fetching Weather data...");
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Weather data:", error);
    return {
      cod: 69,
      message: "error code for internal use",
    };
  }
}
export async function fetchDelijnData(apiUrl) {
  const apiKey = atob("ZGRiNjg2MDU3MTlkNGJiOGI2NDQ0YjY4NzFjZWZjN2E=");
  try {
    console.log("Fetching Delijn data...");
    const response = await fetch(apiUrl, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Delijn data:", error);
  }
}
