export async function fetchWeatherData(location: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  try {
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
export async function fetchDelijnData(apiUrl: string) {
  const apiKey = process.env.DELIJN_API_KEY;
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
export async function fetchIRailData(apiUrl: string) {
  try {
    // De URL komt via een runtime message binnen, dus we beperken hem tot iRail
    // zodat de background script geen willekeurige origins kan ophalen.
    const url = new URL(apiUrl);
    if (url.protocol !== "https:" || url.hostname !== "api.irail.be") {
      throw new Error("Invalid iRail URL");
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching iRail data:", error);
    return null;
  }
}
