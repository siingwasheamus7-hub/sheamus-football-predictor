
export async function onRequest(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      }
    });
  }

  try {
    const apiKey = context.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      throw new Error("API_FOOTBALL_KEY is not configured");
    }

    const response = await fetch(
      "https://v3.football.api-sports.io/leagues?current=true",
      {
        headers: {
          "x-apisports-key": apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        "API-Football request failed: " + response.status
      );
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

    return new Response(JSON.stringify({
      success: true,
      message: "African competition connection successful",
      total: africanCompetitions.length,
      competitions: africanCompetitions
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers
    });
  }
}
