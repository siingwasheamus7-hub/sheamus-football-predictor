
exports.handler = async function () {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      throw new Error("API_FOOTBALL_KEY is not configured");
    }

    const competitions = [
      { name: "Africa Cup of Nations", country: "Africa", type: "national" },
      { name: "CAF Champions League", country: "Africa", type: "club" },
      { name: "CAF Confederation Cup", country: "Africa", type: "club" }
    ];

    const response = await fetch(
      "https://v3.football.api-sports.io/leagues?current=true",
      {
        headers: {
          "x-apisports-key": apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error("API-Football request failed: " + response.status);
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length) {
      throw new Error("API-Football rejected the request");
    }

    const africanCompetitions = (data.response || [])
      .filter(item => {
        const name = (item.league?.name || "").toLowerCase();
        const country = (item.country?.name || "").toLowerCase();

        return (
          country === "africa" ||
          name.includes("africa cup of nations") ||
          name.includes("caf ") ||
          name.includes("cosafa") ||
          name.includes("cecafa")
        );
      })
      .map(item => ({
        id: item.league.id,
        name: item.league.name,
        country: item.country?.name || "Africa",
        type: item.league.type,
        seasons: item.seasons || []
      }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "African competition connection successful",
        total: africanCompetitions.length,
        competitions: africanCompetitions
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
