export async function fetchWeatherData(location: string) {
  const apiKey = "2b6f9b6dbe5064dd770f29d4b229a22c";
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`,
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
export async function fetchDelijnData(apiUrl: string) {
  const apiKey = "ddb68605719d4bb8b6444b6871cefc7a";
  try {
    const response = await fetch(apiUrl, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Delijn data:", error);
  }
}
