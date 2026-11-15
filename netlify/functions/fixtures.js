
exports.handler = async function (event) {
  const allowedLeagues = [
    "eng.1",
    "esp.1",
    "ita.1",
    "ger.1",
    "fra.1",
    "uefa.champions",
    "usa.1"
  ];

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    const league =
      event.queryStringParameters?.league || "eng.1";

    if (!allowedLeagues.includes(league)) {
      throw new Error("Unsupported league");
    }

    const base =
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`;

    // Upcoming and live fixtures
    const currentResponse = await fetch(`${base}?limit=500`);

    if (!currentResponse.ok) {
      throw new Error("Could not load current fixtures");
    }

    const currentData = await currentResponse.json();

    // Current and previous calendar month
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 45);

    const months = [0, 1].map(offset =>
      new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - offset,
        1
      )).toISOString().slice(0, 7).replace("-", "")
    );

    const historyResponses = await Promise.all(
      months.map(month =>
        fetch(`${base}?dates=${month}&limit=500`)
      )
    );

    const historyData = await Promise.all(
      historyResponses.map(async response => {
        if (!response.ok) {
          throw new Error("Could not load recent results");
        }
        return response.json();
      })
    );

    // Keep only completed matches from the last 45 days
    const allResults = historyData.flatMap(data =>
      data.events || []
    );

    const uniqueResults = [
      ...new Map(
        allResults.map(match => [match.id, match])
      ).values()
    ];

    const recentResults = uniqueResults.filter(match =>
      match.status?.type?.completed === true &&
      new Date(match.date) >= cutoff &&
      new Date(match.date) <= now
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...currentData,
        recentResults
      })
    };

  } catch (error) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
