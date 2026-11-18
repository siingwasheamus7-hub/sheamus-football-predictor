
export async function onRequest(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60"
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

    // African national-team and club competitions
    const africanLeagues = [
      { id: 36, name: "AFCON Qualifiers", category: "National Teams" },
      { id: 922, name: "Women's AFCON", category: "National Teams" },
      { id: 538, name: "AFCON U20", category: "National Teams" },
      { id: 973, name: "AFCON U17", category: "National Teams" },
      { id: 535, name: "CECAFA Senior Challenge Cup", category: "National Teams" },
      { id: 1159, name: "CECAFA U20", category: "National Teams" },
      { id: 771, name: "COSAFA U20", category: "National Teams" },
      { id: 12, name: "CAF Champions League", category: "African Clubs" },
      { id: 20, name: "CAF Confederation Cup", category: "African Clubs" },
      { id: 533, name: "CAF Super Cup", category: "African Clubs" },
      { id: 869, name: "CECAFA Club Cup", category: "African Clubs" },
      { id: 1164, name: "CAF Women's Champions League", category: "African Clubs" }
    ];

    // Request fixtures for the next 7 days in one API call
    const today = new Date();
    const from = today.toISOString().slice(0, 10);

    const endDate = new Date(today);
    endDate.setUTCDate(endDate.getUTCDate() + 7);
    const to = endDate.toISOString().slice(0, 10);

    const url =
      `https://v3.football.api-sports.io/fixtures?from=${from}&to=${to}`;

    const response = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey
      }
    });

    if (!response.ok) {
      throw new Error("API-Football request failed: " + response.status);
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length) {
      throw new Error("API-Football error: " + JSON.stringify(data.errors));
    }

    const leagueIds = new Set(
      africanLeagues.map(league => league.id)
    );

    const fixtures = (data.response || [])
      .filter(match => leagueIds.has(match.league?.id))
      .map(match => ({
        fixture: match.fixture,
        league: match.league,
        teams: match.teams,
        goals: match.goals,
        score: match.score,
        competitionCategory:
          africanLeagues.find(item => item.id === match.league.id)?.category
      }));

    return new Response(JSON.stringify({
      success: true,
      message: "African football fixtures loaded successfully",
      total: fixtures.length,
      dateFrom: from,
      dateTo: to,
      competitions: africanLeagues,
      fixtures
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
